import type { SubMenu } from "@/types";
import { mockSubMenus } from "@/lib/mock-data";
import { simulateDelay, generateId } from "./api";

let subMenus = [...mockSubMenus];

export async function getSubMenus(): Promise<SubMenu[]> {
  await simulateDelay();
  return [...subMenus].sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getSubMenu(id: string): Promise<SubMenu | undefined> {
  await simulateDelay();
  return subMenus.find((s) => s.id === id);
}

export async function createSubMenu(
  data: Omit<SubMenu, "id">
): Promise<SubMenu> {
  await simulateDelay();
  const newSubMenu: SubMenu = { ...data, id: generateId("submenu") };
  subMenus.push(newSubMenu);
  return { ...newSubMenu };
}

export async function updateSubMenu(
  id: string,
  data: Partial<SubMenu>
): Promise<SubMenu> {
  await simulateDelay();
  const index = subMenus.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("SubMenu not found");
  subMenus[index] = { ...subMenus[index], ...data };
  return { ...subMenus[index] };
}

export async function deleteSubMenu(id: string): Promise<void> {
  await simulateDelay();
  subMenus = subMenus.filter((s) => s.id !== id);
}

export async function reorderSubMenus(
  ids: string[]
): Promise<SubMenu[]> {
  await simulateDelay();
  subMenus = subMenus.map((s) => ({
    ...s,
    displayOrder: ids.indexOf(s.id),
  }));
  return [...subMenus].sort((a, b) => a.displayOrder - b.displayOrder);
}
