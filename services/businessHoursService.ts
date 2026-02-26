import type { BusinessHours } from "@/types";
import { mockBusinessHours } from "@/lib/mock-data";
import { simulateDelay } from "./api";

let businessHours = [...mockBusinessHours];

export async function getBusinessHours(): Promise<BusinessHours[]> {
  await simulateDelay();
  return [...businessHours];
}

export async function updateBusinessHours(
  id: string,
  data: Partial<BusinessHours>
): Promise<BusinessHours> {
  await simulateDelay();
  const index = businessHours.findIndex((bh) => bh.id === id);
  if (index === -1) throw new Error("Business hours not found");
  businessHours[index] = { ...businessHours[index], ...data };
  return { ...businessHours[index] };
}
