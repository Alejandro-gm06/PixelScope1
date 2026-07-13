import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon,
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonActionSheet,
  IonModal, IonItem, IonLabel, IonList
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { folderOutline, cameraOutline, imagesOutline, imageOutline } from 'ionicons/icons';
import { PhotoService } from '../../services/photo.service';
import { ImageService } from '../../services/image.service';
import { ImageCanvasComponent } from '../../components/image-canvas/image-canvas.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonModal,
    IonItem, IonLabel, IonList, ImageCanvasComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>PixelScope</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="hero-section">
        <h1 class="gradient-text">Análisis de Color</h1>
        <p class="subtitle">Explora los fundamentos del procesamiento de imágenes</p>
      </div>

      <ion-grid>
        <ion-row>
          <ion-col size="12" size-md="4">
            <ion-card class="action-card glass-card" (click)="uploadFile()">
              <ion-card-content>
                <div class="icon-circle">
                  <ion-icon name="folder-outline"></ion-icon>
                </div>
                <h3>Cargar Archivo</h3>
                <p>JPG, PNG</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
          
          <ion-col size="12" size-md="4">
            <ion-card class="action-card glass-card" (click)="takePhoto()">
              <ion-card-content>
                <div class="icon-circle">
                  <ion-icon name="camera-outline"></ion-icon>
                </div>
                <h3>Cámara</h3>
                <p>Capturar foto</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
          
          <ion-col size="12" size-md="4">
            <ion-card class="action-card glass-card" (click)="showSamplesModal = true">
              <ion-card-content>
                <div class="icon-circle">
                  <ion-icon name="images-outline"></ion-icon>
                </div>
                <h3>Ejemplos</h3>
                <p>Imágenes de prueba</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div class="preview-section" *ngIf="imageService.loaded()">
        <h3 class="section-title">Imagen Actual</h3>
        <app-image-canvas 
          [imageData]="imageService.imageData()"
          [interactive]="false">
        </app-image-canvas>
      </div>

      <div class="no-image-placeholder animate-fade-slide-up" *ngIf="!imageService.loaded()">
        <ion-icon name="image-outline"></ion-icon>
        <h2>Ninguna imagen cargada</h2>
        <p>Selecciona una opción arriba para comenzar el análisis.</p>
      </div>

      <!-- Samples Modal -->
      <ion-modal [isOpen]="showSamplesModal" (didDismiss)="showSamplesModal = false" initialBreakpoint="0.5" [breakpoints]="[0, 0.5, 0.75]">
        <ng-template>
          <ion-header class="ion-no-border">
            <ion-toolbar>
              <ion-title>Imágenes de Ejemplo</ion-title>
              <ion-buttons slot="end">
                <ion-button (click)="showSamplesModal = false">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-grid>
              <ion-row>
                <ion-col size="6" *ngFor="let sample of samples">
                  <div class="sample-item" (click)="loadSample(sample.file)">
                    <img [src]="'assets/samples/' + sample.file" [alt]="sample.name" />
                    <div class="sample-label">{{ sample.name }}</div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-content>
        </ng-template>
      </ion-modal>
    </ion-content>
  `,
  styles: [`
    .hero-section {
      text-align: center;
      padding: 40px 20px;
      margin-bottom: 20px;
    }
    
    h1 {
      font-size: 36px;
      font-weight: 800;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    
    .subtitle {
      font-size: 16px;
      color: var(--ps-text-secondary);
      max-width: 400px;
      margin: 0 auto;
    }

    .action-card {
      cursor: pointer;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      
      &:active {
        transform: scale(0.97);
      }
      
      h3 {
        margin: 16px 0 4px;
        font-weight: 600;
        font-size: 16px;
        color: var(--ps-text-primary);
      }
      
      p {
        margin: 0;
        font-size: 13px;
        color: var(--ps-text-muted);
      }
    }

    .icon-circle {
      width: 64px;
      height: 64px;
      margin: 0 auto;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      
      ion-icon {
        font-size: 28px;
        color: var(--ps-primary-end);
      }
    }

    .action-card:hover .icon-circle {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-4px);
      box-shadow: var(--ps-shadow-glow);
    }

    .preview-section {
      margin-top: 40px;
      animation: fadeSlideUp 0.5s ease-out;
    }

    .sample-item {
      position: relative;
      border-radius: var(--ps-radius-md);
      overflow: hidden;
      cursor: pointer;
      aspect-ratio: 1;
      border: 2px solid transparent;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--ps-primary-start);
        transform: scale(1.02);
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .sample-label {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0,0,0,0.8));
        padding: 12px 8px 8px;
        font-size: 13px;
        font-weight: 600;
        text-align: center;
      }
    }
  `]
})
export class HomePage {
  showSamplesModal = false;

  samples = [
    { name: 'Paisaje', file: 'sample_landscape.png' },
    { name: 'Retrato', file: 'sample_portrait.png' },
    { name: 'Océano', file: 'sample_ocean.png' },
    { name: 'Patrón de Color', file: 'sample_colortest.png' }
  ];

  constructor(
    public photoService: PhotoService,
    public imageService: ImageService
  ) {
    addIcons({ folderOutline, cameraOutline, imagesOutline, imageOutline });
  }

  uploadFile() {
    this.photoService.triggerFilePicker().catch(console.error);
  }

  takePhoto() {
    this.photoService.takePhotoWeb().catch(console.error);
  }

  loadSample(fileName: string) {
    this.photoService.loadSample(fileName).then(() => {
      this.showSamplesModal = false;
    }).catch(console.error);
  }
}
