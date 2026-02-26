"use client";

import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    if (newValue !== value) onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    if (newValue !== value) onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      const clamped = Math.min(Math.max(val, min), max);
      onChange(clamped);
    }
  };

  return (
    <div className="flex items-center border border-border rounded-md bg-background">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="h-10 w-10 rounded-none"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className="h-10 w-12 text-center border-0 bg-background text-foreground font-semibold outline-none"
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="h-10 w-10 rounded-none"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
