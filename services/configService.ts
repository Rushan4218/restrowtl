import { simulateDelay } from "./api";

const BELL_REASONS_KEY = "restrohub_bell_reasons";

const defaultBellReasons = [
  "Water",
  "Menu",
  "Bill",
  "Assistance",
  "Other",
];

export async function getBellReasons(): Promise<string[]> {
  await simulateDelay(50);
  if (typeof window === "undefined") return defaultBellReasons;
  
  try {
    const data = localStorage.getItem(BELL_REASONS_KEY);
    if (data) {
      const reasons = JSON.parse(data);
      return reasons.length > 0 ? reasons : defaultBellReasons;
    }
    // Seed with defaults
    localStorage.setItem(BELL_REASONS_KEY, JSON.stringify(defaultBellReasons));
    return defaultBellReasons;
  } catch {
    return defaultBellReasons;
  }
}

export async function saveBellReasons(reasons: string[]): Promise<void> {
  await simulateDelay(50);
  if (typeof window === "undefined") return;
  localStorage.setItem(BELL_REASONS_KEY, JSON.stringify(reasons));
}
