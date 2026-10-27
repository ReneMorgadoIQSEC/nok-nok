import {
  IFaceBBox,
  ILetterboxMeta,
  IPoint2D,
  IYuNetDecodeOptions,
  IYuNetFace,
} from '../../interfaces/IYuNet';

const STRIDES = [8, 16, 32] as const;

export function createLetterboxMeta(
  sourceWidth: number,
  sourceHeight: number,
  inputSize = 640,
): ILetterboxMeta {
  const scale = Math.min(inputSize / sourceWidth, inputSize / sourceHeight);
  const scaledW = sourceWidth * scale;
  const scaledH = sourceHeight * scale;
  return {
    scale,
    padX: (inputSize - scaledW) / 2,
    padY: (inputSize - scaledH) / 2,
    sourceWidth,
    sourceHeight,
    inputSize,
  };
}

/**
 * Convierte un frame RGBA del canvas a tensor NCHW BGR float32 con letterbox a inputSize².
 */
export function rgbaToYuNetTensor(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  meta: ILetterboxMeta,
): Float32Array {
  const { inputSize, scale, padX, padY } = meta;
  const tensor = new Float32Array(1 * 3 * inputSize * inputSize);
  const plane = inputSize * inputSize;

  for (const channel of [0, 1, 2]) {
    tensor.fill(0, channel * plane, (channel + 1) * plane);
  }

  const scaledW = Math.round(width * scale);
  const scaledH = Math.round(height * scale);
  const offsetX = Math.round(padX);
  const offsetY = Math.round(padY);

  for (let y = 0; y < scaledH; y++) {
    const srcY = Math.min(height - 1, Math.floor(y / scale));
    for (let x = 0; x < scaledW; x++) {
      const srcX = Math.min(width - 1, Math.floor(x / scale));
      const srcIdx = (srcY * width + srcX) * 4;
      const dstX = offsetX + x;
      const dstY = offsetY + y;
      if (dstX < 0 || dstY < 0 || dstX >= inputSize || dstY >= inputSize) continue;

      const dst = dstY * inputSize + dstX;
      const r = rgba[srcIdx];
      const g = rgba[srcIdx + 1];
      const b = rgba[srcIdx + 2];
      // NCHW BGR, valores 0–255 sin normalizar (convención YuNet).
      tensor[0 * plane + dst] = b;
      tensor[1 * plane + dst] = g;
      tensor[2 * plane + dst] = r;
    }
  }

  return tensor;
}

function mapPointToSource(x: number, y: number, meta: ILetterboxMeta): IPoint2D {
  return {
    x: (x - meta.padX) / meta.scale,
    y: (y - meta.padY) / meta.scale,
  };
}

function mapBoxToSource(
  x: number,
  y: number,
  w: number,
  h: number,
  meta: ILetterboxMeta,
): IFaceBBox {
  const topLeft = mapPointToSource(x, y, meta);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: w / meta.scale,
    height: h / meta.scale,
  };
}

function iou(a: IFaceBBox, b: IFaceBBox): number {
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  const ix1 = Math.max(a.x, b.x);
  const iy1 = Math.max(a.y, b.y);
  const ix2 = Math.min(ax2, bx2);
  const iy2 = Math.min(ay2, by2);
  const iw = Math.max(0, ix2 - ix1);
  const ih = Math.max(0, iy2 - iy1);
  const inter = iw * ih;
  const union = a.width * a.height + b.width * b.height - inter;
  return union <= 0 ? 0 : inter / union;
}

function nms(faces: IYuNetFace[], threshold: number): IYuNetFace[] {
  const sorted = [...faces].sort((a, b) => b.score - a.score);
  const kept: IYuNetFace[] = [];

  for (const face of sorted) {
    if (kept.every((k) => iou(face.bbox, k.bbox) <= threshold)) {
      kept.push(face);
    }
  }

  return kept;
}

/**
 * Decodifica las 12 salidas de YuNet a rostros en coordenadas del frame original.
 */
export function decodeYuNetOutputs(
  outputs: Record<string, { data: Float32Array; dims: readonly number[] }>,
  options: IYuNetDecodeOptions,
  meta: ILetterboxMeta,
): IYuNetFace[] {
  const faces: IYuNetFace[] = [];

  for (const stride of STRIDES) {
    const cls = outputs[`cls_${stride}`].data;
    const obj = outputs[`obj_${stride}`].data;
    const bbox = outputs[`bbox_${stride}`].data;
    const kps = outputs[`kps_${stride}`].data;
    const anchors = outputs[`cls_${stride}`].dims[1];
    const cols = Math.floor(options.inputWidth / stride);

    for (let i = 0; i < anchors; i++) {
      const c = Math.min(1, Math.max(0, cls[i]));
      const o = Math.min(1, Math.max(0, obj[i]));
      const score = Math.sqrt(c * o);
      if (score < options.scoreThreshold) continue;

      const col = i % cols;
      const row = Math.floor(i / cols);
      const bOff = i * 4;
      const kOff = i * 10;

      const cx = (col + bbox[bOff]) * stride;
      const cy = (row + bbox[bOff + 1]) * stride;
      const w = Math.exp(bbox[bOff + 2]) * stride;
      const h = Math.exp(bbox[bOff + 3]) * stride;

      const boxModel = {
        x: cx - w / 2,
        y: cy - h / 2,
        width: w,
        height: h,
      };

      const rightEye = mapPointToSource(
        (col + kps[kOff]) * stride,
        (row + kps[kOff + 1]) * stride,
        meta,
      );
      const leftEye = mapPointToSource(
        (col + kps[kOff + 2]) * stride,
        (row + kps[kOff + 3]) * stride,
        meta,
      );
      const nose = mapPointToSource(
        (col + kps[kOff + 4]) * stride,
        (row + kps[kOff + 5]) * stride,
        meta,
      );
      const rightMouth = mapPointToSource(
        (col + kps[kOff + 6]) * stride,
        (row + kps[kOff + 7]) * stride,
        meta,
      );
      const leftMouth = mapPointToSource(
        (col + kps[kOff + 8]) * stride,
        (row + kps[kOff + 9]) * stride,
        meta,
      );

      faces.push({
        bbox: mapBoxToSource(boxModel.x, boxModel.y, boxModel.width, boxModel.height, meta),
        score,
        rightEye,
        leftEye,
        nose,
        rightMouth,
        leftMouth,
      });
    }
  }

  return nms(faces, options.nmsThreshold);
}

export function eyeTiltDegrees(leftEye: IPoint2D, rightEye: IPoint2D): number {
  const dx = leftEye.x - rightEye.x;
  const dy = leftEye.y - rightEye.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/** Porcentaje de inclinación respecto a 90° (horizontal = 0%). */
export function tiltPercentFromDegrees(angleDeg: number): number {
  return (Math.abs(angleDeg) / 90) * 100;
}

export function averageSectorLuminance(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  sectors = 6,
): number[] {
  const cols = 2;
  const rows = Math.ceil(sectors / cols);
  const values: number[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (values.length >= sectors) break;
      const x0 = Math.floor((c * width) / cols);
      const x1 = Math.floor(((c + 1) * width) / cols);
      const y0 = Math.floor((r * height) / rows);
      const y1 = Math.floor(((r + 1) * height) / rows);

      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * width + x) * 4;
          const lum = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
          sum += lum;
          count++;
        }
      }
      values.push(count ? sum / count : 0);
    }
  }

  return values;
}
