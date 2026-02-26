import { RestaurantTable, Reservation, Order, OrderItem } from "@/types";

// Mock restaurant tables - 8 tables with 1 disabled
export const mockTables: RestaurantTable[] = [
  {
    id: "table-1",
    name: "Table 1",
    capacity: 2,
    isEnabled: true,
    token: "qr-token-1",
  },
  {
    id: "table-2",
    name: "Table 2",
    capacity: 2,
    isEnabled: true,
    token: "qr-token-2",
  },
  {
    id: "table-3",
    name: "Table 3",
    capacity: 4,
    isEnabled: true,
    token: "qr-token-3",
  },
  {
    id: "table-4",
    name: "Table 4",
    capacity: 4,
    isEnabled: true,
    token: "qr-token-4",
  },
  {
    id: "table-5",
    name: "Table 5",
    capacity: 6,
    isEnabled: true,
    token: "qr-token-5",
  },
  {
    id: "table-6",
    name: "Table 6",
    capacity: 6,
    isEnabled: false, // This table is disabled for reservations
    token: "qr-token-6",
  },
  {
    id: "table-7",
    name: "Table 7",
    capacity: 8,
    isEnabled: true,
    token: "qr-token-7",
  },
  {
    id: "table-8",
    name: "Table 8",
    capacity: 8,
    isEnabled: true,
    token: "qr-token-8",
  },
];

// Mock reservations for 2026-02-20 (business hours: 3am-11pm)
export const mockReservations: Reservation[] = [
  {
    id: "res-1",
    tableId: "table-1",
    tableName: "Table 1",
    customerName: "Walk-in",
    guestCount: 2,
    startTime: "2026-02-20T09:00:00",
    endTime: "2026-02-20T10:30:00",
    status: "active",
    notes: "Walk-in",
  },
  {
    id: "res-2",
    tableId: "table-3",
    tableName: "Table 3",
    customerName: "Walk-in",
    guestCount: 2,
    startTime: "2026-02-20T12:00:00",
    endTime: "2026-02-20T13:30:00",
    status: "active",
    notes: "Walk-in",
  },
  {
    id: "res-3",
    tableId: "table-5",
    tableName: "Table 5",
    customerName: "Johnson Party",
    guestCount: 4,
    startTime: "2026-02-20T18:00:00",
    endTime: "2026-02-20T19:45:00",
    status: "active",
    notes: "Dinner reservation",
  },
  {
    id: "res-4",
    tableId: "table-7",
    tableName: "Table 7",
    customerName: "Walk-in",
    guestCount: 1,
    startTime: "2026-02-20T15:00:00",
    endTime: "2026-02-20T16:00:00",
    status: "active",
    notes: "Walk-in",
  },
  {
    id: "res-5",
    tableId: "table-2",
    tableName: "Table 2",
    customerName: "Late Night Guest",
    guestCount: 3,
    startTime: "2026-02-20T20:00:00",
    endTime: "2026-02-20T22:00:00",
    status: "active",
    notes: "Late dinner",
  },
  {
    id: "res-6",
    tableId: "table-4",
    tableName: "Table 4",
    customerName: "Early Breakfast",
    guestCount: 2,
    startTime: "2026-02-20T07:00:00",
    endTime: "2026-02-20T08:30:00",
    status: "active",
    notes: "Early breakfast",
  },
];

// Mock orders (business hours: 3am-11pm)
export const mockOrders: Order[] = [
  {
    id: "order-1",
    tableId: "table-1",
    tableName: "Table 1",
    items: [
      {
        productId: "prod-1",
        productName: "Espresso",
        quantity: 1,
        price: 3.5,
      },
      {
        productId: "prod-2",
        productName: "Croissant",
        quantity: 1,
        price: 4.0,
      },
    ],
    status: "acknowledged",
    total: 7.5,
    createdAt: "2026-02-20T09:10:00",
    kotNumber: 1,
  },
  {
    id: "order-2",
    tableId: "table-3",
    tableName: "Table 3",
    items: [
      {
        productId: "prod-3",
        productName: "Cappuccino",
        quantity: 2,
        price: 4.5,
      },
      {
        productId: "prod-4",
        productName: "Sandwich",
        quantity: 1,
        price: 8.0,
      },
    ],
    status: "acknowledged",
    total: 17.0,
    createdAt: "2026-02-20T12:15:00",
    kotNumber: 2,
  },
  {
    id: "order-3",
    tableId: "table-5",
    tableName: "Table 5",
    items: [
      {
        productId: "prod-5",
        productName: "Grilled Salmon",
        quantity: 2,
        price: 22.0,
      },
      {
        productId: "prod-6",
        productName: "House Wine",
        quantity: 1,
        price: 18.0,
      },
      {
        productId: "prod-7",
        productName: "Tiramisu",
        quantity: 2,
        price: 7.5,
      },
    ],
    status: "acknowledged",
    total: 77.0,
    createdAt: "2026-02-20T18:05:00",
    kotNumber: 3,
  },
  {
    id: "order-4",
    tableId: "table-7",
    tableName: "Table 7",
    items: [
      {
        productId: "prod-8",
        productName: "Americano",
        quantity: 1,
        price: 3.0,
      },
      {
        productId: "prod-9",
        productName: "Brownie",
        quantity: 1,
        price: 5.5,
      },
    ],
    status: "acknowledged",
    total: 8.5,
    createdAt: "2026-02-20T15:10:00",
    kotNumber: 4,
  },
];

export const generateMockDataForDate = (date: Date) => {
  return {
    tables: mockTables,
    reservations: mockReservations,
    orders: mockOrders,
  };
};
