"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React from "react";

/**
 * Admin Header - Consistent title and subtitle for all admin pages
 */
export function AdminHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  );
}

/**
 * Admin Card - Consistent card styling for all admin sections
 */
export function AdminCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5 shadow-sm",
        hover && "transition-shadow hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Admin Status Badge - Unified status styling for admin sections
 */
interface AdminBadgeProps {
  status: "active" | "pending" | "completed" | "cancelled" | "inactive" | "warning";
  label?: string;
  className?: string;
}

const statusStyles: Record<AdminBadgeProps["status"], string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  warning: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const statusLabels: Record<AdminBadgeProps["status"], string> = {
  active: "Active",
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  inactive: "Inactive",
  warning: "Warning",
};

export function AdminBadge({ status, label, className }: AdminBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-none font-medium",
        statusStyles[status],
        className
      )}
    >
      {label || statusLabels[status]}
    </Badge>
  );
}

/**
 * Admin Table Header - Consistent table header styling
 */
export function AdminTableHeader({
  columns,
  className,
}: {
  columns: string[];
  className?: string;
}) {
  return (
    <thead className={cn("border-b border-border bg-muted/50", className)}>
      <tr>
        {columns.map((column, index) => (
          <th
            key={index}
            className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/**
 * Admin Table Cell - Consistent table cell styling
 */
export function AdminTableCell({
  children,
  align = "left",
  className,
  colSpan = 1,
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  colSpan?: number;
}) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-4 py-3 text-sm text-foreground",
        alignClasses[align],
        className
      )}
    >
      {children}
    </td>
  );
}

/**
 * Admin Table Row - Consistent table row with hover effects
 */
export function AdminTableRow({
  children,
  onClick,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "border-b border-border",
        hover &&
          "transition-colors hover:bg-muted/50 cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

/**
 * Admin Action Button Group - Consistent action buttons
 */
export function AdminActionButton({
  variant = "outline",
  size = "sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant={variant}
      size={size}
      className="h-8 px-3 text-xs font-medium transition-all"
      {...props}
    />
  );
}

/**
 * Admin Empty State - Consistent empty state messaging
 */
export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <AdminCard className="text-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="text-4xl text-muted-foreground">✕</div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </AdminCard>
  );
}

/**
 * Admin Loading Skeleton - Consistent loading state
 */
export function AdminSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-12 bg-muted rounded-md animate-pulse",
        className
      )}
    />
  );
}
