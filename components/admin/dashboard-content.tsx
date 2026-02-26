"use client";

import { useEffect, useState } from "react";
import {
  Package,
  FolderTree,
  Grid3X3,
  ClipboardList,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { getTables } from "@/services/tableService";
import {
  getOrders,
  getTodayOrdersCount,
  getTodayRevenue,
} from "@/services/orderService";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingCards } from "@/components/shared/loading-state";
import {
  AdminHeader,
  AdminCard,
} from "@/components/admin/shared/admin-components";
import type { Order } from "@/types";

interface Stats {
  totalProducts: number;
  totalCategories: number;
  totalTables: number;
  todayOrders: number;
  revenue: number;
}

export function DashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, categories, tables, todayOrders, revenue, orders] =
          await Promise.all([
            getProducts(),
            getCategories(),
            getTables(),
            getTodayOrdersCount(),
            getTodayRevenue(),
            getOrders(),
          ]);
        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          totalTables: tables.length,
          todayOrders,
          revenue,
        });
        setRecentOrders(orders.slice(0, 5));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingCards count={5} />;

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-primary",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: FolderTree,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Tables",
      value: stats.totalTables,
      icon: Grid3X3,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: ClipboardList,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Today's Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Dashboard"
        subtitle="Overview of your restaurant operations"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <AdminCard key={stat.title}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </p>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {stat.value}
                </div>
              </div>
              <stat.icon className={`h-5 w-5 flex-shrink-0 ${stat.color}`} />
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Recent Orders */}
      <AdminCard>
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Recent Orders</h3>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {order.id}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Table: <span className="font-medium">{order.tableName}</span> &middot;{" "}
                    <span className="font-medium">{order.items.length}</span> item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-base">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
