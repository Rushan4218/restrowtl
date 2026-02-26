"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, Search } from "lucide-react";

import type { AdminOrderType, CustomerProfile, Product, RestaurantTable } from "@/types";
import { getEnabledTables } from "@/services/tableService";
import { getProducts } from "@/services/productService";
import { adminCustomerService } from "@/services/adminCustomerService";
import { OrderSummaryCard } from "./order-summary-card";

type SelectedItem = { productId: string; quantity: number };

function toLocalDateTimeInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function CreateOrderFromListModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: {
    orderType: AdminOrderType;
    tableId?: string;
    tableName?: string;
    startTime?: string;
    endTime?: string;
    guestCount?: number;
    customerKind: "walk_in" | "registered";
    customerName?: string;
    customerId?: string;
    notes?: string;
    items: SelectedItem[];
  }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const [orderType, setOrderType] = useState<AdminOrderType>("dine_in");
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tableId, setTableId] = useState<string>("");
  const selectedTable = useMemo(() => tables.find((t) => t.id === tableId), [tables, tableId]);

  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [guestCount, setGuestCount] = useState<number>(2);

  const [customerKind, setCustomerKind] = useState<"walk_in" | "registered">("walk_in");
  const [customerName, setCustomerName] = useState<string>("Walk-in");
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [customerQuery, setCustomerQuery] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");

  const [notes, setNotes] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    (async () => {
      const [t, p, c] = await Promise.all([
        getEnabledTables(),
        getProducts(),
        adminCustomerService.getCustomers(),
      ]);
      if (!mounted) return;
      setTables(t);
      setProducts(p.filter((x) => x.isAvailable));
      setCustomers(c);
    })();

    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);

    setOrderType("dine_in");
    setTableId("");
    setStartTime(toLocalDateTimeInputValue(now));
    setEndTime(toLocalDateTimeInputValue(later));
    setGuestCount(2);

    setCustomerKind("walk_in");
    setCustomerName("Walk-in");
    setCustomerQuery("");
    setCustomerId("");
    setNotes("");
    setQuery("");
    setSelected({});
  }, [open]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
    );
  }, [products, query]);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.telephone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customers, customerQuery]);

  const selectedItems: SelectedItem[] = useMemo(() => {
    return Object.entries(selected)
      .filter(([, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));
  }, [selected]);

  const totalItems = useMemo(
    () => selectedItems.reduce((sum, i) => sum + i.quantity, 0),
    [selectedItems]
  );

  const subtotal = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p] as const));
    return selectedItems.reduce((sum, i) => sum + (byId.get(i.productId)?.price ?? 0) * i.quantity, 0);
  }, [selectedItems, products]);

  const handleQty = (productId: string, nextQty: number) => {
    setSelected((prev) => {
      const copy = { ...prev };
      if (nextQty <= 0) delete copy[productId];
      else copy[productId] = nextQty;
      return copy;
    });
  };

  const canConfirm = useMemo(() => {
    if (selectedItems.length === 0) return false;
    if (orderType === "dine_in" || orderType === "reservation") {
      if (!selectedTable) return false;
      if (!startTime || !endTime) return false;
    }
    if (customerKind === "registered") {
      if (!customerId) return false;
    }
    return true;
  }, [selectedItems.length, orderType, selectedTable, startTime, endTime, customerKind, customerId]);

  const confirm = async () => {
    if (!canConfirm) return;
    setLoading(true);
    try {
      await onConfirm({
        orderType,
        tableId: (orderType === "dine_in" || orderType === "reservation") ? selectedTable?.id : undefined,
        tableName: (orderType === "dine_in" || orderType === "reservation") ? selectedTable?.name : undefined,
        startTime: (orderType === "dine_in" || orderType === "reservation") ? new Date(startTime).toISOString() : undefined,
        endTime: (orderType === "dine_in" || orderType === "reservation") ? new Date(endTime).toISOString() : undefined,
        guestCount: (orderType === "dine_in" || orderType === "reservation") ? Math.max(1, guestCount) : undefined,
        customerKind,
        customerName: customerKind === "walk_in" ? (customerName.trim() || "Walk-in") : undefined,
        customerId: customerKind === "registered" ? customerId : undefined,
        notes: notes.trim() || undefined,
        items: selectedItems,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <div className="p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-lg">Create Order</DialogTitle>
            <DialogDescription className="text-sm">
              Create a new order with reservation details, customer selection, and menu items.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={(v) => setOrderType(v as AdminOrderType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine_in">Dine In</SelectItem>
                    <SelectItem value="take_away">Take Away</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="quick_order">Quick Order</SelectItem>
                    <SelectItem value="reservation">Reservation</SelectItem>
                    <SelectItem value="pick_up">Pick Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(orderType === "dine_in" || orderType === "reservation") ? (
                <div className="space-y-1">
                  <Label>
                    Table {(orderType === "dine_in" || orderType === "reservation") && <span className="text-destructive">*</span>}
                  </Label>
                  <Select value={tableId} onValueChange={setTableId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} (cap {t.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="rounded-lg border p-3 bg-muted/30">
                  <div className="text-sm font-medium">
                    {orderType === "take_away" ? "Take Away" : orderType === "delivery" ? "Delivery" : orderType === "quick_order" ? "Quick Order" : "Pick Up"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Table selection is not required for this order type.
                  </div>
                </div>
              )}
            </div>

            {(orderType === "dine_in" || orderType === "reservation") ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>
                    End Time <span className="text-destructive">*</span>
                  </Label>
                  <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Guests</Label>
                  <Input
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                  />
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Customer</div>
                <Badge variant="secondary">
                  {customerKind === "walk_in" ? "Walk-in" : "Registered"}
                </Badge>
              </div>

              <RadioGroup
                value={customerKind}
                onValueChange={(v) => setCustomerKind(v as any)}
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="walk_in" />
                  <span className="text-sm">Walk-in</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="registered" />
                  <span className="text-sm">Registered member</span>
                </label>
              </RadioGroup>

              {customerKind === "walk_in" ? (
                <div className="space-y-1">
                  <Label>Customer Name</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={customerQuery}
                      onChange={(e) => setCustomerQuery(e.target.value)}
                      placeholder="Search name / phone / email"
                      className="pl-8"
                    />
                  </div>

                  <div className="rounded-md border">
                    <ScrollArea className="h-40">
                      <div className="p-2 space-y-1">
                        {filteredCustomers.length === 0 ? (
                          <div className="text-sm text-muted-foreground p-2">No customers</div>
                        ) : (
                          filteredCustomers.slice(0, 30).map((c) => {
                            const active = c.id === customerId;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => setCustomerId(c.id)}
                                className={`w-full text-left rounded-md p-2 transition-colors ${
                                  active ? "bg-primary/10" : "hover:bg-muted"
                                }`}
                              >
                                <div className="text-sm font-medium">{c.fullName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {c.telephone} • {c.email}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Menu Items</div>
                <Badge variant="outline">{totalItems} selected</Badge>
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search menu" className="pl-8" />
              </div>

              <div className="rounded-xl border overflow-hidden">
                <ScrollArea className="h-[320px]">
                  <div className="p-3 space-y-2">
                    {filteredProducts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No items</div>
                    ) : (
                      filteredProducts.map((p) => {
                        const qty = selected[p.id] ?? 0;
                        return (
                          <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{p.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {p.description}
                              </div>
                              <div className="text-xs mt-1">
                                <span className="text-muted-foreground">Price:</span> {p.price.toFixed(2)}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => handleQty(p.id, qty - 1)}
                                disabled={qty <= 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <div className="w-10 text-center font-semibold">{qty}</div>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => handleQty(p.id, qty + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-1">
                <Label>Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <OrderSummaryCard subtotal={subtotal} itemCount={totalItems} />

            <div className="rounded-xl border p-4 space-y-2">
              <div className="text-sm font-semibold">Quick validation</div>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {orderType === "dine_in" ? (
                  <>
                    <li>Table and time range required for Dine In</li>
                    <li>Guest count is optional</li>
                  </>
                ) : (
                  <>
                    <li>No table required for Take Away / Delivery</li>
                    <li>You can still attach a customer for delivery</li>
                  </>
                )}
                <li>At least 1 item required to confirm</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={confirm} disabled={!canConfirm || loading}>
                {loading ? "Creating..." : "Confirm & Create"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
