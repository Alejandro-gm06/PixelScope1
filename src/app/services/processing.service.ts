import { Injectable } from '@angular/core';
import {
  PixelRGB, PixelHSI, PixelHSV, PixelCMYK, PixelData, ColorSpace
} from '../models/pixel-data.model';

@Injectable({ providedIn: 'root' })
export class ProcessingService {

  // ─── RGB → Grayscale (ITU-R BT.601) ────────────────────────
  rgbToGray(r: number, g: number, b: number): number {
    return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  }

  // ─── RGB → CMYK ────────────────────────────────────────────
  rgbToCmyk(r: number, g: number, b: number): PixelCMYK {
    const rp = r / 255;
    const gp = g / 255;
    const bp = b / 255;

    const k = 1 - Math.max(rp, gp, bp);

    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    const c = ((1 - rp - k) / (1 - k)) * 100;
    const m = ((1 - gp - k) / (1 - k)) * 100;
    const y = ((1 - bp - k) / (1 - k)) * 100;

    return {
      c: Math.round(c * 10) / 10,
      m: Math.round(m * 10) / 10,
      y: Math.round(y * 10) / 10,
      k: Math.round(k * 100 * 10) / 10
    };
  }

  // ─── RGB → HSI ─────────────────────────────────────────────
  // Handles singular cases:
  // - R=G=B (achromatic): sqrt denominator = 0 → H = 0
  // - R+G+B=0 (pure black): S divides by zero → S = 0, H = 0
  rgbToHsi(r: number, g: number, b: number): PixelHSI {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const intensity = (rn + gn + bn) / 3;

    // Pure black
    if (rn + gn + bn === 0) {
      return { h: 0, s: 0, i: 0 };
    }

    const minVal = Math.min(rn, gn, bn);
    const saturation = 1 - (3 * minVal) / (rn + gn + bn);

    // Achromatic (R=G=B)
    if (saturation < 0.00001) {
      return { h: 0, s: 0, i: intensity };
    }

    const numerator = 0.5 * ((rn - gn) + (rn - bn));
    const denominator = Math.sqrt(
      (rn - gn) * (rn - gn) + (rn - bn) * (gn - bn)
    );

    // Prevent division by zero in acos
    if (denominator < 0.00001) {
      return { h: 0, s: saturation, i: intensity };
    }

    let theta = Math.acos(
      Math.max(-1, Math.min(1, numerator / denominator))
    );
    let hue = theta * (180 / Math.PI); // Convert to degrees

    if (bn > gn) {
      hue = 360 - hue;
    }

    return {
      h: Math.round(hue * 10) / 10,
      s: Math.round(saturation * 1000) / 1000,
      i: Math.round(intensity * 1000) / 1000
    };
  }

  // ─── RGB → HSV ─────────────────────────────────────────────
  // Handles singular cases:
  // - max=0 (pure black): S divides by zero → S = 0, H = 0
  // - delta=0 (pure gray): H undefined → H = 0
  rgbToHsv(r: number, g: number, b: number): PixelHSV {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const maxVal = Math.max(rn, gn, bn);
    const minVal = Math.min(rn, gn, bn);
    const delta = maxVal - minVal;

    const value = maxVal;

    // Pure black
    if (maxVal === 0) {
      return { h: 0, s: 0, v: 0 };
    }

    const saturation = delta / maxVal;

    // Pure gray (achromatic)
    if (delta < 0.00001) {
      return { h: 0, s: 0, v: Math.round(value * 1000) / 1000 };
    }

    let hue = 0;
    if (rn === maxVal) {
      hue = 60 * ((gn - bn) / delta);
    } else if (gn === maxVal) {
      hue = 60 * (2 + (bn - rn) / delta);
    } else {
      hue = 60 * (4 + (rn - gn) / delta);
    }

    if (hue < 0) {
      hue += 360;
    }

    return {
      h: Math.round(hue * 10) / 10,
      s: Math.round(saturation * 1000) / 1000,
      v: Math.round(value * 1000) / 1000
    };
  }

