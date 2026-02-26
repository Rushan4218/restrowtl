import type { MeasuringUnit } from "@/types";
import { mockMeasuringUnits } from "@/lib/mock-inventory";
import { simulateDelay, generateId } from "./api";

let units = [...mockMeasuringUnits];

export async function getMeasuringUnits(): Promise<MeasuringUnit[]> {
  await simulateDelay();
  return [...units];
}

export async function createMeasuringUnit(data: Omit<MeasuringUnit, "id">): Promise<MeasuringUnit> {
  await simulateDelay();
  const unit: MeasuringUnit = { ...data, id: generateId("unit") };
  units.push(unit);
  return { ...unit };
}

export async function updateMeasuringUnit(id: string, data: Partial<MeasuringUnit>): Promise<MeasuringUnit> {
  await simulateDelay();
  const idx = units.findIndex(u => u.id === id);
  if (idx === -1) throw new Error("Unit not found");
  units[idx] = { ...units[idx], ...data };
  return { ...units[idx] };
}

export async function deleteMeasuringUnit(id: string): Promise<void> {
  await simulateDelay();
  units = units.filter(u => u.id !== id);
}
