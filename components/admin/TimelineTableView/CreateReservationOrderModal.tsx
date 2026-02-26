"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Search } from "lucide-react";
import type { Product, RestaurantTable } from "@/types";
import { getProducts } from "@/services/productService";
import { formatReservationDuration, getTimeString } from "@/lib/timelineUtils";

type SelectedItem = { productId: string; quantity: number };

interface CreateReservationOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: RestaurantTable;
  startTime?: string;
  endTime?: string;
  onConfirm: (payload: {
    customerName: string;
    guestCount: number;
    items: SelectedItem[];
  }) => Promise<void>;
}

export const CreateReservationOrderModal: React.FC<CreateReservationOrderModalProps> = ({
  open,
  onOpenChange,
  table,
  startTime,
  endTime,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");

  const [customerName, setCustomerName] = useState("Walk-in");
  const [guestCount, setGuestCount] = useState(2);
  const [selected, setSelected] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    (async () => {
      const all = await getProducts();
      if (!mounted) return;
      setProducts(all.filter((p) => p.isAvailable));
    })();
    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Reset per open, but keep default name
    setGuestCount(2);
    setSelected({});
    setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [products, query]);

  const selectedItems: SelectedItem[] = useMemo(() => {
    return Object.entries(selected)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));
  }, [selected]);

  const totalItems = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = selectedItems.reduce((sum, i) => {
    const prod = products.find((p) => p.id === i.productId);
    return sum + (prod?.price ?? 0) * i.quantity;
  }, 0);

  const durationText = startTime && endTime ? formatReservationDuration(startTime, endTime) : "";

  const handleQty = (productId: string, nextQty: number) => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (nextQty <= 0) {
        delete copy[productId];
      } else {
        copy[productId] = nextQty;
      }
      return copy;
    });
  };

  const handleConfirm = async () => {
    if (!table || !startTime || !endTime) return;
    if (selectedItems.length === 0) return;

    setIsLoading(true);
    try {
      await onConfirm({
        customerName: customerName.trim() || "Walk-in",
        guestCount: Math.max(1, guestCount),
        items: selectedItems,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-lg">Create reservation & order</DialogTitle>
            <DialogDescription className="text-sm">
              Select menu items, then confirm to create a reservation on the selected table.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-900">
              <div className="text-xs text-gray-600 dark:text-gray-400">Table</div>
              <div className="font-semibold text-gray-900 dark:text-white truncate">
                {table?.name ?? "-"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Seating for {table?.capacity ?? 0}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-900">
              <div className="text-xs text-gray-600 dark:text-gray-400">Time</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {startTime ? getTimeString(new Date(startTime)) : "--:--"} – {endTime ? getTimeString(new Date(endTime)) : "--:--"}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{durationText}</div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-3 bg-gray-50 dark:bg-slate-900">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Customer</div>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9 mt-1"
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Guests</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value || 1)))}
                      className="h-9 text-center"
                      min={1}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setGuestCount((g) => g + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Menu list */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  placeholder="Search menu items"
                />
              </div>
              <Badge variant="secondary" className="whitespace-nowrap">
                {totalItems} selected
              </Badge>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <ScrollArea className="h-[360px]">
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filtered.map((p) => {
                    const qty = selected[p.id] ?? 0;
                    return (
                      <div
                        key={p.id}
                        className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-slate-900"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {p.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {p.description}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white w-16 text-right">
                            ${p.price.toFixed(2)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQty(p.id, qty - 1)}
                              disabled={qty <= 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <div className="w-8 text-center text-sm font-semibold">
                              {qty}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQty(p.id, qty + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && (
                    <div className="p-6 text-sm text-gray-600 dark:text-gray-400 text-center">
                      No items found.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900">
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Summary
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Items</span>
                <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax (8%)</span>
                <span className="font-semibold text-gray-900 dark:text-white">${(subtotal * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700 pt-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total</span>
                <span className="font-bold text-gray-900 dark:text-white">${(subtotal * 1.08).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isLoading || !table || !startTime || !endTime || selectedItems.length === 0}
                onClick={handleConfirm}
              >
                {isLoading ? "Creating..." : "Confirm & Create"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              {selectedItems.length === 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Select at least one menu item to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
