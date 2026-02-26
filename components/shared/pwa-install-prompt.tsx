"use client";

import { useState, useEffect } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwa } from "@/hooks/use-pwa";

export function PwaInstallPrompt() {
  const {
    canInstall,
    isInstalled,
    isIosSafari,
    triggerInstall,
    dismissInstall,
    isDismissed,
  } = usePwa();
  const [mounted, setMounted] = useState(false);

  // Delay showing the prompt so it doesn't interrupt initial page load
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Don't show anything until after mount delay
  if (!mounted) return null;

  // Don't show if already installed or dismissed
  if (isInstalled || isDismissed) return null;

  // Don't show if neither native install nor iOS Safari
  if (!canInstall && !isIosSafari) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:bottom-4 sm:left-4 sm:right-4 sm:p-0">
      <div className="mx-auto w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative overflow-hidden rounded-lg border bg-card shadow-lg sm:rounded-xl">
          {/* Orange accent bar */}
          <div className="h-1 w-full bg-primary" />

          <div className="p-3 sm:p-4">
            <button
              onClick={dismissInstall}
              className="absolute right-2 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:right-3 sm:top-4"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-2.5 pr-6 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-10 sm:w-10">
                <Download className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Install RestroHub
                </h3>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {canInstall
                    ? "Add to your home screen for quick access and offline support."
                    : "Add this app to your home screen for the best experience."}
                </p>
              </div>
            </div>

            {/* Android / Desktop: native install button */}
            {canInstall && (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={triggerInstall}
                >
                  <Download className="h-3.5 w-3.5" />
                  Install Now
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground"
                  onClick={dismissInstall}
                >
                  Not now
                </Button>
              </div>
            )}

            {/* iOS Safari: manual instructions */}
            {!canInstall && isIosSafari && (
              <div className="mt-3 rounded-lg bg-muted/50 p-2.5 sm:p-3">
                <p className="mb-2 text-xs font-medium text-foreground">
                  To install on your iPhone:
                </p>
                <ol className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      1
                    </span>
                    <span className="flex flex-wrap items-center gap-1 pt-0.5">
                      {"Tap the Share button"}
                      <Share className="inline h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      2
                    </span>
                    <span className="flex flex-wrap items-center gap-1 pt-0.5">
                      {"Scroll down, tap "}
                      <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                        {"Add to Home Screen"}
                        <Plus className="inline h-3 w-3 shrink-0" />
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      3
                    </span>
                    <span className="pt-0.5">
                      {"Tap "}
                      <span className="font-medium text-foreground">
                        {"Add"}
                      </span>
                    </span>
                  </li>
                </ol>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 w-full text-xs text-muted-foreground"
                  onClick={dismissInstall}
                >
                  Got it, maybe later
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
