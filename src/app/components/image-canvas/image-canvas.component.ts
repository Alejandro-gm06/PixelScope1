import {
  Component, Input, Output, EventEmitter,
  ViewChild, ElementRef, AfterViewInit, OnChanges,
  SimpleChanges, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-canvas',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="canvas-wrapper" [class.interactive]="interactive">
      <canvas
        #imageCanvas
        (click)="onCanvasClick($event)"
        (mousemove)="onCanvasMove($event)"
        (touchstart)="onTouchStart($event)"
      ></canvas>
      <div class="no-image" *ngIf="!imageData">
        <ion-icon name="image-outline"></ion-icon>
        <p>Sin imagen</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .canvas-wrapper {
      position: relative;
      width: 100%;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
    }
    .canvas-wrapper.interactive {
      cursor: crosshair;
    }
    canvas {
      display: block;
      max-width: 100%;
      height: auto;
      border-radius: 12px;
    }
    .no-image {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.3);
    }
    .no-image ion-icon {
      font-size: 48px;
    }
    .no-image p {
      font-size: 14px;
      margin: 0;
    }
  `]
})
export class ImageCanvasComponent implements AfterViewInit, OnChanges {
  @ViewChild('imageCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() imageData: ImageData | null = null;
  @Input() interactive = false;
  @Input() maxHeight = 500;

  @Output() pixelClick = new EventEmitter<{ x: number; y: number }>();
  @Output() pixelHover = new EventEmitter<{ x: number; y: number }>();

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private initialized = false;

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    this.initialized = true;
    if (this.imageData) {
      this.render();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageData'] && this.initialized) {
      this.render();
    }
  }

  private render(): void {
    if (!this.imageData || !this.ctx) return;
    this.canvas.width = this.imageData.width;
    this.canvas.height = this.imageData.height;
    this.ctx.putImageData(this.imageData, 0, 0);
  }

  private getPixelCoords(event: MouseEvent | Touch): { x: number; y: number } | null {
    if (!this.imageData) return null;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.imageData.width / rect.width;
    const scaleY = this.imageData.height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);

    if (x < 0 || x >= this.imageData.width || y < 0 || y >= this.imageData.height) {
      return null;
    }
    return { x, y };
  }

  onCanvasClick(event: MouseEvent): void {
    if (!this.interactive) return;
    const coords = this.getPixelCoords(event);
    if (coords) this.pixelClick.emit(coords);
  }

  onCanvasMove(event: MouseEvent): void {
    if (!this.interactive) return;
    const coords = this.getPixelCoords(event);
    if (coords) this.pixelHover.emit(coords);
  }

  onTouchStart(event: TouchEvent): void {
    if (!this.interactive || !event.touches.length) return;
    event.preventDefault();
    const coords = this.getPixelCoords(event.touches[0]);
    if (coords) this.pixelClick.emit(coords);
  }
}
