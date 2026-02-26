"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingCards } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { ConsumptionRecord, DishRecipe, StockItem, Product, MeasuringUnit } from "@/types";
import { getProducts } from "@/services/productService";
import { getDishRecipes, getConsumptions, consumeCustom } from "@/services/consumptionService";
import { getStockItems } from "@/services/stockItemService";
import { getMeasuringUnits } from "@/services/measuringUnitService";

type Mode = "dish" | "addons";

type LineRow = {
  id: string;
  stockItemId: string;
  unitId: string;
  qty: number;
};

const LOW_STOCK_MIN = 5;

function money(n: number) {
  return `Rs ${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

function uid() {
  return `row_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function ConsumptionContent() {
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<DishRecipe[]>([]);
  const [items, setItems] = useState<StockItem[]>([]);
  const [units, setUnits] = useState<MeasuringUnit[]>([]);
  const [records, setRecords] = useState<ConsumptionRecord[]>([]);

  const [mode, setMode] = useState<Mode>("dish");
  const [dishId, setDishId] = useState<string>("");
  const [servings, setServings] = useState<number>(1);
  const [rows, setRows] = useState<LineRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, r, i, u, c] = await Promise.all([
        getProducts(),
        getDishRecipes(),
        getStockItems(),
        getMeasuringUnits(),
        getConsumptions(),
      ]);
      setProducts(p);
      setRecipes(r);
      setItems(i);
      setUnits(u);
      setRecords(c);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unitLabel = useCallback(
    (unitId: string) => units.find((u) => u.id === unitId)?.shortName ?? "—",
    [units]
  );

  const selectedRecipe = useMemo(
    () => recipes.find((r) => r.dishId === dishId) ?? null,
    [recipes, dishId]
  );

  // When dish/servings changes, rebuild rows from recipe (dish mode)
  useEffect(() => {
    if (mode !== "dish") return;
    if (!dishId || !selectedRecipe) {
      setRows([]);
      return;
    }

    const next: LineRow[] = selectedRecipe.lines.map((l) => ({
      id: uid(),
      stockItemId: l.stockItemId,
      unitId: l.unitId,
      qty: Number((l.qtyPerServing * Math.max(1, servings)).toFixed(3)),
    }));
    setRows(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dishId, servings, mode, selectedRecipe?.id]);

  const computed = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]));
    const lines = rows.map((r) => {
      const it = byId.get(r.stockItemId);
      const avgCost = it?.avgCost ?? 0;
      const amount = avgCost * (Number(r.qty) || 0);
      const remainingAfter = (it?.currentQty ?? 0) - (Number(r.qty) || 0);
      return {
        ...r,
        itemName: it?.name ?? "Select stock item",
        avgCost,
        amount,
        remainingAfter,
      };
    });
    const total = lines.reduce((s, x) => s + (x.amount || 0), 0);
    const low = lines.filter((l) => l.stockItemId && l.remainingAfter < LOW_STOCK_MIN);
    return { lines, total, low };
  }, [rows, items]);

  const resetForm = () => {
    setMode("dish");
    setDishId("");
    setServings(1);
    setRows([]);
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: uid(), stockItemId: "", unitId: "", qty: 0 },
    ]);
  };

  const updateRow = (id: string, patch: Partial<LineRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const save = async () => {
    try {
      if (!dishId) return toast.error("Select a dish");
      if (servings <= 0) return toast.error("Servings must be > 0");
      const validLines = rows.filter((r) => r.stockItemId && Number(r.qty) > 0);
      if (!validLines.length) return toast.error("Add at least one stock deduction row");

      await consumeCustom({
        dishId,
        servings,
        lines: validLines.map((l) => ({ stockItemId: l.stockItemId, qty: Number(l.qty), unitId: l.unitId })),
        note: mode === "addons" ? "Add-ons consumption" : undefined,
      });

      toast.success("Consumption saved and stock deducted");
      resetForm();
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save consumption");
    }
  };

  if (loading) return <LoadingCards />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-semibold text-card-foreground">Add New Consumption</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetForm}>Reset</Button>
          <Button onClick={save} className="gap-2">
            Save Consumption
          </Button>
        </div>
      </div>

      {/* Low stock warning */}
      {computed.low.length > 0 && (
        <div className="rounded-md border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-200">
          <div className="font-semibold mb-2">⚠️ Low stock warning (threshold: {LOW_STOCK_MIN})</div>
          <ul className="list-disc pl-5 space-y-1">
            {computed.low.map((l) => (
              <li key={l.id}>
                {l.itemName} will be <span className="font-semibold">{l.remainingAfter.toFixed(3)}</span> {unitLabel(l.unitId)} after deduction.
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Finished Goods */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/30">
            <div className="font-semibold text-card-foreground">Finished Goods</div>
            <div className="text-sm text-muted-foreground">Output</div>
          </div>

          <div className="p-5 space-y-4">
            {/* Tabs */}
            <div className="inline-flex rounded-md bg-muted p-1 border border-border">
              <button
                type="button"
                onClick={() => setMode("dish")}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  mode === "dish" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dish
              </button>
              <button
                type="button"
                onClick={() => setMode("addons")}
                className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                  mode === "addons" 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Add-Ons
              </button>
            </div>

            <div className="space-y-2">
              <Label className="text-card-foreground">
                Dish <span className="text-destructive">*</span>
              </Label>
              <Select value={dishId} onValueChange={setDishId}>
                <SelectTrigger className="h-11 bg-background border-border text-foreground">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-card-foreground">Servings</Label>
                <Input
                  className="h-11 bg-background border-border text-foreground placeholder:text-muted-foreground"
                  type="number"
                  value={servings}
                  min={1}
                  onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Recipe status</Label>
                <div className="h-11 flex items-center rounded-md border border-border px-3 text-sm bg-background text-foreground">
                  {dishId && !selectedRecipe ? (
                    <span className="text-warning">No recipe configured (mock)</span>
                  ) : dishId && selectedRecipe ? (
                    <span className="text-success">Recipe loaded</span>
                  ) : (
                    <span className="text-muted-foreground">Select dish</span>
                  )}
                </div>
              </div>
            </div>

            {mode === "addons" && (
              <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                Add-ons mode lets you add manual stock deduction rows on the right.
              </div>
            )}
          </div>
        </div>

        {/* Right: Stock Used */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/30">
            <div className="font-semibold text-card-foreground">Stock Used or Reduced after Sales</div>
            <div className="text-sm text-muted-foreground">Input</div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-4 gap-3 text-sm font-medium text-card-foreground px-2">
              <div>
                Stocks <span className="text-destructive">*</span>
              </div>
              <div>
                Unit <span className="text-destructive">*</span>
              </div>
              <div>
                QTY <span className="text-destructive">*</span>
              </div>
              <div>Amount</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {computed.lines.length === 0 ? (
                <div className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Select a dish to auto-fill recipe deductions, or click "Add Row" to enter manually.
                </div>
              ) : (
                computed.lines.map((r) => {
                  const item = items.find((i) => i.id === r.stockItemId);
                  const allowedUnits = item?.unitIds ?? [];
                  return (
                    <div key={r.id} className="grid grid-cols-4 gap-3">
                      <Select
                        value={r.stockItemId}
                        onValueChange={(v) => {
                          const it = items.find((x) => x.id === v);
                          updateRow(r.id, { stockItemId: v, unitId: it?.unitIds?.[0] ?? "" });
                        }}
                      >
                        <SelectTrigger className="h-11 bg-background border-border text-foreground">
                          <SelectValue placeholder="Select Stock item" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {items.map((it) => (
                            <SelectItem key={it.id} value={it.id}>
                              {it.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={r.unitId}
                        onValueChange={(v) => updateRow(r.id, { unitId: v })}
                      >
                        <SelectTrigger className="h-11 bg-background border-border text-foreground">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {(allowedUnits.length ? allowedUnits : units.map((u) => u.id)).map((uid_) => (
                            <SelectItem key={uid_} value={uid_}>
                              {unitLabel(uid_)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        className="h-11 bg-background border-border text-foreground placeholder:text-muted-foreground"
                        type="number"
                        value={r.qty}
                        min={0}
                        step="0.001"
                        onChange={(e) => updateRow(r.id, { qty: Number(e.target.value) || 0 })}
                      />

                      <div className="h-11 flex items-center rounded-md border border-border px-3 text-sm text-muted-foreground bg-muted/40">
                        {money(r.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addRow}
              className="gap-2 w-full"
            >
              <Plus className="h-4 w-4" />
              Add Row
            </Button>

            <div className="pt-4 border-t border-border flex items-center justify-between text-sm">
              <span className="font-medium text-card-foreground">Total</span>
              <span className="font-semibold text-foreground">{money(computed.total)}</span>
            </div>

            {/* Recent records */}
            {!records.length ? (
              <div className="pt-4">
                <EmptyState
                  title="No consumption records"
                  description="Save consumption to deduct stock and track COGS."
                />
              </div>
            ) : (
              <div className="pt-4 space-y-3">
                <div className="text-sm font-semibold text-card-foreground">Recent Consumption</div>
                <div className="overflow-x-auto rounded-md border border-border bg-muted/30">
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground bg-muted/50 border-b border-border">
                      <tr>
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Dish</th>
                        <th className="py-3 px-4 font-medium">Servings</th>
                        <th className="py-3 px-4 text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {records.slice(0, 8).map((r) => {
                        const dishName = products.find((p) => p.id === r.dishId)?.name ?? r.dishId;
                        return (
                          <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                            <td className="py-3 px-4 text-foreground">{new Date(r.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-foreground">{dishName}</td>
                            <td className="py-3 px-4 text-foreground">{r.servings}</td>
                            <td className="py-3 px-4 text-right text-foreground font-medium">{money(r.totalCost)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
