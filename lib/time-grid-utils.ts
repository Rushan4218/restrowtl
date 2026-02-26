/**
 * Time Grid Utility Functions
 * Handles 15-minute grid alignment and slot calculations
 */

const GRID_RESOLUTION_MINUTES = 15;
const MINUTES_PER_DAY = 24 * 60;

/**
 * Convert minutes from start of day to slot index (0-based)
 * Example: 180 minutes (3:00 AM) = slot 12
 */
export function minutesToSlotIndex(minutes: number): number {
  return Math.floor(minutes / GRID_RESOLUTION_MINUTES);
}

/**
 * Convert slot index to minutes from start of day
 */
export function slotIndexToMinutes(slotIndex: number): number {
  return slotIndex * GRID_RESOLUTION_MINUTES;
}

/**
 * Parse time string (HH:mm) to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes from midnight to time string (HH:mm)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Parse ISO datetime string to minutes from start of day
 */
export function isoToMinutes(isoDatetime: string): number {
  const date = new Date(isoDatetime);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours * 60 + minutes;
}

/**
 * Get slot index from ISO datetime
 */
export function isoToSlotIndex(isoDatetime: string): number {
  return minutesToSlotIndex(isoToMinutes(isoDatetime));
}

/**
 * Snap time to nearest 15-minute grid
 */
export function snapToGrid(minutes: number): number {
  return Math.round(minutes / GRID_RESOLUTION_MINUTES) * GRID_RESOLUTION_MINUTES;
}

/**
 * Calculate number of grid slots a duration spans
 * Example: 30 minutes = 2 slots, 45 minutes = 3 slots
 */
export function durationToSlotSpan(durationMinutes: number): number {
  return Math.ceil(durationMinutes / GRID_RESOLUTION_MINUTES);
}

/**
 * Calculate duration in minutes from start and end slot indices
 */
export function slotSpanToDuration(startSlot: number, endSlot: number): number {
  return (endSlot - startSlot) * GRID_RESOLUTION_MINUTES;
}

/**
 * Get grid boundaries (first and last slots) for a given time range
 */
export function getGridBoundaries(
  openTimeStr: string,
  closeTimeStr: string
): { firstSlot: number; lastSlot: number; totalSlots: number } {
  const openMinutes = timeToMinutes(openTimeStr);
  const closeMinutes = timeToMinutes(closeTimeStr);

  const firstSlot = minutesToSlotIndex(openMinutes);
  const lastSlot = minutesToSlotIndex(closeMinutes);

  return {
    firstSlot,
    lastSlot: lastSlot > firstSlot ? lastSlot : firstSlot + 1,
    totalSlots: (lastSlot - firstSlot) * 2, // Approximate
  };
}

/**
 * Create ISO datetime string from date (YYYY-MM-DD) and time (HH:mm)
 */
export function createISO(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00Z`;
}

/**
 * Extract date from ISO datetime
 */
export function getDateFromISO(isoDatetime: string): string {
  return isoDatetime.split("T")[0];
}

/**
 * Extract time from ISO datetime
 */
export function getTimeFromISO(isoDatetime: string): string {
  const time = isoDatetime.split("T")[1];
  return time.substring(0, 5); // HH:mm
}

/**
 * Check if two times fall on the same day (simple check)
 */
export function isSameDay(iso1: string, iso2: string): boolean {
  return getDateFromISO(iso1) === getDateFromISO(iso2);
}

/**
 * Get all slot indices in a range (inclusive)
 */
export function getSlotRange(startSlot: number, endSlot: number): number[] {
  const slots: number[] = [];
  for (let i = startSlot; i < endSlot; i++) {
    slots.push(i);
  }
  return slots;
}

/**
 * Format minutes as human-readable time
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
