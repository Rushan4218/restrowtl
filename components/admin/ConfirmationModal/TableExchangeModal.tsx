"use client";

import React from "react";
import { useAdminStore } from "@/store/adminStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowRight } from "lucide-react";

export const TableExchangeModal: React.FC = () => {
  const {
    isConfirmModalOpen,
    setConfirmModalOpen,
    selectedReservationId,
    targetTableId,
    tables,
    reservations,
    draggedReservationId,
    exchangeTable,
  } = useAdminStore();

  const draggedReservation = reservations.find(
    (r) => r.id === draggedReservationId
  );
  const sourceTable = tables.find((t) => t.id === draggedReservation?.tableId);
  const targetTable = tables.find((t) => t.id === targetTableId);

  const handleConfirm = () => {
    if (draggedReservationId && targetTableId) {
      exchangeTable(draggedReservationId, targetTableId);
      setConfirmModalOpen(false);
    }
  };

  const handleCancel = () => {
    setConfirmModalOpen(false);
  };

  return (
    <AlertDialog open={isConfirmModalOpen} onOpenChange={setConfirmModalOpen}>
      <AlertDialogContent suppressHydrationWarning className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold">
            Move Reservation?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Confirm moving the reservation from {sourceTable?.name} to {targetTable?.name}. All associated orders will be transferred.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800/40">
            <div className="flex items-center gap-4">
              {/* Source Table */}
              <div className="flex-1 space-y-2">
                <div className="text-xs uppercase tracking-wide font-semibold text-gray-600 dark:text-gray-400">
                  From
                </div>
                <div className="bg-white dark:bg-slate-950 p-3 rounded border border-gray-200 dark:border-slate-700">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {sourceTable?.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Seating for {sourceTable?.capacity}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 pt-6">
                <ArrowRight className="h-5 w-5 text-orange-600" />
              </div>

              {/* Target Table */}
              <div className="flex-1 space-y-2">
                <div className="text-xs uppercase tracking-wide font-semibold text-gray-600 dark:text-gray-400">
                  To
                </div>
                <div className="bg-white dark:bg-slate-950 p-3 rounded border border-green-500 border-2">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {targetTable?.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Seating for {targetTable?.capacity}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="space-y-2 border-t border-gray-200 dark:border-slate-700 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Guest Count
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {draggedReservation?.guestCount} guest
                  {draggedReservation && draggedReservation.guestCount > 1
                    ? "s"
                    : ""}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Reservation ID
                </div>
                <div className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                  {draggedReservationId}
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-300 italic">
            All associated orders will be moved to the new table. This action can
            be undone.
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <AlertDialogCancel onClick={handleCancel} className="mr-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Move Reservation
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
