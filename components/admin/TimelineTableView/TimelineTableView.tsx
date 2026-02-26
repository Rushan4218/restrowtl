import React, { useState } from "react";
import { RestaurantTable, Reservation, Order } from "@/types";
import { TimelineHeader } from "./TimelineHeader";
import { TableRow } from "./TableRow";
import { hasTimeOverlap } from "@/lib/timelineUtils";
import { useTableExchange } from "@/hooks/useTableExchange";
import { useAdminStore } from "@/store/adminStore";
import { CreateReservationOrderModal } from "./CreateReservationOrderModal";
import { adminReservationOrderService } from "@/services/adminReservationOrderService";
import { toast } from "sonner";

interface TimelineTableViewProps {
  tables: RestaurantTable[];
  reservations: Reservation[];
  orders: Order[];
  selectedDate: Date;
  selectedReservationId?: string;
  onSelectReservation: (id: string) => void;
  onTableExchange?: (reservationId: string, newTableId: string) => void;
  isLoading?: boolean;
}

export const TimelineTableView: React.FC<TimelineTableViewProps> = ({
  tables,
  reservations,
  orders,
  selectedDate,
  selectedReservationId,
  onSelectReservation,
  onTableExchange,
  isLoading = false,
}) => {
  const COLUMN_WIDTH = 120; // Width of each hour column in pixels
  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    draggedReservationId,
    targetTableId,
  } = useTableExchange();

  const { setConfirmModalOpen, setSelectedReservation, setOrderPanelOpen } = useAdminStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [createTable, setCreateTable] = useState<RestaurantTable | undefined>();
  const [createStart, setCreateStart] = useState<string | undefined>();
  const [createEnd, setCreateEnd] = useState<string | undefined>();

  const handleReservationDragStart = (
    reservationId: string,
    tableId: string,
    event: React.DragEvent
  ) => {
    setSelectedReservation(reservationId);
    handleDragStart(reservationId, tableId, event);
  };

  const handleTableDrop = (tableId: string, event: React.DragEvent) => {
    const data = event.dataTransfer?.getData("text/plain");
    if (data) {
      const [reservationId, sourceTableId] = data.split(":");
      if (sourceTableId !== tableId) {
        // Show confirmation modal
        setSelectedReservation(reservationId);
        setConfirmModalOpen(true);
        handleDrop(tableId, event);
        onTableExchange?.(reservationId, tableId);
      }
    }
  };

  const handleCreateFromGridClick = (args: {
    table: RestaurantTable;
    startTime: string;
    endTime: string;
  }) => {
    // Prevent creating on disabled tables
    if (!args.table.isEnabled) {
      toast.error("This table is disabled");
      return;
    }

    // Prevent overlaps within the same table
    const conflict = reservations.some((r) =>
      r.tableId === args.table.id
        ? hasTimeOverlap(r.startTime, r.endTime, args.startTime, args.endTime)
        : false
    );
    if (conflict) {
      toast.error("That time slot overlaps with an existing reservation");
      return;
    }

    setCreateTable(args.table);
    setCreateStart(args.startTime);
    setCreateEnd(args.endTime);
    setCreateOpen(true);
  };

  const handleConfirmCreate = async (payload: {
    customerName: string;
    guestCount: number;
    items: Array<{ productId: string; quantity: number }>;
  }) => {
    if (!createTable || !createStart || !createEnd) return;

    // Double-check overlap on confirm (safety)
    const conflict = reservations.some((r) =>
      r.tableId === createTable.id
        ? hasTimeOverlap(r.startTime, r.endTime, createStart, createEnd)
        : false
    );
    if (conflict) {
      toast.error("That time slot overlaps with an existing reservation");
      return;
    }

    const { reservation } = await adminReservationOrderService.createReservationWithOrder({
      tableId: createTable.id,
      tableName: createTable.name,
      customerName: payload.customerName,
      guestCount: payload.guestCount,
      startTime: createStart,
      endTime: createEnd,
      items: payload.items,
    });

    toast.success("Reservation & order created");
    setSelectedReservation(reservation.id);
    setOrderPanelOpen(true);
    onSelectReservation(reservation.id);
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading timeline data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Scrollable container for both header and tables */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - stays at top but scrolls horizontally with body */}
        <div className="flex-shrink-0 overflow-x-hidden">
          <TimelineHeader columnWidth={COLUMN_WIDTH} />
        </div>

        {/* Tables and reservations - Horizontally and vertically scrollable */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {tables.length === 0 ? (
            <div className="w-full h-96 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                No tables available
              </p>
            </div>
          ) : (
            <div className="inline-block min-w-full">
              {tables.map((table) => {
                const tableReservations = reservations.filter(
                  (r) => r.tableId === table.id
                );
                const tableOrders = orders.filter((o) => o.tableId === table.id);

                return (
                  <TableRow
                    key={table.id}
                    table={table}
                    reservations={tableReservations}
                    orders={tableOrders}
                    selectedReservationId={selectedReservationId}
                    onSelectReservation={onSelectReservation}
                    columnWidth={COLUMN_WIDTH}
                    selectedDate={selectedDate}
                    isDragging={Boolean(draggedReservationId)}
                    onCreateFromGridClick={handleCreateFromGridClick}
                    draggedReservationId={draggedReservationId}
                    targetTableId={targetTableId}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleTableDrop}
                    onReservationDragStart={handleReservationDragStart}
                    onReservationDragEnd={handleDragEnd}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Reservation + Order modal */}
      <CreateReservationOrderModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        table={createTable}
        startTime={createStart}
        endTime={createEnd}
        onConfirm={handleConfirmCreate}
      />

      {/* Legend */}
      <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-3 bg-gray-50 dark:bg-slate-900 flex gap-6 text-xs overflow-x-auto flex-shrink-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "#FF9A56" }}
          />
          <span className="text-gray-700 dark:text-gray-300">Walk-in</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: "#FFBC80" }}
          />
          <span className="text-gray-700 dark:text-gray-300">Reserved</span>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <div className="w-0.5 h-4 bg-red-500" />
          <span className="text-gray-700 dark:text-gray-300">
            Current time
          </span>
        </div>
      </div>
    </div>
  );
};