  // ─── RGB → Hex ─────────────────────────────────────────────
  rgbToHex(r: number, g: number, b: number): string {
    const toHex = (v: number) => v.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // ─── Get full pixel info ───────────────────────────────────
  getPixelInfo(imageData: ImageData, x: number, y: number): PixelData {
    const idx = (y * imageData.width + x) * 4;
    const r = imageData.data[idx];
    const g = imageData.data[idx + 1];
    const b = imageData.data[idx + 2];

    return {
      x, y,
      rgb: { r, g, b },
      hex: this.rgbToHex(r, g, b),
      hsi: this.rgbToHsi(r, g, b),
      hsv: this.rgbToHsv(r, g, b),
      cmyk: this.rgbToCmyk(r, g, b),
      gray: this.rgbToGray(r, g, b)
    };
  }

  // ─── Extract single RGB channel ────────────────────────────
  extractChannel(imageData: ImageData, channel: 'red' | 'green' | 'blue'): ImageData {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const result = new ImageData(w, h);
    const dst = result.data;

    for (let i = 0; i < src.length; i += 4) {
      if (channel === 'red') {
        dst[i] = src[i]; dst[i + 1] = 0; dst[i + 2] = 0;
      } else if (channel === 'green') {
        dst[i] = 0; dst[i + 1] = src[i + 1]; dst[i + 2] = 0;
      } else {
        dst[i] = 0; dst[i + 1] = 0; dst[i + 2] = src[i + 2];
      }
      dst[i + 3] = 255;
    }
    return result;
  }

  // ─── Extract channel as grayscale ──────────────────────────
  extractChannelGray(imageData: ImageData, channel: 'red' | 'green' | 'blue'): ImageData {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const result = new ImageData(w, h);
    const dst = result.data;

    const chIdx = channel === 'red' ? 0 : channel === 'green' ? 1 : 2;

    for (let i = 0; i < src.length; i += 4) {
      const val = src[i + chIdx];
      dst[i] = val; dst[i + 1] = val; dst[i + 2] = val;
      dst[i + 3] = 255;
    }
    return result;
  }

  // ─── Convert to grayscale ──────────────────────────────────
  toGrayscale(imageData: ImageData): ImageData {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const result = new ImageData(w, h);
    const dst = result.data;

    for (let i = 0; i < src.length; i += 4) {
      const gray = this.rgbToGray(src[i], src[i + 1], src[i + 2]);
      dst[i] = gray; dst[i + 1] = gray; dst[i + 2] = gray;
      dst[i + 3] = 255;
    }
    return result;
  }

  // ─── Simulate CMYK visual ─────────────────────────────────
  // Shows composite CMYK by converting each pixel to CMYK then back to RGB
  // using subtractive color model simulation
  toCmykSimulated(imageData: ImageData): ImageData {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const result = new ImageData(w, h);
    const dst = result.data;

    for (let i = 0; i < src.length; i += 4) {
      const cmyk = this.rgbToCmyk(src[i], src[i + 1], src[i + 2]);
      // Convert CMYK back to RGB to visualize the simulated result
      const c = cmyk.c / 100;
      const m = cmyk.m / 100;
      const y = cmyk.y / 100;
      const k = cmyk.k / 100;
      dst[i] = Math.round(255 * (1 - c) * (1 - k));
      dst[i + 1] = Math.round(255 * (1 - m) * (1 - k));
      dst[i + 2] = Math.round(255 * (1 - y) * (1 - k));
      dst[i + 3] = 255;
    }
    return result;
  }

  // ─── Extract HSI/HSV components ────────────────────────────
  toHue(imageData: ImageData, model: 'hsi' | 'hsv' = 'hsi'): ImageData {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const result = new ImageData(w, h);
    const dst = result.data;

    for (let i = 0; i < src.length; i += 4) {
      const conv = model === 'hsi'
        ? this.rgbToHsi(src[i], src[i + 1], src[i + 2])
        : this.rgbToHsv(src[i], src[i + 1], src[i + 2]);
      // Map hue (0-360) to a color wheel representation
      const hueNorm = conv.h / 360;
      const rgb = this.hueToRgb(hueNorm);
      dst[i] = rgb.r; dst[i + 1] = rgb.g; dst[i + 2] = rgb.b;
      dst[i + 3] = 255;
    }
    return result;
  }

  toSaturation(imageData: ImageData, model: 'hsi' | 'hsv' = 'hsi'): ImageData {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const result = new ImageData(w, h);
    const dst = result.data;

    for (let i = 0; i < src.length; i += 4) {
      const conv = model === 'hsi'
        ? this.rgbToHsi(src[i], src[i + 1], src[i + 2])
        : this.rgbToHsv(src[i], src[i + 1], src[i + 2]);
      const val = Math.round(conv.s * 255);
      dst[i] = val; dst[i + 1] = val; dst[i + 2] = val;
      dst[i + 3] = 255;
    }
    return result;
  }

  toIntensity(imageData: ImageData): ImageData {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const result = new ImageData(w, h);
    const dst = result.data;

    for (let i = 0; i < src.length; i += 4) {
      const hsi = this.rgbToHsi(src[i], src[i + 1], src[i + 2]);
      const val = Math.round(hsi.i * 255);
      dst[i] = val; dst[i + 1] = val; dst[i + 2] = val;
      dst[i + 3] = 255;
    }
    return result;
  }

  toValue(imageData: ImageData): ImageData {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    const result = new ImageData(w, h);
    const dst = result.data;

    for (let i = 0; i < src.length; i += 4) {
      const hsv = this.rgbToHsv(src[i], src[i + 1], src[i + 2]);
      const val = Math.round(hsv.v * 255);
      dst[i] = val; dst[i + 1] = val; dst[i + 2] = val;
      dst[i + 3] = 255;
    }
    return result;
  }

  // ─── Process image for a given color space ─────────────────
  processColorSpace(imageData: ImageData, space: ColorSpace): ImageData {
    switch (space) {
      case 'original': return this.cloneImageData(imageData);
      case 'red': return this.extractChannel(imageData, 'red');
      case 'green': return this.extractChannel(imageData, 'green');
      case 'blue': return this.extractChannel(imageData, 'blue');
      case 'grayscale': return this.toGrayscale(imageData);
      case 'cmyk': return this.toCmykSimulated(imageData);
      case 'hue': return this.toHue(imageData, 'hsi');
      case 'saturation-hsi': return this.toSaturation(imageData, 'hsi');
      case 'intensity': return this.toIntensity(imageData);
      case 'saturation-hsv': return this.toSaturation(imageData, 'hsv');
      case 'value': return this.toValue(imageData);
      default: return this.cloneImageData(imageData);
    }
  }

  // ─── Helper: clone ImageData ───────────────────────────────
  cloneImageData(imageData: ImageData): ImageData {
    return new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
  }

  // ─── Helper: Convert hue (0-1) to RGB for visualization ───
  private hueToRgb(h: number): PixelRGB {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const q = 1 - f;

    let r = 0, g = 0, b = 0;
    switch (i % 6) {
      case 0: r = 1; g = f; b = 0; break;
      case 1: r = q; g = 1; b = 0; break;
      case 2: r = 0; g = 1; b = f; break;
      case 3: r = 0; g = q; b = 1; break;
      case 4: r = f; g = 0; b = 1; break;
      case 5: r = 1; g = 0; b = q; break;
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  // ─── Get region average ────────────────────────────────────
  getRegionAverage(
    imageData: ImageData,
    startX: number, startY: number,
    endX: number, endY: number
  ): PixelData {
    let totalR = 0, totalG = 0, totalB = 0;
    let count = 0;

    const x1 = Math.max(0, Math.min(startX, endX));
    const x2 = Math.min(imageData.width - 1, Math.max(startX, endX));
    const y1 = Math.max(0, Math.min(startY, endY));
    const y2 = Math.min(imageData.height - 1, Math.max(startY, endY));

    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        const idx = (y * imageData.width + x) * 4;
        totalR += imageData.data[idx];
        totalG += imageData.data[idx + 1];
        totalB += imageData.data[idx + 2];
        count++;
      }
    }

    if (count === 0) count = 1;
    const r = Math.round(totalR / count);
    const g = Math.round(totalG / count);
    const b = Math.round(totalB / count);

    return {
      x: Math.round((x1 + x2) / 2),
      y: Math.round((y1 + y2) / 2),
      rgb: { r, g, b },
      hex: this.rgbToHex(r, g, b),
      hsi: this.rgbToHsi(r, g, b),
      hsv: this.rgbToHsv(r, g, b),
      cmyk: this.rgbToCmyk(r, g, b),
      gray: this.rgbToGray(r, g, b)
    };
  }
}
