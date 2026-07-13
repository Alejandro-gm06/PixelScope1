import { Injectable } from '@angular/core';
import { ImageService } from './image.service';

@Injectable({ providedIn: 'root' })
export class PhotoService {

  constructor(private imageService: ImageService) {}

  // Load from file input event
  async loadFromFileInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!this.isValidImageType(file)) {
        throw new Error('Formato no soportado. Use JPG, JPEG o PNG.');
      }
      await this.imageService.loadFromFile(file);
    }
  }

  // Load from camera (HTML input with capture)
  async takePhotoWeb(): Promise<void> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png';
      input.capture = 'environment';
      input.onchange = async (e) => {
        try {
          await this.loadFromFileInput(e);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      input.click();
    });
  }

  // Load sample image
  async loadSample(sampleName: string): Promise<void> {
    const url = `assets/samples/${sampleName}`;
    await this.imageService.loadFromUrl(url);
  }

  // Trigger file picker
  triggerFilePicker(): Promise<void> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/jpg,image/png';
      input.onchange = async (e) => {
        try {
          await this.loadFromFileInput(e);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      input.click();
    });
  }

  private isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return validTypes.includes(file.type);
  }
}
