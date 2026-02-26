"use client";

import { useEffect, useState, useCallback } from "react";
import {
  createTemporarySession,
  getSession,
  addOrderToSession,
  destroySession,
  completeSessionPayment,
  linkCustomerToSession,
} from "@/services/sessionService";
import type { TemporarySession } from "@/types";

interface UseTemporarySessionReturn {
  session: TemporarySession | null;
  isSessionActive: boolean;
  isLoading: boolean;
  error: string | null;
  createSession: (tableId: string, temporaryUserId: string) => Promise<TemporarySession>;
  addOrder: (orderId: string) => Promise<void>;
  endSession: () => Promise<void>;
  completePayment: () => Promise<void>;
  linkCustomer: (customerId: string) => Promise<void>;
}

/**
 * useTemporarySession Hook
 *
 * Manages temporary user sessions for table orders.
 * Coordinates with table lock hook.
 * Persists session across page reloads.
 *
 * Usage:
 * ```typescript
 * const { session, createSession, addOrder } = useTemporarySession();
 *
 * const handleOrderConfirm = async (orderId: string) => {
 *   await addOrder(orderId);
 * };
 * ```
 */
export function useTemporarySession(): UseTemporarySessionReturn {
  const [session, setSession] = useState<TemporarySession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new session
  const createSession = useCallback(
    async (tableId: string, temporaryUserId: string): Promise<TemporarySession> => {
      setIsLoading(true);
      setError(null);

      try {
        const newSession = await createTemporarySession(tableId, temporaryUserId);

        // Persist to sessionStorage
        sessionStorage.setItem(
          "temporarySession",
          JSON.stringify({
            id: newSession.id,
            tableId: newSession.tableId,
            temporaryUserId: newSession.temporaryUserId,
            expiresAt: newSession.expiresAt,
          })
        );

        setSession(newSession);
        return newSession;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create session";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Add order to session
  const addOrder = useCallback(
    async (orderId: string): Promise<void> => {
      if (!session) throw new Error("No active session");

      try {
        const updatedSession = await addOrderToSession(session.id, orderId);
        setSession(updatedSession);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add order";
        setError(errorMessage);
        throw err;
      }
    },
    [session]
  );

  // End session (user cancels or timeout)
  const endSession = useCallback(async (): Promise<void> => {
    if (!session) return;

    try {
      await destroySession(session.id);
      setSession(null);
      sessionStorage.removeItem("temporarySession");
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to end session";
      setError(errorMessage);
      throw err;
    }
  }, [session]);

  // Complete payment
  const completePayment = useCallback(async (): Promise<void> => {
    if (!session) return;

    try {
      const completedSession = await completeSessionPayment(session.id);
      setSession(completedSession);
      sessionStorage.removeItem("temporarySession");
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to complete payment";
      setError(errorMessage);
      throw err;
    }
  }, [session]);

  // Link customer to session (when they log in)
  const linkCustomer = useCallback(
    async (customerId: string): Promise<void> => {
      if (!session) throw new Error("No active session");

      try {
        const updatedSession = await linkCustomerToSession(session.id, customerId);
        setSession(updatedSession);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to link customer";
        setError(errorMessage);
        throw err;
      }
    },
    [session]
  );

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const savedSessionData = sessionStorage.getItem("temporarySession");
    if (savedSessionData) {
      try {
        const data = JSON.parse(savedSessionData);
        getSession(data.id).then((existingSession) => {
          if (existingSession) {
            setSession(existingSession);
          } else {
            sessionStorage.removeItem("temporarySession");
          }
        });
      } catch (err) {
        console.error("[v0] Failed to restore session:", err);
        sessionStorage.removeItem("temporarySession");
      }
    }
  }, []);

  // Periodic session validation
  useEffect(() => {
    if (!session) return;

    const validateInterval = setInterval(async () => {
      try {
        const current = await getSession(session.id);
        if (!current) {
          setSession(null);
          setError("Your session has expired.");
          sessionStorage.removeItem("temporarySession");
        }
      } catch (err) {
        console.error("[v0] Session validation failed:", err);
      }
    }, 30000); // Validate every 30 seconds

    return () => clearInterval(validateInterval);
  }, [session]);

  return {
    session,
    isSessionActive: session !== null && session.paymentStatus !== "completed",
    isLoading,
    error,
    createSession,
    addOrder,
    endSession,
    completePayment,
    linkCustomer,
  };
}
