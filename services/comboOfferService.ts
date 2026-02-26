import type { ComboOffer } from "@/types";
import { mockComboOffers } from "@/lib/mock-data";
import { simulateDelay, generateId } from "./api";

let comboOffers = [...mockComboOffers];

export async function getComboOffers(): Promise<ComboOffer[]> {
  await simulateDelay();
  return [...comboOffers].filter((c) => c.isActive);
}

export async function getAllComboOffers(): Promise<ComboOffer[]> {
  await simulateDelay();
  return [...comboOffers];
}

export async function getComboOffer(id: string): Promise<ComboOffer | undefined> {
  await simulateDelay();
  return comboOffers.find((c) => c.id === id);
}

export async function createComboOffer(
  data: Omit<ComboOffer, "id">
): Promise<ComboOffer> {
  await simulateDelay();
  const newCombo: ComboOffer = { ...data, id: generateId("combo") };
  comboOffers.push(newCombo);
  return { ...newCombo };
}

export async function updateComboOffer(
  id: string,
  data: Partial<ComboOffer>
): Promise<ComboOffer> {
  await simulateDelay();
  const index = comboOffers.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("ComboOffer not found");
  comboOffers[index] = { ...comboOffers[index], ...data };
  return { ...comboOffers[index] };
}

export async function deleteComboOffer(id: string): Promise<void> {
  await simulateDelay();
  comboOffers = comboOffers.filter((c) => c.id !== id);
}

export async function getComboOffersByProduct(productId: string): Promise<ComboOffer[]> {
  await simulateDelay();
  return comboOffers.filter((c) => c.productIds.includes(productId) && c.isActive);
}
