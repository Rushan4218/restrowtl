import { Order, OrderItem, Reservation } from "@/types";
import { simulateDelay, generateId } from "./api";
import { useAdminStore } from "@/store/adminStore";
import { getProducts } from "./productService";

type CreateReservationOrderInput = {
  tableId: string;
  tableName: string;
  customerName: string;
  guestCount: number;
  startTime: string; // ISO or local ISO-like used in project
  endTime: string;
  items: Array<{ productId: string; quantity: number }>;
};

export const adminReservationOrderService = {
  /**
   * Creates BOTH reservation + order (mock API), and updates admin store.
   * Keeps the same "mock service" style as the rest of the project.
   */
  async createReservationWithOrder(
    input: CreateReservationOrderInput
  ): Promise<{ reservation: Reservation; order: Order }> {
    await simulateDelay(500);

    const store = useAdminStore.getState();
    const products = await getProducts();
    const productById = new Map(products.map((p) => [p.id, p] as const));

    const normalizedItems: OrderItem[] = input.items
      .filter((i) => i.quantity > 0)
      .map((i) => {
        const prod = productById.get(i.productId);
        return {
          productId: i.productId,
          productName: prod?.name ?? "Unknown item",
          price: prod?.price ?? 0,
          quantity: i.quantity,
        };
      });

    const subtotal = normalizedItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    const nextKot =
      (store.orders.reduce((max, o) => Math.max(max, o.kotNumber ?? 0), 0) || 0) +
      1;

    const reservation: Reservation = {
      id: generateId("res"),
      tableId: input.tableId,
      tableName: input.tableName,
      customerName: input.customerName,
      guestCount: input.guestCount,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "active",
      notes: "Created from timeline",
    };

    const order: Order = {
      id: generateId("order"),
      tableId: input.tableId,
      tableName: input.tableName,
      items: normalizedItems,
      status: "pending_ack",
      total: subtotal,
      createdAt: input.startTime,
      kotNumber: nextKot,
      notes: `Auto-created for reservation ${reservation.id}`,
    };

    // Update store (optimistic)
    useAdminStore.setState((prev) => ({
      reservations: [reservation, ...prev.reservations],
      orders: [order, ...prev.orders],
    }));

    return { reservation, order };
  },
};
