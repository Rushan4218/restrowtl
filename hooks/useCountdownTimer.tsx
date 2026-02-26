"use client";

/**
 * Format seconds into MM:SS display format
 * Example: 300 seconds → "5:00"
 */
export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Determine time warning level based on remaining seconds
 * - "danger" (red): < 1 minute remaining
 * - "warning" (yellow): < 2 minutes remaining
 * - "normal" (green): > 2 minutes remaining
 */
export function getTimeWarningLevel(
  seconds: number
): "danger" | "warning" | "normal" {
  if (seconds < 60) return "danger";
  if (seconds < 120) return "warning";
  return "normal";
}

/**
 * Get color class based on warning level
 */
export function getTimeWarningColor(level: "danger" | "warning" | "normal"): string {
  switch (level) {
    case "danger":
      return "text-red-600";
    case "warning":
      return "text-yellow-600";
    default:
      return "text-green-600";
  }
}

/**
 * Get background color for time warning
 */
export function getTimeWarningBgColor(level: "danger" | "warning" | "normal"): string {
  switch (level) {
    case "danger":
      return "bg-red-50";
    case "warning":
      return "bg-yellow-50";
    default:
      return "bg-green-50";
  }
}

/**
 * Determine if time is critically low
 */
export function isTimeCritical(seconds: number): boolean {
  return seconds < 60;
}

/**
 * Get visual indicator (pulse animation) based on time remaining
 */
export function shouldPulseAnimation(seconds: number): boolean {
  return seconds < 120; // Start pulsing when less than 2 minutes
}
