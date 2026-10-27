import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import type { InferenceSession, Tensor } from 'onnxruntime-web/wasm';
import { IYuNetFace, LifeTestBorderState, LifeTestFramesEvent } from '../../interfaces/IYuNet';
import {
  averageSectorLuminance,
  createLetterboxMeta,
  decodeYuNetOutputs,
  eyeTiltDegrees,
  rgbaToYuNetTensor,
  tiltPercentFromDegrees,
} from './yunet-decoder';

const MODEL_PATH = "/models/face_detection_yunet_2023mar.onnx";
const MODEL_INPUT_SIZE = 640;
const IDEAL_WIDTH = 480;
const IDEAL_HEIGHT = 640;
const CAPTURE_COUNT = 10;
/** Espera con validaciones OK antes de empezar a muestrear frames. */
const CAPTURE_HOLD_MS = 2000;
const CAPTURE_IN_PROGRESS_MSG =
  'Por favor no te muevas mientras estamos capturando tu rostro.';
const ORT_WASM_PATHS = {
  mjs: '/ort/ort-wasm-simd-threaded.mjs',
  wasm: '/ort/ort-wasm-simd-threaded.wasm',
};

@Component({
  selector: 'app-life-test',
  imports: [],
  templateUrl: './life-test.html',
})
export class LifeTest implements AfterViewInit, OnDestroy {
  @ViewChild('video', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('processCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  /** Desviación máxima horizontal del centro del rostro (fracción del ancho). */
  @Input() centerToleranceX = 0.08;
  /** Desviación máxima vertical del centro del rostro (fracción del alto). */
  @Input() centerToleranceY = 0.08;
  /** Luminosidad promedio mínima (0–255) sobre 6 sectores. */
  @Input() minLuminance = 80;
  /** Luminosidad promedio máxima (0–255); por encima el rostro suele quedar sobreexpuesto. */
  @Input() maxLuminance = 200;
  /** Ancho mínimo del rostro respecto al video (0–1). */
  @Input() minFaceWidthRatio = 0.30;
  /** Ancho máximo del rostro respecto al video (0–1). */
  @Input() maxFaceWidthRatio = 0.50;
  /** Porcentaje máximo de inclinación lateral (100% = 90°). */
  @Input() maxTiltPercent = 6;
  /** Asimetría máxima ojo–nariz respecto a la distancia interocular (frente). */
  @Input() maxYawAsymmetry = 0.08;
  @Input() scoreThreshold = 0.6;
  @Input() nmsThreshold = 0.3;
  @Input() autoStart = true;

  @Output() framesCaptured = new EventEmitter<LifeTestFramesEvent>();
  @Output() validationError = new EventEmitter<string>();
  @Output() cameraError = new EventEmitter<string>();

  readonly borderState = signal<LifeTestBorderState>('idle');

  private session: InferenceSession | null = null;
  private ortModule: typeof import('onnxruntime-web/wasm') | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private running = false;
  private inferring = false;
  private capturing = false;
  private capturedFrames: string[] = [];
  private captureHoldStartedAt: number | null = null;
  private destroyed = false;

  ngAfterViewInit(): void {
    if (this.autoStart) {
      void this.start();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopAll();
  }

  /** Inicia cámara, modelo YuNet y el ciclo de detección. */
  async start(): Promise<void> {
    if (this.running) return;

    this.borderState.set('idle');
    this.capturedFrames = [];
    this.capturing = false;
    this.captureHoldStartedAt = null;

    try {
      await this.loadModel();
      await this.openCamera();
      this.running = true;
      this.scheduleDetect();
    } catch {
      this.handleInitError();
      this.stopAll();
    }
  }

  /** Detiene todo y vuelve a iniciar el proceso. */
  async restart(): Promise<void> {
    this.stopAll();
    await this.start();
  }

  private handleInitError(): void {
    this.cameraError.emit('Error al iniciar la cámara');
  }

  private reportValidationError(description: string): void {
    this.validationError.emit(description);
  }

  private async loadModel(): Promise<void> {
    if (this.session) return;

    // Importar solo el backend WASM (sin JSEP/WebGPU) para usar los binarios en /ort.
    const ort = await import('onnxruntime-web/wasm');
    this.ortModule = ort;
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.wasmPaths = ORT_WASM_PATHS;

    this.session = await ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ['wasm'],
    });
  }

  private async openCamera(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.cameraError.emit('getUserMedia no está disponible en este navegador');
      return;
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: { ideal: IDEAL_WIDTH },
        height: { ideal: IDEAL_HEIGHT },
        aspectRatio: { ideal: IDEAL_WIDTH / IDEAL_HEIGHT },
      },
    });

    const video = this.videoRef.nativeElement;
    video.srcObject = this.stream;
    video.muted = true;
    await video.play();
  }

  private scheduleDetect(): void {
    if (!this.running || this.destroyed) return;

    this.rafId = requestAnimationFrame(() => {
      void this.detectFrame().finally(() => this.scheduleDetect());
    });
  }

  private async detectFrame(): Promise<void> {
    if (!this.running || this.inferring || !this.session || !this.ortModule) return;

    const video = this.videoRef.nativeElement;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    const width = video.videoWidth || IDEAL_WIDTH;
    const height = video.videoHeight || IDEAL_HEIGHT;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    this.inferring = true;
    try {
      const meta = createLetterboxMeta(width, height, MODEL_INPUT_SIZE);
      const tensorData = rgbaToYuNetTensor(imageData.data, width, height, meta);
      const tensor: Tensor = new this.ortModule.Tensor('float32', tensorData, [
        1,
        3,
        MODEL_INPUT_SIZE,
        MODEL_INPUT_SIZE,
      ]);

      const outputMap = await this.session.run({ input: tensor });
      const decodedInputs: Record<string, { data: Float32Array; dims: readonly number[] }> = {};
      for (const name of Object.keys(outputMap)) {
        const t = outputMap[name];
        decodedInputs[name] = {
          data: t.data as Float32Array,
          dims: t.dims,
        };
      }

      const faces = decodeYuNetOutputs(
        decodedInputs,
        {
          scoreThreshold: this.scoreThreshold,
          nmsThreshold: this.nmsThreshold,
          inputWidth: MODEL_INPUT_SIZE,
          inputHeight: MODEL_INPUT_SIZE,
        },
        meta,
      );

      const valid = this.runValidations(faces, imageData.data, width, height);
      if (!valid) {
        this.capturing = false;
        this.capturedFrames = [];
        this.captureHoldStartedAt = null;
        this.borderState.set('invalid');
        return;
      }

      this.borderState.set('valid');
      await this.captureFrame(canvas);
    } catch {
      this.handleInitError();
      this.borderState.set('invalid');
    } finally {
      this.inferring = false;
    }
  }

  private runValidations(
    faces: IYuNetFace[],
    rgba: Uint8ClampedArray,
    width: number,
    height: number,
  ): boolean {
    // 1. Que exista un rostro
    if (faces.length === 0) {
      this.reportValidationError('Coloque su rostro en el óvalo');
      return false;
    }

    // 2. Solo un rostro
    if (faces.length > 1) {
      this.reportValidationError('Coloque solo un rostro en el óvalo');
      return false;
    }

    const face = faces[0];
    const cx = face.bbox.x + face.bbox.width / 2;
    const cy = face.bbox.y + face.bbox.height / 2;
    const frameCx = width / 2;
    const frameCy = height / 2;

    // 3. Rostro centrado
    if (Math.abs(cx - frameCx) > width * this.centerToleranceX) {
      this.reportValidationError('Alinee su rostro con la pantalla');
      return false;
    }
    if (Math.abs(cy - frameCy) > height * this.centerToleranceY) {
      this.reportValidationError('Alinee su rostro con la pantalla');
      return false;
    }

    // 4. Luminosidad promedio en 6 sectores
    const sectors = averageSectorLuminance(rgba, width, height, 6);
    const avgLuminance = sectors.reduce((a, b) => a + b, 0) / sectors.length;
    if (avgLuminance < this.minLuminance) {
      this.reportValidationError('Busca un lugar con más luz');
      return false;
    }
    if (avgLuminance > this.maxLuminance) {
      this.reportValidationError('Busca un lugar con menos luz');
      return false;
    }

    // 5. Distancia (porcentaje de ancho del rostro)
    const faceWidthRatio = face.bbox.width / width;
    if (faceWidthRatio < this.minFaceWidthRatio) {
      this.reportValidationError('Acércate a la zona de captura');
      return false;
    }
    if (faceWidthRatio > this.maxFaceWidthRatio) {
      this.reportValidationError('Aléjate de la zona de captura');
      return false;
    }

    // 6. Inclinación lateral (línea entre ojos)
    const tiltDeg = eyeTiltDegrees(face.leftEye, face.rightEye);
    const tiltPct = tiltPercentFromDegrees(tiltDeg);
    if (tiltPct > this.maxTiltPercent) {
      this.reportValidationError('Alinee su rostro con la pantalla');
      return false;
    }

    // 7. Mirando de frente
    if (!this.isFacingCamera(face)) {
      this.reportValidationError('Mantenga la mirada al frente durante todo el proceso');
      return false;
    }

    return true;
  }

  private isFacingCamera(face: IYuNetFace): boolean {
    const eyeDist = Math.hypot(
      face.leftEye.x - face.rightEye.x,
      face.leftEye.y - face.rightEye.y,
    );
    if (eyeDist < 1) return false;

    const midEyeX = (face.leftEye.x + face.rightEye.x) / 2;
    const noseOffset = Math.abs(face.nose.x - midEyeX) / eyeDist;

    const distRight = Math.hypot(face.nose.x - face.rightEye.x, face.nose.y - face.rightEye.y);
    const distLeft = Math.hypot(face.nose.x - face.leftEye.x, face.nose.y - face.leftEye.y);
    const asymmetry = Math.abs(distLeft - distRight) / eyeDist;

    const mouthMidX = (face.leftMouth.x + face.rightMouth.x) / 2;
    const mouthOffset = Math.abs(mouthMidX - face.nose.x) / eyeDist;

    const eyesY = (face.leftEye.y + face.rightEye.y) / 2;
    const mouthY = (face.leftMouth.y + face.rightMouth.y) / 2;
    const noseBetween = face.nose.y > eyesY && face.nose.y < mouthY;

    return (
      noseOffset <= this.maxYawAsymmetry &&
      asymmetry <= this.maxYawAsymmetry &&
      mouthOffset <= this.maxYawAsymmetry &&
      noseBetween
    );
  }

  private async captureFrame(canvas: HTMLCanvasElement): Promise<void> {
    if (!this.capturing) {
      this.capturing = true;
      this.capturedFrames = [];
      this.captureHoldStartedAt = Date.now();
    }

    // Mantener el mensaje de captura y esperar antes de tomar frames.
    this.reportValidationError(CAPTURE_IN_PROGRESS_MSG);
    if (
      this.captureHoldStartedAt === null ||
      Date.now() - this.captureHoldStartedAt < CAPTURE_HOLD_MS
    ) {
      return;
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    this.capturedFrames.push(base64);

    if (this.capturedFrames.length < CAPTURE_COUNT) return;

    const frames = [...this.capturedFrames];
    this.framesCaptured.emit({ frames });
    this.stopAll();
    this.borderState.set('valid');
  }

  private stopAll(): void {
    this.running = false;
    this.inferring = false;
    this.capturing = false;
    this.capturedFrames = [];
    this.captureHoldStartedAt = null;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = null;
    }

    const video = this.videoRef?.nativeElement;
    if (video) {
      video.srcObject = null;
    }

    // Liberar sesión ONNX para no seguir consumiendo memoria/CPU.
    const session = this.session;
    this.session = null;
    this.ortModule = null;
    void session?.release?.();
  }
}
