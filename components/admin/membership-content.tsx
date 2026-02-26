"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  UserPlus,
  Mail,
  Phone,
  FileText,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingCards } from "@/components/shared/loading-state";
import {
  getMembershipRequests,
  updateMembershipRequestStatus,
} from "@/services/membershipService";
import { updateCustomerMembership } from "@/services/authService";
import type { MembershipRequestRecord } from "@/types";

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: "Approved",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: <XCircle className="h-3 w-3" />,
  },
};

export function MembershipContent() {
  const [requests, setRequests] = useState<MembershipRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [tab, setTab] = useState("pending");

  const loadRequests = useCallback(async () => {
    try {
      const data = await getMembershipRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async (request: MembershipRequestRecord) => {
    setProcessing(request.id);
    try {
      await updateMembershipRequestStatus(request.id, "active");
      await updateCustomerMembership(request.customerId, "active", "member");
      toast.success(`Approved membership for ${request.fullName}`);
      await loadRequests();
    } catch {
      toast.error("Failed to approve request");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: MembershipRequestRecord) => {
    setProcessing(request.id);
    try {
      await updateMembershipRequestStatus(request.id, "rejected");
      await updateCustomerMembership(request.customerId, "rejected", "customer");
      toast.success(`Rejected membership for ${request.fullName}`);
      await loadRequests();
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setProcessing(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (tab === "all") return true;
    return r.status === tab;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "active").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  if (loading) return <LoadingCards count={4} />;

  return (
    <>
      {/* Stats row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            Pending
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {filteredRequests.length === 0 ? (
            <EmptyState
              icon={<UserPlus className="h-10 w-10" />}
              title={`No ${tab === "all" ? "" : tab} requests`}
              description={
                tab === "pending"
                  ? "No pending membership requests at this time."
                  : `No ${tab} membership requests found.`
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const config = statusConfig[request.status] || statusConfig.pending;
                const isProcessing = processing === request.id;

                return (
                  <Card key={request.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-foreground">
                          {request.fullName}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`gap-1 border-none text-xs font-medium ${config.className}`}
                        >
                          {config.icon}
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{request.email}</span>
                        </div>
                        {request.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{request.phone}</span>
                          </div>
                        )}
                        {request.additionalDetails && (
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <span>{request.additionalDetails}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Requested{" "}
                            {new Date(request.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        {request.reviewedAt && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              Reviewed{" "}
                              {new Date(request.reviewedAt).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {request.status === "pending" && (
                        <>
                          <Separator className="my-4" />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="gap-1.5"
                              onClick={() => handleApprove(request)}
                              disabled={isProcessing}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {isProcessing ? "Processing..." : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-destructive hover:text-destructive"
                              onClick={() => handleReject(request)}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              {isProcessing ? "Processing..." : "Reject"}
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
