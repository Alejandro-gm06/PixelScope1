import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PixelData } from '../../models/pixel-data.model';

@Component({
  selector: 'app-pixel-info-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pixel-card" *ngIf="pixel" [@fadeIn]>
      <!-- Color preview -->
      <div class="color-preview-section">
        <div class="color-swatch-large" [style.background]="pixel.hex"></div>
        <div class="coords">
          <span class="coord-label">Posición</span>
          <span class="coord-value">({{ pixel.x }}, {{ pixel.y }})</span>
        </div>
      </div>

      <!-- RGB Section -->
      <div class="section">
        <div class="section-title">RGB</div>
        <div class="channel-row">
          <span class="channel-label red">R</span>
          <div class="channel-bar-bg">
            <div class="channel-bar red" [style.width.%]="(pixel.rgb.r / 255) * 100"></div>
          </div>
          <span class="channel-value">{{ pixel.rgb.r }}</span>
        </div>
        <div class="channel-row">
          <span class="channel-label green">G</span>
          <div class="channel-bar-bg">
            <div class="channel-bar green" [style.width.%]="(pixel.rgb.g / 255) * 100"></div>
          </div>
          <span class="channel-value">{{ pixel.rgb.g }}</span>
        </div>
        <div class="channel-row">
          <span class="channel-label blue">B</span>
          <div class="channel-bar-bg">
            <div class="channel-bar blue" [style.width.%]="(pixel.rgb.b / 255) * 100"></div>
          </div>
          <span class="channel-value">{{ pixel.rgb.b }}</span>
        </div>
      </div>

      <!-- Hex -->
      <div class="section inline-section">
        <div class="section-title">Hexadecimal</div>
        <div class="hex-display">
          <div class="hex-swatch" [style.background]="pixel.hex"></div>
          <span class="hex-value">{{ pixel.hex }}</span>
        </div>
      </div>

      <!-- Gray -->
      <div class="section inline-section">
        <div class="section-title">Escala de Grises</div>
        <span class="mono-value">{{ pixel.gray }}</span>
      </div>

      <!-- CMYK -->
      <div class="section">
        <div class="section-title">CMYK</div>
        <div class="cmyk-grid">
          <div class="cmyk-item">
            <span class="cmyk-label" style="color: #00bcd4">C</span>
            <span class="cmyk-val">{{ pixel.cmyk.c }}%</span>
          </div>
          <div class="cmyk-item">
            <span class="cmyk-label" style="color: #e91e63">M</span>
            <span class="cmyk-val">{{ pixel.cmyk.m }}%</span>
          </div>
          <div class="cmyk-item">
            <span class="cmyk-label" style="color: #ffc107">Y</span>
            <span class="cmyk-val">{{ pixel.cmyk.y }}%</span>
          </div>
          <div class="cmyk-item">
            <span class="cmyk-label" style="color: #9e9e9e">K</span>
            <span class="cmyk-val">{{ pixel.cmyk.k }}%</span>
          </div>
        </div>
      </div>

      <!-- HSI -->
      <div class="section">
        <div class="section-title">HSI</div>
        <div class="hsx-grid">
          <div class="hsx-item">
            <span class="hsx-label">H</span>
            <span class="hsx-val">{{ pixel.hsi.h }}°</span>
          </div>
          <div class="hsx-item">
            <span class="hsx-label">S</span>
            <span class="hsx-val">{{ (pixel.hsi.s * 100).toFixed(1) }}%</span>
          </div>
          <div class="hsx-item">
            <span class="hsx-label">I</span>
            <span class="hsx-val">{{ (pixel.hsi.i * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <!-- HSV -->
      <div class="section">
        <div class="section-title">HSV</div>
        <div class="hsx-grid">
          <div class="hsx-item">
            <span class="hsx-label">H</span>
            <span class="hsx-val">{{ pixel.hsv.h }}°</span>
          </div>
          <div class="hsx-item">
            <span class="hsx-label">S</span>
            <span class="hsx-val">{{ (pixel.hsv.s * 100).toFixed(1) }}%</span>
          </div>
          <div class="hsx-item">
            <span class="hsx-label">V</span>
            <span class="hsx-val">{{ (pixel.hsv.v * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pixel-card {
      background: rgba(20, 20, 35, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 20px;
      animation: fadeSlideIn 0.3s ease-out;
    }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .color-preview-section {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .color-swatch-large {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      border: 2px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      flex-shrink: 0;
    }

    .coords {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .coord-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.4);
    }

    .coord-value {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      font-family: 'JetBrains Mono', monospace;
    }

    .section {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 8px;
      font-weight: 600;
    }

    .channel-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .channel-label {
      width: 20px;
      font-weight: 700;
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
    }

    .channel-label.red { color: #ff4d4d; }
    .channel-label.green { color: #4dff88; }
    .channel-label.blue { color: #4d88ff; }

    .channel-bar-bg {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 4px;
      overflow: hidden;
    }

    .channel-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .channel-bar.red { background: linear-gradient(90deg, #ff4d4d, #ff8888); }
    .channel-bar.green { background: linear-gradient(90deg, #4dff88, #88ffaa); }
    .channel-bar.blue { background: linear-gradient(90deg, #4d88ff, #88aaff); }

    .channel-value {
      width: 32px;
      text-align: right;
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      color: rgba(255, 255, 255, 0.8);
    }

    .inline-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .inline-section .section-title {
      margin-bottom: 0;
    }

    .hex-display {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hex-swatch {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .hex-value, .mono-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: #fff;
      font-weight: 500;
    }

    .cmyk-grid, .hsx-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .hsx-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .cmyk-item, .hsx-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 8px;
      text-align: center;
    }

    .cmyk-label, .hsx-label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 4px;
      color: rgba(255, 255, 255, 0.5);
    }

    .cmyk-val, .hsx-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #fff;
    }
  `]
})
export class PixelInfoCardComponent {
  @Input() pixel: PixelData | null = null;
}
