export interface PixelRGB {
  r: number;
  g: number;
  b: number;
}

export interface PixelHSI {
  h: number; // 0-360 degrees
  s: number; // 0-1
  i: number; // 0-1
}

export interface PixelHSV {
  h: number; // 0-360 degrees
  s: number; // 0-1
  v: number; // 0-1
}

export interface PixelCMYK {
  c: number; // 0-100 percent
  m: number; // 0-100 percent
  y: number; // 0-100 percent
  k: number; // 0-100 percent
}

export interface PixelData {
  x: number;
  y: number;
  rgb: PixelRGB;
  hex: string;
  hsi: PixelHSI;
  hsv: PixelHSV;
  cmyk: PixelCMYK;
  gray: number; // 0-255
}

export interface HistogramData {
  values: number[];      // 256 frequency values
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  min: number;
  max: number;
  total: number;
}

export type ColorChannel = 'red' | 'green' | 'blue';

export type ColorSpace =
  | 'original'
  | 'red'
  | 'green'
  | 'blue'
  | 'grayscale'
  | 'cmyk'
  | 'hue'
  | 'saturation-hsi'
  | 'intensity'
  | 'saturation-hsv'
  | 'value';

export interface ImageState {
  originalImageData: ImageData | null;
  width: number;
  height: number;
  fileName: string;
  loaded: boolean;
}
