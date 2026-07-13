import { Component, computed, Signal, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
  IonButton, IonIcon, IonSegment, IonSegmentButton, IonLabel, IonSelect,
  IonSelectOption, IonRange, IonCard
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { imageOutline } from 'ionicons/icons';
import { ImageService } from '../../services/image.service';
import { ProcessingService } from '../../services/processing.service';
import { ImageCanvasComponent } from '../../components/image-canvas/image-canvas.component';
import { ColorSpace } from '../../models/pixel-data.model';

@Component({
  selector: 'app-comparator',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonButton, IonIcon, IonSegment, IonSegmentButton,
    IonLabel, IonSelect, IonSelectOption, IonRange, IonCard, ImageCanvasComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Comparador</ion-title>
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
        <!-- Mode Selector -->
        <div class="controls-section animate-fade-in">
          <ion-segment [(ngModel)]="viewMode" scrollable>
            <ion-segment-button value="side">
              <ion-label>Lado a lado</ion-label>
            </ion-segment-button>
            <ion-segment-button value="slider">
              <ion-label>Slider</ion-label>
            </ion-segment-button>
            <ion-segment-button value="overlay">
              <ion-label>Superposición</ion-label>
            </ion-segment-button>
          </ion-segment>
          
          <div class="selectors-row">
            <div class="selector-group">
              <span class="selector-label">Izquierda / Fondo</span>
              <ion-select [(ngModel)]="leftSpace" interface="popover">
                <ion-select-option *ngFor="let opt of spaceOptions" [value]="opt.value">{{ opt.label }}</ion-select-option>
              </ion-select>
            </div>
            
            <div class="selector-group">
              <span class="selector-label">Derecha / Frente</span>
              <ion-select [(ngModel)]="rightSpace" interface="popover">
                <ion-select-option *ngFor="let opt of spaceOptions" [value]="opt.value">{{ opt.label }}</ion-select-option>
              </ion-select>
            </div>
          </div>
          
          <!-- Opacity slider for overlay mode -->
          <div class="overlay-controls animate-fade-in" *ngIf="viewMode === 'overlay'">
            <span class="range-label">Opacidad de la capa superior</span>
            <ion-range [(ngModel)]="opacity" min="0" max="100" pin="true"></ion-range>
          </div>
        </div>

        <!-- Side by side view -->
        <ion-grid class="side-by-side-grid animate-fade-in" *ngIf="viewMode === 'side'">
          <ion-row>
            <ion-col size="12" size-md="6">
              <ion-card class="view-card">
                <div class="card-label">{{ getLabelFor(leftSpace) }}</div>
                <app-image-canvas [imageData]="leftImage()"></app-image-canvas>
              </ion-card>
            </ion-col>
            <ion-col size="12" size-md="6">
              <ion-card class="view-card">
                <div class="card-label">{{ getLabelFor(rightSpace) }}</div>
                <app-image-canvas [imageData]="rightImage()"></app-image-canvas>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Slider and Overlay views (Custom Canvas) -->
        <ion-card class="custom-view-card animate-fade-in" *ngIf="viewMode === 'slider' || viewMode === 'overlay'">
          <div class="card-label dual">
            <span class="left">{{ getLabelFor(leftSpace) }}</span>
            <span class="right">{{ getLabelFor(rightSpace) }}</span>
          </div>
          
          <div class="canvas-container" 
               (mousemove)="onMouseMove($event)" 
               (touchmove)="onTouchMove($event)"
               (mousedown)="startDrag()"
               (mouseup)="stopDrag()"
               (mouseleave)="stopDrag()"
               (touchstart)="startDrag()"
               (touchend)="stopDrag()">
            <canvas #customCanvas class="custom-canvas"></canvas>
            
            <!-- Slider handle -->
            <div class="slider-handle" *ngIf="viewMode === 'slider'" [style.left.%]="sliderPosition">
              <div class="slider-line"></div>
              <div class="slider-button">
                <div class="arrow left-arrow"></div>
                <div class="arrow right-arrow"></div>
              </div>
            </div>
          </div>
        </ion-card>
      </ng-container>
    </ion-content>
  `,
  styles: [`
    .controls-section {
      background: var(--ps-bg-card);
      border: 1px solid var(--ps-glass-border);
      border-radius: var(--ps-radius-md);
      padding: 16px;
      margin-bottom: 24px;
      backdrop-filter: var(--ps-glass-blur);
    }
    
    ion-segment {
      margin-bottom: 16px;
    }
    
    .selectors-row {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      @media (min-width: 768px) {
        flex-direction: row;
      }
    }
    
    .selector-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      
      ion-select {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--ps-radius-sm);
      }
    }
    
    .selector-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--ps-text-muted);
      font-weight: 600;
    }
    
    .overlay-controls {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
    }
    
    .range-label {
      font-size: 12px;
      color: var(--ps-text-secondary);
      margin-bottom: 4px;
      display: block;
    }
    
    .view-card, .custom-view-card {
      margin: 0;
      border-radius: var(--ps-radius-md);
      overflow: hidden;
      position: relative;
    }
    
    .card-label {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(10, 10, 20, 0.75);
      backdrop-filter: blur(8px);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 10;
      
      &.dual {
        left: 0; right: 0; top: 0;
        background: transparent;
        border: none;
        backdrop-filter: none;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
        
        span {
          background: rgba(10, 10, 20, 0.75);
          backdrop-filter: blur(8px);
          padding: 6px 16px;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-top: none;
        }
      }
    }
    
    .canvas-container {
      width: 100%;
      position: relative;
      cursor: crosshair;
      user-select: none;
      touch-action: none;
    }
    
    .custom-canvas {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .slider-handle {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 40px;
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 5;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .slider-line {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #06b6d4;
      box-shadow: 0 0 10px #06b6d4, 0 0 20px #06b6d4;
    }
    
    .slider-button {
      width: 32px;
      height: 32px;
      background: #06b6d4;
      border-radius: 50%;
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 6px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.6);
      z-index: 6;
      
      .arrow {
        width: 0; 
        height: 0; 
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
      }
      
      .left-arrow { border-right: 6px solid #fff; }
      .right-arrow { border-left: 6px solid #fff; }
    }
  `]
})
export class ComparatorPage implements AfterViewChecked {
  @ViewChild('customCanvas') customCanvasRef?: ElementRef<HTMLCanvasElement>;
  
  viewMode: 'side' | 'slider' | 'overlay' = 'slider';
  
  leftSpace: ColorSpace = 'original';
  rightSpace: ColorSpace = 'grayscale';
  opacity = 50; // 0-100
  
  sliderPosition = 50; // 0-100 percent
  private isDragging = false;
  private hasRenderedCustom = false;
  
  spaceOptions = [
    { value: 'original', label: 'Original (RGB)' },
    { value: 'red', label: 'Canal Rojo' },
    { value: 'green', label: 'Canal Verde' },
    { value: 'blue', label: 'Canal Azul' },
    { value: 'grayscale', label: 'Escala de Grises' },
    { value: 'cmyk', label: 'CMYK (Simulado)' },
    { value: 'hue', label: 'Matiz (Hue HSI)' },
    { value: 'saturation-hsi', label: 'Saturación (HSI)' },
    { value: 'intensity', label: 'Intensidad (HSI)' },
    { value: 'saturation-hsv', label: 'Saturación (HSV)' },
    { value: 'value', label: 'Valor (HSV)' }
  ];

  leftImage: Signal<ImageData | null>;
  rightImage: Signal<ImageData | null>;

  constructor(
    public imageService: ImageService,
    private processingService: ProcessingService,
    private router: Router
  ) {
    addIcons({ imageOutline });
    
    this.leftImage = computed(() => {
      const img = this.imageService.imageData();
      return img ? this.processingService.processColorSpace(img, this.leftSpace) : null;
    });
    
    this.rightImage = computed(() => {
      const img = this.imageService.imageData();
      return img ? this.processingService.processColorSpace(img, this.rightSpace) : null;
    });
  }

  getLabelFor(value: string): string {
    return this.spaceOptions.find(o => o.value === value)?.label || value;
  }

  ngAfterViewChecked() {
    if ((this.viewMode === 'slider' || this.viewMode === 'overlay') && this.customCanvasRef) {
      // Small optimization to avoid constant redraws unless necessary
      // For a real app, we'd wire this to signals, but here we just redraw every check
      this.drawCustomView();
    }
  }

  private drawCustomView() {
    const canvas = this.customCanvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    
    const lImg = this.leftImage();
    const rImg = this.rightImage();
    
    if (!canvas || !ctx || !lImg || !rImg) return;
    
    if (canvas.width !== lImg.width || canvas.height !== lImg.height) {
      canvas.width = lImg.width;
      canvas.height = lImg.height;
    }
    
    if (this.viewMode === 'slider') {
      // Draw left
      ctx.putImageData(lImg, 0, 0);
      
      // Draw right (clip to slider position)
      const dividerX = Math.round((this.sliderPosition / 100) * lImg.width);
      const rightWidth = lImg.width - dividerX;
      
      if (rightWidth > 0) {
        // Create temp canvas for right image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = lImg.width;
        tempCanvas.height = lImg.height;
        tempCanvas.getContext('2d')!.putImageData(rImg, 0, 0);
        
        // Draw only the right portion
        ctx.drawImage(
          tempCanvas, 
          dividerX, 0, rightWidth, lImg.height, // source rect
          dividerX, 0, rightWidth, lImg.height  // dest rect
        );
      }
    } else if (this.viewMode === 'overlay') {
      // Draw left (background)
      ctx.putImageData(lImg, 0, 0);
      
      // Draw right (foreground) with opacity
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = lImg.width;
      tempCanvas.height = lImg.height;
      tempCanvas.getContext('2d')!.putImageData(rImg, 0, 0);
      
      ctx.globalAlpha = this.opacity / 100;
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.globalAlpha = 1.0;
    }
  }

  // Drag handlers for slider
  startDrag() {
    if (this.viewMode === 'slider') this.isDragging = true;
  }
  
  stopDrag() {
    this.isDragging = false;
  }
  
  onMouseMove(e: MouseEvent) {
    if (!this.isDragging || this.viewMode !== 'slider') return;
    this.updateSliderPos(e.clientX);
  }
  
  onTouchMove(e: TouchEvent) {
    if (!this.isDragging || this.viewMode !== 'slider') return;
    if (e.touches.length > 0) {
      this.updateSliderPos(e.touches[0].clientX);
      e.preventDefault(); // Prevent scrolling
    }
  }
  
  private updateSliderPos(clientX: number) {
    const rect = this.customCanvasRef!.nativeElement.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    this.sliderPosition = (x / rect.width) * 100;
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
