/**
 * Hook to use theme context
 */

'use client';

import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './theme-context';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to get current tokens for a mode
 */
export function useThemeTokens(mode: 'light' | 'dark' = 'light') {
  const { tokens } = useTheme();
  return tokens?.[`${mode}Mode`] || null;
}

/**
 * Hook to get primary color
 */
export function usePrimaryColor() {
  const { currentTheme } = useTheme();
  return currentTheme?.primaryColor || '#FF6B6B';
}
