import type { AddOn } from "@/types";
import { mockAddOns } from "@/lib/mock-data";
import { simulateDelay, generateId } from "./api";

let addOns = [...mockAddOns];

export async function getAddOns(): Promise<AddOn[]> {
  await simulateDelay();
  return [...addOns];
}

export async function getAddOn(id: string): Promise<AddOn | undefined> {
  await simulateDelay();
  return addOns.find((a) => a.id === id);
}

export async function createAddOn(data: Omit<AddOn, "id">): Promise<AddOn> {
  await simulateDelay();
  const newAddOn: AddOn = { ...data, id: generateId("ao") };
  addOns.push(newAddOn);
  return { ...newAddOn };
}

export async function updateAddOn(id: string, data: Partial<AddOn>): Promise<AddOn> {
  await simulateDelay();
  const index = addOns.findIndex((a) => a.id === id);
  if (index === -1) throw new Error("AddOn not found");
  addOns[index] = { ...addOns[index], ...data };
  return { ...addOns[index] };
}

export async function deleteAddOn(id: string): Promise<void> {
  await simulateDelay();
  addOns = addOns.filter((a) => a.id !== id);
}

export async function toggleAddOnAvailability(id: string): Promise<AddOn> {
  await simulateDelay();
  const index = addOns.findIndex((a) => a.id === id);
  if (index === -1) throw new Error("AddOn not found");
  addOns[index] = {
    ...addOns[index],
    isAvailable: !addOns[index].isAvailable,
  };
  return { ...addOns[index] };
}

export async function searchAddOns(query: string): Promise<AddOn[]> {
  await simulateDelay();
  const lowerQuery = query.toLowerCase();
  return addOns.filter((a) => a.name.toLowerCase().includes(lowerQuery));
}
