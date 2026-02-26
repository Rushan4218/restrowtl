"use client";

import React, { useState, useMemo } from "react";
import { useTableTimeline } from "@/hooks/useTableTimeline";
import { useAdminStore } from "@/store/adminStore";
import { TimelineTableView } from "@/components/admin/TimelineTableView/TimelineTableView";
import { OrderPanel } from "@/components/admin/OrderPanel/OrderPanel";
import { TableExchangeModal } from "@/components/admin/ConfirmationModal/TableExchangeModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatDate } from "@/lib/timelineUtils";
import type { Order } from "@/types";

type OrderStatus = "acknowledged" | "served" | "completed" | "cancelled";

export default function OrdersPage() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-02-20"));
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const {
    tables,
    reservations,
    orders,
    isLoading,
    selectedReservationId,
    setSelectedReservation,
    setOrderPanelOpen,
  } = useAdminStore();

  // Fetch data for the selected date
  useTableTimeline(currentDate);

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (filterStatus === "all") return orders;
    return orders.filter((o) => o.status === filterStatus);
  }, [orders, filterStatus]);

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date("2026-02-20"));
  };

  const handleSelectReservation = (reservationId: string) => {
    setSelectedReservation(reservationId);
    setOrderPanelOpen(true);
  };

  // Get selected reservation and order
  const selectedReservation = reservations.find(
    (r) => r.id === selectedReservationId
  );
  const selectedOrder = selectedReservation
    ? filteredOrders.find(
        (o) =>
          o.tableId === selectedReservation.tableId &&
          new Date(o.createdAt).getTime() >=
            new Date(selectedReservation.startTime).getTime() &&
          new Date(o.createdAt).getTime() <=
            new Date(selectedReservation.endTime).getTime()
      )
    : undefined;

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Orders & Table Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage reservations, orders, and table assignments
        </p>
      </div>

      {/* Date selector and summary */}
      <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 p-4 mb-6 space-y-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousDay}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex-1 text-center">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg border border-orange-300 dark:border-orange-700">
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatDate(currentDate)}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="bg-amber-600 hover:bg-amber-700 text-white border-0"
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Reservation Summary */}
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
            Number of reservations: <span className="font-bold">{reservations.length}</span> groups · <span className="font-bold">{reservations.reduce((sum, r) => sum + r.guestCount, 0)}</span> people
          </p>
        </div>

        {/* Order Status Filter - Tag-based Design */}
        <div className="flex flex-col gap-4 border-t border-gray-200 dark:border-slate-700 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Filter by Order Status
            </span>
            {filterStatus !== "all" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterStatus("all")}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Tag-based Filter Badges */}
          <div className="flex flex-wrap gap-2">
            {/* All Orders - Neutral */}
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                filterStatus === "all"
                  ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 ring-2 ring-gray-600 dark:ring-gray-400"
                  : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              }`}
            >
              All Orders
            </button>

            {/* Acknowledged - Blue */}
            <button
              onClick={() => setFilterStatus("acknowledged")}
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                filterStatus === "acknowledged"
                  ? "bg-blue-600 text-white ring-2 ring-blue-400 dark:ring-blue-500"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40"
              }`}
            >
              Acknowledged
            </button>

            {/* Served - Green */}
            <button
              onClick={() => setFilterStatus("served")}
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                filterStatus === "served"
                  ? "bg-green-600 text-white ring-2 ring-green-400 dark:ring-green-500"
                  : "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40"
              }`}
            >
              Served
            </button>

            {/* Completed - Emerald */}
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                filterStatus === "completed"
                  ? "bg-emerald-600 text-white ring-2 ring-emerald-400 dark:ring-emerald-500"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/40"
              }`}
            >
              Completed
            </button>

            {/* Cancelled - Red */}
            <button
              onClick={() => setFilterStatus("cancelled")}
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                filterStatus === "cancelled"
                  ? "bg-red-600 text-white ring-2 ring-red-400 dark:ring-red-500"
                  : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40"
              }`}
            >
              Cancelled
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Tables
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {tables.filter((t) => t.isEnabled).length} / {tables.length}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Active Reservations
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {reservations.length}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {filterStatus === "all" ? "Total" : "Filtered"} Orders
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {filteredOrders.length}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Revenue
          </div>
          <div className="text-2xl font-bold text-orange-600">
            ${filteredOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Main timeline view */}
      <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <TimelineTableView
          tables={tables}
          reservations={reservations}
          orders={filteredOrders}
          selectedReservationId={selectedReservationId}
          onSelectReservation={handleSelectReservation}
          isLoading={isLoading}
        />
      </div>

      {/* Order Panel Side Drawer */}
      <OrderPanel
        reservation={selectedReservation}
        order={selectedOrder}
      />

      {/* Table Exchange Confirmation Modal */}
      <TableExchangeModal />
    </div>
  );
}
