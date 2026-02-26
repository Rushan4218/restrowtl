export type GeneratedOrder = {
  id: string;
  tableId: string;
  status: string;
  orderType: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const statuses = ["pending","acknowledged","served","paid","cancelled"];
const orderTypes = ["dine_in","takeaway","delivery"];

function randomDateWithinMonths(monthsBack = 4) {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - monthsBack);
  const timestamp = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(timestamp);
}

export function generateBulkOrders(count = 1200): GeneratedOrder[] {
  const orders: GeneratedOrder[] = [];

  for (let i = 0; i < count; i++) {
    const createdAt = randomDateWithinMonths(4);
    const itemCount = random(1, 5);

    const items = Array.from({ length: itemCount }).map((_, index) => {
      const price = random(200, 1500);
      const quantity = random(1, 3);
      return {
        id: `item-${i}-${index}`,
        name: `Product ${random(1, 20)}`,
        quantity,
        price,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.13);
    const total = subtotal + tax;

    orders.push({
      id: `bulk-${i}`,
      tableId: `T-${random(1, 20)}`,
      status: pick(statuses),
      orderType: pick(orderTypes),
      items,
      subtotal,
      tax,
      total,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  }

  return orders;
}