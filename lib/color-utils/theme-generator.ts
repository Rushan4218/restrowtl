/**
 * Complete theme generation from a single primary color
 */

import type { ColorScheme, ThemeTokens, CustomTheme } from './types';
import {
  generateTonalPalette,
  generateSecondaryColor,
  generateTertiaryColor,
  generateNeutralColor,
  getErrorColor,
} from './tonal-palette';
import { validateContrast } from './contrast';

/**
 * Generate complete color scheme from primary color
 */
export function generateColorScheme(primaryHex: string): ColorScheme {
  const primary = generateTonalPalette(primaryHex);
  const secondary = generateTonalPalette(generateSecondaryColor(primaryHex));
  const tertiary = generateTonalPalette(generateTertiaryColor(primaryHex));
  const neutral = generateTonalPalette(generateNeutralColor(primaryHex));
  const neutralVariant = generateTonalPalette(generateNeutralColor(primaryHex, 30));
  const error = generateTonalPalette(getErrorColor());

  return { primary, secondary, tertiary, neutral, neutralVariant, error };
}

/**
 * Generate theme tokens for light and dark modes
 */
export function generateThemeTokens(colorScheme: ColorScheme): ThemeTokens {
  return {
    lightMode: {
      primary: colorScheme.primary.tone40,
      onPrimary: colorScheme.primary.tone100,
      primaryContainer: colorScheme.primary.tone90,
      onPrimaryContainer: colorScheme.primary.tone10,
      secondary: colorScheme.secondary.tone40,
      onSecondary: colorScheme.secondary.tone100,
      secondaryContainer: colorScheme.secondary.tone90,
      onSecondaryContainer: colorScheme.secondary.tone10,
      tertiary: colorScheme.tertiary.tone40,
      onTertiary: colorScheme.tertiary.tone100,
      tertiaryContainer: colorScheme.tertiary.tone90,
      onTertiaryContainer: colorScheme.tertiary.tone10,
      error: colorScheme.error.tone40,
      onError: colorScheme.error.tone100,
      errorContainer: colorScheme.error.tone90,
      onErrorContainer: colorScheme.error.tone10,
      background: colorScheme.neutral.tone99,
      onBackground: colorScheme.neutral.tone10,
      surface: colorScheme.neutral.tone99,
      onSurface: colorScheme.neutral.tone10,
      surfaceVariant: colorScheme.neutralVariant.tone90,
      onSurfaceVariant: colorScheme.neutralVariant.tone30,
      outline: colorScheme.neutralVariant.tone50,
      outlineVariant: colorScheme.neutralVariant.tone80,
      scrim: colorScheme.neutral.tone0,
      shadow: colorScheme.neutral.tone0,
    },
    darkMode: {
      primary: colorScheme.primary.tone80,
      onPrimary: colorScheme.primary.tone20,
      primaryContainer: colorScheme.primary.tone30,
      onPrimaryContainer: colorScheme.primary.tone90,
      secondary: colorScheme.secondary.tone80,
      onSecondary: colorScheme.secondary.tone20,
      secondaryContainer: colorScheme.secondary.tone30,
      onSecondaryContainer: colorScheme.secondary.tone90,
      tertiary: colorScheme.tertiary.tone80,
      onTertiary: colorScheme.tertiary.tone20,
      tertiaryContainer: colorScheme.tertiary.tone30,
      onTertiaryContainer: colorScheme.tertiary.tone90,
      error: colorScheme.error.tone80,
      onError: colorScheme.error.tone20,
      errorContainer: colorScheme.error.tone30,
      onErrorContainer: colorScheme.error.tone80,
      background: colorScheme.neutral.tone10,
      onBackground: colorScheme.neutral.tone90,
      surface: colorScheme.neutral.tone10,
      onSurface: colorScheme.neutral.tone90,
      surfaceVariant: colorScheme.neutralVariant.tone30,
      onSurfaceVariant: colorScheme.neutralVariant.tone80,
      outline: colorScheme.neutralVariant.tone60,
      outlineVariant: colorScheme.neutralVariant.tone30,
      scrim: colorScheme.neutral.tone0,
      shadow: colorScheme.neutral.tone0,
    },
  };
}

/**
 * Generate a complete custom theme
 */
export function generateCustomTheme(
  primaryColorHex: string,
  themeId?: string
): CustomTheme {
  // Validate hex color
  if (!primaryColorHex.match(/^#[0-9A-F]{6}$/i)) {
    throw new Error('Invalid hex color format');
  }

  const colorScheme = generateColorScheme(primaryColorHex);
  const tokens = generateThemeTokens(colorScheme);

  // Validate contrast
  const lightContrast = validateContrast(
    tokens.lightMode.background,
    tokens.lightMode.onBackground
  );
  const darkContrast = validateContrast(
    tokens.darkMode.background,
    tokens.darkMode.onBackground
  );

  return {
    id: themeId || `theme-${Date.now()}`,
    primaryColor: primaryColorHex,
    generatedAt: Date.now(),
    tokens,
    contrastChecked: lightContrast.pass && darkContrast.pass,
  };
}

/**
 * Export theme tokens as CSS variables
 */
export function generateCSSVariables(tokens: ThemeTokens): {
  light: Record<string, string>;
  dark: Record<string, string>;
} {
  const cssNames: Record<string, string> = {
    primary: '--color-primary',
    onPrimary: '--color-on-primary',
    primaryContainer: '--color-primary-container',
    onPrimaryContainer: '--color-on-primary-container',
    secondary: '--color-secondary',
    onSecondary: '--color-on-secondary',
    secondaryContainer: '--color-secondary-container',
    onSecondaryContainer: '--color-on-secondary-container',
    tertiary: '--color-tertiary',
    onTertiary: '--color-on-tertiary',
    tertiaryContainer: '--color-tertiary-container',
    onTertiaryContainer: '--color-on-tertiary-container',
    error: '--color-error',
    onError: '--color-on-error',
    errorContainer: '--color-error-container',
    onErrorContainer: '--color-on-error-container',
    background: '--color-background',
    onBackground: '--color-on-background',
    surface: '--color-surface',
    onSurface: '--color-on-surface',
    surfaceVariant: '--color-surface-variant',
    onSurfaceVariant: '--color-on-surface-variant',
    outline: '--color-outline',
    outlineVariant: '--color-outline-variant',
    scrim: '--color-scrim',
    shadow: '--color-shadow',
  };

  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  Object.entries(cssNames).forEach(([key, varName]) => {
    light[varName] = tokens.lightMode[key as keyof typeof tokens.lightMode];
    dark[varName] = tokens.darkMode[key as keyof typeof tokens.darkMode];
  });

  return { light, dark };
}
