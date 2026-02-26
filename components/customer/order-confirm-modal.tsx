"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  Send,
  ChefHat,
  ConciergeBell,
  UserCheck,
  AlertCircle,
  MessageSquare,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/shared/loading-state";
import { useCart } from "@/hooks/use-cart";
import { useTable } from "@/hooks/use-table";
import { useDeviceSession } from "@/hooks/use-device-session";
import { getEnabledTables } from "@/services/tableService";
import { createOrder } from "@/services/orderService";
import { linkOrderToCustomer } from "@/services/authService";
import type { RestaurantTable, Customer } from "@/types";

const TAX_RATE = 0.08;

interface OrderConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderConfirmModal({
  open,
  onOpenChange,
}: OrderConfirmModalProps) {
  const router = useRouter();
  const {
    items,
    totalPrice,
    removeItem,
    setItemQuantity,
    clearCart,
  } = useCart();
  const { selectedTable, isTableLocked, tableLoading, tableError } = useTable();
  const { startSession, addOrderToSession } = useDeviceSession();

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [selectedTableId, setSelectedTableId] = useState<string>("");

  useEffect(() => {
    if (open) {
      loadTables();
      // Set table from QR code if locked
      if (isTableLocked && selectedTable) {
        setSelectedTableId(selectedTable.id);
      }
    }
  }, [open, isTableLocked, selectedTable]);

  const loadTables = async () => {
    setTablesLoading(true);
    try {
      const data = await getEnabledTables();
      setTables(data);
    } catch (error) {
      console.error("Failed to load tables:", error);
      toast.error("Failed to load tables");
    } finally {
      setTablesLoading(false);
    }
  };

  const currentTable = tables.find((t) => t.id === selectedTableId) || selectedTable;

  const taxAmount = totalPrice * TAX_RATE;
  const grandTotal = totalPrice + taxAmount;

  const handleEditNotes = (productId: string, currentNotes: string) => {
    setEditingProductId(productId);
    setEditingNotes(currentNotes);
  };

  const handleSaveNotes = (productId: string) => {
    const item = items.find((i) => i.product.id === productId);
    if (item) {
      item.notes = editingNotes;
      setEditingProductId(null);
      setEditingNotes("");
      toast.success("Special request saved");
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedTableId) {
      toast.error("Please select a table");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      // Get customer ID if authenticated
      const customerData = localStorage.getItem("customerData");
      const customerId = customerData
        ? (JSON.parse(customerData) as Customer).id
        : undefined;

      const { order, notifications } = await createOrder(
        selectedTableId,
        currentTable?.name || "",
        items,
        customerId
      );

      // Link to customer if authenticated
      if (customerId) {
        await linkOrderToCustomer(order.id, customerId);
      }

      // Create / extend device table session (30-min reservation on this device)
      startSession(selectedTableId, currentTable?.name || "");
      addOrderToSession(order.id);

      onOpenChange(false);
      clearCart();
      if (!isTableLocked) setSelectedTableId("");

      // Show notification toasts for each recipient
      notifications.forEach((n, idx) => {
        const icon =
          n.recipient === "chef"
            ? "Chef"
            : n.recipient === "receptionist"
              ? "Receptionist"
              : "Server";
        setTimeout(() => {
          toast.success(`Notified ${icon}`, {
            description: n.message,
          });
        }, idx * 600);
      });

      router.push(`/menu/order-confirmation?orderId=${order.id}`);
    } catch (error) {
      console.error("Order confirmation error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">Confirm Your Order</DialogTitle>
        <DialogDescription className="sr-only">
          Review your selected items, choose a table, and confirm your order
        </DialogDescription>

        {/* Header */}
        <div className="shrink-0 border-b bg-background px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">
            Confirm Your Order
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your selected items, choose a table, and confirm.
          </p>
        </div>

        {/* Scrollable items area */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-3 px-6 py-4">
              {items.map((item) => (
                <div key={item.product.id} className="rounded-lg border border-border bg-background p-4">
                  {editingProductId === item.product.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          Add Request for {item.product.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => setEditingProductId(null)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="e.g., Extra hot, No whipped cream..."
                        className="min-h-20 text-xs resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProductId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveNotes(item.product.id)}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        {/* Initial badge */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          {item.product.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${item.product.price.toFixed(2)} each
                          </p>
                        </div>

                        {/* Price */}
                        <p className="shrink-0 text-right font-bold text-foreground">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              setItemQuantity(item.product, Math.max(1, item.quantity - 1))
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-bold text-orange-600">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              setItemQuantity(item.product, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Add Request button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto h-7 gap-1.5 text-xs"
                          onClick={() => handleEditNotes(item.product.id, item.notes || "")}
                        >
                          <MessageSquare className="h-3 w-3" />
                          {item.notes ? "Edit" : "Add"} Request
                        </Button>

                        {/* Delete button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Notes display */}
                      {item.notes && (
                        <div className="rounded-md border border-amber-200 bg-amber-50/50 p-2 dark:border-amber-800/40 dark:bg-amber-900/20">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-300">
                              {item.notes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Price summary */}
        <div className="shrink-0 border-t bg-muted/30 px-6 py-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span className="tabular-nums">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-orange-600 tabular-nums">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Table Selection */}
        <div className="shrink-0 border-t bg-background px-6 py-4">
          <Label className="mb-2 block text-sm font-semibold text-foreground">
            Select Table
          </Label>
            {isTableLocked && selectedTable ? (
              <div className="flex items-center gap-2 rounded-md border border-orange-500 bg-orange-50 px-3 py-2 dark:bg-orange-950">
                <Badge variant="secondary" className="gap-1 bg-orange-600 text-white">
                  QR
                </Badge>
                <span className="text-sm font-medium text-foreground">
                  {selectedTable.name} ({selectedTable.capacity} seats)
                </span>
              </div>
            ) : tablesLoading ? (
              <LoadingSpinner />
            ) : (
              <Select 
                value={selectedTableId || ""} 
                onValueChange={setSelectedTableId}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose your table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((tbl) => (
                    <SelectItem key={tbl.id} value={tbl.id}>
                      {tbl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Staff notification */}
          <div className="shrink-0 border-t bg-background px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <ChefHat className="h-4 w-4" />
                <span>Chef</span>
                <ConciergeBell className="h-4 w-4 ml-2" />
                <span>Receptionist</span>
                <UserCheck className="h-4 w-4 ml-2" />
                <span>Server</span>
              </div>
              <span className="text-xs text-muted-foreground">Will be notified</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="shrink-0 border-t bg-background px-6 py-3 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Back to Menu
            </Button>
            <Button
              onClick={handleConfirmOrder}
              disabled={!selectedTableId || submitting || items.length === 0}
              className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600"
            >
              <Send className="h-4 w-4" />
            {submitting ? "Confirming..." : "Confirm Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
