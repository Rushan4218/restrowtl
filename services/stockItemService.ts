import type { StockItem, StockMovement, InventoryMovementType } from "@/types";
import { mockStockItems, mockStockMovements } from "@/lib/mock-inventory";
import { simulateDelay, generateId } from "./api";
import { applyRestock, applyConsumption } from "@/lib/inventory/calculations";

let items = [...mockStockItems];
let movements = [...mockStockMovements];

export async function getStockItems(): Promise<StockItem[]> {
  await simulateDelay();
  return [...items];
}

export async function getStockMovements(): Promise<StockMovement[]> {
  await simulateDelay();
  return [...movements].sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime());
}

export async function createStockItem(
  data: Omit<StockItem, "id" | "createdAt" | "updatedAt" | "openingValue" | "currentQty" | "avgCost">
): Promise<StockItem> {
  await simulateDelay();
  const now = new Date().toISOString();
  const openingValue = (data.openingQty || 0) * (data.openingRate || 0);
  const item: StockItem = {
    ...data,
    id: generateId("si"),
    createdAt: now,
    updatedAt: now,
    openingValue,
    currentQty: data.openingQty || 0,
    avgCost: data.openingRate || 0,
  };
  items.push(item);

  // Add opening movement
  movements.unshift({
    id: generateId("mv"),
    date: now,
    type: "opening",
    stockItemId: item.id,
    qtyIn: item.openingQty,
    qtyOut: 0,
    rate: item.openingRate,
    value: openingValue,
    note: "Opening Stock",
    createdAt: now,
  });

  return { ...item };
}

export async function updateStockItem(id: string, data: Partial<StockItem>): Promise<StockItem> {
  await simulateDelay();
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error("Stock item not found");
  // NOTE: Do not auto-recompute historical opening movement on edits; treat edits as metadata updates.
  items[idx] = { ...items[idx], ...data, updatedAt: new Date().toISOString() };
  return { ...items[idx] };
}

export async function deleteStockItem(id: string): Promise<void> {
  await simulateDelay();
  items = items.filter(i => i.id !== id);
  movements = movements.filter(m => m.stockItemId !== id);
}

export async function createMovement(params: {
  type: InventoryMovementType;
  stockItemId: string;
  qty: number; // incoming for restock/adjust, outgoing for consume/waste
  rate?: number; // required for incoming
  date?: string;
  note?: string;
  supplierId?: string;
  dishId?: string;
  reference?: string;
}): Promise<{ item: StockItem; movement: StockMovement; cogs?: number }> {
  await simulateDelay();
  const idx = items.findIndex(i => i.id === params.stockItemId);
  if (idx === -1) throw new Error("Stock item not found");

  const now = params.date ?? new Date().toISOString();
  const current = items[idx];

  if (params.type === "restock" || params.type === "adjust") {
    const rate = params.rate ?? current.avgCost ?? 0;
    const next = applyRestock(current, params.qty, rate, now);
    items[idx] = next;

    const mv: StockMovement = {
      id: generateId("mv"),
      date: now,
      type: params.type,
      stockItemId: current.id,
      qtyIn: params.qty,
      qtyOut: 0,
      rate,
      value: params.qty * rate,
      note: params.note,
      supplierId: params.supplierId,
      reference: params.reference,
      createdAt: now,
    };
    movements.unshift(mv);
    return { item: { ...next }, movement: { ...mv } };
  }

  // consume/waste
  const { next, cogs } = applyConsumption(current, params.qty, now);
  items[idx] = next;

  const mv: StockMovement = {
    id: generateId("mv"),
    date: now,
    type: params.type,
    stockItemId: current.id,
    qtyIn: 0,
    qtyOut: params.qty,
    rate: current.avgCost,
    value: params.qty * current.avgCost,
    note: params.note,
    dishId: params.dishId,
    reference: params.reference,
    createdAt: now,
  };
  movements.unshift(mv);
  return { item: { ...next }, movement: { ...mv }, cogs };
}
