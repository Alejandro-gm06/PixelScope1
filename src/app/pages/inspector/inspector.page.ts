import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
  IonButton, IonIcon, IonCard, IonAccordionGroup, IonAccordion, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { scanOutline, informationCircleOutline } from 'ionicons/icons';
import { ImageService } from '../../services/image.service';
import { ProcessingService } from '../../services/processing.service';
import { ImageCanvasComponent } from '../../components/image-canvas/image-canvas.component';
import { PixelInfoCardComponent } from '../../components/pixel-info-card/pixel-info-card.component';
import { PixelData } from '../../models/pixel-data.model';

@Component({
  selector: 'app-inspector',
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid,
    IonRow, IonCol, IonButton, IonIcon, IonCard, IonAccordionGroup, IonAccordion,
    IonItem, IonLabel, ImageCanvasComponent, PixelInfoCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Inspector de Píxeles</ion-title>
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
        <ion-grid class="inspector-grid">
          <ion-row>
            <!-- Left col: Interactive Image -->
            <ion-col size="12" size-lg="8" class="image-col">
              <ion-card class="canvas-card animate-fade-in">
                <div class="instruction-banner">
                  <ion-icon name="scan-outline"></ion-icon>
                  <span>Haz clic o pasa el cursor para inspeccionar</span>
                </div>
                <app-image-canvas 
                  [imageData]="imageService.imageData()"
                  [interactive]="true"
                  (pixelClick)="onPixelSelect($event)"
                  (pixelHover)="onPixelHover($event)">
                </app-image-canvas>
              </ion-card>
            </ion-col>

            <!-- Right col: Info & Magnifier -->
            <ion-col size="12" size-lg="4" class="info-col animate-fade-slide-up">
              
              <!-- Magnifier -->
              <div class="magnifier-container" [class.active]="currentPixel">
                <canvas #magnifierCanvas width="150" height="150"></canvas>
                <div class="crosshair-h"></div>
                <div class="crosshair-v"></div>
              </div>

              <!-- Pixel Info Card -->
              <div class="info-container" *ngIf="currentPixel">
                <app-pixel-info-card [pixel]="currentPixel"></app-pixel-info-card>
              </div>
              
              <div class="empty-info" *ngIf="!currentPixel">
                <p>Selecciona un píxel para ver sus valores en todos los espacios de color.</p>
              </div>

            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-accordion-group class="education-section ion-margin-top animate-fade-in">
          <ion-accordion value="info">
            <ion-item slot="header">
              <ion-icon name="information-circle-outline" slot="start"></ion-icon>
              <ion-label>Entendiendo los valores</ion-label>
            </ion-item>
            <div slot="content" class="ion-padding education-content">
              <p>El inspector descompone el color exacto de un solo píxel en múltiples modelos matemáticos simultáneamente:</p>
              <ul>
                <li><strong>Hexadecimal:</strong> Representación web estándar (ej: #FF0000 es rojo puro).</li>
                <li><strong>CMYK Simulado:</strong> Los porcentajes de tinta Cian, Magenta, Amarilla y Negra necesarios para imprimir este color.</li>
                <li><strong>HSI vs HSV:</strong> Compara la diferencia en los valores de Saturación y Brillo/Intensidad según el modelo utilizado.</li>
              </ul>
            </div>
          </ion-accordion>
        </ion-accordion-group>
      </ng-container>
    </ion-content>
  `,
  styles: [`
    .inspector-grid {
      padding: 0;
    }
    
    .canvas-card {
      margin: 0;
      padding: 0;
      overflow: hidden;
      border-radius: var(--ps-radius-md);
      position: relative;
    }

    .instruction-banner {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 10, 20, 0.7);
      backdrop-filter: blur(8px);
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
      z-index: 10;
      pointer-events: none;
      
      ion-icon {
        color: var(--ps-primary-end);
      }
    }

    .info-col {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .magnifier-container {
      width: 150px;
      height: 150px;
      margin: 0 auto;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      position: relative;
      background: rgba(0, 0, 0, 0.5);
      transition: all 0.3s ease;
      opacity: 0.5;
      
      &.active {
        opacity: 1;
        border-color: var(--ps-primary-start);
        box-shadow: var(--ps-shadow-glow);
      }
      
      canvas {
        display: block;
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
      }
      
      .crosshair-h, .crosshair-v {
        position: absolute;
        background: rgba(255, 255, 255, 0.5);
        pointer-events: none;
      }
      
      .crosshair-h {
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
      }
      
      .crosshair-v {
        left: 50%;
        top: 0;
        bottom: 0;
        width: 1px;
      }
    }

    .empty-info {
      text-align: center;
      padding: 40px 20px;
      color: var(--ps-text-muted);
      font-size: 14px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: var(--ps-radius-md);
    }
    
    .education-content p { margin-top: 0; }
    .education-content ul { padding-left: 20px; margin-bottom: 0; }
    .education-content li { margin-bottom: 8px; }
  `]
})
export class InspectorPage {
  @ViewChild('magnifierCanvas') magnifierCanvasRef!: ElementRef<HTMLCanvasElement>;
  
  currentPixel: PixelData | null = null;
  private isHovering = false;

  constructor(
    public imageService: ImageService,
    private processingService: ProcessingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ scanOutline, informationCircleOutline });
  }

  onPixelHover(coords: { x: number; y: number }) {
    this.isHovering = true;
    this.updateInspector(coords);
  }

  onPixelSelect(coords: { x: number; y: number }) {
    this.updateInspector(coords);
  }

  private updateInspector(coords: { x: number; y: number }) {
    const imgData = this.imageService.imageData();
    if (!imgData) return;

    // Update info card
    this.currentPixel = this.processingService.getPixelInfo(imgData, coords.x, coords.y);
    this.cdr.detectChanges(); // Update UI
    
    // Update magnifier (20x20 area zoomed to 150x150)
    if (this.magnifierCanvasRef) {
      const canvas = this.magnifierCanvasRef.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const zoom = 150 / 20; // 7.5x
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, 150, 150);
      
      // We need to draw a portion of the original image data onto the magnifier
      // Create a temporary canvas to hold the full image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgData.width;
      tempCanvas.height = imgData.height;
      tempCanvas.getContext('2d')!.putImageData(imgData, 0, 0);
      
      // Draw zoomed crop
      ctx.drawImage(
        tempCanvas,
        coords.x - 10, coords.y - 10, 20, 20, // source rect
        0, 0, 150, 150 // destination rect
      );
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
