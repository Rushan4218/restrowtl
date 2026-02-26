import type { ConsumptionRecord, DishRecipe, Order } from "@/types";
import { mockDishRecipes } from "@/lib/mock-inventory";
import { simulateDelay, generateId } from "./api";
import { createMovement, getStockItems } from "./stockItemService";

let recipes: DishRecipe[] = [...mockDishRecipes];
let consumptions: ConsumptionRecord[] = [];

export async function getDishRecipes(): Promise<DishRecipe[]> {
  await simulateDelay();
  return [...recipes];
}

export async function upsertDishRecipe(recipe: DishRecipe): Promise<DishRecipe> {
  await simulateDelay();
  const idx = recipes.findIndex(r => r.dishId === recipe.dishId);
  if (idx === -1) {
    recipes.push(recipe);
    return { ...recipe };
  }
  recipes[idx] = { ...recipe, updatedAt: new Date().toISOString() };
  return { ...recipes[idx] };
}

export async function getConsumptions(): Promise<ConsumptionRecord[]> {
  await simulateDelay();
  return [...consumptions].sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime());
}

export async function consumeDish(params: {
  dishId: string;
  servings: number;
  date?: string;
  note?: string;
  source?: "manual" | "order";
  orderId?: string;
}): Promise<ConsumptionRecord> {
  await simulateDelay();
  const at = params.date ?? new Date().toISOString();
  const recipe = recipes.find(r => r.dishId === params.dishId);
  if (!recipe) throw new Error("No recipe configured for this dish");

  // Apply movements for each line
  let totalCost = 0;
  for (const line of recipe.lines) {
    const qty = line.qtyPerServing * params.servings;
    const res = await createMovement({
      type: "consume",
      stockItemId: line.stockItemId,
      qty,
      date: at,
      note: params.note ?? `Consumed for dish ${params.dishId}`,
      dishId: params.dishId,
      reference: params.orderId,
    });
    totalCost += res.cogs ?? 0;
  }

  const rec: ConsumptionRecord = {
    id: generateId("cons"),
    date: at,
    dishId: params.dishId,
      reference: params.orderId,
    servings: params.servings,
    totalCost: Math.round((totalCost + Number.EPSILON) * 100) / 100,
    note: params.note,
    createdAt: at,
  };
  consumptions.unshift(rec);
  return { ...rec };
}



export async function consumeFromOrder(order: Order): Promise<{ totalCogs: number; records: ConsumptionRecord[]; skipped: { productId: string; reason: string }[] }> {
  await simulateDelay();
  const at = new Date().toISOString();

  let totalCogs = 0;
  const records: ConsumptionRecord[] = [];
  const skipped: { productId: string; reason: string }[] = [];

  for (const item of order.items) {
    const recipe = recipes.find(r => r.dishId === item.productId);
    if (!recipe) {
      skipped.push({ productId: item.productId, reason: "No recipe configured" });
      continue;
    }

    // Apply movements for each ingredient line
    let dishCost = 0;
    for (const line of recipe.lines) {
      const qty = line.qtyPerServing * item.quantity;
      const res = await createMovement({
        type: "consume",
        stockItemId: line.stockItemId,
        qty,
        date: at,
        note: `Auto-consumption from order ${order.id} (${item.quantity}x ${item.productName})`,
        dishId: item.productId,
        reference: order.id,
      });
      dishCost += res.cogs ?? 0;
    }

    const rec: ConsumptionRecord = {
      id: generateId("cons"),
      date: at,
      dishId: item.productId,
      servings: item.quantity,
      totalCost: Math.round((dishCost + Number.EPSILON) * 100) / 100,
      note: `Auto from order ${order.id}`,
      source: "order",
      orderId: order.id,
      createdAt: at,
    };
    consumptions.unshift(rec);
    records.push(rec);
    totalCogs += dishCost;
  }

  return {
    totalCogs: Math.round((totalCogs + Number.EPSILON) * 100) / 100,
    records,
    skipped,
  };
}

export async function consumeCustom(params: {
  dishId: string;
  servings: number;
  lines: { stockItemId: string; qty: number; unitId?: string; note?: string }[];
  date?: string;
  note?: string;
}): Promise<ConsumptionRecord> {
  await simulateDelay();
  const at = params.date ?? new Date().toISOString();

  let totalCost = 0;
  for (const line of params.lines) {
    if (!line.stockItemId) continue;
    const qty = Number(line.qty) || 0;
    if (qty <= 0) continue;
    const res = await createMovement({
      type: "consume",
      stockItemId: line.stockItemId,
      qty,
      date: at,
      note: line.note ?? params.note ?? `Consumed for dish ${params.dishId}`,
      dishId: params.dishId,
      reference: params.orderId,
    });
    totalCost += res.cogs ?? 0;
  }

  const rec: ConsumptionRecord = {
    id: generateId("cons"),
    date: at,
    dishId: params.dishId,
      reference: params.orderId,
    servings: params.servings,
    totalCost: Math.round((totalCost + Number.EPSILON) * 100) / 100,
    note: params.note,
    createdAt: new Date().toISOString(),
  };
  consumptions.unshift(rec);
  return { ...rec };
}
