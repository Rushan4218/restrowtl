import type { Category } from "@/types";
import { mockCategories } from "@/lib/mock-data";
import { simulateDelay, generateId } from "./api";

let categories = [...mockCategories];

export async function getCategories(): Promise<Category[]> {
  await simulateDelay();
  return [...categories];
}

export async function getRootCategories(): Promise<Category[]> {
  await simulateDelay();
  return categories.filter((c) => c.parentId === null);
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  await simulateDelay();
  return categories.filter((c) => c.parentId === parentId);
}

export async function createCategory(
  data: Omit<Category, "id">
): Promise<Category> {
  await simulateDelay();
  const newCategory: Category = { ...data, id: generateId("cat") };
  categories.push(newCategory);
  return { ...newCategory };
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<Category> {
  await simulateDelay();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Category not found");
  categories[index] = { ...categories[index], ...data };
  return { ...categories[index] };
}

export async function deleteCategory(id: string): Promise<void> {
  await simulateDelay();
  // Also remove subcategories
  const childIds = categories.filter((c) => c.parentId === id).map((c) => c.id);
  categories = categories.filter(
    (c) => c.id !== id && !childIds.includes(c.id)
  );
}
