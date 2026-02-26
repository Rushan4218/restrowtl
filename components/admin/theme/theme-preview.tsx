'use client';

import React from 'react';
import { useTheme } from '@/components/theme';
import { generateCSSVariables } from '@/lib/color-utils';
import { AlertCircle, Info } from 'lucide-react';

export function ThemePreview() {
  const { currentTheme } = useTheme();

  if (!currentTheme) return null;

  const cssVars = generateCSSVariables(currentTheme.tokens);

  const renderComponentShowcase = (mode: 'light' | 'dark') => {
    const colors = mode === 'light' ? cssVars.light : cssVars.dark;

    return (
      <div
        className="p-6 space-y-8"
        style={{
          backgroundColor: colors['--color-background'],
          color: colors['--color-on-background'],
        }}
      >
        {/* Color Palette */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Color Palette</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div
              className="h-16 rounded-md border flex items-center justify-center text-white font-medium"
              style={{
                backgroundColor: colors['--color-primary'],
                borderColor: colors['--color-outline-variant'],
              }}
            >
              Primary
            </div>
            <div
              className="h-16 rounded-md border flex items-center justify-center font-medium"
              style={{
                backgroundColor: colors['--color-secondary'],
                color: colors['--color-on-secondary'],
                borderColor: colors['--color-outline-variant'],
              }}
            >
              Secondary
            </div>
            <div
              className="h-16 rounded-md border flex items-center justify-center font-medium"
              style={{
                backgroundColor: colors['--color-tertiary'],
                color: colors['--color-on-tertiary'],
                borderColor: colors['--color-outline-variant'],
              }}
            >
              Tertiary
            </div>
            <div
              className="h-16 rounded-md border flex items-center justify-center font-medium"
              style={{
                backgroundColor: colors['--color-error'],
                color: colors['--color-on-error'],
                borderColor: colors['--color-outline-variant'],
              }}
            >
              Error
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Buttons</h4>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 rounded-md font-medium text-sm transition-opacity hover:opacity-90"
              style={{
                backgroundColor: colors['--color-primary'],
                color: colors['--color-on-primary'],
              }}
            >
              Filled Primary
            </button>
            <button
              className="px-4 py-2 rounded-md font-medium text-sm border transition-colors"
              style={{
                borderColor: colors['--color-outline'],
                color: colors['--color-on-surface'],
                backgroundColor: 'transparent',
              }}
            >
              Outlined
            </button>
            <button
              className="px-4 py-2 rounded-md font-medium text-sm transition-opacity"
              style={{
                color: colors['--color-primary'],
                backgroundColor: 'transparent',
              }}
            >
              Text Button
            </button>
            <button
              className="px-4 py-2 rounded-md font-medium text-sm transition-opacity hover:opacity-75"
              style={{
                backgroundColor: colors['--color-error'],
                color: colors['--color-on-error'],
              }}
            >
              Destructive
            </button>
          </div>
        </div>

        {/* Text Hierarchy */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Text Hierarchy</h4>
          <div className="space-y-2">
            <p style={{ fontSize: '20px', fontWeight: 600 }}>
              Heading 1 (20px)
            </p>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>
              Heading 2 (16px)
            </p>
            <p style={{ fontSize: '14px' }}>
              Body text (14px) - Main content reads at this size
            </p>
            <p style={{ fontSize: '12px', color: colors['--color-on-surface-variant'] }}>
              Secondary text (12px) - Supplementary information
            </p>
            <p style={{ fontSize: '12px', color: colors['--color-outline'] }}>
              Tertiary text (12px) - Least prominent
            </p>
          </div>
        </div>

        {/* Badges */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Badges & Tags</h4>
          <div className="flex flex-wrap gap-2">
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: colors['--color-primary-container'],
                color: colors['--color-on-primary-container'],
              }}
            >
              Primary Badge
            </span>
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: colors['--color-secondary-container'],
                color: colors['--color-on-secondary-container'],
              }}
            >
              Secondary Badge
            </span>
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: colors['--color-error-container'],
                color: colors['--color-on-error-container'],
              }}
            >
              Error Badge
            </span>
            <span
              className="px-2 py-1 rounded-full text-xs font-medium border"
              style={{
                borderColor: colors['--color-outline'],
                color: colors['--color-on-surface-variant'],
              }}
            >
              Outlined Badge
            </span>
          </div>
        </div>

        {/* Cards & Containers */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Cards & Containers</h4>
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: colors['--color-surface'],
              borderColor: colors['--color-outline-variant'],
              color: colors['--color-on-surface'],
            }}
          >
            <p className="font-medium mb-1">Surface Card</p>
            <p style={{ color: colors['--color-on-surface-variant'], fontSize: '14px' }}>
              Content displayed on elevated surfaces with proper contrast
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Status & Alerts</h4>
          <div className="space-y-2">
            <div
              className="p-3 rounded-lg border flex gap-2 items-start"
              style={{
                backgroundColor: colors['--color-error-container'],
                borderColor: colors['--color-error'],
                color: colors['--color-on-error-container'],
              }}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">Error state with proper color contrast</p>
            </div>
            <div
              className="p-3 rounded-lg border flex gap-2 items-start"
              style={{
                backgroundColor: colors['--color-primary-container'],
                borderColor: colors['--color-primary'],
                color: colors['--color-on-primary-container'],
              }}
            >
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">Info state - Important information</p>
            </div>
          </div>
        </div>

        {/* Form Elements */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Form Elements</h4>
          <input
            type="text"
            placeholder="Text input field"
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{
              backgroundColor: colors['--color-surface'],
              borderColor: colors['--color-outline'],
              color: colors['--color-on-surface'],
            }}
          />
          <div className="mt-2 flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <label className="text-sm">Checkbox option</label>
          </div>
        </div>

        {/* Links & Focus States */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Links & Focus States</h4>
          <div className="space-y-2">
            <a
              href="#"
              style={{ color: colors['--color-primary'] }}
              className="text-sm underline hover:opacity-80 transition-opacity"
            >
              Primary Link
            </a>
            <div
              style={{
                backgroundColor: colors['--color-surface-variant'],
                borderColor: colors['--color-primary'],
                borderWidth: '2px',
                borderRadius: '6px',
                padding: '8px 12px',
                color: colors['--color-on-surface'],
              }}
            >
              <p className="text-sm">Focused element (with ring)</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Light Mode Preview */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-card-foreground">Light Mode</h3>
          <p className="text-xs text-muted-foreground mt-1">Complete component showcase</p>
        </div>
        {renderComponentShowcase('light')}
      </div>

      {/* Dark Mode Preview */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-card-foreground">Dark Mode</h3>
          <p className="text-xs text-muted-foreground mt-1">Complete component showcase</p>
        </div>
        {renderComponentShowcase('dark')}
      </div>

      {/* WCAG Compliance Info */}
      <div className="rounded-lg border border-border p-4 bg-card">
        <p className="text-xs font-semibold text-card-foreground mb-2">Accessibility Standards</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          All generated colors meet WCAG AA contrast standards (4.5:1 for text on backgrounds). The theme system automatically ensures readability across all components and modes.
        </p>
      </div>
    </div>
  );
}
