"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, TrendingUp, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/shared/modal";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { MeasuringUnit, StockGroup, StockItem, StockCategory, Supplier } from "@/types";
import { getMeasuringUnits } from "@/services/measuringUnitService";
import { getStockGroups, createStockGroup } from "@/services/stockGroupService";
import { getStockItems, createStockItem, updateStockItem, deleteStockItem, createMovement, getStockMovements } from "@/services/stockItemService";
import { getSuppliers } from "@/services/supplierService";
import { computeItemValue, computeTotalStockValue, isLowStock, sumRestockedThisWeek } from "@/lib/inventory/calculations";

const categories: StockCategory[] = ["Drinks", "Groceries", "Meat", "Vegetables", "Others"];

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function StockItemsContent() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [units, setUnits] = useState<MeasuringUnit[]>([]);
  const [groups, setGroups] = useState<StockGroup[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movementsValueThisWeek, setMovementsValueThisWeek] = useState({ qty: 0, value: 0 });

  const [modalOpen, setModalOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [restocking, setRestocking] = useState<StockItem | null>(null);

  const [form, setForm] = useState({
    name: "",
    unitIds: [] as string[],
    defaultPrice: 0,
    category: "Groceries" as StockCategory,
    stockGroupId: "sg-groceries",
    lowStockThreshold: 0,
    openingQty: 0,
    openingRate: 0,
  });

  const [restockForm, setRestockForm] = useState({
    qty: 0,
    rate: 0,
    supplierId: "__none__" as string,
    reference: "",
    note: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [i, u, g, s, m] = await Promise.all([
        getStockItems(),
        getMeasuringUnits(),
        getStockGroups(),
        getSuppliers(),
        getStockMovements(),
      ]);
      setItems(i);
      setUnits(u);
      setGroups(g);
      setSuppliers(s);
      setMovementsValueThisWeek(sumRestockedThisWeek(m));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = computeTotalStockValue(items);
    const low = items.filter(isLowStock);
    return { total, lowCount: low.length };
  }, [items]);

  const resetForm = () => {
    setForm({
      name: "",
      unitIds: [],
      defaultPrice: 0,
      category: "Groceries",
      stockGroupId: groups[0]?.id ?? "sg-groceries",
      lowStockThreshold: 0,
      openingQty: 0,
      openingRate: 0,
    });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (it: StockItem) => {
    setEditing(it);
    setForm({
      name: it.name,
      unitIds: it.unitIds,
      defaultPrice: it.defaultPrice,
      category: it.category,
      stockGroupId: it.stockGroupId,
      lowStockThreshold: it.lowStockThreshold,
      openingQty: it.openingQty,
      openingRate: it.openingRate,
    });
    setModalOpen(true);
  };

  const save = async () => {
    try {
      if (!form.name.trim()) return toast.error("Item name is required");
      if (!form.unitIds.length) return toast.error("Select at least one measuring unit");
      if (!form.stockGroupId) return toast.error("Select a stock group");
      if (editing) {
        await updateStockItem(editing.id, {
          name: form.name.trim(),
          unitIds: form.unitIds,
          defaultPrice: Number(form.defaultPrice) || 0,
          category: form.category,
          stockGroupId: form.stockGroupId,
          lowStockThreshold: Number(form.lowStockThreshold) || 0,
        });
        toast.success("Stock item updated");
      } else {
        await createStockItem({
          name: form.name.trim(),
          unitIds: form.unitIds,
          defaultPrice: Number(form.defaultPrice) || 0,
          category: form.category,
          stockGroupId: form.stockGroupId,
          lowStockThreshold: Number(form.lowStockThreshold) || 0,
          openingQty: Number(form.openingQty) || 0,
          openingRate: Number(form.openingRate) || 0,
        });
        toast.success("Stock item created");
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteStockItem(id);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  };

  const openRestock = (it: StockItem) => {
    setRestocking(it);
    setRestockForm({ qty: 0, rate: it.avgCost || it.defaultPrice || 0, supplierId: "__none__", reference: "", note: "" });
    setRestockOpen(true);
  };

  const doRestock = async () => {
    if (!restocking) return;
    if (restockForm.qty <= 0) return toast.error("Quantity must be > 0");
    if (restockForm.rate <= 0) return toast.error("Rate must be > 0");
    try {
      await createMovement({
        type: "restock",
        stockItemId: restocking.id,
        qty: Number(restockForm.qty),
        rate: Number(restockForm.rate),
        supplierId: restockForm.supplierId === "__none__" ? undefined : restockForm.supplierId,
        reference: restockForm.reference || undefined,
        note: restockForm.note || undefined,
      });
      toast.success("Restocked");
      setRestockOpen(false);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to restock");
    }
  };

  const createGroupInline = async (name: string) => {
    const n = name.trim();
    if (!n) return;
    try {
      const g = await createStockGroup({ name: n });
      setGroups((prev) => [...prev, g]);
      setForm((p) => ({ ...p, stockGroupId: g.id }));
      toast.success("Stock group created");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create group");
    }
  };

  const openingValue = useMemo(() => round2((Number(form.openingQty) || 0) * (Number(form.openingRate) || 0)), [form.openingQty, form.openingRate]);

  if (loading) return <LoadingCards />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Weighted average valuation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restocked This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movementsValueThisWeek.value.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{movementsValueThisWeek.qty} units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowCount}</div>
            <p className="text-xs text-muted-foreground">At or below threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Stock Item
        </Button>
      </div>

      {!items.length ? (
        <EmptyState
          title="No stock items yet"
          description="Create your first stock item with opening stock to start tracking inventory."
          actionLabel="Add Stock Item"
          onAction={openCreate}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-3">Item</th>
                    <th className="py-2 pr-3">Group</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Qty</th>
                    <th className="py-2 pr-3">Avg Cost</th>
                    <th className="py-2 pr-3">Value</th>
                    <th className="py-2 pr-3">Low Stock</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const group = groups.find(g => g.id === it.stockGroupId)?.name ?? "—";
                    const low = isLowStock(it);
                    return (
                      <tr key={it.id} className="border-b last:border-b-0">
                        <td className="py-2 pr-3 font-medium">{it.name}</td>
                        <td className="py-2 pr-3">{group}</td>
                        <td className="py-2 pr-3">{it.category}</td>
                        <td className="py-2 pr-3">{it.currentQty}</td>
                        <td className="py-2 pr-3">{it.avgCost.toFixed(2)}</td>
                        <td className="py-2 pr-3">{computeItemValue(it).toFixed(2)}</td>
                        <td className="py-2 pr-3">
                          {low ? <span className="text-red-600 font-medium">Yes</span> : "No"}
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openRestock(it)}>
                              Restock
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEdit(it)} aria-label="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => remove(it.id)} aria-label="Delete">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) resetForm(); }}
        title={editing ? "Edit Stock Item" : "Add Stock Item"}
        description="Configure item details, units, group, and opening stock."
      >
        <div className="space-y-4">
          <div>
            <Label>Item Name</Label>
            <Input value={form.name} onChange={(e)=>setForm(p=>({...p, name:e.target.value}))} placeholder="e.g., Rice" />
          </div>

          <div className="space-y-2">
            <Label>Measuring Units (multi-select)</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {units.map((u) => {
                const checked = form.unitIds.includes(u.id);
                return (
                  <label key={u.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const isOn = Boolean(v);
                        setForm((p) => ({
                          ...p,
                          unitIds: isOn ? Array.from(new Set([...p.unitIds, u.id])) : p.unitIds.filter((x) => x !== u.id),
                        }));
                      }}
                    />
                    <span className="font-medium">{u.name}</span>
                    <span className="text-muted-foreground">({u.shortName})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Default Price</Label>
              <Input type="number" value={form.defaultPrice} onChange={(e)=>setForm(p=>({...p, defaultPrice:Number(e.target.value)}))} />
            </div>
            <div>
              <Label>Low Stock Threshold</Label>
              <Input type="number" value={form.lowStockThreshold} onChange={(e)=>setForm(p=>({...p, lowStockThreshold:Number(e.target.value)}))} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v)=>setForm(p=>({...p, category: v as StockCategory}))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c)=> <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stock Group</Label>
              <Select value={form.stockGroupId} onValueChange={(v)=>setForm(p=>({...p, stockGroupId:v}))}>
                <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                <SelectContent>
                  {groups.map((g)=> <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="mt-2 flex gap-2">
                <Input placeholder="Create new group" onKeyDown={(e)=>{ if(e.key==="Enter"){ e.preventDefault(); createGroupInline((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value=""; } }} />
                <Button variant="outline" onClick={() => {
                  const el = document.querySelector<HTMLInputElement>("input[placeholder='Create new group']");
                  if (el) { createGroupInline(el.value); el.value=""; }
                }}>Create</Button>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="font-medium">Opening Stock</div>
            <p className="text-xs text-muted-foreground mb-3">
              Opening stock sets the initial quantity and starting cost basis for weighted average valuation.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Qty</Label>
                <Input type="number" value={form.openingQty} onChange={(e)=>setForm(p=>({...p, openingQty:Number(e.target.value)}))} disabled={Boolean(editing)} />
              </div>
              <div>
                <Label>Rate</Label>
                <Input type="number" value={form.openingRate} onChange={(e)=>setForm(p=>({...p, openingRate:Number(e.target.value)}))} disabled={Boolean(editing)} />
              </div>
              <div>
                <Label>Value</Label>
                <Input value={openingValue.toFixed(2)} readOnly />
              </div>
            </div>
            {editing && (
              <p className="mt-2 text-xs text-muted-foreground">
                Opening stock fields are locked on edit to preserve movement history. Use Restock / Adjust instead.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setModalOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save Changes" : "Create Item"}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={restockOpen}
        onOpenChange={(o)=>{ setRestockOpen(o); if(!o) setRestocking(null); }}
        title={`Restock${restocking ? `: ${restocking.name}` : ""}`}
        description="Restock uses weighted average costing to update the item's valuation."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={restockForm.qty} onChange={(e)=>setRestockForm(p=>({...p, qty:Number(e.target.value)}))} />
            </div>
            <div>
              <Label>Rate (cost/unit)</Label>
              <Input type="number" value={restockForm.rate} onChange={(e)=>setRestockForm(p=>({...p, rate:Number(e.target.value)}))} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Supplier (optional)</Label>
              <Select value={restockForm.supplierId} onValueChange={(v)=>setRestockForm(p=>({...p, supplierId:v}))}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {suppliers.map((s)=> <SelectItem key={s.id} value={s.id}>{s.fullName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reference (optional)</Label>
              <Input value={restockForm.reference} onChange={(e)=>setRestockForm(p=>({...p, reference:e.target.value}))} placeholder="Invoice no, etc." />
            </div>
          </div>

          <div>
            <Label>Note (optional)</Label>
            <Input value={restockForm.note} onChange={(e)=>setRestockForm(p=>({...p, note:e.target.value}))} placeholder="e.g., weekly refill" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setRestockOpen(false)}>Cancel</Button>
            <Button onClick={doRestock}>Restock</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
