import { Order } from "@/types";
import { useAdminStore } from "@/store/adminStore";
import { generateMockDataForDate } from "@/lib/mockAdminData";

export const adminOrderService = {
  async getOrders(date: string): Promise<Order[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const dateObj = new Date(date);
    const data = generateMockDataForDate(dateObj);
    return data.orders;
  },

  async updateOrderItems(orderId: string, items: any[]): Promise<Order | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Optimistic update via store
    const store = useAdminStore.getState();
    store.updateOrderItems(orderId, items);

    // Mock response
    const newTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return {
      id: orderId,
      tableId: "",
      items,
      subtotal: newTotal,
      total: newTotal,
      status: "acknowledged",
      createdAt: new Date().toISOString(),
    };
  },

  async markOrderServed(orderId: string): Promise<Order | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Optimistic update via store
    const store = useAdminStore.getState();
    store.markOrderServed(orderId);

    return { id: orderId } as Order;
  },

  async markOrderCompleted(orderId: string): Promise<Order | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Optimistic update via store
    const store = useAdminStore.getState();
    store.markOrderCompleted(orderId);

    return { id: orderId } as Order;
  },

  async cancelOrder(orderId: string): Promise<Order | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Optimistic update via store
    const store = useAdminStore.getState();
    store.cancelOrder(orderId);

    return { id: orderId } as Order;
  },
};
