"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getOrderModifiers } from "@/services/serviceConfigService";
import type { Product, OrderModifier } from "@/types";

interface ProductCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onConfirm: (modifiers: Record<string, string[]>, specialRequests?: string) => void;
}

export function ProductCustomizationModal({
  open,
  onOpenChange,
  product,
  onConfirm,
}: ProductCustomizationModalProps) {
  const [modifiers, setModifiers] = useState<OrderModifier[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadModifiers();
    }
  }, [open]);

  const loadModifiers = async () => {
    try {
      const data = await getOrderModifiers();
      setModifiers(data);
      // Initialize selected options
      const init: Record<string, string[]> = {};
      data.forEach((mod) => {
        init[mod.id] = [];
      });
      setSelectedOptions(init);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (
    modifierId: string,
    optionId: string,
    isMultiSelect: boolean
  ) => {
    setSelectedOptions((prev) => {
      const current = prev[modifierId] || [];
      if (isMultiSelect) {
        return {
          ...prev,
          [modifierId]: current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      } else {
        return {
          ...prev,
          [modifierId]: [optionId],
        };
      }
    });
  };

  const canSubmit = () => {
    return modifiers.every((mod) => {
      if (mod.isRequired) {
        return (selectedOptions[mod.id] || []).length > 0;
      }
      return true;
    });
  };

  const handleSubmit = () => {
    if (canSubmit()) {
      onConfirm(selectedOptions, specialRequests.trim() || undefined);
      setSpecialRequests("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{product.description}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Modifiers */}
          {modifiers.map((modifier) => (
            <div key={modifier.id} className="space-y-3">
              <Label className="text-sm font-medium">
                {modifier.name}
                {modifier.isRequired && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </Label>

              {modifier.maxSelections === 1 ? (
                // Single select (radio)
                <RadioGroup
                  value={(selectedOptions[modifier.id] || [])[0] || ""}
                  onValueChange={(value) =>
                    handleOptionChange(modifier.id, value, false)
                  }
                >
                  {modifier.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="cursor-pointer font-normal"
                      >
                        {option.name}
                        {option.price > 0 && (
                          <span className="ml-2 text-muted-foreground">
                            +${option.price.toFixed(2)}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                // Multi select (checkbox)
                <div className="space-y-2">
                  {modifier.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-muted/50"
                    >
                      <Checkbox
                        id={option.id}
                        checked={(selectedOptions[modifier.id] || []).includes(
                          option.id
                        )}
                        onCheckedChange={(checked) =>
                          handleOptionChange(modifier.id, option.id, true)
                        }
                      />
                      <Label
                        htmlFor={option.id}
                        className="cursor-pointer flex-1 font-normal"
                      >
                        {option.name}
                        {option.price > 0 && (
                          <span className="ml-2 text-muted-foreground">
                            +${option.price.toFixed(2)}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                  {modifier.maxSelections && (
                    <p className="text-xs text-muted-foreground">
                      Select up to {modifier.maxSelections}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="special-requests" className="text-sm font-medium">
              Special Requests <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="special-requests"
              placeholder="Any special preparation instructions or dietary notes..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
          >
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
