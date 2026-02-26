import type { Order, OrderItem } from "@/types";

export interface PricingBreakdown {
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
}

export interface CalculationParams {
  items: OrderItem[];
  discountPercent?: number;
  taxPercent?: number;
  serviceChargePercent?: number;
  guestCount?: number;
}

/**
 * Calculate subtotal from items
 */
export function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  subtotal: number,
  discountPercent: number = 0
): number {
  if (discountPercent < 0 || discountPercent > 100) return 0;
  return Math.round((subtotal * discountPercent) / 100 * 100) / 100;
}

/**
 * Calculate tax amount (applies to subtotal after discount)
 */
export function calculateTax(
  subtotal: number,
  discountAmount: number,
  taxPercent: number = 0
): number {
  if (taxPercent < 0 || taxPercent > 100) return 0;
  const taxableAmount = subtotal - discountAmount;
  return Math.round((taxableAmount * taxPercent) / 100 * 100) / 100;
}

/**
 * Calculate service charge (usually on subtotal before tax)
 */
export function calculateServiceCharge(
  subtotal: number,
  serviceChargePercent: number = 0
): number {
  if (serviceChargePercent < 0 || serviceChargePercent > 100) return 0;
  return Math.round((subtotal * serviceChargePercent) / 100 * 100) / 100;
}

/**
 * Complete pricing calculation
 */
export function calculatePricing(params: CalculationParams): PricingBreakdown {
  const subtotal = calculateSubtotal(params.items);
  const discount = calculateDiscount(subtotal, params.discountPercent || 0);
  const tax = calculateTax(subtotal, discount, params.taxPercent || 0);
  const serviceCharge = calculateServiceCharge(subtotal, params.serviceChargePercent || 0);
  
  const total = subtotal - discount + tax + serviceCharge;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    serviceCharge: Math.round(serviceCharge * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Calculate per-person cost
 */
export function calculatePerPersonCost(
  total: number,
  guestCount: number = 1
): number {
  if (guestCount < 1) return total;
  return Math.round((total / guestCount) * 100) / 100;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Validate quantity
 */
export function isValidQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1;
}

/**
 * Create updated order with new items and pricing
 */
export function createUpdatedOrder(
  originalOrder: Order,
  updatedItems: OrderItem[],
  params: Partial<CalculationParams> = {}
): Order {
  const pricing = calculatePricing({
    items: updatedItems,
    discountPercent: params.discountPercent,
    taxPercent: params.taxPercent || 10, // Default 10% tax
    serviceChargePercent: params.serviceChargePercent || 0,
    guestCount: params.guestCount,
  });

  return {
    ...originalOrder,
    items: updatedItems,
    total: pricing.total,
    subtotal: pricing.subtotal,
    taxAmount: pricing.tax,
  };
}
