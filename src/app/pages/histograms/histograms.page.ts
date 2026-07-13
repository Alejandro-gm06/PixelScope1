import { Component, computed, signal, Signal, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewChecked, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
  IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonSegment, IonSegmentButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircleOutline, bulbOutline, statsChartOutline } from 'ionicons/icons';
import { ImageService } from '../../services/image.service';
import { HistogramService } from '../../services/histogram.service';
import { AnalysisService, AnalysisResult } from '../../services/analysis.service';
import { HistogramChartComponent } from '../../components/histogram-chart/histogram-chart.component';
import { HistogramData } from '../../models/pixel-data.model';

@Component({
  selector: 'app-histograms',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid,
    IonRow, IonCol, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonAccordionGroup, IonAccordion, IonItem, IonLabel,
    IonSegment, IonSegmentButton, HistogramChartComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Histogramas y Análisis</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="no-image-placeholder animate-fade-slide-up" *ngIf="!imageService.loaded()">
        <ion-icon name="image-outline"></ion-icon>
        <h2>Ninguna imagen cargada</h2>
        <p>Vuelve al inicio y carga una imagen primero.</p>
        <ion-button (click)="goHome()" class="ion-margin-top" color="primary">Ir al Inicio</ion-button>
      </div>

      <ng-container *ngIf="imageService.loaded()">
        <!-- Auto Analysis Card -->
        <ion-card class="analysis-card animate-fade-slide-up" *ngIf="analysisResult() as result">
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="bulb-outline"></ion-icon>
              Análisis Inteligente
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p class="summary-text">{{ result.summary }}</p>
            <ul class="details-list">
              <li *ngFor="let detail of result.details">{{ detail }}</li>
            </ul>
          </ion-card-content>
        </ion-card>

        <!-- View Controls -->
        <div class="view-controls">
          <ion-segment [ngModel]="viewMode()" (ngModelChange)="viewMode.set($event)">
            <ion-segment-button value="separated">
              <ion-label>Separados</ion-label>
            </ion-segment-button>
            <ion-segment-button value="combined">
              <ion-label>Superpuestos</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <!-- Combined View -->
        <ion-card class="combined-card animate-fade-in" *ngIf="viewMode() === 'combined'" [class.hidden]="viewMode() !== 'combined'">
          <ion-card-content>
            <canvas #combinedCanvas width="800" height="300" class="combined-canvas"></canvas>
          </ion-card-content>
        </ion-card>

        <!-- Separated View -->
        <ion-grid class="histograms-grid animate-fade-in" *ngIf="viewMode() === 'separated'">
          <ion-row>
            <!-- Red -->
            <ion-col size="12" size-md="6">
              <div class="histogram-panel">
                <app-histogram-chart 
                  [data]="redHist()?.values || []" 
                  color="#ff4d4d" 
                  label="Canal Rojo">
                </app-histogram-chart>
                <div class="stats-grid" *ngIf="redHist() as hist">
                  <div class="stat-item"><div class="stat-label">Media</div><div class="stat-value">{{ hist.mean }}</div></div>
                  <div class="stat-item"><div class="stat-label">Moda</div><div class="stat-value">{{ hist.mode }}</div></div>
                  <div class="stat-item"><div class="stat-label">Desv. Est.</div><div class="stat-value">{{ hist.stdDev }}</div></div>
                </div>
              </div>
            </ion-col>
            
            <!-- Green -->
            <ion-col size="12" size-md="6">
              <div class="histogram-panel">
                <app-histogram-chart 
                  [data]="greenHist()?.values || []" 
                  color="#4dff88" 
                  label="Canal Verde">
                </app-histogram-chart>
                <div class="stats-grid" *ngIf="greenHist() as hist">
                  <div class="stat-item"><div class="stat-label">Media</div><div class="stat-value">{{ hist.mean }}</div></div>
                  <div class="stat-item"><div class="stat-label">Moda</div><div class="stat-value">{{ hist.mode }}</div></div>
                  <div class="stat-item"><div class="stat-label">Desv. Est.</div><div class="stat-value">{{ hist.stdDev }}</div></div>
                </div>
              </div>
            </ion-col>

            <!-- Blue -->
            <ion-col size="12" size-md="6">
              <div class="histogram-panel">
                <app-histogram-chart 
                  [data]="blueHist()?.values || []" 
                  color="#4d88ff" 
                  label="Canal Azul">
                </app-histogram-chart>
                <div class="stats-grid" *ngIf="blueHist() as hist">
                  <div class="stat-item"><div class="stat-label">Media</div><div class="stat-value">{{ hist.mean }}</div></div>
                  <div class="stat-item"><div class="stat-label">Moda</div><div class="stat-value">{{ hist.mode }}</div></div>
                  <div class="stat-item"><div class="stat-label">Desv. Est.</div><div class="stat-value">{{ hist.stdDev }}</div></div>
                </div>
              </div>
            </ion-col>

            <!-- Gray / Intensity -->
            <ion-col size="12" size-md="6">
              <div class="histogram-panel">
                <app-histogram-chart 
                  [data]="grayHist()?.values || []" 
                  color="#ffffff" 
                  label="Intensidad (Gris)">
                </app-histogram-chart>
                <div class="stats-grid" *ngIf="grayHist() as hist">
                  <div class="stat-item"><div class="stat-label">Media</div><div class="stat-value">{{ hist.mean }}</div></div>
                  <div class="stat-item"><div class="stat-label">Moda</div><div class="stat-value">{{ hist.mode }}</div></div>
                  <div class="stat-item"><div class="stat-label">Desv. Est.</div><div class="stat-value">{{ hist.stdDev }}</div></div>
                </div>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-accordion-group class="education-section ion-margin-top">
          <ion-accordion value="info">
            <ion-item slot="header">
              <ion-icon name="stats-chart-outline" slot="start"></ion-icon>
              <ion-label>¿Qué indica un histograma?</ion-label>
            </ion-item>
            <div slot="content" class="ion-padding education-content">
              <p>Un histograma es un gráfico de barras que muestra la distribución de los tonos en una imagen.</p>
              <ul>
                <li><strong>Eje X (Horizontal):</strong> Representa los valores de tono de 0 (más oscuro/negro) a 255 (más claro/blanco).</li>
                <li><strong>Eje Y (Vertical):</strong> Indica la cantidad de píxeles que tienen ese valor específico.</li>
              </ul>
              <p><strong>¿Cómo leerlo?</strong></p>
              <ul>
                <li>Si la gráfica se acumula a la <strong>izquierda</strong>, la imagen es oscura (subexpuesta).</li>
                <li>Si se acumula a la <strong>derecha</strong>, la imagen es muy brillante (sobreexpuesta).</li>
                <li>Si los datos están agrupados al <strong>centro</strong>, la imagen tiene bajo contraste.</li>
                <li>Si abarca <strong>todo el ancho</strong> de manera distribuida, la imagen tiene buen contraste y aprovecha todo el rango tonal.</li>
              </ul>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </ng-container>
    </ion-content>
  `,
  styles: [`
    .analysis-card {
      background: rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.3);
      margin-bottom: 24px;
      
      ion-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #a78bfa;
        font-size: 16px;
      }
      
      .summary-text {
        font-size: 15px;
        font-weight: 500;
        color: #fff;
        line-height: 1.5;
        margin-bottom: 12px;
        margin-top: 0;
      }
      
      .details-list {
        padding-left: 20px;
        margin: 0;
        color: rgba(255, 255, 255, 0.7);
        font-size: 13px;
        
        li {
          margin-bottom: 6px;
        }
      }
    }

    .view-controls {
      max-width: 300px;
      margin: 0 auto 20px;
    }

    .histogram-panel {
      background: var(--ps-bg-card);
      border: 1px solid var(--ps-glass-border);
      border-radius: var(--ps-radius-md);
      padding: 12px;
      height: 100%;
    }

    .stats-grid {
      margin-top: 12px;
    }

    .combined-card {
      background: var(--ps-bg-card);
      border: 1px solid var(--ps-glass-border);
      padding: 16px;
    }

    .combined-canvas {
      width: 100%;
      height: 250px;
      display: block;
    }
    
    .hidden {
      display: none;
    }
    
    .education-content p { margin-top: 0; }
    .education-content ul { padding-left: 20px; margin-bottom: 12px; }
    .education-content li { margin-bottom: 6px; line-height: 1.5; }
  `]
})
export class HistogramsPage {
  @ViewChild('combinedCanvas') combinedCanvasRef?: ElementRef<HTMLCanvasElement>;
  
  viewMode = signal<'separated' | 'combined'>('separated');
  
  redHist: Signal<HistogramData | null>;
  greenHist: Signal<HistogramData | null>;
  blueHist: Signal<HistogramData | null>;
  grayHist: Signal<HistogramData | null>;
  analysisResult: Signal<AnalysisResult | null>;

  private hasDrawnCombined = false;

  constructor(
    public imageService: ImageService,
    private histogramService: HistogramService,
    private analysisService: AnalysisService,
    private router: Router
  ) {
    addIcons({ informationCircleOutline, bulbOutline, statsChartOutline });
    
    this.redHist = computed(() => {
      const img = this.imageService.imageData();
      return img ? this.histogramService.computeRedHistogram(img) : null;
    });
    
    this.greenHist = computed(() => {
      const img = this.imageService.imageData();
      return img ? this.histogramService.computeGreenHistogram(img) : null;
    });
    
    this.blueHist = computed(() => {
      const img = this.imageService.imageData();
      return img ? this.histogramService.computeBlueHistogram(img) : null;
    });
    
    this.grayHist = computed(() => {
      const img = this.imageService.imageData();
      return img ? this.histogramService.computeGrayHistogram(img) : null;
    });
    
    this.analysisResult = computed(() => {
      const img = this.imageService.imageData();
      return img ? this.analysisService.analyzeImage(img) : null;
    });
    
    effect(() => {
      const mode = this.viewMode();
      if (mode === 'combined') {
        requestAnimationFrame(() => this.drawCombinedHistogram());
      }
    });
  }

  private drawCombinedHistogram() {
    const canvas = this.combinedCanvasRef!.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rData = this.redHist()?.values;
    const gData = this.greenHist()?.values;
    const bData = this.blueHist()?.values;
    const grayData = this.grayHist()?.values;
    
    if (!rData || !gData || !bData || !grayData) return;
    
    // High DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, w, h);
    
    // Global max
    let maxVal = 1;
    for (let i = 0; i < 256; i++) {
      maxVal = Math.max(maxVal, rData[i], gData[i], bData[i]);
    }
    
    const barWidth = w / 256;
    
    // Helper to draw
    const drawSeries = (data: number[], color: string, isLine = false) => {
      ctx.beginPath();
      for (let i = 0; i < 256; i++) {
        const barHeight = (data[i] / maxVal) * (h - 10);
        const x = i * barWidth;
        const y = h - barHeight;
        
        if (i === 0) ctx.moveTo(x, h);
        ctx.lineTo(x + barWidth/2, y);
      }
      ctx.lineTo(w, h);
      
      if (isLine) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = color;
        ctx.fill();
      }
    };
    
    // Draw with multiply blend mode or transparency
    ctx.globalCompositeOperation = 'screen'; // Looks good on dark backgrounds
    
    drawSeries(rData, 'rgba(255, 77, 77, 0.6)');
    drawSeries(gData, 'rgba(77, 255, 136, 0.6)');
    drawSeries(bData, 'rgba(77, 136, 255, 0.6)');
    
    ctx.globalCompositeOperation = 'source-over';
    drawSeries(grayData, 'rgba(255, 255, 255, 0.8)', true); // Gray as solid line
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
