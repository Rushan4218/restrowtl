import type { StockGroup } from "@/types";
import { mockStockGroups } from "@/lib/mock-inventory";
import { simulateDelay, generateId } from "./api";

let groups = [...mockStockGroups];

export async function getStockGroups(): Promise<StockGroup[]> {
  await simulateDelay();
  return [...groups];
}

export async function createStockGroup(data: Omit<StockGroup, "id">): Promise<StockGroup> {
  await simulateDelay();
  const g: StockGroup = { ...data, id: generateId("sg") };
  groups.push(g);
  return { ...g };
}

export async function updateStockGroup(id: string, data: Partial<StockGroup>): Promise<StockGroup> {
  await simulateDelay();
  const idx = groups.findIndex(g => g.id === id);
  if (idx === -1) throw new Error("Group not found");
  groups[idx] = { ...groups[idx], ...data };
  return { ...groups[idx] };
}

export async function deleteStockGroup(id: string): Promise<void> {
  await simulateDelay();
  groups = groups.filter(g => g.id !== id);
}
