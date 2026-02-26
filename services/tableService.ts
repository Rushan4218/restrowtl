import type { RestaurantTable } from "@/types";
import { mockTables } from "@/lib/mock-data";
import { simulateDelay, generateId } from "./api";
import { generateToken } from "@/lib/tokens";

let tables = [...mockTables];

export async function getTables(): Promise<RestaurantTable[]> {
  await simulateDelay();
  return [...tables];
}

export async function getEnabledTables(): Promise<RestaurantTable[]> {
  await simulateDelay();
  return tables.filter((t) => t.isEnabled);
}

export async function createTable(
  data: Omit<RestaurantTable, "id" | "token">
): Promise<RestaurantTable> {
  await simulateDelay();
  const newTable: RestaurantTable = {
    ...data,
    id: generateId("t"),
    token: generateToken(),
  };
  tables.push(newTable);
  return { ...newTable };
}

export async function getTableByToken(
  token: string
): Promise<RestaurantTable | undefined> {
  await simulateDelay();
  return tables.find((t) => t.token === token && t.isEnabled);
}

export async function regenerateToken(id: string): Promise<RestaurantTable> {
  await simulateDelay();
  const index = tables.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Table not found");
  tables[index] = { ...tables[index], token: generateToken() };
  return { ...tables[index] };
}

export async function updateTable(
  id: string,
  data: Partial<RestaurantTable>
): Promise<RestaurantTable> {
  await simulateDelay();
  const index = tables.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Table not found");
  tables[index] = { ...tables[index], ...data };
  return { ...tables[index] };
}

export async function deleteTable(id: string): Promise<void> {
  await simulateDelay();
  tables = tables.filter((t) => t.id !== id);
}
