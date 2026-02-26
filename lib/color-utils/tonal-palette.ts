/**
 * Tonal palette generation for Material Design 3
 * Generates a 15-tone palette from a single base color
 */

import type { TonalPalette, OKLCH } from './types';
import { rgbToOklch, oklchToRgb } from './oklch-conversion';
import { hexToRgb, rgbToHex } from './hex-conversion';

const TONES = [0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 99, 100];

export function generateTonalPalette(hexColor: string): TonalPalette {
  // Convert hex to RGB then to OKLCH
  const rgb = hexToRgb(hexColor);
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);

  // Generate tones by modifying the lightness (okl) component
  const palette: Record<string, string> = {};

  TONES.forEach(tone => {
    const lightness = tone / 100;
    const rgb = oklchToRgb(lightness, oklch.k, oklch.h);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    palette[`tone${tone}`] = hex;
  });

  return palette as unknown as TonalPalette;
}

/**
 * Generate secondary color by shifting hue
 */
export function generateSecondaryColor(
  primaryHex: string,
  hueShift: number = 60
): string {
  const rgb = hexToRgb(primaryHex);
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);

  // Shift hue for secondary color
  const shiftedHue = (oklch.h + hueShift) % 360;

  // Maintain similar lightness and chroma but shift hue
  const secondaryRgb = oklchToRgb(oklch.o, oklch.k, shiftedHue);
  return rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
}

/**
 * Generate tertiary color by shifting hue further
 */
export function generateTertiaryColor(
  primaryHex: string,
  hueShift: number = 150
): string {
  const rgb = hexToRgb(primaryHex);
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);

  // Shift hue further for tertiary color
  const shiftedHue = (oklch.h + hueShift) % 360;

  const tertiaryRgb = oklchToRgb(oklch.o, oklch.k, shiftedHue);
  return rgbToHex(tertiaryRgb.r, tertiaryRgb.g, tertiaryRgb.b);
}

/**
 * Generate neutral color from primary (removes hue saturation)
 */
export function generateNeutralColor(primaryHex: string): string {
  const rgb = hexToRgb(primaryHex);
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);

  // Reduce chroma to near 0 for neutral
  const neutralRgb = oklchToRgb(oklch.o, oklch.k * 0.1, oklch.h);
  return rgbToHex(neutralRgb.r, neutralRgb.g, neutralRgb.b);
}

/**
 * Standard error color (red-based)
 */
export function getErrorColor(): string {
  return '#B3261E';
}
