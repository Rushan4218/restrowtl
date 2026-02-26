import type { MenuSet } from "@/types";
import { mockMenuSets } from "@/lib/mock-data";
import { simulateDelay, generateId } from "./api";

let menuSets = [...mockMenuSets];

export async function getMenuSets(): Promise<MenuSet[]> {
  await simulateDelay();
  return [...menuSets].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getMenuSet(id: string): Promise<MenuSet | undefined> {
  await simulateDelay();
  return menuSets.find((m) => m.id === id);
}

export async function getMenuSetsByType(type: string): Promise<MenuSet[]> {
  await simulateDelay();
  return menuSets.filter((m) => m.type === type && m.isActive);
}

export async function createMenuSet(
  data: Omit<MenuSet, "id">
): Promise<MenuSet> {
  await simulateDelay();
  const newMenuSet: MenuSet = { ...data, id: generateId("mset") };
  menuSets.push(newMenuSet);
  return { ...newMenuSet };
}

export async function updateMenuSet(
  id: string,
  data: Partial<MenuSet>
): Promise<MenuSet> {
  await simulateDelay();
  const index = menuSets.findIndex((m) => m.id === id);
  if (index === -1) throw new Error("MenuSet not found");
  menuSets[index] = { ...menuSets[index], ...data };
  return { ...menuSets[index] };
}

export async function deleteMenuSet(id: string): Promise<void> {
  await simulateDelay();
  menuSets = menuSets.filter((m) => m.id !== id);
}

export async function reorderMenuSets(ids: string[]): Promise<MenuSet[]> {
  await simulateDelay();
  menuSets = menuSets.map((m) => ({
    ...m,
    displayOrder: ids.indexOf(m.id),
  }));
  return [...menuSets].sort((a, b) => a.displayOrder - b.displayOrder);
}
