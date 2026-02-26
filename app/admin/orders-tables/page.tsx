"use client";

import React, { useState } from "react";
import { useTableTimeline } from "@/hooks/useTableTimeline";
import { useAdminStore } from "@/store/adminStore";
import { TimelineTableView } from "@/components/admin/TimelineTableView/TimelineTableView";
import { OrderPanel } from "@/components/admin/OrderPanel/OrderPanel";
import { TableExchangeModal } from "@/components/admin/ConfirmationModal/TableExchangeModal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/timelineUtils";

export default function OrdersTablesPage() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-02-20"));
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
    ? orders.find(
        (o) =>
          o.tableId === selectedReservation.tableId &&
          new Date(o.createdAt).getTime() >=
            new Date(selectedReservation.startTime).getTime() &&
          new Date(o.createdAt).getTime() <=
            new Date(selectedReservation.endTime).getTime()
      )
    : undefined;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Orders & Table Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage reservations, orders, and table assignments
          </p>
        </div>

        {/* Date selector */}
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 p-4 mb-6 flex items-center gap-4">
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

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Tables
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {tables.length}
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
              Orders
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {orders.length}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Revenue
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Main timeline view */}
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <TimelineTableView
            tables={tables}
            reservations={reservations}
            orders={orders}
            selectedDate={currentDate}
            selectedReservationId={selectedReservationId}
            onSelectReservation={handleSelectReservation}
            isLoading={isLoading}
          />
        </div>
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
