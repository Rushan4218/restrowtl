// Time formatting and calculations for timeline view

export const TIMELINE_START_HOUR = 3; // 03:00 (3 AM)
export const TIMELINE_END_HOUR = 23; // 23:00 (11 PM)
export const TIMELINE_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR; // 20 hours

// Timeline grid config
export const GRID_MINUTES = 15; // 4 grids per hour
export const GRIDS_PER_HOUR = 60 / GRID_MINUTES; // 4

/**
 * Round UP a Date to the nearest GRID_MINUTES boundary.
 * Examples: 05:12 -> 05:15, 05:16 -> 05:30
 */
export const roundUpToGrid = (date: Date, minutesStep: number = GRID_MINUTES): Date => {
  const d = new Date(date);
  const mins = d.getMinutes();
  const remainder = mins % minutesStep;
  if (remainder === 0) return d;
  d.setMinutes(mins + (minutesStep - remainder), 0, 0);
  return d;
};

/**
 * Convert (x px) into minutes offset within the timeline.
 * - columnWidthPx is the width of 1 hour.
 * - timelineStartHour is TIMELINE_START_HOUR.
 */
export const pxToMinutes = (xPx: number, columnWidthPx: number): number => {
  const minutesPerPx = 60 / columnWidthPx;
  return xPx * minutesPerPx;
};

/**
 * Convert minutes offset into pixels.
 */
export const minutesToPx = (minutes: number, columnWidthPx: number): number => {
  const pxPerMinute = columnWidthPx / 60;
  return minutes * pxPerMinute;
};

/**
 * Local ISO string without timezone (keeps UI times stable when parsing).
 * Example: 2026-02-20T05:15:00
 */
export const toLocalIso = (date: Date): string => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
};

/**
 * Format hour number to 12-hour time format
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Formatted time string (e.g., "12:00", "13:00")
 */
export const formatHourToTime = (hour: number): string => {
  return `${String(hour).padStart(2, "0")}:00`;
};

/**
 * Get current time position as percentage within timeline
 * @returns Percentage (0-100) where current time falls in timeline
 */
export const getCurrentTimePosition = (): number => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInHours = currentHour + currentMinutes / 60;

  if (currentTimeInHours < TIMELINE_START_HOUR) return 0;
  if (currentTimeInHours > TIMELINE_END_HOUR) return 100;

  const position =
    ((currentTimeInHours - TIMELINE_START_HOUR) / TIMELINE_HOURS) * 100;
  return Math.max(0, Math.min(100, position));
};

/**
 * Check if current time is within timeline
 * @returns Boolean indicating if current time is within operational hours
 */
export const isCurrentTimeInTimeline = (): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= TIMELINE_START_HOUR && currentHour < TIMELINE_END_HOUR;
};

/**
 * Calculate reservation duration in minutes
 * @param startTime - ISO string of start time
 * @param endTime - ISO string of end time
 * @returns Duration in minutes
 */
export const getReservationDuration = (
  startTime: string,
  endTime: string
): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / (1000 * 60));
};

/**
 * Format reservation duration for display
 * @param startTime - ISO string of start time
 * @param endTime - ISO string of end time
 * @returns Formatted duration string (e.g., "1h 30m")
 */
export const formatReservationDuration = (
  startTime: string,
  endTime: string
): string => {
  const durationMinutes = getReservationDuration(startTime, endTime);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

/**
 * Format date for display
 * @param date - Date object
 * @returns Formatted date string (e.g., "2026-02-20 (Fri)")
 */
export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

/**
 * Get time string from Date for display
 * @param date - Date object
 * @returns Time string (e.g., "13:45")
 */
export const getTimeString = (date: Date): string => {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

/**
 * Check if reservation time overlaps with another
 * @param reservation1 - First reservation time range
 * @param reservation2 - Second reservation time range
 * @returns Boolean indicating overlap
 */
export const hasTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const r1Start = new Date(start1).getTime();
  const r1End = new Date(end1).getTime();
  const r2Start = new Date(start2).getTime();
  const r2End = new Date(end2).getTime();

  return r1Start < r2End && r1End > r2Start;
};

/**
 * Calculate total bill with tax
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total amount including tax
 */
export const calculateTotal = (subtotal: number, taxRate: number = 0.08): number => {
  return subtotal * (1 + taxRate);
};

/**
 * Calculate tax amount
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Tax amount
 */
export const calculateTax = (subtotal: number, taxRate: number = 0.08): number => {
  return subtotal * taxRate;
};

/**
 * Calculate reservation position and width for timeline display
 * @param reservation - Reservation object with startTime and endTime
 * @param timeStart - Timeline start hour (e.g., 12)
 * @param timeEnd - Timeline end hour (e.g., 17)
 * @param columnWidth - Width of each hour column in pixels (optional)
 * @returns Object with left and width percentages for CSS positioning
 */
export const calculateReservationPosition = (
  reservation: { startTime: string; endTime: string },
  timeStart: number,
  timeEnd: number,
  columnWidth?: number
): { left: string; width: string } => {
  const resStart =
    new Date(reservation.startTime).getHours() +
    new Date(reservation.startTime).getMinutes() / 60;
  const resEnd =
    new Date(reservation.endTime).getHours() +
    new Date(reservation.endTime).getMinutes() / 60;

  // Calculate percentage within timeline
  const startPercent = Math.max(0, resStart - timeStart) / (timeEnd - timeStart);
  const duration = Math.min(timeEnd, resEnd) - Math.max(timeStart, resStart);
  const widthPercent = duration / (timeEnd - timeStart);

  return {
    left: `${startPercent * 100}%`,
    width: `${Math.max(10, widthPercent * 100)}%`,
  };
};
