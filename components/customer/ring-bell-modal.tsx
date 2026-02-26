"use client";

import { useState, useEffect } from "react";
import { Bell, X, Utensils, Droplet, Receipt, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { createBellRequest } from "@/services/bellService";
import { getBellReasons } from "@/services/configService";
import { useTable } from "@/hooks/use-table";

interface RingBellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Map reason keywords to icons and descriptions
const reasonDetails: Record<string, { icon: React.ReactNode; description: string }> = {
  "water": { icon: <Droplet className="h-5 w-5 text-blue-600" />, description: "Request water or beverages" },
  "menu": { icon: <Utensils className="h-5 w-5 text-amber-600" />, description: "Need the menu or have questions" },
  "bill": { icon: <Receipt className="h-5 w-5 text-green-600" />, description: "Ready for the check" },
  "help": { icon: <AlertCircle className="h-5 w-5 text-red-600" />, description: "Need immediate assistance" },
};

// Play bell ringing sound when assistant is needed
function playBellSound() {
  try {
    const audio = new Audio("/sounds/bell-ring.mp3");
    audio.volume = 0.7;
    audio.crossOrigin = "anonymous";
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("[v0] Bell sound played successfully");
        })
        .catch((error) => {
          console.log("[v0] Bell sound playback error:", error);
        });
    }
  } catch (error) {
    console.log("[v0] Failed to play bell sound:", error);
  }
}

function getReasonIcon(reason: string) {
  const lower = reason.toLowerCase();
  for (const [key, details] of Object.entries(reasonDetails)) {
    if (lower.includes(key)) {
      return details;
    }
  }
  return { icon: <Bell className="h-5 w-5 text-primary" />, description: reason };
}

export function RingBellModal({ open, onOpenChange }: RingBellModalProps) {
  const { table } = useTable();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastBellTime, setLastBellTime] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      loadReasons();
    }
  }, [open]);

  const loadReasons = async () => {
    try {
      const data = await getBellReasons();
      setReasons(data);
      setSelectedReasons([]);
      
      // Check if bell was rung recently (within 2 minutes)
      const lastBellStr = localStorage.getItem("lastBellRingTime");
      if (lastBellStr) {
        const lastTime = parseInt(lastBellStr);
        if (Date.now() - lastTime < 120000) {
          setLastBellTime(lastTime);
        }
      }
    } catch {
      toast.error("Failed to load bell reasons");
    }
  };

  const handleSelectReason = (reason: string, checked: boolean) => {
    setSelectedReasons(prev => {
      if (checked) {
        // Only add if not already selected (prevent duplicates)
        return prev.includes(reason) ? prev : [...prev, reason];
      } else {
        // Remove if unchecking
        return prev.filter(r => r !== reason);
      }
    });
  };

  const handleRingBell = async () => {
    if (!table || selectedReasons.length === 0) return;
    
    setSubmitting(true);
    try {
      // Play bell sound immediately
      playBellSound();

      // Send bell request for each selected reason
      for (const reason of selectedReasons) {
        await createBellRequest(table.id, table.name, reason);
      }
      
      localStorage.setItem("lastBellRingTime", Date.now().toString());
      setLastBellTime(Date.now());
      toast.success(`Bell rung for ${selectedReasons.length} request${selectedReasons.length !== 1 ? 's' : ''}! Staff will assist you shortly.`);
      
      // Close modal immediately after bell rings
      setSelectedReasons([]);
      onOpenChange(false);
    } catch {
      toast.error("Failed to ring bell");
    } finally {
      setSubmitting(false);
    }
  };

  const timeSinceLastBell = lastBellTime ? Math.round((Date.now() - lastBellTime) / 1000) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            Ring for Assistance
          </DialogTitle>
          <DialogDescription>
            {table ? `Table ${table.name} - Select one or more reasons` : "Select reasons for assistance"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recent bell indicator */}
          {lastBellTime && timeSinceLastBell !== null && timeSinceLastBell < 120 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              Staff was just here {timeSinceLastBell < 60 ? `${timeSinceLastBell}s` : `${Math.floor(timeSinceLastBell / 60)}m`} ago. Try waiting a moment before ringing again.
            </div>
          )}

          <div>
            <Label className="mb-3 block text-sm font-medium">
              What do you need help with?
            </Label>
            <div className="space-y-3">
              {reasons.map((reason) => {
                const details = getReasonIcon(reason);
                const isSelected = selectedReasons.includes(reason);
                
                return (
                  <div key={reason}>
                    <div 
                      className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectReason(reason, !isSelected)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelectReason(reason, !isSelected);
                        }
                      }}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          // Prevent event bubbling to parent div
                          handleSelectReason(reason, checked as boolean);
                        }}
                        id={reason}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="rounded-full bg-muted p-2">
                          {details.icon}
                        </div>
                        <div>
                          <Label htmlFor={reason} className="cursor-pointer font-medium text-foreground block">
                            {reason}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {details.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected reasons preview */}
          {selectedReasons.length > 0 && (
            <Card className="border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Selected ({selectedReasons.length}):
              </p>
              <div className="space-y-2">
                {selectedReasons.map((reason, index) => {
                  const details = getReasonIcon(reason);
                  return (
                    <div key={`${reason}-${index}`} className="flex items-center gap-2">
                      <div className="rounded-full bg-muted p-1">
                        {details.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {reason}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleRingBell}
            disabled={submitting || selectedReasons.length === 0}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            {submitting ? "Ringing..." : "Ring Bell"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
