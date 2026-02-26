"use client";

import { useEffect, useMemo, useState } from "react";
import type { Order } from "@/types";

export type DateFilterPreset = "all" | "today" | "yesterday" | "this_week" | "custom";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

// Monday-based week start to match most business calendars.
function startOfWeekMonday(d: Date) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0..6 (Sun..Sat)
  const diff = (day === 0 ? -6 : 1) - day;
  x.setDate(x.getDate() + diff);
  return x;
}

export type UseOrderListParams = {
  orders: Order[];
  preset: DateFilterPreset;
  startDate?: string; // yyyy-mm-dd
  endDate?: string; // yyyy-mm-dd
  cancelledOnly?: boolean;
  pageSize?: number;
};

export function useOrderList({
  orders,
  preset,
  startDate,
  endDate,
  cancelledOnly = false,
  pageSize = 50,
}: UseOrderListParams) {
  const [page, setPage] = useState(1);

  // Reset pagination when filters change.
  useEffect(() => {
    setPage(1);
  }, [preset, startDate, endDate, cancelledOnly, pageSize]);

  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    if (preset === "today") {
      return { rangeStart: startOfDay(now).getTime(), rangeEnd: endOfDay(now).getTime() };
    }
    if (preset === "yesterday") {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { rangeStart: startOfDay(y).getTime(), rangeEnd: endOfDay(y).getTime() };
    }
    if (preset === "this_week") {
      const s = startOfWeekMonday(now);
      return { rangeStart: s.getTime(), rangeEnd: endOfDay(now).getTime() };
    }
    if (preset === "custom") {
      const s = startDate ? new Date(startDate + "T00:00:00") : null;
      const e = endDate ? new Date(endDate + "T23:59:59") : null;
      return {
        rangeStart: s ? s.getTime() : null,
        rangeEnd: e ? e.getTime() : null,
      };
    }
    return { rangeStart: null, rangeEnd: null };
  }, [preset, startDate, endDate]);

  const filteredOrders = useMemo(() => {
    let list = orders;

    if (cancelledOnly) {
      list = list.filter((o) => o.status === "cancelled");
    }

    if (rangeStart != null) {
      list = list.filter((o) => new Date(o.createdAt).getTime() >= rangeStart);
    }
    if (rangeEnd != null) {
      list = list.filter((o) => new Date(o.createdAt).getTime() <= rangeEnd);
    }

    return list;
  }, [orders, cancelledOnly, rangeStart, rangeEnd]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  }, [filteredOrders.length, pageSize]);

  // Keep page stable but clamped when data changes.
  const currentPage = Math.min(page, totalPages);

  const pagedOrders = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIdx, startIdx + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  return {
    page: currentPage,
    setPage,
    totalPages,
    pageSize,
    filteredCount: filteredOrders.length,
    pagedOrders,
    // exposed for UI (optional)
    rangeStart,
    rangeEnd,
  };
}
