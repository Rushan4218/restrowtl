"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ClipboardList,
  Search,
  Receipt,
  CheckCircle2,
  X,
  Clock,
  CheckCheck,
  Filter,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingTable } from "@/components/shared/loading-state";
import { getOrders, updateOrderStatus, acknowledgeOrder } from "@/services/orderService";
import type { Order, OrderStatus } from "@/types";

const TAX_RATE = 0.08;

const allStatusOptions: OrderStatus[] = [
  "pending_ack",
  "acknowledged",
  "completed",
  "served",
  "payment_done",
  "cancelled",
];

type ViewMode = "all-orders" | "table-orders";

// Helper to calculate minutes elapsed
function getMinutesElapsed(timestamp: string): number {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  return Math.floor((now - then) / (1000 * 60));
}

export function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("all-orders");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [tableSearch, setTableSearch] = useState("");
  const [billOrder, setBillOrder] = useState<Order | null>(null);
  const [completing, setCompleting] = useState(false);
  const [selectedOrderForItems, setSelectedOrderForItems] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      await loadOrders();
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleAcknowledge = async (orderId: string) => {
    try {
      await acknowledgeOrder(orderId);
      await loadOrders();
      toast.success("Order acknowledged");
    } catch {
      toast.error("Failed to acknowledge order");
    }
  };

  const handleCompleteOrder = async () => {
    if (!billOrder) return;
    setCompleting(true);
    try {
      await updateOrderStatus(billOrder.id, "completed");
      toast.success(`Order ${billOrder.id} completed`);
      setBillOrder(null);
      await loadOrders();
    } catch {
      toast.error("Failed to complete order");
    } finally {
      setCompleting(false);
    }
  };

  // Table Orders: only served (not completed) orders, filtered by table search
  const tableOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === "served")
      .filter((o) =>
        tableSearch.trim()
          ? o.tableName.toLowerCase().includes(tableSearch.toLowerCase())
          : true
      );
  }, [orders, tableSearch]);

  // All Orders: filtered by status dropdown
  const allOrdersFiltered = useMemo(() => {
    return filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  if (loading) return <LoadingTable rows={5} />;

  return (
    <>
      {/* Top bar: view mode dropdown + filters */}
      <div className="mb-6 flex flex-col gap-4">
        {/* View Mode Selector */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-orders">All Orders</SelectItem>
                <SelectItem value="table-orders">Table Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === "all-orders" && (
            <p className="text-sm text-muted-foreground">
              {allOrdersFiltered.length} order{allOrdersFiltered.length !== 1 ? "s" : ""}
            </p>
          )}

          {viewMode === "table-orders" && (
            <p className="text-sm text-muted-foreground">
              {tableOrders.length} served order{tableOrders.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Status Filter Tags - All Orders View */}
        {viewMode === "all-orders" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filter by Status:</span>
              </div>
              {filterStatus !== "all" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filter
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
                className={filterStatus === "all" ? "bg-primary text-primary-foreground" : ""}
              >
                All Statuses
              </Button>
              {allStatusOptions.map((status) => {
                const isActive = filterStatus === status;
                const statusColors: Record<OrderStatus, string> = {
                  pending_ack: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
                  acknowledged: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
                  completed: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
                  served: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
                  payment_done: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
                  cancelled: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
                };

                const statusLabels: Record<OrderStatus, string> = {
                  pending_ack: "Pending Acknowledge",
                  acknowledged: "Acknowledged",
                  completed: "Completed",
                  served: "Served",
                  payment_done: "Payment Done",
                  cancelled: "Cancelled",
                };

                return (
                  <Button
                    key={status}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={isActive ? `${statusColors[status]} border` : `border ${statusColors[status]}`}
                  >
                    {statusLabels[status]}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Table Search - Table Orders View */}
        {viewMode === "table-orders" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Search by Table:</span>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter table name..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === "all-orders" && (
        <AllOrdersView
          orders={allOrdersFiltered}
          filterStatus={filterStatus}
          onStatusChange={handleStatusChange}
          onAcknowledge={handleAcknowledge}
          onViewItems={setSelectedOrderForItems}
        />
      )}

      {viewMode === "table-orders" && (
        <TableOrdersView
          orders={tableOrders}
          tableSearch={tableSearch}
          onComplete={(order) => setBillOrder(order)}
        />
      )}

      {/* Bill Summary Modal */}
      <BillModal
        order={billOrder}
        open={!!billOrder}
        onOpenChange={(open) => !open && setBillOrder(null)}
        onConfirm={handleCompleteOrder}
        completing={completing}
      />

      {/* Items Detail Modal */}
      <ItemsModal
        order={selectedOrderForItems}
        open={!!selectedOrderForItems}
        onOpenChange={(open) => !open && setSelectedOrderForItems(null)}
      />
    </>
  );
}

/* ── All Orders View ─────────────────────────────────────── */

/* ── All Orders View - Grid Layout ───────────────────────── */

function AllOrdersView({
  orders,
  filterStatus,
  onStatusChange,
  onAcknowledge,
  onViewItems,
}: {
  orders: Order[];
  filterStatus: string;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onAcknowledge: (id: string) => void;
  onViewItems: (order: Order) => void;
}) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-10 w-10" />}
        title="No orders found"
        description={
          filterStatus !== "all"
            ? "No orders with this status."
            : "Orders will appear here when customers place them."
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {orders.map((order) => {
        const minutesElapsed = getMinutesElapsed(order.createdAt);
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        // Status color mapping
        const statusColorMap: Record<OrderStatus, string> = {
          pending_ack: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
          acknowledged: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          served: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
          payment_done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
          cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        };

        const statusLabelMap: Record<OrderStatus, string> = {
          pending_ack: "Pending",
          acknowledged: "Acked",
          completed: "Done",
          served: "Served",
          payment_done: "Paid",
          cancelled: "Cancelled",
        };

        return (
          <Card
            key={order.id}
            className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary/40 overflow-hidden"
          >
            {/* Header - Compact */}
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="space-y-2">
                {/* Order ID and Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <Badge className={`shrink-0 text-xs ${statusColorMap[order.status]}`}>
                    {statusLabelMap[order.status]}
                  </Badge>
                </div>

                {/* Table and Type */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-foreground">
                    Table: {order.tableName}
                  </span>
                  {order.orderType && (
                    <Badge variant="secondary" className="text-xs">
                      {order.orderType === "dine_in" ? "Dine In" : "Delivery"}
                    </Badge>
                  )}
                </div>

                {/* Items and Time */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                  <span>{minutesElapsed}m ago</span>
                </div>
              </div>
            </CardHeader>

            {/* Content - Items Preview and Total */}
            <CardContent className="flex-1 px-3 py-2 space-y-2">
              {/* Items Preview */}
              <div className="space-y-1">
                {order.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                    {item.notes && (
                      <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <span className="font-medium">{item.quantity}×</span> 
                    <span className="truncate">{item.productName}</span>
                  </div>
                ))}
                {itemCount > 2 && (
                  <button
                    onClick={() => onViewItems(order)}
                    className="text-xs font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
                  >
                    +{itemCount - 2} more
                  </button>
                )}
              </div>

              {/* Total Amount */}
              <div className="border-t border-border pt-2">
                <p className="text-sm font-bold text-foreground">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </CardContent>

            {/* Actions - Compact Footer */}
            <div className="px-3 pb-2 space-y-1.5 border-t border-border">
              {/* Acknowledge Button for Pending */}
              {order.status === "pending_ack" && (
                <Button
                  onClick={() => onAcknowledge(order.id)}
                  size="sm"
                  className="w-full text-xs h-8 bg-orange-600 hover:bg-orange-700 gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Acknowledge
                </Button>
              )}

              {/* Status Updates - Compact */}
              {order.status !== "pending_ack" && order.status !== "cancelled" && (
                <div className="flex gap-1 flex-wrap">
                  {order.status !== "preparing" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 flex-1"
                      onClick={() => onStatusChange(order.id, "preparing")}
                    >
                      Preparing
                    </Button>
                  )}
                  {order.status !== "served" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 flex-1"
                      onClick={() => onStatusChange(order.id, "served")}
                    >
                      Serve
                    </Button>
                  )}
                  {order.status === "served" && (
                    <Button
                      size="sm"
                      className="text-xs h-7 px-2 flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => onStatusChange(order.id, "completed")}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              )}

              {/* Time Warning for Pending Ack */}
              {order.status === "pending_ack" && minutesElapsed > 2 && (
                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium text-center">
                  ⚠ {minutesElapsed}m waiting
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ── Table Orders View ───────────────────────────────────── */

function TableOrdersView({
  orders,
  tableSearch,
  onComplete,
}: {
  orders: Order[];
  tableSearch: string;
  onComplete: (order: Order) => void;
}) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-10 w-10" />}
        title="No served orders"
        description={
          tableSearch.trim()
            ? `No served orders found for "${tableSearch}".`
            : "Served orders awaiting completion will appear here."
        }
      />
    );
  }

  // Group by table
  const grouped = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const key = order.tableName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(order);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([tableName, tableOrders]) => {
        const tableTotal = tableOrders.reduce((s, o) => s + o.total, 0);
        return (
          <div key={tableName}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Table: {tableName}
              </h3>
              <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                Subtotal: ${tableTotal.toFixed(2)}
              </span>
            </div>
            <div className="space-y-3">
              {tableOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base text-foreground">
                          {order.id}
                        </CardTitle>
                        <StatusBadge status={order.status} />
                      </div>
                      <span className="font-semibold text-foreground">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 space-y-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-foreground">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => onComplete(order)}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Order
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Bill Summary Modal ──────────────────────────────────── */

function BillModal({
  order,
  open,
  onOpenChange,
  onConfirm,
  completing,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  completing: boolean;
}) {
  if (!order) return null;

  const subtotal = order.total;
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Receipt className="h-5 w-5 text-primary" />
            Bill Summary
          </DialogTitle>
          <DialogDescription>
            {order.id} &middot; Table {order.tableName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.productName}
                </span>
                <span className="tabular-nums text-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span className="tabular-nums">${tax.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-lg font-semibold text-foreground">
              Grand Total
            </span>
            <span className="text-lg font-bold tabular-nums text-primary">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={completing}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {completing ? "Completing..." : "Confirm Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Items Detail Modal ──────────────────────────────────── */

function ItemsModal({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Order Items - {order.tableName}
          </DialogTitle>
          <DialogDescription>
            Order ID: #{order.id.slice(0, 8)} • {order.items.length} items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
            >
              {/* Item Header with Note Icon */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {item.notes && (
                    <div
                      className="rounded-full bg-amber-100 p-1.5 dark:bg-amber-900/30"
                      title="Customer notes"
                    >
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  )}
                  <div className="text-right">
                    <p className="font-medium text-foreground text-sm">
                      {item.quantity}×
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {item.notes && (
                <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-2 border border-amber-200 dark:border-amber-800/40">
                  <p className="text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
                    🔔 Special Requests:
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 italic">
                    {item.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              ${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">${order.total.toFixed(2)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
