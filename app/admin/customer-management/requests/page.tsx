
"use client";

import { useEffect, useState } from "react";
import {
  adminMembershipRequestService,
  MembershipRequest,
} from "@/services/adminMembershipRequestService";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import {
  AdminCard,
  AdminTableHeader,
  AdminTableCell,
  AdminTableRow,
  AdminActionButton,
  AdminBadge,
  AdminEmptyState,
} from "@/components/admin/shared/admin-components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function MembershipRequestsPage() {
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "declined">("all");

  useEffect(() => {
    try {
      setLoading(true);
      const allRequests = adminMembershipRequestService.getAll();
      setRequests(allRequests);
    } catch (error) {
      toast.error("Failed to load membership requests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdate = (id: string, status: "APPROVED" | "DECLINED") => {
    try {
      const updated = adminMembershipRequestService.updateStatus(id, status);
      setRequests(updated);
      const statusText = status === "APPROVED" ? "approved" : "declined";
      toast.success(`Request ${statusText} successfully`);
    } catch (error) {
      toast.error("Failed to update request status");
      console.error(error);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    declined: requests.filter((r) => r.status === "DECLINED").length,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminNavbar
        title="Membership Requests"
        subtitle={`Manage ${stats.total} membership request${stats.total !== 1 ? "s" : ""}`}
      />

      <div className="flex-1 px-4 md:px-6 lg:px-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <AdminCard>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
            </div>
          </AdminCard>
          <AdminCard>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Declined</p>
              <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
            </div>
          </AdminCard>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "approved", "declined"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f === "all" ? "All Requests" : f}
            </Button>
          ))}
        </div>

        {/* Requests Table */}
        {loading ? (
          <AdminCard className="text-center py-8">
            <p className="text-muted-foreground">Loading requests...</p>
          </AdminCard>
        ) : filteredRequests.length === 0 ? (
          <AdminEmptyState
            title={filter === "all" ? "No requests" : `No ${filter} requests`}
            description="There are no membership requests to display."
          />
        ) : (
          <AdminCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <AdminTableHeader columns={["Name", "Contact", "Status", "Date", "Actions"]} />
                <tbody>
                  {filteredRequests.map((req) => (
                    <AdminTableRow key={req.id}>
                      <AdminTableCell>
                        <div className="font-semibold text-foreground">{req.fullName}</div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {req.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            {req.phone}
                          </div>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell align="center">
                        <AdminBadge
                          status={
                            req.status === "PENDING"
                              ? "pending"
                              : req.status === "APPROVED"
                              ? "active"
                              : "cancelled"
                          }
                          label={req.status}
                        />
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(req.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </AdminTableCell>
                      <AdminTableCell align="right">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === "PENDING" ? (
                            <>
                              <AdminActionButton
                                variant="outline"
                                onClick={() => handleUpdate(req.id, "APPROVED")}
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Approve"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </AdminActionButton>
                              <AdminActionButton
                                variant="outline"
                                onClick={() => handleUpdate(req.id, "DECLINED")}
                                className="text-red-600 hover:text-red-700"
                                title="Decline"
                              >
                                <X className="h-3.5 w-3.5" />
                              </AdminActionButton>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">No actions</span>
                          )}
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        )}
      </div>
    </div>
  );
}
