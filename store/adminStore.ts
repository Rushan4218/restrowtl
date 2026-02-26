import { create } from "zustand";
import { RestaurantTable, Reservation, Order } from "@/types";

export interface AdminState {
  // Timeline data
  tables: RestaurantTable[];
  reservations: Reservation[];
  orders: Order[];
  selectedDate: Date;

  // UI state
  selectedReservationId: string | null;
  isOrderPanelOpen: boolean;
  isConfirmModalOpen: boolean;

  // Drag state
  draggedReservationId: string | null;
  targetTableId: string | null;

  // Loading state
  isLoading: boolean;

  // Actions
  setTables: (tables: RestaurantTable[]) => void;
  setReservations: (reservations: Reservation[]) => void;
  setOrders: (orders: Order[]) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedReservation: (id: string | null) => void;
  setOrderPanelOpen: (open: boolean) => void;
  setConfirmModalOpen: (open: boolean) => void;
  setDraggedReservation: (id: string | null) => void;
  setTargetTable: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;

  // Business logic
  exchangeTable: (reservationId: string, newTableId: string) => void;
  updateOrderItems: (orderId: string, items: any[]) => void;
  markOrderServed: (orderId: string) => void;
  markOrderCompleted: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  tables: [],
  reservations: [],
  orders: [],
  selectedDate: new Date(),
  selectedReservationId: null,
  isOrderPanelOpen: false,
  isConfirmModalOpen: false,
  draggedReservationId: null,
  targetTableId: null,
  isLoading: false,

  setTables: (tables) => set({ tables }),
  setReservations: (reservations) => set({ reservations }),
  setOrders: (orders) => set({ orders }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedReservation: (id) => set({ selectedReservationId: id }),
  setOrderPanelOpen: (open) => set({ isOrderPanelOpen: open }),
  setConfirmModalOpen: (open) => set({ isConfirmModalOpen: open }),
  setDraggedReservation: (id) => set({ draggedReservationId: id }),
  setTargetTable: (id) => set({ targetTableId: id }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  exchangeTable: (reservationId, newTableId) =>
    set((state) => {
      const reservation = state.reservations.find((r) => r.id === reservationId);
      const newTable = state.tables.find((t) => t.id === newTableId);

      if (!reservation || !newTable) return state;

      // Update reservation with new table
      const updatedReservations = state.reservations.map((r) =>
        r.id === reservationId
          ? {
              ...r,
              tableId: newTableId,
              tableName: newTable.name,
            }
          : r
      );

      // Update orders associated with this reservation's table
      const updatedOrders = state.orders.map((o) =>
        o.tableId === reservation.tableId
          ? {
              ...o,
              tableId: newTableId,
              tableName: newTable.name,
            }
          : o
      );

      return {
        reservations: updatedReservations,
        orders: updatedOrders,
        draggedReservationId: null,
        targetTableId: null,
      };
    }),

  updateOrderItems: (orderId, items) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              items,
              total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
            }
          : o
      ),
    })),

  markOrderServed: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: "served" as const } : o
      ),
    })),

  markOrderCompleted: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: "completed" as const } : o
      ),
    })),

  cancelOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: "cancelled" as const } : o
      ),
    })),
}));
