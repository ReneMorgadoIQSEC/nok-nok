/** Punto 2D en coordenadas de imagen. */
export interface IPoint2D {
  x: number;
  y: number;
}

/** Bounding box YuNet: origen superior-izquierdo + tamaño. */
export interface IFaceBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Rostro decodificado desde YuNet.
 * Landmarks en orden del modelo: ojo derecho, ojo izquierdo, nariz,
 * comisura derecha, comisura izquierda.
 */
export interface IYuNetFace {
  bbox: IFaceBBox;
  score: number;
  rightEye: IPoint2D;
  leftEye: IPoint2D;
  nose: IPoint2D;
  rightMouth: IPoint2D;
  leftMouth: IPoint2D;
}

export interface IYuNetDecodeOptions {
  scoreThreshold: number;
  nmsThreshold: number;
  /** Ancho del tensor de entrada (tras letterbox), p. ej. 640. */
  inputWidth: number;
  /** Alto del tensor de entrada (tras letterbox), p. ej. 640. */
  inputHeight: number;
}

/** Mapeo letterbox: escala y padding aplicados al frame original. */
export interface ILetterboxMeta {
  scale: number;
  padX: number;
  padY: number;
  sourceWidth: number;
  sourceHeight: number;
  inputSize: number;
}

export type LifeTestBorderState = 'idle' | 'invalid' | 'valid';

export interface LifeTestFramesEvent {
  frames: string[];
}
