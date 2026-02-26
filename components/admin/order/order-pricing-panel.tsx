"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PricingBreakdown } from "@/lib/order-calculations";

interface OrderPricingPanelProps {
  pricing: PricingBreakdown;
  onDiscountChange?: (percent: number) => void;
  onTaxChange?: (percent: number) => void;
  onServiceChargeChange?: (percent: number) => void;
  discountPercent?: number;
  taxPercent?: number;
  serviceChargePercent?: number;
  guestCount?: number;
  showInputs?: boolean;
}

export function OrderPricingPanel({
  pricing,
  onDiscountChange,
  onTaxChange,
  onServiceChargeChange,
  discountPercent = 0,
  taxPercent = 10,
  serviceChargePercent = 0,
  guestCount = 1,
  showInputs = false,
}: OrderPricingPanelProps) {
  return (
    <Card className="p-4 space-y-3 bg-muted/50 border-border">
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="text-sm font-medium text-foreground">
          ${pricing.subtotal.toFixed(2)}
        </span>
      </div>

      {/* Discount */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Discount</span>
          {showInputs && onDiscountChange && (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                className="w-12 h-7 text-xs bg-background"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>
        <span className={`text-sm font-medium ${pricing.discount > 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
          {pricing.discount > 0 ? '-' : ''} ${pricing.discount.toFixed(2)}
        </span>
      </div>

      {/* Tax */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tax</span>
          {showInputs && onTaxChange && (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min="0"
                max="100"
                value={taxPercent}
                onChange={(e) => onTaxChange(parseFloat(e.target.value) || 0)}
                className="w-12 h-7 text-xs bg-background"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-foreground">
          ${pricing.tax.toFixed(2)}
        </span>
      </div>

      {/* Service Charge */}
      {pricing.serviceCharge > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Service Charge</span>
            {showInputs && onServiceChargeChange && (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={serviceChargePercent}
                  onChange={(e) => onServiceChargeChange(parseFloat(e.target.value) || 0)}
                  className="w-12 h-7 text-xs bg-background"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-foreground">
            ${pricing.serviceCharge.toFixed(2)}
          </span>
        </div>
      )}

      {/* Per Person Cost */}
      {guestCount && guestCount > 1 && (
        <>
          <Separator className="my-2" />
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">Per Person ({guestCount})</span>
            <span className="text-sm font-semibold text-foreground">
              ${(pricing.total / guestCount).toFixed(2)}
            </span>
          </div>
        </>
      )}

      {/* Total */}
      <Separator className="my-2" />
      <div className="flex items-center justify-between pt-2 bg-primary/10 rounded-md p-3">
        <span className="font-semibold text-foreground">Total</span>
        <span className="text-lg font-bold text-primary">
          ${pricing.total.toFixed(2)}
        </span>
      </div>
    </Card>
  );
}
