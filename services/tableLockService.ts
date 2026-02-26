import type { TableLock } from "@/types";
import { simulateDelay, generateId } from "./api";

let locks: TableLock[] = [];

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get current lock for a table
 * Returns null if no lock or lock expired
 */
export async function getTableLock(tableId: string): Promise<TableLock | null> {
  await simulateDelay();
  const lock = locks.find((l) => l.tableId === tableId);

  if (!lock) return null;

  // Check if lock expired
  if (new Date(lock.expiresAt) < new Date()) {
    // Auto-delete expired lock
    locks = locks.filter((l) => l.id !== lock.id);
    return null;
  }

  return lock;
}

/**
 * Create a new table lock
 * Checks if table is already locked before creating
 */
export async function createTableLock(
  tableId: string,
  temporaryUserId: string
): Promise<TableLock> {
  await simulateDelay();

  // Check if already locked
  const existingLock = locks.find((l) => l.tableId === tableId);
  if (existingLock && new Date(existingLock.expiresAt) > new Date()) {
    throw new Error(
      `Table ${tableId} is already locked by user ${existingLock.temporaryUserId}`
    );
  }

  // Remove expired lock if exists
  locks = locks.filter(
    (l) => !(l.tableId === tableId && new Date(l.expiresAt) < new Date())
  );

  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_DURATION_MS);

  const newLock: TableLock = {
    id: generateId("lock"),
    tableId,
    temporaryUserId,
    reservationStartTime: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    paymentStatus: "pending",
  };

  locks.push(newLock);
  return newLock;
}

/**
 * Release a table lock
 */
export async function releaseTableLock(lockId: string): Promise<void> {
  await simulateDelay();
  locks = locks.filter((l) => l.id !== lockId);
}

/**
 * Mark lock payment as completed
 */
export async function completeTableLockPayment(
  lockId: string
): Promise<TableLock> {
  await simulateDelay();
  const index = locks.findIndex((l) => l.id === lockId);
  if (index === -1) throw new Error("Lock not found");

  locks[index] = { ...locks[index], paymentStatus: "completed" };
  return locks[index];
}

/**
 * Verify lock is still active for a specific user
 * Used to prevent race conditions
 */
export async function verifyTableLockOwnership(
  tableId: string,
  temporaryUserId: string
): Promise<boolean> {
  await simulateDelay();
  const lock = locks.find((l) => l.tableId === tableId);

  if (!lock) return false;
  if (new Date(lock.expiresAt) < new Date()) return false;
  return lock.temporaryUserId === temporaryUserId;
}

/**
 * Get all active locks (non-expired)
 */
export async function getAllActiveLocks(): Promise<TableLock[]> {
  await simulateDelay();
  const now = new Date();
  const activeLocks = locks.filter((l) => new Date(l.expiresAt) > now);

  // Clean up expired locks
  locks = activeLocks;

  return activeLocks;
}

/**
 * Cleanup: Remove expired locks
 * Can be called periodically as garbage collection
 */
export async function cleanupExpiredLocks(): Promise<number> {
  await simulateDelay();
  const now = new Date();
  const beforeCount = locks.length;

  locks = locks.filter((l) => new Date(l.expiresAt) > now);

  return beforeCount - locks.length;
}

/**
 * Debug: Clear all locks (for testing)
 */
export async function clearAllLocks(): Promise<void> {
  locks = [];
}
