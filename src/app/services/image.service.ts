import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageService {
  private _imageData = signal<ImageData | null>(null);
  private _width = signal(0);
  private _height = signal(0);
  private _fileName = signal('');
  private _imageUrl = signal<string | null>(null);

  // Public readonly signals
  readonly imageData = this._imageData.asReadonly();
  readonly width = this._width.asReadonly();
  readonly height = this._height.asReadonly();
  readonly fileName = this._fileName.asReadonly();
  readonly imageUrl = this._imageUrl.asReadonly();
  readonly loaded = computed(() => this._imageData() !== null);

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  async loadFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        this._fileName.set(file.name);
        this.loadFromDataUrl(dataUrl).then(resolve).catch(reject);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async loadFromUrl(url: string): Promise<void> {
    return this.loadFromDataUrl(url);
  }

  async loadFromDataUrl(dataUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Limit size for performance (max 1200px on longest side)
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        const maxSize = 1200;
        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = Math.round(h * maxSize / w);
            w = maxSize;
          } else {
            w = Math.round(w * maxSize / h);
            h = maxSize;
          }
        }

        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx.drawImage(img, 0, 0, w, h);
        const imageData = this.ctx.getImageData(0, 0, w, h);

        this._imageData.set(imageData);
        this._width.set(w);
        this._height.set(h);
        this._imageUrl.set(dataUrl);

        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  }

  getImageDataUrl(): string | null {
    if (!this._imageData()) return null;
    const id = this._imageData()!;
    this.canvas.width = id.width;
    this.canvas.height = id.height;
    this.ctx.putImageData(id, 0, 0);
    return this.canvas.toDataURL();
  }

  clear(): void {
    this._imageData.set(null);
    this._width.set(0);
    this._height.set(0);
    this._fileName.set('');
    this._imageUrl.set(null);
  }
}
