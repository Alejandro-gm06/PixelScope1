import { Injectable } from '@angular/core';
import { HistogramData } from '../models/pixel-data.model';

@Injectable({ providedIn: 'root' })
export class HistogramService {

  computeRedHistogram(imageData: ImageData): HistogramData {
    return this.computeChannelHistogram(imageData, 0);
  }

  computeGreenHistogram(imageData: ImageData): HistogramData {
    return this.computeChannelHistogram(imageData, 1);
  }

  computeBlueHistogram(imageData: ImageData): HistogramData {
    return this.computeChannelHistogram(imageData, 2);
  }

  computeGrayHistogram(imageData: ImageData): HistogramData {
    const values = new Array(256).fill(0);
    const src = imageData.data;
    const total = src.length / 4;

    for (let i = 0; i < src.length; i += 4) {
      const gray = Math.round(0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]);
      values[gray]++;
    }

    return this.computeStats(values, total);
  }

  private computeChannelHistogram(imageData: ImageData, channelOffset: number): HistogramData {
    const values = new Array(256).fill(0);
    const src = imageData.data;
    const total = src.length / 4;

    for (let i = 0; i < src.length; i += 4) {
      values[src[i + channelOffset]]++;
    }

    return this.computeStats(values, total);
  }

  private computeStats(values: number[], total: number): HistogramData {
    // Mean
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += i * values[i];
    }
    const mean = sum / total;

    // Median
    let cumulative = 0;
    let median = 0;
    const half = total / 2;
    for (let i = 0; i < 256; i++) {
      cumulative += values[i];
      if (cumulative >= half) {
        median = i;
        break;
      }
    }

    // Mode
    let maxFreq = 0;
    let mode = 0;
    for (let i = 0; i < 256; i++) {
      if (values[i] > maxFreq) {
        maxFreq = values[i];
        mode = i;
      }
    }

    // Standard deviation
    let sqDiffSum = 0;
    for (let i = 0; i < 256; i++) {
      sqDiffSum += values[i] * (i - mean) * (i - mean);
    }
    const stdDev = Math.sqrt(sqDiffSum / total);

    // Min and max (non-zero)
    let minVal = 0;
    let maxVal = 255;
    for (let i = 0; i < 256; i++) {
      if (values[i] > 0) { minVal = i; break; }
    }
    for (let i = 255; i >= 0; i--) {
      if (values[i] > 0) { maxVal = i; break; }
    }

    return {
      values,
      mean: Math.round(mean * 100) / 100,
      median,
      mode,
      stdDev: Math.round(stdDev * 100) / 100,
      min: minVal,
      max: maxVal,
      total
    };
  }
}
