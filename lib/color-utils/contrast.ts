/**
 * WCAG contrast ratio calculation for accessibility
 */

import { hexToRgb } from './hex-conversion';

/**
 * Calculate relative luminance
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsWCAG_AA(hex1: string, hex2: string): boolean {
  return getContrastRatio(hex1, hex2) >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard (7:1 for normal text)
 */
export function meetsWCAG_AAA(hex1: string, hex2: string): boolean {
  return getContrastRatio(hex1, hex2) >= 7;
}

/**
 * Find the best text color (black or white) for a given background
 */
export function getTextColor(backgroundHex: string): '#000000' | '#FFFFFF' {
  const rgb = hexToRgb(backgroundHex);
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  // If luminance is high (light background), use dark text
  // If luminance is low (dark background), use light text
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Validate all color combinations meet accessibility standards
 */
export interface ContrastValidation {
  pass: boolean;
  warnings: string[];
  details: Record<string, number>;
}

export function validateContrast(
  backgroundColor: string,
  foregroundColor: string,
  accentColor?: string
): ContrastValidation {
  const warnings: string[] = [];
  const details: Record<string, number> = {};

  const bgFgRatio = getContrastRatio(backgroundColor, foregroundColor);
  details['background-foreground'] = bgFgRatio;

  if (bgFgRatio < 4.5) {
    warnings.push(`Background-foreground contrast (${bgFgRatio.toFixed(2)}:1) below WCAG AA (4.5:1)`);
  }

  if (accentColor) {
    const bgAccentRatio = getContrastRatio(backgroundColor, accentColor);
    details['background-accent'] = bgAccentRatio;

    if (bgAccentRatio < 3) {
      warnings.push(`Background-accent contrast (${bgAccentRatio.toFixed(2)}:1) below minimum (3:1)`);
    }
  }

  return {
    pass: warnings.length === 0,
    warnings,
    details,
  };
}
