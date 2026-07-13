import { Component, computed, signal, Signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton,
  IonLabel, IonAccordionGroup, IonAccordion, IonItem, IonButton, IonIcon, IonCard
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { informationCircleOutline, colorWandOutline } from 'ionicons/icons';
import { ImageService } from '../../services/image.service';
import { ProcessingService } from '../../services/processing.service';
import { ImageCanvasComponent } from '../../components/image-canvas/image-canvas.component';
import { ColorSpace } from '../../models/pixel-data.model';

@Component({
  selector: 'app-color-spaces',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonSegment, IonSegmentButton, IonLabel, IonAccordionGroup, IonAccordion,
    IonItem, IonButton, IonIcon, IonCard, ImageCanvasComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Espacios de Color</ion-title>
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
        <div class="space-selector-container">
          <ion-segment [ngModel]="selectedSpace()" (ngModelChange)="selectedSpace.set($event)" scrollable>
            <ion-segment-button value="original"><ion-label>RGB (Original)</ion-label></ion-segment-button>
            <ion-segment-button value="grayscale"><ion-label>Grises</ion-label></ion-segment-button>
            <ion-segment-button value="cmyk"><ion-label>CMYK (Simulado)</ion-label></ion-segment-button>
            <ion-segment-button value="hue"><ion-label>Matiz (Hue)</ion-label></ion-segment-button>
            <ion-segment-button value="saturation"><ion-label>Saturación</ion-label></ion-segment-button>
            <ion-segment-button value="intensity"><ion-label>Luminosidad</ion-label></ion-segment-button>
          </ion-segment>
          
          <!-- Sub-toggle for Saturation and Luminosity (HSI vs HSV) -->
          <div class="sub-toggle animate-fade-in" *ngIf="selectedSpace() === 'saturation' || selectedSpace() === 'intensity'">
            <ion-segment [ngModel]="modelVariant()" (ngModelChange)="modelVariant.set($event)" class="compact-segment">
              <ion-segment-button value="hsi">
                <ion-label>Modelo HSI (Intensidad)</ion-label>
              </ion-segment-button>
              <ion-segment-button value="hsv">
                <ion-label>Modelo HSV (Value)</ion-label>
              </ion-segment-button>
            </ion-segment>
          </div>
        </div>

        <ion-card class="main-canvas-card animate-fade-in">
          <app-image-canvas [imageData]="processedImage()"></app-image-canvas>
        </ion-card>

        <ion-accordion-group class="education-section animate-fade-slide-up" [value]="selectedSpace()">
          
          <ion-accordion value="original">
            <ion-item slot="header">
              <ion-icon name="color-wand-outline" slot="start"></ion-icon>
              <ion-label>Modelo RGB</ion-label>
            </ion-item>
            <div slot="content" class="ion-padding education-content">
              <p>El modelo RGB (Rojo, Verde, Azul) representa los colores tal como son capturados por sensores de cámara y mostrados en pantallas (aditivo).</p>
            </div>
          </ion-accordion>

          <ion-accordion value="grayscale">
            <ion-item slot="header">
              <ion-icon name="information-circle-outline" slot="start"></ion-icon>
              <ion-label>Escala de Grises (Luminancia)</ion-label>
            </ion-item>
            <div slot="content" class="ion-padding education-content">
              <p>Convierte el color a una intensidad en blanco y negro considerando cómo el ojo humano percibe el brillo (somos más sensibles al verde).</p>
              <div class="formula-box">Y = 0.299·R + 0.587·G + 0.114·B</div>
            </div>
          </ion-accordion>

          <ion-accordion value="cmyk">
            <ion-item slot="header">
              <ion-icon name="information-circle-outline" slot="start"></ion-icon>
              <ion-label>Modelo CMYK (Sustractivo)</ion-label>
            </ion-item>
            <div slot="content" class="ion-padding education-content">
              <p>Usado en impresión. La tinta absorbe (resta) luz. CMY son los opuestos de RGB (Cian opuesto al Rojo, Magenta al Verde, Amarillo al Azul). La 'K' (Key) es negro puro añadido para mejorar el contraste.</p>
              <div class="formula-box">
                K = 1 - max(R', G', B')<br>
                C = (1 - R' - K) / (1 - K)
              </div>
            </div>
          </ion-accordion>

          <ion-accordion value="hue">
            <ion-item slot="header">
              <ion-icon name="information-circle-outline" slot="start"></ion-icon>
              <ion-label>Matiz (Hue)</ion-label>
            </ion-item>
            <div slot="content" class="ion-padding education-content">
              <p>El Matiz es el "tipo de color" puro (rojo, verde, naranja, etc.), medido como un ángulo de 0° a 360° en un círculo cromático. Separa el color de su brillo o pureza.</p>
            </div>
          </ion-accordion>
          
          <ion-accordion value="saturation">
            <ion-item slot="header">
              <ion-icon name="information-circle-outline" slot="start"></ion-icon>
              <ion-label>Saturación (HSI vs HSV)</ion-label>
            </ion-item>
            <div slot="content" class="ion-padding education-content">
              <p>La saturación indica la "pureza" del color. Una saturación de 0 es gris; 100% es el color más puro posible.</p>
              <ul>
                <li><strong>HSI:</strong> La pureza se mide respecto a la intensidad promedio. $S = 1 - 3 \cdot \min(R,G,B)/(R+G+B)$</li>
                <li><strong>HSV:</strong> La pureza se mide respecto al canal más brillante. $S = (\max - \min) / \max$</li>
              </ul>
              <p><em>Notarás que HSI suele producir imágenes de saturación más oscuras/estrictas, mientras que HSV es el estándar en selectores de color de software.</em></p>
            </div>
          </ion-accordion>
          
          <ion-accordion value="intensity">
            <ion-item slot="header">
              <ion-icon name="information-circle-outline" slot="start"></ion-icon>
              <ion-label>Luminosidad: Intensidad (HSI) vs Valor (HSV)</ion-label>
            </ion-item>
            <div slot="content" class="ion-padding education-content">
              <p>Representa qué tan claro u oscuro es el color, pero los modelos difieren fundamentalmente:</p>
              <ul>
                <li><strong>HSI (Intensidad):</strong> Es el promedio matemático de los tres canales. Representa la energía luminosa total. $I = (R+G+B)/3$</li>
                <li><strong>HSV (Valor):</strong> Es simplemente el valor del canal más alto. Representa el brillo máximo. $V = \max(R,G,B)$</li>
              </ul>
            </div>
          </ion-accordion>

        </ion-accordion-group>
      </ng-container>
    </ion-content>
  `,
  styles: [`
    .space-selector-container {
      margin-bottom: 20px;
    }
    
    ion-segment {
      margin-bottom: 12px;
    }
    
    .compact-segment {
      max-width: 300px;
      margin: 0 auto;
      --background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      
      ion-segment-button {
        min-height: 28px;
        font-size: 11px;
      }
    }

    .main-canvas-card {
      margin: 0 0 24px 0;
      padding: 0;
      overflow: hidden;
      border-radius: var(--ps-radius-md);
    }

    .formula-box {
      background: rgba(0, 0, 0, 0.3);
      padding: 12px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      margin-top: 8px;
      color: #a78bfa;
      border-left: 3px solid #7c3aed;
    }

    .education-content {
      p { margin-top: 0; margin-bottom: 12px; line-height: 1.6; }
      ul { padding-left: 20px; margin-bottom: 0; }
      li { margin-bottom: 8px; line-height: 1.5; }
    }
  `]
})
export class ColorSpacesPage {
  selectedSpace = signal<string>('original');
  modelVariant = signal<'hsi' | 'hsv'>('hsi');
  
  processedImage: Signal<ImageData | null>;

  constructor(
    public imageService: ImageService,
    private processingService: ProcessingService,
    private router: Router
  ) {
    addIcons({ informationCircleOutline, colorWandOutline });
    
    this.processedImage = computed(() => {
      const img = this.imageService.imageData();
      const space = this.selectedSpace();
      const variant = this.modelVariant();
      if (!img) return null;
      
      let spaceToProcess: ColorSpace = 'original';
      
      if (space === 'saturation') {
        spaceToProcess = variant === 'hsi' ? 'saturation-hsi' : 'saturation-hsv';
      } else if (space === 'intensity') {
        spaceToProcess = variant === 'hsi' ? 'intensity' : 'value';
      } else {
        spaceToProcess = space as ColorSpace;
      }
      
      return this.processingService.processColorSpace(img, spaceToProcess);
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
