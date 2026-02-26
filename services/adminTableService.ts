import { RestaurantTable, Reservation } from "@/types";
import { generateMockDataForDate } from "@/lib/mockAdminData";

export const adminTableService = {
  async getTables(): Promise<RestaurantTable[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const data = generateMockDataForDate(new Date("2026-02-20"));
    return data.tables;
  },

  async getReservations(date: string): Promise<Reservation[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const dateObj = new Date(date);
    const data = generateMockDataForDate(dateObj);
    return data.reservations;
  },

  async updateReservationTable(
    reservationId: string,
    newTableId: string,
    newTableName: string
  ): Promise<Reservation | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock response - in real app this would update backend
    const reservation: Reservation = {
      id: reservationId,
      tableId: newTableId,
      guestCount: 2,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      notes: "Moved to " + newTableName,
    };
    return reservation;
  },
};
