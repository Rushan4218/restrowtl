"use client";

import { useEffect, useState, useCallback } from "react";
import {
  createTableLock,
  getTableLock,
  releaseTableLock,
  verifyTableLockOwnership,
  completeTableLockPayment,
} from "@/services/tableLockService";
import type { TableLock } from "@/types";

interface UseTableLockReturn {
  lock: TableLock | null;
  isLocked: boolean;
  isLoading: boolean;
  error: string | null;
  timeRemaining: number; // seconds
  lockTable: (tableId: string) => Promise<TableLock>;
  releaseTable: () => Promise<void>;
  completePayment: () => Promise<void>;
}

/**
 * useTableLock Hook
 *
 * Manages table locking with 5-minute countdown timer.
 * Automatically releases lock on expiration.
 * Handles race conditions through re-verification.
 *
 * Usage:
 * ```typescript
 * const { lock, lockTable, timeRemaining, isLocked } = useTableLock();
 *
 * const handleLockTable = async (tableId: string) => {
 *   try {
 *     const lock = await lockTable(tableId);
 *     console.log("Table locked:", lock);
 *   } catch (err) {
 *     console.error("Lock failed:", err);
 *   }
 * };
 * ```
 */
export function useTableLock(): UseTableLockReturn {
  const [lock, setLock] = useState<TableLock | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Calculate time remaining from lock expiration
  const calculateTimeRemaining = useCallback((expiresAt: string): number => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
    return diff;
  }, []);

  // Lock a table
  const lockTable = useCallback(
    async (tableId: string): Promise<TableLock> => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Check if table is already locked
        const existingLock = await getTableLock(tableId);
        if (existingLock) {
          throw new Error(
            "This table is already reserved. Please wait 5 minutes or choose another table."
          );
        }

        // Step 2: Generate temporary user ID
        const temporaryUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Step 3: Create lock
        const newLock = await createTableLock(tableId, temporaryUserId);

        // Step 4: Store in sessionStorage for persistence
        const sessionData = {
          lockId: newLock.id,
          tableId: newLock.tableId,
          temporaryUserId: newLock.temporaryUserId,
          expiresAt: newLock.expiresAt,
        };
        sessionStorage.setItem("tableLock", JSON.stringify(sessionData));

        setLock(newLock);
        setTimeRemaining(calculateTimeRemaining(newLock.expiresAt));

        return newLock;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to lock table. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [calculateTimeRemaining]
  );

  // Release table lock
  const releaseTable = useCallback(async (): Promise<void> => {
    if (!lock) return;

    try {
      await releaseTableLock(lock.id);
      setLock(null);
      setTimeRemaining(0);
      sessionStorage.removeItem("tableLock");
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to release table";
      setError(errorMessage);
      throw err;
    }
  }, [lock]);

  // Complete payment (immediate release + mark as paid)
  const completePayment = useCallback(async (): Promise<void> => {
    if (!lock) return;

    try {
      await completeTableLockPayment(lock.id);
      setLock(null);
      setTimeRemaining(0);
      sessionStorage.removeItem("tableLock");
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete payment";
      setError(errorMessage);
      throw err;
    }
  }, [lock]);

  // Restore lock from sessionStorage on mount
  useEffect(() => {
    const savedLockData = sessionStorage.getItem("tableLock");
    if (savedLockData) {
      try {
        const data = JSON.parse(savedLockData);
        getTableLock(data.tableId).then((existingLock) => {
          if (existingLock) {
            setLock(existingLock);
            setTimeRemaining(calculateTimeRemaining(existingLock.expiresAt));
          } else {
            sessionStorage.removeItem("tableLock");
          }
        });
      } catch (err) {
        console.error("[v0] Failed to restore lock:", err);
        sessionStorage.removeItem("tableLock");
      }
    }
  }, [calculateTimeRemaining]);

  // Countdown timer
  useEffect(() => {
    if (!lock) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(lock.expiresAt);
      setTimeRemaining(remaining);

      // Auto-release when countdown reaches 0
      if (remaining <= 0) {
        clearInterval(interval);
        releaseTableLock(lock.id)
          .then(() => {
            setLock(null);
            sessionStorage.removeItem("tableLock");
          })
          .catch((err) => {
            console.error("[v0] Failed to auto-release lock:", err);
          });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lock]);

  // Verify lock ownership periodically (prevent race conditions)
  useEffect(() => {
    if (!lock) return;

    const verifyInterval = setInterval(async () => {
      try {
        const isOwner = await verifyTableLockOwnership(
          lock.tableId,
          lock.temporaryUserId
        );
        if (!isOwner) {
          setLock(null);
          setError("Your table lock has been released.");
          sessionStorage.removeItem("tableLock");
        }
      } catch (err) {
        console.error("[v0] Lock verification failed:", err);
      }
    }, 10000); // Verify every 10 seconds

    return () => clearInterval(verifyInterval);
  }, [lock]);

  return {
    lock,
    isLocked: lock !== null,
    isLoading,
    error,
    timeRemaining,
    lockTable,
    releaseTable,
    completePayment,
  };
}
