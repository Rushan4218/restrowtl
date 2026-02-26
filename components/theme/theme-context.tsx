/**
 * Theme context for managing current theme state
 */

'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { CustomTheme, ThemeTokens } from '@/lib/color-utils';
import { generateCustomTheme, generateCSSVariables } from '@/lib/color-utils';

export interface ThemeContextValue {
  currentTheme: CustomTheme | null;
  isLoading: boolean;
  setTheme: (primaryColorHex: string) => Promise<void>;
  resetToDefault: () => void;
  tokens: ThemeTokens | null;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const DEFAULT_PRIMARY_COLOR = '#FF6B6B'; // Restaurant red

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: CustomTheme;
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<CustomTheme | null>(defaultTheme || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem('custom-theme');
      if (stored && !currentTheme) {
        const theme = JSON.parse(stored) as CustomTheme;
        setCurrentTheme(theme);
        applyTheme(theme);
      } else if (currentTheme) {
        applyTheme(currentTheme);
      } else {
        // Generate default theme
        const defaultTheme = generateCustomTheme(DEFAULT_PRIMARY_COLOR);
        setCurrentTheme(defaultTheme);
        applyTheme(defaultTheme);
      }
      // Setup listener for system color scheme changes
      if (currentTheme) {
        setupColorSchemeListener(currentTheme);
      }
    } catch (error) {
      console.error('[v0] Failed to load theme from localStorage:', error);
      // Fall back to generating default theme
      const defaultTheme = generateCustomTheme(DEFAULT_PRIMARY_COLOR);
      setCurrentTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  const setTheme = useCallback(async (primaryColorHex: string) => {
    try {
      setIsLoading(true);
      
      // Generate new theme
      const newTheme = generateCustomTheme(primaryColorHex);
      setCurrentTheme(newTheme);

      // Apply theme to DOM
      applyTheme(newTheme);

      // Persist to localStorage
      localStorage.setItem('custom-theme', JSON.stringify(newTheme));

      // Also persist to backend (non-blocking)
      try {
        await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primaryColor: primaryColorHex,
            tokens: newTheme.tokens,
          }),
        });
      } catch (error) {
        console.warn('[v0] Failed to persist theme to backend:', error);
      }
    } catch (error) {
      console.error('[v0] Failed to set theme:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultTheme = generateCustomTheme(DEFAULT_PRIMARY_COLOR);
    setCurrentTheme(defaultTheme);
    applyTheme(defaultTheme);
    localStorage.setItem('custom-theme', JSON.stringify(defaultTheme));
  }, []);

  const tokens = currentTheme?.tokens || null;

  // Provide default theme context even during hydration
  const value: ThemeContextValue = {
    currentTheme: isMounted ? currentTheme : (defaultTheme || null),
    isLoading,
    setTheme,
    resetToDefault,
    tokens: isMounted ? tokens : (defaultTheme?.tokens || null),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Apply theme tokens to DOM as CSS variables
 */
function applyTheme(theme: CustomTheme): void {
  const cssVariables = generateCSSVariables(theme.tokens);
  const root = document.documentElement;
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const vars = isDarkMode ? cssVariables.dark : cssVariables.light;

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Also set a custom property to track which color scheme is active
  root.style.setProperty('--theme-primary', theme.primaryColor);
  root.style.setProperty('--theme-generated-at', theme.generatedAt.toString());
}

/**
 * Listen to system color scheme changes and reapply theme
 */
function setupColorSchemeListener(theme: CustomTheme): void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = () => {
    applyTheme(theme);
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else if (mediaQuery.addListener) {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
  }
}
