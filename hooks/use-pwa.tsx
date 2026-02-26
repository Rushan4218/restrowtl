"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaContextValue {
  /** Whether the browser supports native install prompt (Android / desktop Chrome) */
  canInstall: boolean;
  /** Whether the app is already running in standalone (installed) mode */
  isInstalled: boolean;
  /** Whether user is on iOS Safari (needs manual Add-to-Home-Screen) */
  isIosSafari: boolean;
  /** Trigger the native install prompt (Android / desktop) */
  triggerInstall: () => Promise<void>;
  /** Dismiss the install banner (stored for 7 days) */
  dismissInstall: () => void;
  /** Whether the banner was recently dismissed */
  isDismissed: boolean;
}

const PwaContext = createContext<PwaContextValue>({
  canInstall: false,
  isInstalled: false,
  isIosSafari: false,
  triggerInstall: async () => {},
  dismissInstall: () => {},
  isDismissed: false,
});

const DISMISS_KEY = "restrohub_pwa_dismissed";
const DISMISS_DAYS = 7;

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return false;
    const dismissed = new Date(stored);
    const diff = Date.now() - dismissed.getTime();
    return diff < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true to prevent flash

  // Register Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed silently
      });
    }
  }, []);

  // Detect standalone mode
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);
  }, []);

  // Detect iOS Safari
  useEffect(() => {
    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari =
      /safari/i.test(ua) && !/crios|fxios|opios|chrome/i.test(ua);
    const standalone =
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsIosSafari(isIos && isSafari && !standalone);
  }, []);

  // Check dismissal
  useEffect(() => {
    setIsDismissed(wasDismissedRecently());
  }, []);

  // Capture beforeinstallprompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect successful install
    const appInstalled = () => setIsInstalled(true);
    window.addEventListener("appinstalled", appInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", appInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
  }, []);

  const canInstall = !!deferredPrompt && !isInstalled;

  return (
    <PwaContext.Provider
      value={{
        canInstall,
        isInstalled,
        isIosSafari,
        triggerInstall,
        dismissInstall,
        isDismissed,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  return useContext(PwaContext);
}
