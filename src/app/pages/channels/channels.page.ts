import { Component, computed, Signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
  IonSegment, IonSegmentButton, IonLabel, IonAccordionGroup, IonAccordion,
  IonItem, IonButton, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircleOutline } from 'ionicons/icons';
import { ImageService } from '../../services/image.service';
import { ProcessingService } from '../../services/processing.service';
import { ImageCanvasComponent } from '../../components/image-canvas/image-canvas.component';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid,
    IonRow, IonCol, IonSegment, IonSegmentButton, IonLabel, IonAccordionGroup,
    IonAccordion, IonItem, IonButton, IonIcon, ImageCanvasComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Descomposición RGB</ion-title>
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
        <div class="view-controls">
          <ion-segment [(ngModel)]="viewMode" (ionChange)="onModeChange($event)" value="color">
            <ion-segment-button value="color">
              <ion-label>Color</ion-label>
            </ion-segment-button>
            <ion-segment-button value="gray">
              <ion-label>Escala de Grises</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <ion-grid class="channels-grid animate-fade-in">
          <ion-row>
            <ion-col size="12" size-md="6">
              <div class="channel-card">
                <div class="channel-header">
                  <div class="channel-indicator original"></div>
                  <span>Original</span>
                </div>
                <app-image-canvas [imageData]="original()"></app-image-canvas>
              </div>
            </ion-col>
            <ion-col size="12" size-md="6">
              <div class="channel-card">
                <div class="channel-header">
                  <div class="channel-indicator red"></div>
                  <span class="red-text">Canal Rojo (R)</span>
                </div>
                <app-image-canvas [imageData]="redChannel()"></app-image-canvas>
              </div>
            </ion-col>
            <ion-col size="12" size-md="6">
              <div class="channel-card">
                <div class="channel-header">
                  <div class="channel-indicator green"></div>
                  <span class="green-text">Canal Verde (G)</span>
                </div>
                <app-image-canvas [imageData]="greenChannel()"></app-image-canvas>
              </div>
            </ion-col>
            <ion-col size="12" size-md="6">
              <div class="channel-card">
                <div class="channel-header">
                  <div class="channel-indicator blue"></div>
                  <span class="blue-text">Canal Azul (B)</span>
                </div>
                <app-image-canvas [imageData]="blueChannel()"></app-image-canvas>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-accordion-group class="education-section animate-fade-slide-up">
          <ion-accordion value="info">
            <ion-item slot="header">
              <ion-icon name="information-circle-outline" slot="start"></ion-icon>
              <ion-label>¿Qué son los canales RGB?</ion-label>
            </ion-item>
            <div slot="content" class="ion-padding education-content">
              <p>El modelo <strong>RGB (Red, Green, Blue)</strong> es un modelo de color aditivo. Esto significa que los colores se crean sumando luz de diferentes colores (rojo, verde y azul) sobre un fondo negro.</p>
              
              <p>En el procesamiento de imágenes digitales, una imagen a color está compuesta por tres capas o "canales" superpuestos:</p>
              
              <ul>
                <li><strong>Canal Rojo:</strong> Mide cuánta luz roja hay en cada píxel (0-255).</li>
                <li><strong>Canal Verde:</strong> Mide cuánta luz verde hay en cada píxel (0-255).</li>
                <li><strong>Canal Azul:</strong> Mide cuánta luz azul hay en cada píxel (0-255).</li>
              </ul>
              
              <p><strong>Vista en Color vs Escala de Grises:</strong><br>
              En la <em>vista a color</em>, ves cada canal proyectado con luz de su propio color. En la <em>vista en escala de grises</em>, puedes ver la intensidad pura (brillo) de ese canal de forma más clara; las áreas blancas indican el valor máximo (255) y las negras el valor mínimo (0).</p>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </ng-container>
    </ion-content>
  `,
  styles: [`
    .view-controls {
      margin-bottom: 20px;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .channel-card {
      background: var(--ps-bg-card);
      border-radius: var(--ps-radius-md);
      padding: 12px;
      margin-bottom: 8px;
      border: 1px solid var(--ps-glass-border);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .channel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .channel-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .channel-indicator.original { background: linear-gradient(135deg, #ff4d4d, #4dff88, #4d88ff); }
    .channel-indicator.red { background: var(--ps-red); box-shadow: 0 0 8px rgba(255,77,77,0.5); }
    .channel-indicator.green { background: var(--ps-green); box-shadow: 0 0 8px rgba(77,255,136,0.5); }
    .channel-indicator.blue { background: var(--ps-blue); box-shadow: 0 0 8px rgba(77,136,255,0.5); }

    .red-text { color: #ff8888; }
    .green-text { color: #88ffaa; }
    .blue-text { color: #88aaff; }

    .education-section {
      margin-top: 24px;
      margin-bottom: 24px;
    }
    
    .education-content {
      p { margin-top: 0; margin-bottom: 12px; }
      ul { padding-left: 20px; margin-bottom: 16px; }
      li { margin-bottom: 6px; }
    }
  `]
})
export class ChannelsPage {
  viewMode: 'color' | 'gray' = 'color';
  
  original: Signal<ImageData | null>;
  redChannel: Signal<ImageData | null>;
  greenChannel: Signal<ImageData | null>;
  blueChannel: Signal<ImageData | null>;

  constructor(
    public imageService: ImageService,
    private processingService: ProcessingService,
    private router: Router
  ) {
    addIcons({ informationCircleOutline });
    
    this.original = computed(() => this.imageService.imageData());
    
    this.redChannel = computed(() => {
      const img = this.imageService.imageData();
      if (!img) return null;
      return this.viewMode === 'color' 
        ? this.processingService.extractChannel(img, 'red')
        : this.processingService.extractChannelGray(img, 'red');
    });
    
    this.greenChannel = computed(() => {
      const img = this.imageService.imageData();
      if (!img) return null;
      return this.viewMode === 'color' 
        ? this.processingService.extractChannel(img, 'green')
        : this.processingService.extractChannelGray(img, 'green');
    });
    
    this.blueChannel = computed(() => {
      const img = this.imageService.imageData();
      if (!img) return null;
      return this.viewMode === 'color' 
        ? this.processingService.extractChannel(img, 'blue')
        : this.processingService.extractChannelGray(img, 'blue');
    });
  }

  onModeChange(event: any) {
    this.viewMode = event.detail.value;
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
