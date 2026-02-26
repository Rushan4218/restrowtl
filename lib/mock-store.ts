/**
 * In-Memory Mock Store for Tables and Reservations
 * Simulates database behavior with realistic timing
 */

import type {
  TimelineTable,
  TimelineReservation,
  ReservationType,
} from "@/types/reservation-timeline";
import type { RestaurantTable } from "@/types";

// In-memory storage
let tables: Map<string, TimelineTable> = new Map();
let reservations: Map<string, TimelineReservation> = new Map();
let lastModified: Map<string, number> = new Map();

// Initialize with mock data on first load
let initialized = false;

export const mockStore = {
  /**
   * Initialize mock data
   */
  initialize() {
    if (initialized) return;

    // Mock tables with default reservation durations (15 minutes = 1 grid slot)
    const mockTables: TimelineTable[] = [
      {
        id: "table-1",
        name: "Table 1",
        capacity: 2,
        isEnabled: true,
        token: "token-1",
        defaultReservationDuration: 15,
        isAvailableForReservations: true,
      },
      {
        id: "table-2",
        name: "Table 2",
        capacity: 4,
        isEnabled: true,
        token: "token-2",
        defaultReservationDuration: 15,
        isAvailableForReservations: true,
      },
      {
        id: "table-3",
        name: "Table 3",
        capacity: 6,
        isEnabled: true,
        token: "token-3",
        defaultReservationDuration: 15,
        isAvailableForReservations: true,
      },
      {
        id: "table-4",
        name: "Table 4 (Bar)",
        capacity: 2,
        isEnabled: true,
        token: "token-4",
        defaultReservationDuration: 15,
        isAvailableForReservations: true,
      },
      {
        id: "table-5",
        name: "Table 5 (Lounge)",
        capacity: 8,
        isEnabled: true,
        token: "token-5",
        defaultReservationDuration: 15,
        isAvailableForReservations: true,
      },
    ];

    mockTables.forEach((table) => {
      tables.set(table.id, table);
      lastModified.set(`table-${table.id}`, Date.now());
    });

    // Mock reservations for today
    const today = new Date().toISOString().split("T")[0];
    const mockReservations: TimelineReservation[] = [
      {
        id: "res-1",
        tableId: "table-1",
        tableName: "Table 1",
        guestCount: 2,
        customerName: "John Doe",
        reservationType: "reserved" as ReservationType,
        startTime: `${today}T11:00:00Z`,
        endTime: `${today}T12:00:00Z`,
        durationMinutes: 60,
        notes: "Anniversary dinner",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "res-2",
        tableId: "table-2",
        tableName: "Table 2",
        guestCount: 4,
        customerName: "Jane Smith",
        reservationType: "online_booking" as ReservationType,
        startTime: `${today}T12:00:00Z`,
        endTime: `${today}T13:00:00Z`,
        durationMinutes: 60,
        notes: "Business meeting",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "res-3",
        tableId: "table-1",
        tableName: "Table 1",
        guestCount: 2,
        customerName: "Walk-in Group",
        reservationType: "walk_in" as ReservationType,
        startTime: `${today}T14:00:00Z`,
        endTime: `${today}T15:00:00Z`,
        durationMinutes: 60,
        notes: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockReservations.forEach((res) => {
      reservations.set(res.id, res);
      lastModified.set(`reservation-${res.id}`, Date.now());
    });

    initialized = true;
  },

  /**
   * Simulate network delay (500-800ms)
   */
  async simulateDelay(error = false) {
    const delay = Math.random() * 300 + 500; // 500-800ms
    if (error) {
      // Occasionally fail (5% chance)
      if (Math.random() < 0.05) {
        throw new Error("Simulated network error");
      }
    }
    return new Promise((resolve) => setTimeout(resolve, delay));
  },

  // ===== TABLES =====

  async getTables(): Promise<TimelineTable[]> {
    this.initialize();
    await this.simulateDelay();
    return Array.from(tables.values());
  },

  async getTableById(id: string): Promise<TimelineTable | null> {
    this.initialize();
    await this.simulateDelay();
    return tables.get(id) || null;
  },

  async updateTable(id: string, updates: Partial<TimelineTable>): Promise<TimelineTable> {
    this.initialize();
    await this.simulateDelay();

    const table = tables.get(id);
    if (!table) {
      throw new Error(`Table ${id} not found`);
    }

    const updated: TimelineTable = { ...table, ...updates };
    tables.set(id, updated);
    lastModified.set(`table-${id}`, Date.now());
    return updated;
  },

  async deleteTable(id: string): Promise<void> {
    this.initialize();
    await this.simulateDelay();

    if (!tables.has(id)) {
      throw new Error(`Table ${id} not found`);
    }

    tables.delete(id);
    lastModified.delete(`table-${id}`);

    // Delete related reservations
    reservations.forEach((res, resId) => {
      if (res.tableId === id) {
        reservations.delete(resId);
        lastModified.delete(`reservation-${resId}`);
      }
    });
  },

  // ===== RESERVATIONS =====

  async getReservations(date?: string): Promise<TimelineReservation[]> {
    this.initialize();
    await this.simulateDelay();

    let result = Array.from(reservations.values());

    if (date) {
      result = result.filter((r) => r.startTime.startsWith(date));
    }

    return result;
  },

  async getReservationById(id: string): Promise<TimelineReservation | null> {
    this.initialize();
    await this.simulateDelay();
    return reservations.get(id) || null;
  },

  async createReservation(
    reservation: Omit<TimelineReservation, "id" | "createdAt" | "updatedAt">
  ): Promise<TimelineReservation> {
    this.initialize();
    await this.simulateDelay();

    const id = `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newReservation: TimelineReservation = {
      ...reservation,
      id,
      createdAt: now,
      updatedAt: now,
    };

    reservations.set(id, newReservation);
    lastModified.set(`reservation-${id}`, Date.now());
    return newReservation;
  },

  async updateReservation(
    id: string,
    updates: Partial<Omit<TimelineReservation, "id" | "createdAt">>
  ): Promise<TimelineReservation> {
    this.initialize();
    await this.simulateDelay();

    const reservation = reservations.get(id);
    if (!reservation) {
      throw new Error(`Reservation ${id} not found`);
    }

    const updated: TimelineReservation = {
      ...reservation,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    reservations.set(id, updated);
    lastModified.set(`reservation-${id}`, Date.now());
    return updated;
  },

  async deleteReservation(id: string): Promise<void> {
    this.initialize();
    await this.simulateDelay();

    if (!reservations.has(id)) {
      throw new Error(`Reservation ${id} not found`);
    }

    reservations.delete(id);
    lastModified.delete(`reservation-${id}`);
  },

  /**
   * Get all reservations for a specific table on a specific date
   */
  async getTableReservations(
    tableId: string,
    date: string
  ): Promise<TimelineReservation[]> {
    this.initialize();
    await this.simulateDelay();

    return Array.from(reservations.values()).filter(
      (r) => r.tableId === tableId && r.startTime.startsWith(date)
    );
  },

  /**
   * Reset mock store (for testing)
   */
  reset() {
    tables.clear();
    reservations.clear();
    lastModified.clear();
    initialized = false;
  },
};
