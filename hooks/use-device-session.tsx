"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

const STORAGE_KEY = "device_table_session";
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export interface DeviceSession {
  tableId: string;
  tableName: string;
  orderIds: string[];
  startedAt: string;
  expiresAt: string;
}

interface DeviceSessionContextType {
  session: DeviceSession | null;
  startSession: (tableId: string, tableName: string) => void;
  addOrderToSession: (orderId: string) => void;
  clearSession: () => void;
  isSessionActive: boolean;
  remainingMinutes: number;
}

const DeviceSessionContext = createContext<DeviceSessionContextType>({
  session: null,
  startSession: () => {},
  addOrderToSession: () => {},
  clearSession: () => {},
  isSessionActive: false,
  remainingMinutes: 0,
});

function getStoredSession(): DeviceSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: DeviceSession = JSON.parse(raw);
    // Check if session is still valid
    if (new Date(data.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveSession(session: DeviceSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function DeviceSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DeviceSession | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  // Load from storage on mount
  useEffect(() => {
    const stored = getStoredSession();
    setSession(stored);
  }, []);

  // Countdown timer with cleanup on expiry
  useEffect(() => {
    if (!session) {
      setRemainingMinutes(0);
      return;
    }

    const tick = () => {
      const expiresAt = new Date(session.expiresAt).getTime();
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        // Session expired - cleanup
        setSession(null);
        localStorage.removeItem(STORAGE_KEY);
        setRemainingMinutes(0);
        
        // Optional: Clear temporary user data on session expiry
        // Note: This is a soft cleanup. Users can still access their profile
        // if they navigated to /menu/profile before session expired.
        // For full cleanup, we'd need to check if user is temporary & logged in
        if (typeof window !== "undefined") {
          const authData = localStorage.getItem("restrohub_current_user");
          if (authData) {
            try {
              const user = JSON.parse(authData);
              // Only clear if it's a temporary (non-member) user
              if (user.membershipStatus === "pending" || user.membershipStatus === "rejected") {
                console.log("[v0] Session expired, user data preserved for profile access");
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      } else {
        setRemainingMinutes(Math.ceil(diff / 60000));
      }
    };

    tick();
    const interval = setInterval(tick, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [session]);

  const startSession = useCallback(
    (tableId: string, tableName: string) => {
      const existing = getStoredSession();
      // If there's already an active session for this table, extend it
      if (existing && existing.tableId === tableId) {
        const extended: DeviceSession = {
          ...existing,
          expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
        };
        saveSession(extended);
        setSession(extended);
        return;
      }
      // Otherwise, create a new session
      const newSession: DeviceSession = {
        tableId,
        tableName,
        orderIds: [],
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
      };
      saveSession(newSession);
      setSession(newSession);
    },
    []
  );

  const addOrderToSession = useCallback((orderId: string) => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.orderIds.includes(orderId)) return prev;
      const updated: DeviceSession = {
        ...prev,
        orderIds: [...prev.orderIds, orderId],
        // Extend the session every time a new order is added
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
      };
      saveSession(updated);
      return updated;
    });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const isSessionActive = session !== null;

  return (
    <DeviceSessionContext.Provider
      value={{
        session,
        startSession,
        addOrderToSession,
        clearSession,
        isSessionActive,
        remainingMinutes,
      }}
    >
      {children}
    </DeviceSessionContext.Provider>
  );
}

export function useDeviceSession() {
  return useContext(DeviceSessionContext);
}
