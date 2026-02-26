import type { ComboOffer } from "@/types";
import { mockComboOffers } from "@/lib/mock-data";
import { simulateDelay, generateId } from "./api";

let combos = [...mockComboOffers];

export async function getCombos(): Promise<ComboOffer[]> {
  await simulateDelay();
  return [...combos].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export async function getCombo(id: string): Promise<ComboOffer | undefined> {
  await simulateDelay();
  return combos.find((c) => c.id === id);
}

export async function createCombo(data: Omit<ComboOffer, "id">): Promise<ComboOffer> {
  await simulateDelay();
  const newCombo: ComboOffer = { ...data, id: generateId("combo") };
  combos.push(newCombo);
  return { ...newCombo };
}

export async function updateCombo(id: string, data: Partial<ComboOffer>): Promise<ComboOffer> {
  await simulateDelay();
  const index = combos.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Combo not found");
  combos[index] = { ...combos[index], ...data };
  return { ...combos[index] };
}

export async function deleteCombo(id: string): Promise<void> {
  await simulateDelay();
  combos = combos.filter((c) => c.id !== id);
}

export async function toggleComboStatus(id: string): Promise<ComboOffer> {
  await simulateDelay();
  const index = combos.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Combo not found");
  combos[index] = {
    ...combos[index],
    isActive: !combos[index].isActive,
  };
  return { ...combos[index] };
}

export async function searchCombos(query: string): Promise<ComboOffer[]> {
  await simulateDelay();
  const lowerQuery = query.toLowerCase();
  return combos.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery)
  );
}
