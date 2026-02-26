import type { TemporarySession } from "@/types";
import { simulateDelay, generateId } from "./api";

let sessions: TemporarySession[] = [];

const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Create a new temporary session
 */
export async function createTemporarySession(
  tableId: string,
  temporaryUserId: string
): Promise<TemporarySession> {
  await simulateDelay();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  const newSession: TemporarySession = {
    id: generateId("sess"),
    tableId,
    temporaryUserId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    paymentStatus: "pending",
    orders: [],
  };

  sessions.push(newSession);
  return newSession;
}

/**
 * Get session by ID
 */
export async function getSession(
  sessionId: string
): Promise<TemporarySession | null> {
  await simulateDelay();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) return null;

  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    sessions = sessions.filter((s) => s.id !== sessionId);
    return null;
  }

  return session;
}

/**
 * Get session by table ID and user ID
 */
export async function getSessionByTableAndUser(
  tableId: string,
  temporaryUserId: string
): Promise<TemporarySession | null> {
  await simulateDelay();
  const session = sessions.find(
    (s) => s.tableId === tableId && s.temporaryUserId === temporaryUserId
  );

  if (!session) return null;

  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    sessions = sessions.filter((s) => s.id !== session.id);
    return null;
  }

  return session;
}

/**
 * Add order to session
 */
export async function addOrderToSession(
  sessionId: string,
  orderId: string
): Promise<TemporarySession> {
  await simulateDelay();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) throw new Error("Session not found");

  sessions[index] = {
    ...sessions[index],
    orders: [...sessions[index].orders, orderId],
  };

  return sessions[index];
}

/**
 * Mark session payment as completed
 */
export async function completeSessionPayment(
  sessionId: string
): Promise<TemporarySession> {
  await simulateDelay();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) throw new Error("Session not found");

  sessions[index] = { ...sessions[index], paymentStatus: "completed" };
  return sessions[index];
}

/**
 * Link customer to session (when they log in)
 */
export async function linkCustomerToSession(
  sessionId: string,
  customerId: string
): Promise<TemporarySession> {
  await simulateDelay();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) throw new Error("Session not found");

  sessions[index] = { ...sessions[index], customerId };
  return sessions[index];
}

/**
 * Destroy session (on payment complete or manual cancellation)
 */
export async function destroySession(sessionId: string): Promise<void> {
  await simulateDelay();
  sessions = sessions.filter((s) => s.id !== sessionId);
}

/**
 * Get all active sessions
 */
export async function getAllActiveSessions(): Promise<TemporarySession[]> {
  await simulateDelay();
  const now = new Date();
  const activeSessions = sessions.filter(
    (s) => new Date(s.expiresAt) > now && s.paymentStatus !== "completed"
  );

  // Clean up expired sessions
  sessions = sessions.filter((s) => new Date(s.expiresAt) > now);

  return activeSessions;
}

/**
 * Cleanup: Remove expired and completed sessions
 */
export async function cleanupSessions(): Promise<number> {
  await simulateDelay();
  const now = new Date();
  const beforeCount = sessions.length;

  sessions = sessions.filter(
    (s) => new Date(s.expiresAt) > now && s.paymentStatus !== "completed"
  );

  return beforeCount - sessions.length;
}

/**
 * Debug: Clear all sessions
 */
export async function clearAllSessions(): Promise<void> {
  sessions = [];
}
