import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Error } from '../../../components/error/error';
import { RegisterSteps } from '../../../models/register/steps';
import { Router } from '@angular/router';
import { RegisterDataService } from '../../../services/register/register-data.service';
import { Auth } from '../../../services/auth/auth';

@Component({
  selector: 'app-antispoofing-component',
  imports: [Error],
  templateUrl: './antispoofing.html',
})
export class AntispoofingComponent implements AfterViewInit, OnDestroy {
  openLoader = false;
  showErrorAccessCamera = false;
  showErrorSpoof = false;
  hasError = false;
  canvas: HTMLCanvasElement | null = null;
  cameraId: string | null = null;
  stream: MediaStream | null = null;
  antispoofing: any | null = null;
  defaultMessage = "La <strong>captura</strong> se hará <strong>automáticamente</strong>, coloca tu rostro dentro del <strong>círculo</strong>."
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('indicator') indicator!: ElementRef<HTMLDivElement>;

  constructor(private cdr: ChangeDetectorRef, private registerDataService: RegisterDataService, private router: Router, private auth: Auth) {}

  ngAfterViewInit() {
    this.configureAntispoofing();
  }

  ngOnDestroy() {
    this.stream?.getTracks().forEach((t) => t.stop());
  }

  async configureAntispoofing() {
    try {
      const videoEl = this.video?.nativeElement;
      if (!videoEl) {
        this.showErrorAccessCamera = true;
        return;
      }
      this.canvas = document.createElement('canvas');
      this.cameraId = await this.requestCamera();
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...(this.cameraId ? { deviceId: { exact: this.cameraId } } : {}),
          width: { ideal: 360 },
          height: { ideal: 480 },
          frameRate: { ideal: 60 },
          aspectRatio: 1.77,
        },
        audio: false,
      });
      videoEl.srcObject = this.stream;
      await videoEl.play();
      this.antispoofing = new (window as any).AntiSpoofing({
        videoElement: videoEl,
        canvasElement: this.canvas,
        stream: this.stream,
        inputSize: 224,
        scoreThreshold: 0.8,
        modelsRoute: 'models',
        urlApi: 'https://appservicesdev.azurewebsites.net/TestLife/ValidaAntispoff',
        originSelfHeader: '5b72c18981e916b193adaa52442c8f969f9fa3fb1e95f2bf3a6bf1883bc8a1d0',
        actionListener: this.onActionListener.bind(this),
      });
    } catch (e) {
      console.error(e);
      this.showErrorAccessCamera = true;
    }
  }

  onActionListener(action: string, data: any) {
    if (action === 'error' || action === 'advise') {
      this.hasError = true;
      this.indicator.nativeElement.innerHTML = data;
    } else if (action === 'success') {
      this.hasError = false;
      this.indicator.nativeElement.innerHTML = data;
    } else if (action === 'response') {
      this.indicator.nativeElement.innerHTML = this.defaultMessage;
      this.openLoader = false;
      if(data.success && !data.isSpoof){
        this.registerDataService.updateCurrentStep(RegisterSteps.ANTISPOOFING, { verified: true, completed: true });
        this.router.navigate(['/home']);
        this.auth.login(this.registerDataService.state.data.email, this.registerDataService.state.data.password);
      } else {
        this.showErrorSpoof = true;
      }
    } else if (action === 'framesCaptured') {
      this.openLoader = true;
    }
    this.cdr.detectChanges();
  }

  async requestCamera(): Promise<string | null> {
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      const physicalCameras = videoInputs.filter(
        (d) => !/obs|virtual|snap|manycam|vcam/i.test(d.label)
      );
      return physicalCameras.length ? physicalCameras[0].deviceId : null;
    } finally {
      tempStream.getTracks().forEach((t) => t.stop());
    }
  }

  onCloseErrorAccessCamera() {
    this.showErrorAccessCamera = false;
  }
  onCloseErrorSpoof() {
    this.showErrorSpoof = false;
    this.configureAntispoofing()
  }
}
