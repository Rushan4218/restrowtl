"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LoadingCards } from "@/components/shared/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStockItems, getStockMovements } from "@/services/stockItemService";
import { getSuppliers } from "@/services/supplierService";
import { getProducts } from "@/services/productService";
import type { InventoryMovementType, StockItem, StockMovement, Supplier, Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const types: InventoryMovementType[] = ["opening", "restock", "consume", "adjust", "waste"];

export function StockHistoryContent() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [stockItemId, setStockItemId] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [i, m, s, p] = await Promise.all([
        getStockItems(),
        getStockMovements(),
        getSuppliers(),
        getProducts(),
      ]);
      setItems(i);
      setMovements(m);
      setSuppliers(s);
      setProducts(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return movements.filter((mv) => {
      if (stockItemId !== "all" && mv.stockItemId !== stockItemId) return false;
      if (type !== "all" && mv.type !== type) return false;
      const d = mv.date.slice(0,10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [movements, stockItemId, type, from, to]);

  if (loading) return <LoadingCards />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Filters</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div>
            <Label>Stock Item</Label>
            <Select value={stockItemId} onValueChange={setStockItemId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {items.map((it)=> <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Movement Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {types.map((t)=> <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>From</Label>
            <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
          </div>

          <div>
            <Label>To</Label>
            <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">
            Showing {filtered.length} movement(s)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Item</th>
                  <th className="py-2 pr-3">Qty In</th>
                  <th className="py-2 pr-3">Qty Out</th>
                  <th className="py-2 pr-3">Rate</th>
                  <th className="py-2 pr-3">Value</th>
                  <th className="py-2 pr-3">Supplier</th>
                  <th className="py-2 pr-3">Dish</th>
                  <th className="py-2 pr-3">Ref</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mv) => (
                  <tr key={mv.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-3">{mv.date.slice(0,10)}</td>
                    <td className="py-2 pr-3 font-medium">{mv.type}</td>
                    <td className="py-2 pr-3">{items.find(i=>i.id===mv.stockItemId)?.name ?? mv.stockItemId}</td>
                    <td className="py-2 pr-3">{mv.qtyIn ? mv.qtyIn.toFixed(3) : "—"}</td>
                    <td className="py-2 pr-3">{mv.qtyOut ? mv.qtyOut.toFixed(3) : "—"}</td>
                    <td className="py-2 pr-3">{mv.rate.toFixed(2)}</td>
                    <td className="py-2 pr-3">{mv.value.toFixed(2)}</td>
                    <td className="py-2 pr-3">{mv.supplierId ? (suppliers.find(s=>s.id===mv.supplierId)?.fullName ?? mv.supplierId) : "—"}</td>
                    <td className="py-2 pr-3">{mv.dishId ? (products.find(p=>p.id===mv.dishId)?.name ?? mv.dishId) : "—"}</td>
                    <td className="py-2 pr-3">{mv.reference ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
