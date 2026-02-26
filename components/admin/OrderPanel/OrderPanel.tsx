"use client";

import React, { useState } from "react";
import { Order, Reservation } from "@/types";
import { useAdminStore } from "@/store/adminStore";
import { adminOrderService } from "@/services/adminOrderService";
import { toast } from "sonner";
import { OrderItemsEditor } from "./OrderItemsEditor";
import { BillingSection } from "./BillingSection";
import { Button } from "@/components/ui/button";
import { X, Phone, MapPin, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { getTimeString, formatReservationDuration } from "@/lib/timelineUtils";

interface OrderPanelProps {
  reservation?: Reservation;
  order?: Order;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({ reservation, order }) => {
  const {
    isOrderPanelOpen,
    setOrderPanelOpen,
    updateOrderItems,
    markOrderServed,
    markOrderCompleted,
    cancelOrder,
  } = useAdminStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!reservation || !order) {
    return (
      <Sheet open={isOrderPanelOpen} onOpenChange={setOrderPanelOpen}>
        <SheetContent suppressHydrationWarning side="right" className="w-full sm:w-96 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>No order is currently selected. Select an order from the timeline to view details.</SheetDescription>
          </SheetHeader>
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              No order selected
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const statusColors: Record<string, string> = {
    pending_ack: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
    acknowledged: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200",
    served: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200",
    completed: "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200",
    payment_done: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200",
    cancelled: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200",
  };

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = subtotal * 0.08;
  const total = subtotal + taxAmount;

  const duration = formatReservationDuration(
    reservation.startTime,
    reservation.endTime
  );

  const handleSaveItems = async (updatedItems: typeof order.items) => {
    setIsLoading(true);
    try {
      await adminOrderService.updateOrderItems(order.id, updatedItems);
      setIsEditing(false);
      toast.success("Order items updated");
    } catch (error) {
      toast.error("Failed to update order items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsServed = async () => {
    setIsLoading(true);
    try {
      await adminOrderService.markOrderServed(order.id);
      toast.success("Order marked as served");
    } catch (error) {
      toast.error("Failed to mark order as served");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsCompleted = async () => {
    setIsLoading(true);
    try {
      await adminOrderService.markOrderCompleted(order.id);
      toast.success("Order marked as completed");
    } catch (error) {
      toast.error("Failed to mark order as completed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      await adminOrderService.cancelOrder(order.id);
      toast.success("Order cancelled");
    } catch (error) {
      toast.error("Failed to cancel order");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOrderPanelOpen} onOpenChange={setOrderPanelOpen}>
      <SheetContent suppressHydrationWarning side="right" className="w-full sm:w-96 p-0 flex flex-col overflow-hidden">
        <SheetHeader className="sr-only">
          <SheetTitle>Order #{order.kotNumber}</SheetTitle>
          <SheetDescription>Details and actions for order {order.id} at table {order.tableName}</SheetDescription>
        </SheetHeader>

        {/* Panel Header */}
        <div className="border-b border-gray-200 dark:border-slate-700 p-6 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Order #{order.kotNumber}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.tableName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOrderPanelOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              className={`text-xs font-semibold ${
                statusColors[order.status] || "bg-gray-100 dark:bg-gray-900"
              }`}
            >
              {order.status.replace("_", " ").toUpperCase()}
            </Badge>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Created at {getTimeString(new Date(order.createdAt))}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Reservation Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Reservation Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span>{reservation.tableName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>{duration} duration</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone className="h-4 w-4 text-orange-600" />
                <span>{reservation.guestCount} guest{reservation.guestCount > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {isEditing ? (
            <div className="space-y-3">
              <OrderItemsEditor
                items={order.items}
                onItemsChange={handleSaveItems}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={() => setIsEditing(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              <OrderItemsEditor
                items={order.items}
                onItemsChange={() => {}}
                isReadOnly
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(true)}
                disabled={order.status === "payment_done" || order.status === "cancelled"}
              >
                Edit Items
              </Button>
            </>
          )}

          {/* Billing */}
          <BillingSection
            subtotal={subtotal}
            taxRate={0.08}
            total={total}
          />

          {/* Notes */}
          {order.notes && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notes
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-6 flex-shrink-0 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleMarkAsServed}
            disabled={
              order.status === "served" ||
              order.status === "completed" ||
              order.status === "cancelled" ||
              isLoading
            }
          >
            {isLoading ? "Updating..." : "Mark as Served"}
          </Button>
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleMarkAsCompleted}
            disabled={
              order.status === "completed" ||
              order.status === "payment_done" ||
              order.status === "cancelled" ||
              isLoading
            }
          >
            {isLoading ? "Updating..." : "Mark as Completed"}
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleCancelOrder}
            disabled={order.status === "cancelled" || order.status === "payment_done" || isLoading}
          >
            {isLoading ? "Updating..." : "Cancel Order"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
