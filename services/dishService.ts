import type { Product } from "@/types";
import { mockProducts } from "@/lib/mock-data";
import { simulateDelay, generateId } from "./api";

let dishes = [...mockProducts];

export async function getDishes(): Promise<Product[]> {
  await simulateDelay();
  return [...dishes];
}

export async function getDishByCategory(categoryId: string): Promise<Product[]> {
  await simulateDelay();
  return dishes.filter((d) => d.categoryId === categoryId);
}

export async function getDish(id: string): Promise<Product | undefined> {
  await simulateDelay();
  return dishes.find((d) => d.id === id);
}

export async function createDish(data: Omit<Product, "id">): Promise<Product> {
  await simulateDelay();
  const newDish: Product = { ...data, id: generateId("d") };
  dishes.push(newDish);
  return { ...newDish };
}

export async function updateDish(id: string, data: Partial<Product>): Promise<Product> {
  await simulateDelay();
  const index = dishes.findIndex((d) => d.id === id);
  if (index === -1) throw new Error("Dish not found");
  dishes[index] = { ...dishes[index], ...data };
  return { ...dishes[index] };
}

export async function deleteDish(id: string): Promise<void> {
  await simulateDelay();
  dishes = dishes.filter((d) => d.id !== id);
}

export async function toggleDishAvailability(id: string): Promise<Product> {
  await simulateDelay();
  const index = dishes.findIndex((d) => d.id === id);
  if (index === -1) throw new Error("Dish not found");
  dishes[index] = {
    ...dishes[index],
    isAvailable: !dishes[index].isAvailable,
  };
  return { ...dishes[index] };
}

export async function searchDishes(query: string): Promise<Product[]> {
  await simulateDelay();
  const lowerQuery = query.toLowerCase();
  return dishes.filter(
    (d) =>
      d.name.toLowerCase().includes(lowerQuery) ||
      d.description.toLowerCase().includes(lowerQuery)
  );
}
