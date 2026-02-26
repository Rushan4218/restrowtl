import type { CustomerCreateInput, CustomerProfile, CustomerUpdateInput } from "@/types";
import { mockCustomersAdmin } from "@/lib/mock-data";
import { generateId, simulateDelay } from "@/services/api";

const STORAGE_KEY = "restrohub_admin_customers";

function readStored(): CustomerProfile[] {
  if (typeof window === "undefined") return mockCustomersAdmin;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockCustomersAdmin;
  try {
    const parsed = JSON.parse(raw) as CustomerProfile[];
    return Array.isArray(parsed) ? parsed : mockCustomersAdmin;
  } catch {
    return mockCustomersAdmin;
  }
}

function writeStored(items: CustomerProfile[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const adminCustomerService = {
  async getCustomers(): Promise<CustomerProfile[]> {
    await simulateDelay(200);
    const all = readStored();
    return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getCustomerById(id: string): Promise<CustomerProfile | null> {
    await simulateDelay(150);
    return readStored().find((c) => c.id === id) ?? null;
  },

  async createCustomer(input: CustomerCreateInput): Promise<CustomerProfile> {
    await simulateDelay(300);
    const now = new Date().toISOString();
    const next: CustomerProfile = {
      id: generateId("cust"),
      ...input,
      fullName: input.fullName.trim(),
      telephone: input.telephone.trim(),
      email: input.email.trim(),
      createdAt: now,
      updatedAt: now,
      attributeIds: input.attributeIds ?? [],
    };

    const all = readStored();
    const emailDup = all.some((c) => c.email.toLowerCase() === next.email.toLowerCase());
    if (emailDup) throw new Error("Email already exists");

    const updated = [next, ...all];
    writeStored(updated);
    return next;
  },

  async updateCustomer(id: string, patch: CustomerUpdateInput): Promise<CustomerProfile> {
    await simulateDelay(300);
    const all = readStored();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Customer not found");

    const updated: CustomerProfile = {
      ...all[idx],
      ...patch,
      fullName: patch.fullName ? patch.fullName.trim() : all[idx].fullName,
      telephone: patch.telephone ? patch.telephone.trim() : all[idx].telephone,
      email: patch.email ? patch.email.trim() : all[idx].email,
      updatedAt: new Date().toISOString(),
      attributeIds: patch.attributeIds ?? all[idx].attributeIds,
    };

    // email uniqueness
    if (updated.email) {
      const dup = all.some((c) => c.id !== id && c.email.toLowerCase() === updated.email.toLowerCase());
      if (dup) throw new Error("Email already exists");
    }

    const nextAll = [...all];
    nextAll[idx] = updated;
    writeStored(nextAll);
    return updated;
  },

  async deleteCustomer(id: string): Promise<void> {
    await simulateDelay(200);
    const all = readStored();
    writeStored(all.filter((c) => c.id !== id));
  },
};
