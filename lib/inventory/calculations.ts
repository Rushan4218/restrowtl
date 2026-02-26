import type { StockItem, StockMovement, Supplier, SupplierTransaction } from "@/types";

// Weighted Average Costing for restocks
export function applyRestock(
  item: StockItem,
  qtyAdded: number,
  rate: number,
  atIso: string
): StockItem {
  const oldQty = item.currentQty;
  const oldAvg = item.avgCost;
  const newQty = oldQty + qtyAdded;

  const newAvg = newQty === 0 ? 0 : (oldQty * oldAvg + qtyAdded * rate) / newQty;

  return {
    ...item,
    currentQty: newQty,
    avgCost: round2(newAvg),
    updatedAt: atIso,
  };
}

export function applyConsumption(
  item: StockItem,
  qtyUsed: number,
  atIso: string
): { next: StockItem; cogs: number } {
  const qtyOut = Math.min(item.currentQty, qtyUsed);
  const cogs = qtyOut * item.avgCost;
  return {
    next: { ...item, currentQty: round3(item.currentQty - qtyOut), updatedAt: atIso },
    cogs: round2(cogs),
  };
}

export function computeItemValue(item: StockItem): number {
  return round2(item.currentQty * item.avgCost);
}

export function computeTotalStockValue(items: StockItem[]): number {
  return round2(items.reduce((sum, it) => sum + computeItemValue(it), 0));
}

export function isLowStock(item: StockItem): boolean {
  return item.currentQty <= item.lowStockThreshold;
}

export function withinLastNDays(isoDate: string, n: number): boolean {
  const d = new Date(isoDate).getTime();
  const now = Date.now();
  return now - d <= n * 24 * 60 * 60 * 1000;
}

export function sumRestockedThisWeek(movements: StockMovement[]): { qty: number; value: number } {
  const restocks = movements.filter(m => m.type === "restock" && withinLastNDays(m.date, 7));
  const qty = restocks.reduce((s, m) => s + m.qtyIn, 0);
  const value = restocks.reduce((s, m) => s + m.value, 0);
  return { qty: round3(qty), value: round2(value) };
}

// Supplier ledger: Positive net means "to pay", negative means "to receive"
export function supplierOpeningNet(s: Supplier): number {
  const amt = Math.abs(s.openingAmount || 0);
  return s.openingBalanceType === "to_pay" ? amt : -amt;
}

export function supplierNetBalance(s: Supplier, txns: SupplierTransaction[]): number {
  const open = supplierOpeningNet(s);
  const delta = txns
    .filter(t => t.supplierId === s.id)
    .reduce((sum, t) => {
      if (t.type === "purchase") return sum + t.amount; // increases payable
      if (t.type === "payment") return sum - t.amount; // reduces payable
      return sum + t.amount; // adjustment (positive increases payable)
    }, 0);
  return round2(open + delta);
}

export function supplierToPayToReceive(net: number): { toPay: number; toReceive: number } {
  return { toPay: round2(Math.max(net, 0)), toReceive: round2(Math.max(-net, 0)) };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
export function round3(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}
