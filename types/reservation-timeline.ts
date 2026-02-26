/**
 * Timeline Reservation System Types
 * Extends base RestaurantTable with reservation scheduling capabilities
 */

export type ReservationType = "walk_in" | "reserved" | "online_booking";
export type TimelineGridResolution = 15; // minutes

export interface TimelineTable extends RestaurantTable {
  defaultReservationDuration: 15 | 30 | 45 | 60; // minutes
  isAvailableForReservations: boolean;
}

export interface TimelineReservation {
  id: string;
  tableId: string;
  tableName: string;
  guestCount: number;
  customerName: string;
  reservationType: ReservationType;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  durationMinutes: number; // calculated from startTime and endTime
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineDay {
  date: string; // YYYY-MM-DD
  tables: TimelineTable[];
  reservations: TimelineReservation[];
  businessHours: {
    openTime: string; // HH:mm
    closeTime: string; // HH:mm
  };
}

export interface GridSlot {
  slotIndex: number; // 0-based, increments by 15 min
  startMinute: number; // minutes from midnight
  endMinute: number;
  isAvailable: boolean;
  reservation?: TimelineReservation;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Import base types
export { RestaurantTable } from "./index";
