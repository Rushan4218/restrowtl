"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  ArrowLeft,
  Save,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { getOrdersByCustomer } from "@/services/orderService";
import type { Order } from "@/types";

const membershipStatusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending Approval",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: "Active Member",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: <XCircle className="h-3 w-3" />,
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        phone: user.phone,
      });
    }
  }, [user]);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const data = await getOrdersByCustomer(user.id);
      setOrders(data);
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setOrdersLoading(false);
    }
  }, [user, loadOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <User className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Sign in required
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please sign in to view your profile.
        </p>
        <Button className="mt-4" onClick={() => router.push("/menu")}>
          Back to Menu
        </Button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const providerLabel =
    user.provider === "google"
      ? "Google"
      : user.provider === "facebook"
        ? "Facebook"
        : "Email";

  const membershipConfig =
    membershipStatusConfig[user.membershipStatus || "pending"] ||
    membershipStatusConfig.pending;

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
      </div>

      {/* Account Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Account Details</CardTitle>
            <Badge
              variant="secondary"
              className="gap-1 bg-primary/10 text-primary"
            >
              <Shield className="h-3 w-3" />
              {providerLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {user.fullName}
              </p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Separator />

          {/* Membership Status */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Membership Status
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {user.membershipStatus === "pending"
                    ? "Your request is being reviewed by an administrator."
                    : user.membershipStatus === "active"
                      ? "You have full membership privileges."
                      : "Your membership request was not approved."}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`gap-1 border-none text-xs font-medium ${membershipConfig.className}`}
              >
                {membershipConfig.icon}
                {membershipConfig.label}
              </Badge>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="profile-name"
                className="mb-1 flex items-center gap-2 text-muted-foreground"
              >
                <User className="h-4 w-4" />
                Full Name
              </Label>
              {editing ? (
                <Input
                  id="profile-name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                />
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {user.fullName}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="text-sm font-medium text-foreground">
                {user.email}
              </p>
            </div>

            <div>
              <Label
                htmlFor="profile-phone"
                className="mb-1 flex items-center gap-2 text-muted-foreground"
              >
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              {editing ? (
                <Input
                  id="profile-phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Add phone number"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {user.phone || "Not provided"}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member Since
              </Label>
              <p className="text-sm font-medium text-foreground">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      fullName: user.fullName,
                      phone: user.phone,
                    });
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order History Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Receipt className="h-5 w-5 text-primary" />
              Order History
            </CardTitle>
            {orders.length > 0 && (
              <Badge variant="secondary">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading orders...
              </span>
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-8 w-8" />}
              title="No orders yet"
              description="Your order history will appear here after you place an order."
              action={
                <Button
                  size="sm"
                  onClick={() => router.push("/menu")}
                >
                  Browse Menu
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const isExpanded = expandedOrder === order.id;
                return (
                  <div
                    key={order.id}
                    className="rounded-lg border bg-muted/20 transition-colors hover:bg-muted/40"
                  >
                    <button
                      type="button"
                      className="w-full p-3 text-left"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Receipt className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {order.tableName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.status} />
                          <span className="text-sm font-bold tabular-nums text-foreground">
                            {"$"}{order.total.toFixed(2)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-1.5 border-t pt-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {item.quantity}x {item.productName}
                              </span>
                              <span className="tabular-nums text-foreground">
                                {"$"}{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
