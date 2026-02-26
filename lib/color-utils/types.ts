/**
 * Types for the color theming system
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface OKLCH {
  o: number; // Lightness (0-1)
  k: number; // Chroma (0-0.4)
  h: number; // Hue (0-360)
}

export interface TonalPalette {
  tone0: string;    // Black
  tone10: string;   // Very Dark
  tone20: string;
  tone25: string;
  tone30: string;
  tone35: string;
  tone40: string;
  tone50: string;
  tone60: string;
  tone70: string;
  tone80: string;
  tone90: string;
  tone95: string;
  tone99: string;
  tone100: string;  // White
}

export interface ColorScheme {
  primary: TonalPalette;
  secondary: TonalPalette;
  tertiary: TonalPalette;
  neutral: TonalPalette;
  neutralVariant: TonalPalette;
  error: TonalPalette;
}

export interface ThemeTokens {
  lightMode: {
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    error: string;
    onError: string;
    errorContainer: string;
    onErrorContainer: string;
    background: string;
    onBackground: string;
    surface: string;
    onSurface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
    scrim: string;
    shadow: string;
  };
  darkMode: {
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    error: string;
    onError: string;
    errorContainer: string;
    onErrorContainer: string;
    background: string;
    onBackground: string;
    surface: string;
    onSurface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
    scrim: string;
    shadow: string;
  };
}

export interface CustomTheme {
  id: string;
  primaryColor: string;
  generatedAt: number;
  tokens: ThemeTokens;
  contrastChecked: boolean;
}
