/**
 * Admin theme customization page
 */

'use client';

import React from 'react';
import { AdminNavbar } from '@/components/admin/admin-navbar';
import { AdminCard } from '@/components/admin/shared/admin-components';
import { ColorPicker } from '@/components/admin/theme/color-picker';
import { ThemePreview } from '@/components/admin/theme/theme-preview';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme';
import { RotateCcw } from 'lucide-react';

export function ThemeCustomizationContent() {
  const { resetToDefault } = useTheme();

  const handleReset = () => {
    if (confirm('Reset theme to default color? This cannot be undone.')) {
      resetToDefault();
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar
        title="Theme Customization"
        subtitle="Customize your restaurant's brand colors and appearance"
        action={
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        }
      />

      <div className="flex-1 px-4 md:px-6 lg:px-8 space-y-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Color Picker */}
          <AdminCard>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  Brand Color
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select your primary brand color. The system will automatically generate harmonious secondary and tertiary colors.
                </p>
              </div>
              <ColorPicker />
            </div>
          </AdminCard>

          {/* Theme Info */}
          <AdminCard>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-card-foreground">
                  How It Works
                </h3>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="space-y-1">
                  <p className="font-medium text-card-foreground">Material Design 3</p>
                  <p>
                    Your brand color is transformed into a complete color system using Material Design 3 standards, including light and dark mode support.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-card-foreground">Automatic Accessibility</p>
                  <p>
                    All generated colors meet WCAG AA contrast standards for readability and accessibility.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-card-foreground">Real-time Preview</p>
                  <p>
                    See your changes instantly across the entire application without requiring a page reload.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-card-foreground">Persistent Settings</p>
                  <p>
                    Your theme preference is saved locally and synced to your account automatically.
                  </p>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Theme Preview */}
        <div>
          <h2 className="text-xl font-semibold text-card-foreground mb-4">
            Live Preview
          </h2>
          <ThemePreview />
        </div>
      </div>
    </div>
  );
}
