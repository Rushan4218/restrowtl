import type { Order, OrderStatus, CartItem } from "@/types";
import { consumeFromOrder } from "./consumptionService";
import { mockOrders, mockProducts, mockTables } from "@/lib/mock-data";
import { generateBulkOrders } from "../lib/mock-orders-generator";
import { simulateDelay, generateId } from "./api";

const STORAGE_KEY = "restrohub_orders";
const KOT_STORAGE_KEY = "restrohub_kot_counters";

// KOT Logic: Group orders within 10 minutes into same KOT number
function getKOTNumber(tableId: string): number {
  if (typeof window === "undefined") return 1;
  
  const orders = getStoredOrders();
  const tableOrders = orders
    .filter((o) => o.tableId === tableId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  if (tableOrders.length === 0) {
    return 1;
  }
  
  const lastOrder = tableOrders[0];
  const lastOrderTime = new Date(lastOrder.createdAt).getTime();
  const now = Date.now();
  const tenMinutesInMs = 10 * 60 * 1000;
  
  // If last order was within 10 minutes, reuse KOT number
  if (now - lastOrderTime < tenMinutesInMs && lastOrder.kotNumber) {
    return lastOrder.kotNumber;
  }
  
  // Otherwise, increment KOT number
  return (lastOrder.kotNumber || 0) + 1;
}

// Migrate old "pending" status to "pending_ack"
function migrateOrderStatus(order: any): Order {
  if (order.status === "pending") {
    return { ...order, status: "pending_ack" as OrderStatus };
  }
  return order as Order;
}

function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const orders = JSON.parse(data);
      // Migrate any old status values
      const migratedOrders = orders.map(migrateOrderStatus);
      // Save migrated data back
      if (JSON.stringify(orders) !== JSON.stringify(migratedOrders)) {
        saveOrders(migratedOrders);
      }
      return migratedOrders;
    }

    // Seed with curated recent orders + realistic historical distribution.
    // Generation runs once per browser (persisted in localStorage).
    const bulk = generateBulkOrders({
      count: 1200,
      monthsBack: 4,
      products: mockProducts,
      tables: mockTables,
      // Stable per-day seed so refreshes don't reshuffle unless storage is cleared.
      seed: Number(new Date().toISOString().slice(0, 10).replace(/-/g, "")),
      idPrefix: "ord",
    });

    // Keep the hand-crafted “right-now” orders at the top.
    const seeded = [...mockOrders, ...bulk];
    saveOrders(seeded);
    return seeded;
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export async function getOrders(): Promise<Order[]> {
  await simulateDelay();
  const orders = getStoredOrders();
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getOrder(id: string): Promise<Order | undefined> {
  await simulateDelay();
  const orders = getStoredOrders();
  return orders.find((o) => o.id === id);
}

export async function getOrdersByTable(tableId: string): Promise<Order[]> {
  await simulateDelay();
  const orders = getStoredOrders();
  return orders
    .filter((o) => o.tableId === tableId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export interface OrderNotification {
  recipient: "chef" | "receptionist" | "server";
  message: string;
  orderId: string;
  timestamp: string;
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  await simulateDelay();
  const orders = getStoredOrders();
  return orders
    .filter((o) => o.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function createOrder(
  tableId: string,
  tableName: string,
  items: CartItem[],
  customerId?: string,
  notes?: string,
  meta?: Partial<Order>
): Promise<{ order: Order; notifications: OrderNotification[] }> {
  await simulateDelay();
  const orders = getStoredOrders();
  const kotNumber = getKOTNumber(tableId);
  const orderItems = items.map((item) => ({
    productId: item.product.id,
    productName: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
    notes: item.notes, // Include item-level notes if provided
  }));
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = typeof meta?.total === "number" ? meta.total : subtotal;
  const newOrder: Order = {
    ...(meta ?? {}),
    id: generateId("ord"),
    tableId,
    tableName,
    items: orderItems,
    status: "pending_ack",
    total,
    createdAt: new Date().toISOString(),
    customerId,
    kotNumber,
    notes,
  };
  orders.push(newOrder);
  saveOrders(orders);

  const itemsSummary = orderItems
    .map((i) => `${i.quantity}x ${i.productName}${i.notes ? ` (${i.notes})` : ""}`)
    .join(", ");

  const notifications: OrderNotification[] = [
    {
      recipient: "chef",
      message: `New order ${newOrder.id} for ${tableName}: ${itemsSummary}`,
      orderId: newOrder.id,
      timestamp: newOrder.createdAt,
    },
    {
      recipient: "receptionist",
      message: `Order ${newOrder.id} placed at ${tableName} - Total: $${total.toFixed(2)}`,
      orderId: newOrder.id,
      timestamp: newOrder.createdAt,
    },
    {
      recipient: "server",
      message: `Serve order ${newOrder.id} to ${tableName} when ready (${orderItems.length} items)`,
      orderId: newOrder.id,
      timestamp: newOrder.createdAt,
    },
  ];

  return { order: { ...newOrder }, notifications };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  updatedBy?: string
): Promise<Order> {
  await simulateDelay();
  const orders = getStoredOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) throw new Error("Order not found");

  const current = orders[index];

  // Apply auto-consumption exactly once when the order is finalized for production:
// - payment_done (fully paid)
// - completed / served (including credit/partial payments where amount may remain due)
const shouldApplyConsumption =
  (status === "payment_done" || status === "completed" || status === "served") &&
  !current.inventoryApplied;

if (shouldApplyConsumption) {
  const { totalCogs } = await consumeFromOrder(current);
  orders[index] = {
    ...current,
    status,
    updatedBy: updatedBy ?? current.updatedBy,
    inventoryApplied: true,
    inventoryCogs: totalCogs,
  };
  saveOrders(orders);
  return { ...orders[index] };
}

orders[index] = { ...current, status, updatedBy: updatedBy ?? current.updatedBy };

  saveOrders(orders);
  return { ...orders[index] };
}


export async function acknowledgeOrder(id: string): Promise<Order> {
  await simulateDelay();
  const orders = getStoredOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) throw new Error("Order not found");
  orders[index] = {
    ...orders[index],
    status: "acknowledged",
    acknowledgedAt: new Date().toISOString(),
  };
  saveOrders(orders);
  return { ...orders[index] };
}

export async function getTodayOrdersCount(): Promise<number> {
  await simulateDelay();
  const orders = getStoredOrders();
  const today = new Date().toDateString();
  return orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  ).length;
}

export async function getTodayRevenue(): Promise<number> {
  await simulateDelay();
  const orders = getStoredOrders();
  const today = new Date().toDateString();
  return orders
    .filter((o) => new Date(o.createdAt).toDateString() === today)
    .reduce((sum, o) => sum + o.total, 0);
}
