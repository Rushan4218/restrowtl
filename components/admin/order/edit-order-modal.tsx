"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import type { Order } from "@/types";

const ORDER_STATUSES = [
  "pending",
  "pending_ack",
  "confirmed",
  "preparing",
  "served",
  "completed",
  "cancelled",
  "payment_done",
] as const;

interface EditOrderModalProps {
  open: boolean;
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onSave: (order: Order) => void;
}

export function EditOrderModal({
  open,
  order,
  onOpenChange,
  onSave,
}: EditOrderModalProps) {
  const [status, setStatus] = useState<Order["status"]>("pending");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNotes(order.notes || "");
    }
  }, [order, open]);

  const handleSave = async () => {
    if (!order) return;

    try {
      setSaving(true);
      const updated = {
        ...order,
        status,
        notes,
      };
      onSave(updated);
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
      title="Edit Order"
      description={`Order ID: ${order.id}`}
    >
      <div className="space-y-6">
        {/* Order Summary */}
        <div className="rounded-lg bg-muted p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Table</p>
              <p className="font-semibold text-foreground">{order.tableName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Items</p>
              <p className="font-semibold text-foreground">{order.items.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total</p>
              <p className="font-semibold text-foreground">
                ${(order.total || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
              <p className="font-semibold text-foreground text-sm">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Status */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Order Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Order["status"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  <span className="capitalize">{s.replace(/_/g, " ")}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <Label htmlFor="notes" className="text-sm font-semibold">
            Notes
          </Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add order notes or special instructions..."
            className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
