import type { MeasuringUnit, StockGroup, StockItem, Supplier, StockMovement, DishRecipe, SupplierTransaction } from "@/types";
import { mockProducts } from "@/lib/mock-data";

const now = new Date().toISOString();

export const mockMeasuringUnits: MeasuringUnit[] = [
  { id: "unit-kg", name: "Kilogram", shortName: "kg", description: "Weight in kilograms" },
  { id: "unit-g", name: "Gram", shortName: "g", description: "Weight in grams" },
  { id: "unit-l", name: "Liter", shortName: "ltr", description: "Volume in liters" },
  { id: "unit-ml", name: "Milliliter", shortName: "ml", description: "Volume in milliliters" },
  { id: "unit-pcs", name: "Pieces", shortName: "pcs", description: "Countable pieces" },
];

export const mockStockGroups: StockGroup[] = [
  { id: "sg-drinks", name: "Drinks" },
  { id: "sg-groceries", name: "Groceries" },
  { id: "sg-meat", name: "Meat" },
  { id: "sg-veg", name: "Vegetables" },
  { id: "sg-others", name: "Others" },
];

export const mockSuppliers: Supplier[] = [
  {
    id: "sup-1",
    fullName: "Rahim Traders",
    legalOrgName: "Rahim Traders LLC",
    phone: "+8801000000001",
    email: "rahim@example.com",
    taxNumber: "TAX-RT-001",
    dob: "1990-05-12",
    openingBalanceType: "to_pay",
    openingAmount: 2500,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sup-2",
    fullName: "Green Valley Veg",
    legalOrgName: "Green Valley",
    phone: "+8801000000002",
    email: "green@example.com",
    taxNumber: "TAX-GV-002",
    dob: "1987-11-02",
    openingBalanceType: "to_collect",
    openingAmount: 500,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockStockItems: StockItem[] = [
  {
    id: "si-1",
    name: "Rice",
    unitIds: ["unit-kg"],
    defaultPrice: 80,
    category: "Groceries",
    stockGroupId: "sg-groceries",
    lowStockThreshold: 10,
    openingQty: 25,
    openingRate: 75,
    openingValue: 25 * 75,
    currentQty: 25,
    avgCost: 75,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "si-2",
    name: "Chicken",
    unitIds: ["unit-kg"],
    defaultPrice: 320,
    category: "Meat",
    stockGroupId: "sg-meat",
    lowStockThreshold: 5,
    openingQty: 8,
    openingRate: 300,
    openingValue: 8 * 300,
    currentQty: 8,
    avgCost: 300,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "si-3",
    name: "Mineral Water Bottle",
    unitIds: ["unit-pcs"],
    defaultPrice: 12,
    category: "Drinks",
    stockGroupId: "sg-drinks",
    lowStockThreshold: 24,
    openingQty: 48,
    openingRate: 10,
    openingValue: 48 * 10,
    currentQty: 48,
    avgCost: 10,
    createdAt: now,
    updatedAt: now,
  },
];

// Minimal dish recipes mapped to existing products (if present)
const findDish = (nameIncludes: string) => mockProducts.find(p => p.name.toLowerCase().includes(nameIncludes));

const dishRice = findDish("rice")?.id ?? mockProducts[0]?.id ?? "p-1";
const dishChicken = findDish("chicken")?.id ?? mockProducts[1]?.id ?? "p-2";

export const mockDishRecipes: DishRecipe[] = [
  {
    id: "rec-1",
    dishId: dishRice,
    lines: [
      { stockItemId: "si-1", qtyPerServing: 0.15, unitId: "unit-kg" }, // 150g rice
    ],
    updatedAt: now,
  },
  {
    id: "rec-2",
    dishId: dishChicken,
    lines: [
      { stockItemId: "si-2", qtyPerServing: 0.25, unitId: "unit-kg" }, // 250g chicken
      { stockItemId: "si-1", qtyPerServing: 0.10, unitId: "unit-kg" }, // 100g rice
    ],
    updatedAt: now,
  },
];

export const mockStockMovements: StockMovement[] = [
  ...mockStockItems.map((si) => ({
    id: `mv-open-${si.id}`,
    date: now,
    type: "opening",
    stockItemId: si.id,
    qtyIn: si.openingQty,
    qtyOut: 0,
    rate: si.openingRate,
    value: si.openingValue,
    note: "Opening Stock",
    createdAt: now,
  })),
];

export const mockSupplierTransactions: SupplierTransaction[] = [
  {
    id: "stx-1",
    supplierId: "sup-1",
    date: now,
    type: "purchase",
    amount: 1200,
    note: "Initial purchase",
    reference: "INV-1001",
    createdAt: now,
  },
  {
    id: "stx-2",
    supplierId: "sup-1",
    date: now,
    type: "payment",
    amount: 600,
    note: "Paid cash",
    reference: "PAY-2001",
    createdAt: now,
  },
];
