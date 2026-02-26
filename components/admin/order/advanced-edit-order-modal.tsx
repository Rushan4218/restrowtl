"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/shared/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus, X } from "lucide-react";
import type { Order, OrderItem, Product } from "@/types";
import {
  calculatePricing,
  createUpdatedOrder,
  isValidQuantity,
} from "@/lib/order-calculations";
import { QuantityStepper } from "./quantity-stepper";
import { OrderPricingPanel } from "./order-pricing-panel";
import { ProductSelector } from "./product-selector";

interface AdvancedEditOrderModalProps {
  open: boolean;
  order: Order | null;
  products: Product[];
  onOpenChange: (open: boolean) => void;
  onSave: (order: Order) => Promise<void>;
}

const ORDER_STATUSES = [
  "pending_ack",
  "acknowledged",
  "completed",
  "served",
  "payment_done",
  "cancelled",
] as const;

export function AdvancedEditOrderModal({
  open,
  order,
  products,
  onOpenChange,
  onSave,
}: AdvancedEditOrderModalProps) {
  // State
  const [items, setItems] = useState<OrderItem[]>([]);
  const [status, setStatus] = useState<Order["status"]>("pending_ack");
  const [notes, setNotes] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(10);
  const [serviceChargePercent, setServiceChargePercent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Initialize from order
  useEffect(() => {
    if (order && open) {
      setItems([...order.items]);
      setStatus(order.status);
      setNotes(order.notes || "");
      setGuestCount(order.guestCount || 1);
      // Attempt to extract tax percent from order (assume 10% default)
      setTaxPercent(order.taxRate || 10);
      setDiscountPercent(0); // Reset discount
      setServiceChargePercent(0); // Reset service charge
    }
  }, [order, open]);

  // Calculate pricing
  const pricing = useMemo(() => {
    return calculatePricing({
      items,
      discountPercent,
      taxPercent,
      serviceChargePercent,
      guestCount,
    });
  }, [items, discountPercent, taxPercent, serviceChargePercent, guestCount]);

  // Calculate price difference
  const priceDifference = useMemo(() => {
    return pricing.total - (order?.total || 0);
  }, [pricing.total, order?.total]);

  // Handle add item from selector
  const handleAddProduct = (product: Product) => {
    const existing = items.find((i) => i.productId === product.id);
    
    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
      toast.success(`Increased ${product.name} quantity`);
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
          notes: "",
        },
      ]);
      toast.success(`Added ${product.name}`);
    }
    setShowAddProduct(false);
  };

  // Handle quantity change
  const handleQuantityChange = (productId: string, quantity: number) => {
    if (!isValidQuantity(quantity)) {
      toast.error("Quantity must be at least 1");
      return;
    }

    setItems(
      items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    );
  };

  // Handle price change
  const handlePriceChange = (productId: string, price: number) => {
    if (price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    setItems(
      items.map((i) =>
        i.productId === productId ? { ...i, price } : i
      )
    );
  };

  // Handle remove item
  const handleRemoveItem = (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    if (item) {
      setItems(items.filter((i) => i.productId !== productId));
      toast.success(`Removed ${item.productName}`);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!order) return;

    if (items.length === 0) {
      toast.error("Order must have at least one item");
      return;
    }

    try {
      setSaving(true);

      const updatedOrder = createUpdatedOrder(order, items, {
        discountPercent,
        taxPercent,
        serviceChargePercent,
        guestCount,
      });

      updatedOrder.status = status;
      updatedOrder.notes = notes;
      updatedOrder.guestCount = guestCount;

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      await onSave(updatedOrder);
      toast.success("Order updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update order");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Advanced Order Editor"
      description={`Order: ${order.tableName} • ID: ${order.id}`}
      size="2xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Table</p>
            <p className="font-semibold text-foreground">{order.tableName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Created</p>
            <p className="font-semibold text-foreground text-sm">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Separator />

        {/* Order Status */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Order Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ").toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Guest Count */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Guest Count</Label>
          <Input
            type="number"
            min="1"
            max="50"
            value={guestCount}
            onChange={(e) =>
              setGuestCount(Math.max(1, parseInt(e.target.value) || 1))
            }
            className="bg-background border-border"
          />
        </div>

        <Separator />

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Order Items</h3>
            <Button
              size="sm"
              onClick={() => setShowAddProduct(!showAddProduct)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {/* Product Selector */}
          {showAddProduct && (
            <Card className="p-4 bg-muted/50 border-border">
              <ProductSelector
                products={products}
                onSelect={handleAddProduct}
                selectedProductIds={items.map((i) => i.productId)}
              />
            </Card>
          )}

          {/* Items List */}
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items. Click "Add Item" to start.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <Card
                  key={item.productId}
                  className="p-4 bg-card border-border space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.productName}</p>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Notes: {item.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity and Price Row */}
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Quantity
                      </Label>
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(qty) => handleQuantityChange(item.productId, qty)}
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Unit Price
                      </Label>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price.toFixed(2)}
                          onChange={(e) =>
                            handlePriceChange(item.productId, parseFloat(e.target.value) || 0)
                          }
                          className="h-9 text-sm bg-background border-border"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Subtotal
                      </Label>
                      <p className="text-sm font-semibold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Pricing Controls */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Discount %</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tax %</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={taxPercent}
              onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Service %</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={serviceChargePercent}
              onChange={(e) => setServiceChargePercent(parseFloat(e.target.value) || 0)}
              className="bg-background border-border"
            />
          </div>
        </div>

        {/* Pricing Panel */}
        <OrderPricingPanel
          pricing={pricing}
          guestCount={guestCount}
          discountPercent={discountPercent}
          taxPercent={taxPercent}
          serviceChargePercent={serviceChargePercent}
        />

        {/* Price Difference */}
        {Math.abs(priceDifference) > 0.01 && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <p className="text-sm">
              <span className="text-muted-foreground">Price Change: </span>
              <span
                className={`font-semibold ${
                  priceDifference > 0
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {priceDifference > 0 ? "+" : ""}${priceDifference.toFixed(2)}
              </span>
            </p>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Notes</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes, special requests, etc."
            className="w-full min-h-[80px] p-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || items.length === 0}
            className="gap-2"
          >
            {saving ? "Saving..." : "Save Order"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
