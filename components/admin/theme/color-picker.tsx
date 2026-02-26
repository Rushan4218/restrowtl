/**
 * Color picker component with live preview
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useTheme } from '@/components/theme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ColorPickerProps {
  onColorChange?: (color: string) => void;
}

export function ColorPicker({ onColorChange }: ColorPickerProps) {
  const { currentTheme, setTheme, isLoading } = useTheme();
  const [color, setColor] = useState(currentTheme?.primaryColor || '#FF6B6B');
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColor(value);
    setShowPreview(true);
  };

  const handleApply = useCallback(async () => {
    try {
      if (!color.match(/^#[0-9A-F]{6}$/i)) {
        toast.error('Invalid hex color format (e.g., #FF6B6B)');
        return;
      }

      await setTheme(color);
      onColorChange?.(color);
      setShowPreview(false);
      toast.success('Theme color updated');
    } catch (error) {
      toast.error('Failed to apply theme');
      console.error(error);
    }
  }, [color, setTheme, onColorChange]);

  const handleReset = () => {
    if (currentTheme?.primaryColor) {
      setColor(currentTheme.primaryColor);
      setShowPreview(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Primary Brand Color</Label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              type="color"
              value={color}
              onChange={handleChange}
              className="h-12 cursor-pointer border-border"
            />
          </div>
          <Input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#FF6B6B"
            maxLength={7}
            className="flex-1 font-mono text-sm bg-background border-border text-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter hex color code or use the color picker
        </p>
      </div>

      {showPreview && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
            <div className="flex gap-2">
              {['primary', 'secondary', 'tertiary'].map((variant) => (
                <div
                  key={variant}
                  className="flex-1 h-12 rounded-md border border-border"
                  title={variant}
                  style={{
                    backgroundColor: color,
                    opacity: variant === 'primary' ? 1 : variant === 'secondary' ? 0.8 : 0.6,
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Adjusting theme to {color}. Changes will be applied to all components using theme colors.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleApply}
          disabled={isLoading || !showPreview}
          className="gap-2 flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Apply Theme
            </>
          )}
        </Button>
        {showPreview && (
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
