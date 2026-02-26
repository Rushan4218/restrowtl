/**
 * Reservation Validation Logic
 * Handles overlap detection, grid alignment, and business hours validation
 */

import {
  isoToSlotIndex,
  slotSpanToDuration,
  isSameDay,
  snapToGrid,
  timeToMinutes,
} from "./time-grid-utils";
import type {
  TimelineReservation,
  TimelineTable,
} from "@/types/reservation-timeline";

export interface ValidationError {
  code: string;
  message: string;
}

/**
 * Check if a reservation overlaps with any existing reservations
 * Returns true if overlap detected
 */
export function hasOverlap(
  newStart: string, // ISO 8601
  newEnd: string, // ISO 8601
  existingReservations: TimelineReservation[],
  excludeReservationId?: string
): boolean {
  const newStartMs = new Date(newStart).getTime();
  const newEndMs = new Date(newEnd).getTime();

  return existingReservations.some((existing) => {
    if (excludeReservationId && existing.id === excludeReservationId) {
      return false;
    }

    const existingStartMs = new Date(existing.startTime).getTime();
    const existingEndMs = new Date(existing.endTime).getTime();

    // Overlap condition: newStart < existingEnd AND newEnd > existingStart
    return newStartMs < existingEndMs && newEndMs > existingStartMs;
  });
}

/**
 * Validate that reservation times are within business hours
 */
export function isWithinBusinessHours(
  startTime: string,
  endTime: string,
  openTimeStr: string,
  closeTimeStr: string
): boolean {
  const startMinutes = timeToMinutes(startTime.split("T")[1].substring(0, 5));
  const endMinutes = timeToMinutes(endTime.split("T")[1].substring(0, 5));
  const openMinutes = timeToMinutes(openTimeStr);
  const closeMinutes = timeToMinutes(closeTimeStr);

  // Handle edge case where close time is next day (e.g., 23:00 to 02:00)
  if (closeMinutes < openMinutes) {
    return startMinutes >= openMinutes || startMinutes < closeMinutes;
  }

  return startMinutes >= openMinutes && endMinutes <= closeMinutes;
}

/**
 * Validate that start and end times are on the same 15-minute grid
 */
export function isGridAligned(startTime: string, endTime: string): boolean {
  const startSlot = isoToSlotIndex(startTime);
  const endSlot = isoToSlotIndex(endTime);

  // Check if both convert cleanly
  return (
    startTime.split("T")[1].substring(3, 5) === "00" &&
    endTime.split("T")[1].substring(3, 5) === "00"
  );
}

/**
 * Validate reservation matches table's default duration
 */
export function matchesTableDuration(
  startTime: string,
  endTime: string,
  tableDuration: number
): boolean {
  const actualDuration =
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60;
  return actualDuration === tableDuration;
}

/**
 * Calculate end time from start time and duration
 */
export function calculateEndTime(
  startTime: string,
  durationMinutes: number
): string {
  const startMs = new Date(startTime).getTime();
  const endMs = startMs + durationMinutes * 60 * 1000;
  return new Date(endMs).toISOString();
}

/**
 * Main validation function
 */
export function validateReservation(
  startTime: string,
  endTime: string,
  table: TimelineTable,
  existingReservations: TimelineReservation[],
  openTime: string,
  closeTime: string,
  excludeReservationId?: string
): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Check grid alignment
  if (!isGridAligned(startTime, endTime)) {
    errors.push({
      code: "NOT_GRID_ALIGNED",
      message: "Reservation times must align to 15-minute grid (minutes must be :00 or :15 or :30 or :45)",
    });
  }

  // Check business hours
  if (!isWithinBusinessHours(startTime, endTime, openTime, closeTime)) {
    errors.push({
      code: "OUTSIDE_BUSINESS_HOURS",
      message: `Reservation must be within business hours (${openTime} - ${closeTime})`,
    });
  }

  // Check duration matches table default
  if (!matchesTableDuration(startTime, endTime, table.defaultReservationDuration)) {
    errors.push({
      code: "INVALID_DURATION",
      message: `Reservation duration must be ${table.defaultReservationDuration} minutes`,
    });
  }

  // Check for overlaps with same table
  if (hasOverlap(startTime, endTime, existingReservations, excludeReservationId)) {
    errors.push({
      code: "OVERLAP_DETECTED",
      message: "Reservation overlaps with existing reservation on this table",
    });
  }

  // Check same day
  if (!isSameDay(startTime, endTime)) {
    errors.push({
      code: "CROSS_DAY",
      message: "Reservation cannot span multiple days",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a slot is available for booking
 */
export function isSlotAvailable(
  slotIndex: number,
  tableId: string,
  date: string,
  reservations: TimelineReservation[]
): boolean {
  const tableReservations = reservations.filter((r) => r.tableId === tableId);

  for (const reservation of tableReservations) {
    if (isSameDay(reservation.startTime, `${date}T00:00:00Z`)) {
      const resStartSlot = isoToSlotIndex(reservation.startTime);
      const resEndSlot = isoToSlotIndex(reservation.endTime);

      if (slotIndex >= resStartSlot && slotIndex < resEndSlot) {
        return false;
      }
    }
  }

  return true;
}
