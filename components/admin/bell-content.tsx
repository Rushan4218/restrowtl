"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingTable } from "@/components/shared/loading-state";
import { getBellRequests, resolveBellRequest } from "@/services/bellService";
import type { BellRequest } from "@/types";

function getMinutesElapsed(timestamp: string): number {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  return Math.floor((now - then) / (1000 * 60));
}

// Get reason badge color
function getReasonColor(reason: string): string {
  const lower = reason.toLowerCase();
  if (lower.includes("water") || lower.includes("drink")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (lower.includes("menu") || lower.includes("order")) return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  if (lower.includes("bill") || lower.includes("check")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (lower.includes("help") || lower.includes("urgent")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
}

function playAdminNotificationSound() {
  try {
    const audio = new Audio("/sounds/admin-notification.mp3");
    audio.crossOrigin = "anonymous";
    audio.play().catch(() => {
      console.log("[v0] Admin notification sound not available");
    });
  } catch (error) {
    console.log("[v0] Failed to play notification sound:", error);
  }
}

export function BellContent() {
  const [requests, setRequests] = useState<BellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousRequestCount, setPreviousRequestCount] = useState(0);

  const loadRequests = useCallback(async () => {
    try {
      const data = await getBellRequests();
      setRequests(data);
      
      // Get current pending count
      const currentPendingCount = data.filter((r) => r.status === "pending").length;
      
      // Play notification sound if new bell request arrived
      if (previousRequestCount > 0 && currentPendingCount > previousRequestCount) {
        playAdminNotificationSound();
        toast.success("New bell request received!");
      }
      
      setPreviousRequestCount(currentPendingCount);
    } finally {
      setLoading(false);
    }
  }, [previousRequestCount]);

  useEffect(() => {
    loadRequests();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const handleResolve = async (requestId: string) => {
    try {
      await resolveBellRequest(requestId);
      await loadRequests();
      toast.success("Bell request resolved");
    } catch {
      toast.error("Failed to resolve request");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status === "resolved");
  
  // Group reasons for statistics
  const reasonStats = pendingRequests.reduce((acc, r) => {
    acc[r.reason] = (acc[r.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) return <LoadingTable rows={5} />;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
              <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {pendingRequests.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resolved Today
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {resolvedRequests.filter(r => {
                const today = new Date().toDateString();
                return new Date(r.resolvedAt || "").toDateString() === today;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Most Requested
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Object.keys(reasonStats).length > 0
                ? Object.entries(reasonStats).sort((a, b) => b[1] - a[1])[0]?.[0]
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.keys(reasonStats).length > 0
                ? `${Object.entries(reasonStats).sort((a, b) => b[1] - a[1])[0]?.[1]} times`
                : "No requests"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Pending Requests
          {pendingRequests.length > 0 && (
            <Badge variant="secondary" className="ml-3 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
              {pendingRequests.length}
            </Badge>
          )}
        </h2>

        {pendingRequests.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-10 w-10" />}
            title="No pending bell requests"
            description="Bell requests from customers will appear here."
          />
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request, index) => {
              const minutesElapsed = getMinutesElapsed(request.createdAt);
              const isNewest = index === 0;
              
              return (
                <Card 
                  key={request.id} 
                  className={`border-l-4 border-l-orange-500 ${isNewest ? 'ring-2 ring-orange-300 dark:ring-orange-900/50' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="animate-pulse rounded-full bg-orange-500 p-2">
                          <Bell className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base text-foreground">
                              Table {request.tableName}
                            </CardTitle>
                            {isNewest && (
                              <Badge className="bg-orange-500 text-white text-xs">NEW</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Requested {minutesElapsed < 1 ? "just now" : `${minutesElapsed} min${minutesElapsed !== 1 ? "s" : ""} ago`}
                          </p>
                        </div>
                      </div>
                      <Badge className={getReasonColor(request.reason)}>
                        {request.reason}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleResolve(request.id)}
                      className="gap-2 w-full sm:w-auto"
                      size="sm"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as Resolved
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Requests */}
      {resolvedRequests.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Recently Resolved
            <Badge variant="outline" className="ml-3">
              {resolvedRequests.length}
            </Badge>
          </h2>
          <div className="space-y-3">
            {resolvedRequests.slice(0, 5).map((request) => {
              const minutesElapsed = request.resolvedAt
                ? getMinutesElapsed(request.resolvedAt)
                : 0;
              return (
                <Card key={request.id} className="border-l-4 border-l-emerald-500 opacity-60">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <CardTitle className="text-base text-foreground">
                            Table {request.tableName}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Resolved {minutesElapsed < 1 ? "just now" : `${minutesElapsed} min${minutesElapsed !== 1 ? "s" : ""} ago`}
                          </p>
                        </div>
                      </div>
                      <Badge className={getReasonColor(request.reason)}>
                        {request.reason}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
