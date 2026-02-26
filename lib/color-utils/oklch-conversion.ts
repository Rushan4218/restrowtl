/**
 * OKLCH color space conversion for Material Design 3 tone generation
 * Based on Material Design 3 specification
 */

import type { RGB, OKLCH } from './types';

const LAB_CONSTANTS = {
  kR: 0.3,
  kG: 0.622,
  kB: 0.078,
};

export function rgbToOklch(r: number, g: number, b: number): OKLCH {
  // Normalize RGB to 0-1
  r = r / 255;
  g = g / 255;
  b = b / 255;

  // Convert to linear RGB
  const rLinear = linearize(r);
  const gLinear = linearize(g);
  const bLinear = linearize(b);

  // Convert linear RGB to LMS
  const l = cbrtf(
    0.4121656120 * rLinear +
    0.5362752080 * gLinear +
    0.0514575653 * bLinear
  );
  const m = cbrtf(
    0.2119034982 * rLinear +
    0.6807612419 * gLinear +
    0.1073790571 * bLinear
  );
  const s = cbrtf(
    0.1929763977 * rLinear +
    0.0329836671 * gLinear +
    0.9485409281 * bLinear
  );

  // Convert LMS to OKLCH
  const okl = l * 0.2104542553 + m * 0.7936177850 - s * 0.0040720468;
  const oka = l * 1.9779984951 + m * -2.4285922050 + s * 0.4505937099;
  const okb = l * 0.0259040371 + m * 0.7827717662 - s * 0.8086757660;

  const chroma = Math.sqrt(oka * oka + okb * okb);
  let hue = Math.atan2(okb, oka) * (180 / Math.PI);
  if (hue < 0) hue += 360;

  return {
    o: Math.max(0, Math.min(1, okl)),
    k: Math.max(0, Math.min(0.4, chroma)),
    h: hue,
  };
}

export function oklchToRgb(okl: number, chroma: number, hue: number): RGB {
  // Convert hue to radians
  const hueRad = hue * (Math.PI / 180);

  // Convert OKLCH to OKLab
  const oka = Math.cos(hueRad) * chroma;
  const okb = Math.sin(hueRad) * chroma;

  // Convert OKLab to LMS
  const l = okl + oka * 0.3963377774 + okb * 0.2158037573;
  const m = okl - oka * 0.1055613458 - okb * 0.0638541728;
  const s = okl - oka * 0.0894841775 - okb * 1.2914855480;

  // Cube the values
  const lCubed = l * l * l;
  const mCubed = m * m * m;
  const sCubed = s * s * s;

  // Convert LMS to linear RGB
  const rLinear =
    4.0767416621 * lCubed -
    3.3077363322 * mCubed +
    0.2309101289 * sCubed;
  const gLinear =
    -1.2684380046 * lCubed +
    2.6097574011 * mCubed -
    0.3413193761 * sCubed;
  const bLinear =
    -0.0041960863 * lCubed -
    0.7034186147 * mCubed +
    1.7076147010 * sCubed;

  // Convert from linear to gamma-corrected RGB
  const r = Math.round(gammaCorrect(rLinear) * 255);
  const g = Math.round(gammaCorrect(gLinear) * 255);
  const b = Math.round(gammaCorrect(bLinear) * 255);

  return {
    r: Math.max(0, Math.min(255, r)),
    g: Math.max(0, Math.min(255, g)),
    b: Math.max(0, Math.min(255, b)),
  };
}

function linearize(c: number): number {
  if (c <= 0.04045) {
    return c / 12.92;
  } else {
    return Math.pow((c + 0.055) / 1.055, 2.4);
  }
}

function gammaCorrect(c: number): number {
  if (c <= 0.0031308) {
    return c * 12.92;
  } else {
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }
}

function cbrtf(x: number): number {
  return Math.cbrt(x);
}

export function clampOklch(okl: number, chroma: number, hue: number): OKLCH {
  return {
    o: Math.max(0, Math.min(1, okl)),
    k: Math.max(0, Math.min(0.4, chroma)),
    h: ((hue % 360) + 360) % 360,
  };
}
