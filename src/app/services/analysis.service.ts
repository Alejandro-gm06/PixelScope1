import { Injectable } from '@angular/core';
import { HistogramData } from '../models/pixel-data.model';
import { HistogramService } from './histogram.service';

export interface AnalysisResult {
  dominantChannel: string;
  dominantChannelValue: number;
  brightnessLevel: string;
  brightnessDescription: string;
  averageIntensity: number;
  contrastLevel: string;
  contrastDescription: string;
  saturationDescription: string;
  summary: string;
  details: string[];
}

@Injectable({ providedIn: 'root' })
export class AnalysisService {

  constructor(private histogramService: HistogramService) {}

  analyzeImage(imageData: ImageData): AnalysisResult {
    const redHist = this.histogramService.computeRedHistogram(imageData);
    const greenHist = this.histogramService.computeGreenHistogram(imageData);
    const blueHist = this.histogramService.computeBlueHistogram(imageData);
    const grayHist = this.histogramService.computeGrayHistogram(imageData);

    // Dominant channel
    const channels = [
      { name: 'rojo', mean: redHist.mean },
      { name: 'verde', mean: greenHist.mean },
      { name: 'azul', mean: blueHist.mean }
    ];
    channels.sort((a, b) => b.mean - a.mean);
    const dominant = channels[0];

    // Brightness level
    const avgIntensity = grayHist.mean;
    let brightnessLevel: string;
    let brightnessDescription: string;
    if (avgIntensity < 64) {
      brightnessLevel = 'oscura';
      brightnessDescription = 'La mayor parte de los píxeles se concentran en valores bajos de intensidad, resultando en una imagen predominantemente oscura.';
    } else if (avgIntensity < 128) {
      brightnessLevel = 'medio-oscura';
      brightnessDescription = 'La imagen presenta tonos mayormente oscuros con algunas zonas de brillo moderado.';
    } else if (avgIntensity < 192) {
      brightnessLevel = 'medio-brillante';
      brightnessDescription = 'La imagen tiene una iluminación balanceada con tendencia hacia tonos claros.';
    } else {
      brightnessLevel = 'brillante';
      brightnessDescription = 'La mayor parte de los píxeles presentan valores altos de intensidad, resultando en una imagen muy luminosa.';
    }

    // Contrast level
    const stdDev = grayHist.stdDev;
    let contrastLevel: string;
    let contrastDescription: string;
    if (stdDev < 30) {
      contrastLevel = 'bajo';
      contrastDescription = 'Los valores de intensidad están concentrados en un rango estrecho, indicando bajo contraste.';
    } else if (stdDev < 60) {
      contrastLevel = 'moderado';
      contrastDescription = 'La imagen presenta un contraste moderado con una distribución razonable de tonos claros y oscuros.';
    } else {
      contrastLevel = 'alto';
      contrastDescription = 'Los valores de intensidad cubren un amplio rango, indicando alto contraste entre zonas claras y oscuras.';
    }

    // Saturation analysis (sample pixels)
    let totalSat = 0;
    const sampleStep = Math.max(1, Math.floor(imageData.data.length / 4 / 10000));
    let sampleCount = 0;
    for (let i = 0; i < imageData.data.length; i += 4 * sampleStep) {
      const r = imageData.data[i] / 255;
      const g = imageData.data[i + 1] / 255;
      const b = imageData.data[i + 2] / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sum = r + g + b;
      if (sum > 0) {
        totalSat += 1 - (3 * min / (sum * 3));
      }
      sampleCount++;
    }
    const avgSaturation = sampleCount > 0 ? totalSat / sampleCount : 0;

    let saturationDescription: string;
    if (avgSaturation < 0.15) {
      saturationDescription = 'La imagen es predominantemente acromática o tiene colores muy desaturados.';
    } else if (avgSaturation < 0.35) {
      saturationDescription = 'Los colores presentan una saturación baja a moderada, con tonos pastel o suaves.';
    } else if (avgSaturation < 0.6) {
      saturationDescription = 'La imagen presenta colores con saturación moderada, con buena intensidad cromática.';
    } else {
      saturationDescription = 'Los colores están altamente saturados, con tonos vibrantes e intensos.';
    }

    // Build summary
    const summary = `En esta imagen predomina el canal ${dominant.name} (media: ${dominant.mean.toFixed(1)}). ` +
      `La intensidad promedio es ${avgIntensity.toFixed(1)}, indicando una imagen ${brightnessLevel}. ` +
      `El contraste es ${contrastLevel} (desviación estándar: ${stdDev.toFixed(1)}). ` +
      `La saturación promedio HSI es ${avgSaturation.toFixed(2)}.`;

    // Build detailed analysis points
    const details: string[] = [];
    details.push(`Canal dominante: ${dominant.name} con media de ${dominant.mean.toFixed(1)} (vs. ${channels[1].name}: ${channels[1].mean.toFixed(1)}, ${channels[2].name}: ${channels[2].mean.toFixed(1)}).`);
    details.push(brightnessDescription);
    details.push(contrastDescription);
    details.push(saturationDescription);

    if (grayHist.max - grayHist.min < 100) {
      details.push(`El rango dinámico es limitado (${grayHist.min}-${grayHist.max}), lo que sugiere que la imagen no aprovecha todo el rango tonal disponible.`);
    } else {
      details.push(`El rango dinámico es amplio (${grayHist.min}-${grayHist.max}), aprovechando bien el espectro tonal disponible.`);
    }

    // Highlight zones
    const darkPixels = grayHist.values.slice(0, 64).reduce((a, b) => a + b, 0);
    const brightPixels = grayHist.values.slice(192, 256).reduce((a, b) => a + b, 0);
    const darkPercent = ((darkPixels / grayHist.total) * 100).toFixed(1);
    const brightPercent = ((brightPixels / grayHist.total) * 100).toFixed(1);
    details.push(`Las zonas oscuras (intensidad 0-63) representan el ${darkPercent}% de la imagen, mientras que las zonas claras (192-255) representan el ${brightPercent}%.`);

    return {
      dominantChannel: dominant.name,
      dominantChannelValue: dominant.mean,
      brightnessLevel,
      brightnessDescription,
      averageIntensity: avgIntensity,
      contrastLevel,
      contrastDescription,
      saturationDescription,
      summary,
      details
    };
  }
}
