import type {
  CustomerAttribute,
  CustomerAttributeCreateInput,
  CustomerAttributeUpdateInput,
} from "@/types";
import { mockCustomerAttributes } from "@/lib/mock-data";
import { generateId, simulateDelay } from "@/services/api";

const STORAGE_KEY = "restrohub_customer_attributes";

function readStored(): CustomerAttribute[] {
  if (typeof window === "undefined") return mockCustomerAttributes;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return mockCustomerAttributes;
  try {
    const parsed = JSON.parse(raw) as CustomerAttribute[];
    return Array.isArray(parsed) ? parsed : mockCustomerAttributes;
  } catch {
    return mockCustomerAttributes;
  }
}

function writeStored(attrs: CustomerAttribute[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(attrs));
}

export const adminAttributeService = {
  async getAttributes(): Promise<CustomerAttribute[]> {
    await simulateDelay(200);
    return readStored().sort((a, b) => a.name.localeCompare(b.name));
  },

  async createAttribute(input: CustomerAttributeCreateInput): Promise<CustomerAttribute> {
    await simulateDelay(250);
    const now = new Date().toISOString();
    const next: CustomerAttribute = {
      id: generateId("attr"),
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const all = readStored();
    const dup = all.some((a) => a.name.toLowerCase() === next.name.toLowerCase());
    if (dup) throw new Error("Attribute name already exists");

    const updated = [next, ...all];
    writeStored(updated);
    return next;
  },

  async updateAttribute(id: string, patch: CustomerAttributeUpdateInput): Promise<CustomerAttribute> {
    await simulateDelay(250);
    const all = readStored();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Attribute not found");

    const nextName = patch.name?.trim();
    if (nextName) {
      const dup = all.some((a) => a.id !== id && a.name.toLowerCase() === nextName.toLowerCase());
      if (dup) throw new Error("Attribute name already exists");
    }

    const updated: CustomerAttribute = {
      ...all[idx],
      ...patch,
      name: nextName ?? all[idx].name,
      description: patch.description?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    const nextAll = [...all];
    nextAll[idx] = updated;
    writeStored(nextAll);
    return updated;
  },

  async deleteAttribute(id: string): Promise<void> {
    await simulateDelay(200);
    const all = readStored();
    writeStored(all.filter((a) => a.id !== id));
  },
};
