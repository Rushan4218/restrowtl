import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending_ack: {
    label: "Pending Acknowledgment",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  acknowledged: {
    label: "Acknowledged",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  preparing: {
    label: "Preparing",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  served: {
    label: "Served",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  completed: {
    label: "Completed",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const fallback = {
  label: "Unknown",
  className: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
};

export function StatusBadge({ status }: { status?: OrderStatus }) {
  // Handle undefined or null status
  if (!status) {
    return (
      <Badge
        variant="outline"
        className={cn("border-none font-medium", fallback.className)}
      >
        {fallback.label}
      </Badge>
    );
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] ?? fallback;
  return (
    <Badge
      variant="outline"
      className={cn("border-none font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
}
