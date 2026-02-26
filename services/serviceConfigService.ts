import type { ServiceConfig, MenuFilter, OrderModifier } from "@/types";
import { simulateDelay, generateId } from "./api";

const SERVICE_CONFIG_KEY = "restrohub_service_config";
const MENU_FILTERS_KEY = "restrohub_menu_filters";
const ORDER_MODIFIERS_KEY = "restrohub_order_modifiers";

const defaultServiceConfig: ServiceConfig = {
  id: "config-1",
  restaurantName: "RestroHub Restaurant",
  dineInEnabled: true,
  takeawayEnabled: true,
  deliveryEnabled: true,
  deliveryRadius: 5,
  minDeliveryOrder: 15,
  deliveryFee: 2.5,
  estimatedDineInTime: 30,
  estimatedTakeawayTime: 25,
  estimatedDeliveryTime: 45,
  updatedAt: new Date().toISOString(),
};

const defaultMenuFilters: MenuFilter[] = [
  { id: "f-1", name: "Vegetarian", type: "dietary", icon: "🥗" },
  { id: "f-2", name: "Vegan", type: "dietary", icon: "🌱" },
  { id: "f-3", name: "Gluten-Free", type: "dietary", icon: "🌾" },
  { id: "f-4", name: "Spicy", type: "spice", icon: "🌶️" },
  { id: "f-5", name: "Mild", type: "spice", icon: "✓" },
];

const defaultOrderModifiers: OrderModifier[] = [
  {
    id: "mod-1",
    name: "Size",
    isRequired: true,
    maxSelections: 1,
    options: [
      { id: "size-s", name: "Small", price: 0 },
      { id: "size-m", name: "Medium", price: 2 },
      { id: "size-l", name: "Large", price: 4 },
    ],
  },
  {
    id: "mod-2",
    name: "Protein Options",
    isRequired: false,
    maxSelections: 2,
    options: [
      { id: "prot-chicken", name: "Chicken", price: 0 },
      { id: "prot-beef", name: "Beef", price: 3 },
      { id: "prot-fish", name: "Fish", price: 4 },
      { id: "prot-vegetarian", name: "Vegetarian", price: 0 },
    ],
  },
];

function getStoredConfig(): ServiceConfig {
  if (typeof window === "undefined") return defaultServiceConfig;
  try {
    const data = localStorage.getItem(SERVICE_CONFIG_KEY);
    return data ? JSON.parse(data) : defaultServiceConfig;
  } catch {
    return defaultServiceConfig;
  }
}

function saveConfig(config: ServiceConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SERVICE_CONFIG_KEY, JSON.stringify(config));
}

function getStoredFilters(): MenuFilter[] {
  if (typeof window === "undefined") return defaultMenuFilters;
  try {
    const data = localStorage.getItem(MENU_FILTERS_KEY);
    return data ? JSON.parse(data) : defaultMenuFilters;
  } catch {
    return defaultMenuFilters;
  }
}

function saveFilters(filters: MenuFilter[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MENU_FILTERS_KEY, JSON.stringify(filters));
}

function getStoredModifiers(): OrderModifier[] {
  if (typeof window === "undefined") return defaultOrderModifiers;
  try {
    const data = localStorage.getItem(ORDER_MODIFIERS_KEY);
    return data ? JSON.parse(data) : defaultOrderModifiers;
  } catch {
    return defaultOrderModifiers;
  }
}

function saveModifiers(modifiers: OrderModifier[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORDER_MODIFIERS_KEY, JSON.stringify(modifiers));
}

export async function getServiceConfig(): Promise<ServiceConfig> {
  await simulateDelay();
  return getStoredConfig();
}

export async function updateServiceConfig(
  config: Partial<ServiceConfig>
): Promise<ServiceConfig> {
  await simulateDelay();
  const current = getStoredConfig();
  const updated: ServiceConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };
  saveConfig(updated);
  return updated;
}

export async function getMenuFilters(): Promise<MenuFilter[]> {
  await simulateDelay();
  return getStoredFilters();
}

export async function addMenuFilter(filter: MenuFilter): Promise<MenuFilter[]> {
  await simulateDelay();
  const filters = getStoredFilters();
  filters.push(filter);
  saveFilters(filters);
  return filters;
}

export async function removeMenuFilter(filterId: string): Promise<MenuFilter[]> {
  await simulateDelay();
  const filters = getStoredFilters().filter((f) => f.id !== filterId);
  saveFilters(filters);
  return filters;
}

export async function getOrderModifiers(): Promise<OrderModifier[]> {
  await simulateDelay();
  return getStoredModifiers();
}

export async function addOrderModifier(
  modifier: OrderModifier
): Promise<OrderModifier[]> {
  await simulateDelay();
  const modifiers = getStoredModifiers();
  modifiers.push(modifier);
  saveModifiers(modifiers);
  return modifiers;
}

export async function updateOrderModifier(
  modifierId: string,
  updates: Partial<OrderModifier>
): Promise<OrderModifier[]> {
  await simulateDelay();
  const modifiers = getStoredModifiers();
  const index = modifiers.findIndex((m) => m.id === modifierId);
  if (index !== -1) {
    modifiers[index] = { ...modifiers[index], ...updates };
    saveModifiers(modifiers);
  }
  return modifiers;
}

export async function removeOrderModifier(
  modifierId: string
): Promise<OrderModifier[]> {
  await simulateDelay();
  const modifiers = getStoredModifiers().filter((m) => m.id !== modifierId);
  saveModifiers(modifiers);
  return modifiers;
}
