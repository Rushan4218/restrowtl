"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingCards } from "@/components/shared/loading-state";
import { getStockItems, getStockMovements } from "@/services/stockItemService";
import { getSuppliers, getSupplierTransactions } from "@/services/supplierService";
import { getConsumptions } from "@/services/consumptionService";
import { getStockGroups } from "@/services/stockGroupService";
import { computeItemValue, computeTotalStockValue, isLowStock, sumRestockedThisWeek, supplierNetBalance, supplierToPayToReceive } from "@/lib/inventory/calculations";
import type { StockItem, StockMovement, Supplier, SupplierTransaction, ConsumptionRecord, StockGroup } from "@/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
}
function isoDay(d: Date) {
  return startOfDay(d).toISOString().slice(0,10);
}

export function InventoryDashboardContent() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierTxns, setSupplierTxns] = useState<SupplierTransaction[]>([]);
  const [consumptions, setConsumptions] = useState<ConsumptionRecord[]>([]);
  const [groups, setGroups] = useState<StockGroup[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [i, m, s, st, c, g] = await Promise.all([
          getStockItems(),
          getStockMovements(),
          getSuppliers(),
          getSupplierTransactions(),
          getConsumptions(),
          getStockGroups(),
        ]);
        setItems(i);
        setMovements(m);
        setSuppliers(s);
        setSupplierTxns(st);
        setConsumptions(c);
        setGroups(g);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = useMemo(() => {
    const totalValue = computeTotalStockValue(items);
    const low = items.filter(isLowStock);
    const restocked = sumRestockedThisWeek(movements);

    // Supplier summary
    const nets = suppliers.map((s) => supplierNetBalance(s, supplierTxns));
    const totalToPay = nets.reduce((sum, n) => sum + supplierToPayToReceive(n).toPay, 0);
    const totalToReceive = nets.reduce((sum, n) => sum + supplierToPayToReceive(n).toReceive, 0);

    return {
      totalValue,
      lowCount: low.length,
      restockedQty: restocked.qty,
      restockedValue: restocked.value,
      totalToPay,
      totalToReceive,
    };
  }, [items, movements, suppliers, supplierTxns]);

  const groupPieData = useMemo(() => {
    const byGroup = new Map<string, number>();
    for (const it of items) {
      const v = computeItemValue(it);
      byGroup.set(it.stockGroupId, (byGroup.get(it.stockGroupId) ?? 0) + v);
    }
    return Array.from(byGroup.entries()).map(([stockGroupId, value]) => ({
      stockGroupId,
      value: Math.round((value + Number.EPSILON) * 100) / 100,
      label: groups.find(g => g.id === stockGroupId)?.name ?? "Unknown",
    }));
  }, [items, groups]);

  const restockBarData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      return isoDay(d);
    });
    const byDay = new Map<string, number>();
    for (const mv of movements) {
      if (mv.type !== "restock") continue;
      const k = mv.date.slice(0,10);
      byDay.set(k, (byDay.get(k) ?? 0) + mv.value);
    }
    return days.map((d) => ({ day: d.slice(5), value: Math.round((byDay.get(d) ?? 0) * 100) / 100 }));
  }, [movements]);

  const consumptionLineData = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - idx));
      return isoDay(d);
    });
    const byDay = new Map<string, number>();
    for (const c of consumptions) {
      const k = c.date.slice(0,10);
      byDay.set(k, (byDay.get(k) ?? 0) + c.totalCost);
    }
    return days.map((d) => ({ day: d.slice(5), cost: Math.round((byDay.get(d) ?? 0) * 100) / 100 }));
  }, [consumptions]);

  if (loading) return <LoadingCards />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Weighted average valuation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restocked (7d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.restockedValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats.restockedQty} units total</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplier Outstanding</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalToPay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">To pay: {stats.totalToPay.toFixed(2)} • To receive: {stats.totalToReceive.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Restock Value (Last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-64 w-full"
              config={{
                value: { label: "Restock Value", theme: { light: "hsl(var(--primary))", dark: "hsl(var(--primary))" } },
              }}
            >
              <BarChart data={restockBarData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consumption Cost (Last 14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-64 w-full"
              config={{
                cost: { label: "COGS", theme: { light: "hsl(var(--primary))", dark: "hsl(var(--primary))" } },
              }}
            >
              <LineChart data={consumptionLineData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="cost" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stock Value by Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartContainer
              className="h-72 w-full"
              config={{
                value: { label: "Value", theme: { light: "hsl(var(--primary))", dark: "hsl(var(--primary))" } },
              }}
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={groupPieData} dataKey="value" nameKey="label" outerRadius={110} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>

            <div className="space-y-2 text-sm">
              {groupPieData
                .sort((a,b)=>b.value-a.value)
                .map((g) => (
                <div key={g.stockGroupId} className="flex items-center justify-between rounded-md border p-3">
                  <div className="font-medium">{g.label}</div>
                  <div className="text-muted-foreground">{g.value.toFixed(2)}</div>
                </div>
              ))}
              {!groupPieData.length && (
                <div className="text-muted-foreground">No stock items yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
