"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowLeft,
  UtensilsCrossed,
  ChefHat,
  ConciergeBell,
  UserCheck,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-state";
import { getOrder, updateOrderStatus } from "@/services/orderService";
import { getCancellationPolicy } from "@/services/cancellationPolicyService";
import { useDeviceSession } from "@/hooks/use-device-session";
import { toast } from "sonner";
import type { Order } from "@/types";

const TAX_RATE = 0.08;

export function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const latestOrderId = searchParams.get("orderId");
  const { session, remainingMinutes, isSessionActive } = useDeviceSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    latestOrderId
  );

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<Order | null>(
    null
  );
  const [policyText, setPolicyText] = useState("");
  const [policyLoading, setPolicyLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!session || session.orderIds.length === 0) {
      // Fallback: try loading just the single orderId from URL
      if (latestOrderId) {
        try {
          const single = await getOrder(latestOrderId);
          if (single) setOrders([single]);
        } catch {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.all(
        session.orderIds.map((id) => getOrder(id))
      );
      const valid = results.filter(Boolean) as Order[];
      // Sort newest first
      valid.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(valid);
    } finally {
      setLoading(false);
    }
  }, [session, latestOrderId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOpenCancelModal = async (order: Order) => {
    setCancelTargetOrder(order);
    setCancelModalOpen(true);
    setPolicyLoading(true);
    try {
      const text = await getCancellationPolicy();
      setPolicyText(text);
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelTargetOrder) return;
    setCancelling(true);
    try {
      const updated = await updateOrderStatus(
        cancelTargetOrder.id,
        "cancelled"
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? updated : o))
      );
      setCancelModalOpen(false);
      setCancelTargetOrder(null);
      toast.success("Your order has been cancelled.");
    } catch {
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  // No session and no orders at all
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          No orders yet
        </h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Scan a table QR code and place an order to see your session details
          here.
        </p>
        <Link href="/menu" className="mt-6">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  const sessionTotal = orders.reduce((sum, o) => sum + o.total, 0);
  const sessionTax = sessionTotal * TAX_RATE;
  const sessionGrand = sessionTotal + sessionTax;

  return (
    <div className="mx-auto max-w-lg">
      {/* Session banner */}
      {isSessionActive && session && (
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Table Reservation: {session.tableName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Started{" "}
                  {new Date(session.startedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="gap-1 bg-primary/10 text-primary"
            >
              <Clock className="h-3 w-3" />
              {remainingMinutes} min left
            </Badge>
          </div>
        </div>
      )}

      {/* Latest order success banner */}
      {latestOrderId && orders.find((o) => o.id === latestOrderId) && (
        <>
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Order Confirmed!
            </h2>
            <p className="mt-1 text-muted-foreground">
              Your order has been sent to the kitchen.
            </p>
          </div>

          {/* Notifications sent */}
          <div className="mb-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ChefHat className="h-4 w-4 text-primary" />
              <span>Chef notified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ConciergeBell className="h-4 w-4 text-primary" />
              <span>Receptionist notified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Server notified</span>
            </div>
          </div>
        </>
      )}

      {/* Session orders heading */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Your Orders ({orders.length})
        </h3>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {orders.map((order) => {
          const isCancelled = order.status === "cancelled";
          const canCancel =
            order.status === "pending" || order.status === "preparing";
          const taxAmount = order.total * TAX_RATE;
          const grandTotal = order.total + taxAmount;
          const isExpanded = expandedOrderId === order.id;
          const isLatest = order.id === latestOrderId;

          return (
            <Collapsible
              key={order.id}
              open={isExpanded}
              onOpenChange={(open) =>
                setExpandedOrderId(open ? order.id : null)
              }
            >
              <Card
                className={
                  isLatest && !isCancelled
                    ? "ring-2 ring-primary/50 shadow-md shadow-primary/10"
                    : ""
                }
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer transition-colors hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <CardTitle className="text-sm text-foreground">
                            {order.id}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {isLatest && !isCancelled && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          >
                            Latest
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        <span className="text-sm font-bold tabular-nums text-primary">
                          {"$"}
                          {grandTotal.toFixed(2)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <Separator />

                    {/* Cancelled banner */}
                    {isCancelled && (
                      <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">
                          This order has been cancelled.
                        </span>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="tabular-nums text-foreground">
                            {"$"}
                            {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="tabular-nums">
                          {"$"}
                          {order.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                        <span className="tabular-nums">
                          {"$"}
                          {taxAmount.toFixed(2)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">
                          Total
                        </span>
                        <span className="font-bold tabular-nums text-primary">
                          {"$"}
                          {grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {canCancel && (
                      <>
                        <Separator />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleOpenCancelModal(order)}
                          className="w-full gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Order
                        </Button>
                      </>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {/* Session totals */}
      {orders.length > 1 && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Session Subtotal ({orders.length} orders)</span>
                <span className="tabular-nums">
                  {"$"}
                  {sessionTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Tax</span>
                <span className="tabular-nums">
                  {"$"}
                  {sessionTax.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-foreground">
                  Session Total
                </span>
                <span className="font-bold tabular-nums text-primary">
                  {"$"}
                  {sessionGrand.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-2">
        <Link href="/menu">
          <Button className="w-full gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Order More
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Cancellation Policy Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Please read the cancellation policy before proceeding.
            </DialogDescription>
          </DialogHeader>

          {policyLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading policy...
              </span>
            </div>
          ) : (
            <ScrollArea className="max-h-60">
              <div className="rounded-md border bg-muted/50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {policyText}
                </p>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelling || policyLoading}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              {cancelling ? "Cancelling..." : "I Agree, Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
