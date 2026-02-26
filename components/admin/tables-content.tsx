"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Grid3X3,
  Clock,
  User,
  Users,
  Receipt,
  CalendarClock,
  MessageSquare,
  QrCode,
  Download,
  Printer,
  RefreshCw,
} from "lucide-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Modal } from "@/components/shared/modal";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingCards } from "@/components/shared/loading-state";
import {
  AdminHeader,
  AdminCard,
  AdminBadge,
  AdminEmptyState,
  AdminActionButton,
} from "@/components/admin/shared/admin-components";
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  regenerateToken,
} from "@/services/tableService";
import { getReservationsByTable } from "@/services/reservationService";
import { getOrdersByTable } from "@/services/orderService";
import type { RestaurantTable, Reservation, Order } from "@/types";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const reservationStatusStyles: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  upcoming:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed:
    "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  cancelled:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function TablesContent() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(
    null
  );
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(
    null
  );
  const [tableReservations, setTableReservations] = useState<Reservation[]>([]);
  const [tableOrders, setTableOrders] = useState<Order[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrTable, setQrTable] = useState<RestaurantTable | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 2,
    isEnabled: true,
    defaultStayMinutes: 30,
  });

  const loadTables = useCallback(async () => {
    try {
      const data = await getTables();
      setTables(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const resetForm = () => {
    setFormData({ name: "", capacity: 2, isEnabled: true, defaultStayMinutes: 30 });
    setEditingTable(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (table: RestaurantTable) => {
    setEditingTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity,
      isEnabled: table.isEnabled,
      defaultStayMinutes: table.defaultStayMinutes || 30,
    });
    setModalOpen(true);
  };

  const openDetail = async (table: RestaurantTable) => {
    setSelectedTable(table);
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const [reservations, orders] = await Promise.all([
        getReservationsByTable(table.id),
        getOrdersByTable(table.id),
      ]);
      setTableReservations(reservations);
      setTableOrders(orders);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Table name is required");
      return;
    }
    try {
      if (editingTable) {
        await updateTable(editingTable.id, formData);
        toast.success("Table updated");
      } else {
        await createTable(formData);
        toast.success("Table created");
      }
      setModalOpen(false);
      resetForm();
      await loadTables();
    } catch {
      toast.error("Failed to save table");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTable(id);
      toast.success("Table deleted");
      await loadTables();
    } catch {
      toast.error("Failed to delete table");
    }
  };

  const handleToggle = async (table: RestaurantTable) => {
    try {
      await updateTable(table.id, { isEnabled: !table.isEnabled });
      await loadTables();
      toast.success(
        `${table.name} ${table.isEnabled ? "disabled" : "enabled"}`
      );
    } catch {
      toast.error("Failed to update table");
    }
  };

  const openQrModal = (table: RestaurantTable) => {
    setQrTable(table);
    setQrModalOpen(true);
  };

  const handleRegenerateToken = async () => {
    if (!qrTable) return;
    setRegenerating(true);
    try {
      const updated = await regenerateToken(qrTable.id);
      setQrTable(updated);
      await loadTables();
      toast.success("QR code regenerated");
    } catch {
      toast.error("Failed to regenerate QR code");
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current || !qrTable) return;
    const canvas = qrCanvasRef.current.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `qr-${qrTable.name}.png`;
    link.href = url;
    link.click();
  };

  const handlePrintQr = () => {
    if (!qrCanvasRef.current || !qrTable) return;
    const canvas = qrCanvasRef.current.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>QR Code - ${qrTable.name}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;">
          <h2 style="margin-bottom:16px;">Table: ${qrTable.name}</h2>
          <img src="${dataUrl}" style="width:300px;height:300px;" />
          <p style="margin-top:12px;color:#666;">Scan to view menu and place order</p>
        </body>
      </html>
    `);
    win.document.close();
    win.onload = () => {
      win.print();
      win.close();
    };
  };

  const getQrUrl = (table: RestaurantTable) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/menu?table=${table.token}`;
  };

  const totalBilling = tableOrders.reduce((sum, o) => sum + o.total, 0);

  if (loading) return <LoadingCards count={8} />;

  return (
    <>
      <AdminHeader
        title="Tables Management"
        subtitle={`Manage ${tables.length} table${tables.length !== 1 ? "s" : ""} and their configurations`}
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Table
          </Button>
        }
      />

      {tables.length === 0 ? (
        <AdminEmptyState
          title="No tables yet"
          description="Add your first table to get started and enable QR code ordering."
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Table
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => (
            <AdminCard key={table.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base">
                    {table.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Capacity: {table.capacity} {table.capacity === 1 ? "seat" : "seats"}
                  </p>
                </div>
                <AdminBadge
                  status={table.isEnabled ? "active" : "inactive"}
                  label={table.isEnabled ? "Active" : "Disabled"}
                />
              </div>

              <Separator className="my-2" />

              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Status:
                  </span>
                  <Switch
                    checked={table.isEnabled}
                    onCheckedChange={() => handleToggle(table)}
                    aria-label={`Toggle ${table.name}`}
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <AdminActionButton
                  variant="outline"
                  onClick={() => openQrModal(table)}
                  className="flex-1"
                >
                  <QrCode className="h-3.5 w-3.5 mr-1.5" />
                  QR
                </AdminActionButton>
                <AdminActionButton
                  variant="outline"
                  onClick={() => openEdit(table)}
                  className="flex-1"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </AdminActionButton>
                <AdminActionButton
                  variant="outline"
                  onClick={() => handleDelete(table.id)}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </AdminActionButton>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingTable ? "Edit Table" : "Add New Table"}
        description={
          editingTable
            ? "Update the table details."
            : "Create a new restaurant table."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="table-name">Table Name</Label>
            <Input
              id="table-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g. T1, VIP-1, Patio-3"
              required
            />
          </div>
          <div>
            <Label htmlFor="table-capacity">Seating Capacity</Label>
            <Input
              id="table-capacity"
              type="number"
              min={1}
              value={formData.capacity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capacity: parseInt(e.target.value) || 1,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="table-stay-minutes">Default Stay Duration (Minutes)</Label>
            <Input
              id="table-stay-minutes"
              type="number"
              min={15}
              step={15}
              value={formData.defaultStayMinutes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  defaultStayMinutes: parseInt(e.target.value) || 30,
                }))
              }
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default reservation duration for this table. Used in the timeline view.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isEnabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isEnabled: checked }))
              }
            />
            <Label>Enabled</Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingTable ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        title={qrTable ? `QR Code - ${qrTable.name}` : "QR Code"}
        description="Scan this QR code to access the menu and place orders for this table."
      >
        {qrTable && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-6">
              <QRCodeSVG
                value={getQrUrl(qrTable)}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            {/* Hidden canvas for download */}
            <div ref={qrCanvasRef} className="hidden">
              <QRCodeCanvas
                value={getQrUrl(qrTable)}
                size={400}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              URL: {getQrUrl(qrTable)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={handleDownloadQr} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button onClick={handlePrintQr} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button
                onClick={handleRegenerateToken}
                variant="outline"
                className="gap-2"
                disabled={regenerating}
              >
                <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Table Detail Modal - Reservations & Billing */}
      <Modal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        title={selectedTable ? `${selectedTable.name} - Details` : "Table Details"}
        description={
          selectedTable
            ? `Capacity: ${selectedTable.capacity} seats`
            : undefined
        }
        className="sm:max-w-2xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading details...
            </span>
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 pr-3">
              {/* Reservations Section */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Reservations
                  </h3>
                </div>
                {tableReservations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No reservations for this table.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tableReservations.map((res) => (
                      <Card key={res.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">
                                  {res.customerName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`border-none text-xs font-medium ${
                                    reservationStatusStyles[res.status] || ""
                                  }`}
                                >
                                  {res.status.charAt(0).toUpperCase() +
                                    res.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatTime(res.startTime)} -{" "}
                                  {formatTime(res.endTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {res.guestCount} guests
                                </span>
                              </div>
                              {res.notes && (
                                <div className="flex items-start gap-1 text-xs text-muted-foreground">
                                  <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                                  <span>{res.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Billing / Orders Section */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      Order Billing
                    </h3>
                  </div>
                  {tableOrders.length > 0 && (
                    <div className="rounded-md bg-primary/10 px-3 py-1">
                      <span className="text-sm font-semibold text-primary">
                        Total: ${totalBilling.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                {tableOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No orders for this table.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tableOrders.map((order) => (
                      <Card key={order.id} className="border">
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">
                                {order.id}
                              </span>
                              <StatusBadge status={order.status} />
                            </div>
                            <span className="font-semibold text-foreground">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="mb-2 space-y-1">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {item.quantity}x {item.productName}
                                </span>
                                <span className="text-muted-foreground">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Ordered: {formatDateTime(order.createdAt)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </Modal>
    </>
  );
}
