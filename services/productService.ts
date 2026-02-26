import type { Product } from "@/types";
import { mockProducts } from "@/lib/mock-data";
import { simulateDelay, generateId } from "./api";

let products = [...mockProducts];

export async function getProducts(): Promise<Product[]> {
  await simulateDelay();
  return [...products];
}

export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  await simulateDelay();
  return products.filter((p) => p.categoryId === categoryId);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  await simulateDelay();
  return products.find((p) => p.id === id);
}

export async function createProduct(
  data: Omit<Product, "id">
): Promise<Product> {
  await simulateDelay();
  const newProduct: Product = { ...data, id: generateId("p") };
  products.push(newProduct);
  return { ...newProduct };
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product> {
  await simulateDelay();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Product not found");
  products[index] = { ...products[index], ...data };
  return { ...products[index] };
}

export async function deleteProduct(id: string): Promise<void> {
  await simulateDelay();
  products = products.filter((p) => p.id !== id);
}

export async function toggleProductAvailability(
  id: string
): Promise<Product> {
  await simulateDelay();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Product not found");
  products[index] = {
    ...products[index],
    isAvailable: !products[index].isAvailable,
  };
  return { ...products[index] };
}

export async function searchProducts(query: string): Promise<Product[]> {
  await simulateDelay();
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}
