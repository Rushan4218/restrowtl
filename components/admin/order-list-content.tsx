"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Order, Product, RestaurantTable } from "@/types";
import { getOrders, createOrder, updateOrderStatus } from "@/services/orderService";
import { getEnabledTables } from "@/services/tableService";
import { getProducts } from "@/services/productService";
import { LoadingCards } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreateOrderFromListModal } from "@/components/admin/order/create-order-from-list-modal";
import { AdvancedEditOrderModal } from "@/components/admin/order/advanced-edit-order-modal";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  AdminCard,
  AdminEmptyState,
} from "@/components/admin/shared/admin-components";
import { Edit2, Calendar, Clock, Package, Loader2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useOrderList, type DateFilterPreset } from "@/hooks/use-order-list";

function formatGroupDate(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const day = d.toLocaleDateString(undefined, { weekday: "long" });
  return `${mm}/${dd}(${day})`;
}

function formatTimeRange(iso: string) {
  const start = new Date(iso);
  const end = new Date(start.getTime() + 15 * 60 * 1000);
  const fmt = (x: Date) =>
    x.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)}~${fmt(end)}`;
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
    case "pending_ack":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "preparing":
      return "Preparing";
    case "served":
      return "Served";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "payment_done":
      return "Paid";
    default:
      return status;
  }
}
const ORDER_STATUS_FLOW: Order["status"][] = [
  "pending_ack",
  "acknowledged",
  "served",
  "completed",
  "payment_done",
  "cancelled",
];

const STATUS_INDEX: Record<string, number> = ORDER_STATUS_FLOW.reduce(
  (acc, s, i) => {
    acc[s] = i;
    return acc;
  },
  {} as Record<string, number>
);

function isTerminalStatus(status: string) {
  return status === "cancelled" || status === "payment_done";
}




export function OrderListContent() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Filters
  const [preset, setPreset] = useState<DateFilterPreset>("this_week");
  const [startDate, setStartDate] = useState<string>(""); // yyyy-mm-dd (custom)
  const [endDate, setEndDate] = useState<string>(""); // yyyy-mm-dd (custom)
  const [cancelledOnly, setCancelledOnly] = useState<boolean>(false);

  // New order
  const [openNew, setOpenNew] = useState(false);
  
  // Edit order
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  async function loadAll() {
    try {
      setLoading(true);
      const [o, t, p] = await Promise.all([getOrders(), getEnabledTables(), getProducts()]);
      setOrders(
        [...o].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setTables(t);
      setProducts(p);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to load orders");
      setOrders([]);
      setTables([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      await loadAll();
      if (!alive) return;
    })();
    return () => {
      alive = false;
    };
  }, []);

  const { page, setPage, totalPages, pagedOrders, filteredCount } = useOrderList({
    orders,
    preset,
    startDate,
    endDate,
    cancelledOnly,
    pageSize: 50,
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const o of pagedOrders) {
      const key = new Date(o.createdAt).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    }
    // Sort groups by date desc
    return Array.from(map.entries()).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [pagedOrders]);

  function clearFilters() {
    setPreset("all");
    setStartDate("");
    setEndDate("");
    setCancelledOnly(false);
  }

  async function handleConfirmCreate(payload: {
    orderType: "dine_in" | "take_away" | "delivery" | "quick_order" | "reservation" | "pick_up";
    tableId?: string;
    tableName?: string;
    startTime?: string;
    endTime?: string;
    guestCount?: number;
    customerKind: "walk_in" | "registered";
    customerName?: string;
    customerId?: string;
    notes?: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    try {
      const byId = new Map(products.map((p) => [p.id, p] as const));
      const cartItems = payload.items
        .filter((i) => i.quantity > 0)
        .map((i) => {
          const p = byId.get(i.productId);
          if (!p) return null;
          return { product: p, quantity: i.quantity };
        })
        .filter(Boolean) as any[];

      const tableId =
        payload.orderType === "dine_in" || payload.orderType === "reservation"
          ? payload.tableId
          : payload.orderType === "take_away"
          ? "takeaway"
          : payload.orderType === "delivery"
          ? "delivery"
          : payload.orderType === "quick_order"
          ? "quick_order"
          : "pick_up";

      const tableName =
        payload.orderType === "dine_in" || payload.orderType === "reservation"
          ? payload.tableName
          : payload.orderType === "take_away"
          ? "Take Away"
          : payload.orderType === "delivery"
          ? "Delivery"
          : payload.orderType === "quick_order"
          ? "Quick Order"
          : "Pick Up";

      if (!tableId || !tableName) {
        toast.error("Invalid table selection");
        return;
      }

      const customerId =
        payload.customerKind === "registered" ? payload.customerId : undefined;

      const customerName =
        payload.customerKind === "walk_in"
          ? payload.customerName ?? "Walk-in"
          : undefined;

      const subtotal = cartItems.reduce(
        (sum, it) => sum + it.product.price * it.quantity,
        0
      );
      const taxRate = 0.08;
      const taxAmount = subtotal * taxRate;
      const total = subtotal + taxAmount;

      await createOrder(tableId, tableName, cartItems, customerId, payload.notes, {
        orderType: payload.orderType,
        reservationStartTime: payload.startTime,
        reservationEndTime: payload.endTime,
        guestCount: payload.guestCount,
        customerName,
        subtotal,
        taxRate,
        taxAmount,
        total,
      });

      toast.success("Order created");
      await loadAll();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to create order");
    }
  }

  async function handleSaveOrder(updatedOrder: Order) {
    try {
      // Call the update service to update the order status
      await updateOrderStatus(updatedOrder.id, updatedOrder.status);
      
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
      );
      
      toast.success("Order updated successfully");
      setOpenEdit(false);
      setEditingOrder(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order");
    }
  }


  async function handleQuickStatusChange(orderId: string, nextStatus: Order["status"]) {
    const username =
      (typeof window !== "undefined" && localStorage.getItem("restrohub_username")) ||
      "Admin";

    const prev = orders;
    // optimistic update
    setOrders((current) =>
      current.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus, updatedBy: username } : o
      )
    );

    try {
      setUpdatingStatusId(orderId);
      await updateOrderStatus(orderId, nextStatus, username);
      // keep optimistic state; ensure any service-side fields are synced
      setOrders((current) =>
        current.map((o) =>
          o.id === orderId ? { ...o, status: nextStatus, updatedBy: username } : o
        )
      );
      toast.success("Order status updated");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to update status");
      // revert
      setOrders(prev);
    } finally {
      setUpdatingStatusId((id) => (id === orderId ? null : id));
    }
  }

  if (loading) {
    return (
      <div className="mt-4">
        <LoadingCards />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <AdminCard>
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 items-center">
              <Label className="text-xs font-medium text-muted-foreground mr-1">Date</Label>

              <Button
                size="sm"
                variant={preset === "today" ? "default" : "outline"}
                onClick={() => setPreset("today")}
              >
                Today
              </Button>
              <Button
                size="sm"
                variant={preset === "yesterday" ? "default" : "outline"}
                onClick={() => setPreset("yesterday")}
              >
                Yesterday
              </Button>
              <Button
                size="sm"
                variant={preset === "this_week" ? "default" : "outline"}
                onClick={() => setPreset("this_week")}
              >
                This Week
              </Button>
              <Button
                size="sm"
                variant={preset === "custom" ? "default" : "outline"}
                onClick={() => setPreset("custom")}
              >
                Custom
              </Button>
              <Button
                size="sm"
                variant={preset === "all" ? "default" : "outline"}
                onClick={() => setPreset("all")}
              >
                All
              </Button>

              <div className="ml-auto text-xs text-muted-foreground">
                {filteredCount.toLocaleString()} orders • Page {page}/{totalPages}
              </div>
            </div>

            {preset === "custom" && (
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    From
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-[160px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">To</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-[160px]"
                  />
                </div>

                <div className="text-xs text-muted-foreground mb-2">
                  Tip: leave From/To empty to make it open-ended.
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 items-center">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-muted transition-colors">
                <Checkbox
                  id="cancelledOnly"
                  checked={cancelledOnly}
                  onCheckedChange={(v) => setCancelledOnly(Boolean(v))}
                />
                <span className="text-sm font-medium">Cancelled only</span>
              </label>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button onClick={() => setOpenNew(true)}>Create Order</Button>
            </div>
        </div>
        </div>
      </AdminCard>

      {/* Orders */}
      {loading ? (
        <LoadingCards count={6} />
      ) : filteredCount === 0 ? (
        <AdminEmptyState
          title="No orders found"
          description="Try adjusting the filters or create a new order."
          action={<Button onClick={() => setOpenNew(true)}>Create Order</Button>}
        />
      ) : (
        <div className="space-y-4">
          {grouped.map(([dayKey, list]) => (
            <AdminCard key={dayKey} className="p-0 overflow-hidden">
              {/* Day Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="leading-tight">
                    <div className="font-semibold text-foreground">
                      {formatGroupDate(list[0].createdAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">Orders grouped by day</div>
                  </div>
                </div>
                <Badge variant="secondary">{list.length} on this page</Badge>
              </div>

              {/* Orders List */}
              <div className="divide-y divide-border">
                {list.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      setEditingOrder(o);
                      setOpenEdit(true);
                    }}
                    className="w-full p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setEditingOrder(o);
                        setOpenEdit(true);
                      }
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-base">
                          {o.tableName}
                        </span>
                        <StatusBadge status={o.status} />
                        {o.orderType && (
                          <Badge variant="secondary" className="text-xs">
                            {o.orderType.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 flex flex-col sm:flex-row gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatTimeRange(o.createdAt)}
                        </div>
                        {o.customerName && (
                          <div>Customer: {o.customerName}</div>
                        )}
                        {o.guestCount && (
                          <div>Guests: {o.guestCount}</div>
                        )}
                      
                      {/* Inline status updater */}
                      <div
                        className="mt-3 w-full"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        data-testid="status-flow"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 overflow-x-auto">
                            <div className="flex items-center gap-1.5 min-w-max">
                              {ORDER_STATUS_FLOW.map((s) => {
                                const currentIdx = STATUS_INDEX[o.status] ?? 0;
                                const targetIdx = STATUS_INDEX[s] ?? 0;
                                const isActive = o.status === s;
                                const isDone = targetIdx < currentIdx;
                                const isCancelled = s === "cancelled";
                                const disabled =
                                  updatingStatusId === o.id ||
                                  isActive ||
                                  (isTerminalStatus(o.status) && s !== o.status);

                                return (
                                  <button
                                    key={s}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleQuickStatusChange(o.id, s)}
                                    className={cn(
                                      "px-2.5 py-1 text-xs rounded-md border transition whitespace-nowrap",
                                      "focus:outline-none focus:ring-2 focus:ring-primary/30",
                                      disabled && "opacity-60 cursor-not-allowed",
                                      isActive &&
                                        "bg-primary text-primary-foreground border-primary shadow-sm",
                                      !isActive &&
                                        !isCancelled &&
                                        "bg-background hover:bg-muted border-border",
                                      isDone && !isActive && "text-muted-foreground",
                                      isCancelled &&
                                        !isActive &&
                                        "border-destructive/40 text-destructive hover:bg-destructive/10"
                                    )}
                                  >
                                    {statusLabel(s)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {updatingStatusId === o.id ? (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Updating…
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">
                                {o.updatedBy ? (
                                  <>Updated by: <span className="font-medium text-foreground">{o.updatedBy}</span></>
                                ) : (
                                  <span className="hidden sm:inline">Click a status to update</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
</div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-foreground">
                          {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                        </div>
                        {o.total != null && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            ${o.total.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOrder(o);
                          setOpenEdit(true);
                        }}
                        className="flex-shrink-0"
                        title="Edit order"
                      >
                        <Edit2 className="h-4 w-4 text-primary" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredCount > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="pt-2"
        />
      )}

      {/* Modals */}
      <CreateOrderFromListModal
        open={openNew}
        onOpenChange={setOpenNew}
        onConfirm={handleConfirmCreate}
      />

      <AdvancedEditOrderModal
        open={openEdit}
        order={editingOrder}
        products={products}
        onOpenChange={setOpenEdit}
        onSave={handleSaveOrder}
      />
    </div>
  );
}
