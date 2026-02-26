/**
 * Theme service for API interactions
 */

import type { CustomTheme, ThemeTokens } from '@/lib/color-utils';
import { generateCustomTheme } from '@/lib/color-utils';

export const themeService = {
  /**
   * Save theme to backend
   */
  async saveTheme(primaryColor: string): Promise<CustomTheme> {
    try {
      const theme = generateCustomTheme(primaryColor);

      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryColor,
          tokens: theme.tokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return theme;
    } catch (error) {
      console.error('[v0] Failed to save theme:', error);
      throw error;
    }
  },

  /**
   * Get saved theme from backend
   */
  async getTheme(): Promise<CustomTheme | null> {
    try {
      const response = await fetch('/api/theme', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as { primaryColor?: string };
      if (data.primaryColor) {
        return generateCustomTheme(data.primaryColor);
      }

      return null;
    } catch (error) {
      console.error('[v0] Failed to get theme:', error);
      return null;
    }
  },

  /**
   * Export theme as JSON
   */
  exportTheme(theme: CustomTheme): string {
    return JSON.stringify(theme, null, 2);
  },

  /**
   * Import theme from JSON
   */
  importTheme(json: string): CustomTheme {
    try {
      return JSON.parse(json) as CustomTheme;
    } catch (error) {
      throw new Error('Invalid theme JSON');
    }
  },

  /**
   * Get preset themes
   */
  getPresetThemes(): Array<{ name: string; color: string }> {
    return [
      { name: 'Restaurant Red', color: '#FF6B6B' },
      { name: 'Mint Green', color: '#2ECC71' },
      { name: 'Ocean Blue', color: '#3498DB' },
      { name: 'Sunset Orange', color: '#E67E22' },
      { name: 'Royal Purple', color: '#9B59B6' },
      { name: 'Vibrant Pink', color: '#E91E63' },
    ];
  },
};
