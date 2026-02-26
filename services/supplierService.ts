import type { Supplier, SupplierTransaction } from "@/types";
import { mockSuppliers, mockSupplierTransactions } from "@/lib/mock-inventory";
import { simulateDelay, generateId } from "./api";

let suppliers = [...mockSuppliers];
let txns = [...mockSupplierTransactions];

export async function getSuppliers(): Promise<Supplier[]> {
  await simulateDelay();
  return [...suppliers];
}

export async function getSupplierTransactions(): Promise<SupplierTransaction[]> {
  await simulateDelay();
  return [...txns].sort((a,b)=> new Date(b.date).getTime()-new Date(a.date).getTime());
}

export async function createSupplier(data: Omit<Supplier, "id" | "createdAt" | "updatedAt">): Promise<Supplier> {
  await simulateDelay();
  const now = new Date().toISOString();
  const s: Supplier = { ...data, id: generateId("sup"), createdAt: now, updatedAt: now };
  suppliers.push(s);
  return { ...s };
}

export async function updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
  await simulateDelay();
  const idx = suppliers.findIndex(s => s.id === id);
  if (idx === -1) throw new Error("Supplier not found");
  suppliers[idx] = { ...suppliers[idx], ...data, updatedAt: new Date().toISOString() };
  return { ...suppliers[idx] };
}

export async function deleteSupplier(id: string): Promise<void> {
  await simulateDelay();
  suppliers = suppliers.filter(s => s.id !== id);
  txns = txns.filter(t => t.supplierId !== id);
}

export async function createSupplierTransaction(
  data: Omit<SupplierTransaction, "id" | "createdAt">
): Promise<SupplierTransaction> {
  await simulateDelay();
  const now = new Date().toISOString();
  const t: SupplierTransaction = { ...data, id: generateId("stx"), createdAt: now };
  txns.push(t);
  return { ...t };
}
