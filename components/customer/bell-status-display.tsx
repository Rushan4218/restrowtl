"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBellRequests } from "@/services/bellService";
import { useTable } from "@/hooks/use-table";
import type { BellRequest } from "@/types";

export function BellStatusDisplay() {
  const { table } = useTable();
  const [bellRequests, setBellRequests] = useState<BellRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBellStatus = async () => {
      if (!table) {
        setLoading(false);
        return;
      }
      try {
        const requests = await getBellRequests();
        const tableRequests = requests.filter((r) => r.tableId === table.id);
        setBellRequests(tableRequests);
      } catch {
        console.error("Failed to load bell status");
      } finally {
        setLoading(false);
      }
    };

    loadBellStatus();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadBellStatus, 10000);
    return () => clearInterval(interval);
  }, [table]);

  const pendingRequest = bellRequests.find((r) => r.status === "pending");

  if (!pendingRequest || loading) return null;

  const minutesElapsed = Math.floor(
    (Date.now() - new Date(pendingRequest.createdAt).getTime()) / 60000
  );

  return (
    <Card className="border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="animate-pulse rounded-full bg-orange-500 p-2">
            <Bell className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Bell rung for: <span className="font-semibold text-orange-600 dark:text-orange-400">{pendingRequest.reason}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Waiting {minutesElapsed < 1 ? "just now" : `${minutesElapsed} minute${minutesElapsed !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400">
          Pending
        </Badge>
      </div>
    </Card>
  );
}
