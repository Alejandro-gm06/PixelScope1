import {
  Component, Input, ViewChild, ElementRef,
  AfterViewInit, OnChanges, SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-histogram-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="histogram-wrapper">
      <div class="histogram-label" *ngIf="label">{{ label }}</div>
      <canvas #histCanvas></canvas>
      <div class="histogram-axis">
        <span>0</span>
        <span>64</span>
        <span>128</span>
        <span>192</span>
        <span>255</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .histogram-wrapper {
      background: rgba(0, 0, 0, 0.4);
      border-radius: 12px;
      padding: 16px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .histogram-label {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      color: rgba(255, 255, 255, 0.7);
    }
    canvas {
      display: block;
      width: 100%;
      height: 140px;
      border-radius: 8px;
    }
    .histogram-axis {
      display: flex;
      justify-content: space-between;
      margin-top: 6px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.35);
    }
  `]
})
export class HistogramChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('histCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() data: number[] = [];
  @Input() color = '#ffffff';
  @Input() label = '';
  @Input() fillOpacity = 0.4;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private initialized = false;

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.initialized = true;
    if (this.data.length) {
      this.draw();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['data'] || changes['color']) && this.initialized) {
      this.draw();
    }
  }

  private draw(): void {
    if (!this.data.length || !this.ctx) return;

    // Use requestAnimationFrame to ensure layout has settled
    requestAnimationFrame(() => {
      // High DPI support
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width || this.canvas.parentElement?.clientWidth || 300;
      const h = rect.height || 140;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.ctx.scale(dpr, dpr);

      // Clear
      this.ctx.clearRect(0, 0, w, h);

    // Find max value for normalization
    const maxVal = Math.max(...this.data, 1);
    const barWidth = w / 256;

    // Draw filled area
    this.ctx.beginPath();
    this.ctx.moveTo(0, h);

    for (let i = 0; i < 256; i++) {
      const barHeight = (this.data[i] / maxVal) * (h - 4);
      const x = i * barWidth;
      const y = h - barHeight;
      this.ctx.lineTo(x + barWidth / 2, y);
    }

    this.ctx.lineTo(w, h);
    this.ctx.closePath();

    // Fill with gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, this.hexToRgba(this.color, this.fillOpacity));
    gradient.addColorStop(1, this.hexToRgba(this.color, 0.05));
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Draw line
    this.ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      const barHeight = (this.data[i] / maxVal) * (h - 4);
      const x = i * barWidth;
      const y = h - barHeight;
      if (i === 0) {
        this.ctx.moveTo(x + barWidth / 2, y);
      } else {
        this.ctx.lineTo(x + barWidth / 2, y);
      }
    }
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
    });
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
