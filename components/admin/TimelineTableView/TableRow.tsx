import React from "react";
import { RestaurantTable, Reservation, Order } from "@/types";
import { ReservationCard } from "./ReservationCard";
import {
  TIMELINE_START_HOUR,
  TIMELINE_END_HOUR,
  calculateReservationPosition,
  GRIDS_PER_HOUR,
  GRID_MINUTES,
  pxToMinutes,
  roundUpToGrid,
  toLocalIso,
} from "@/lib/timelineUtils";

interface TableRowProps {
  table: RestaurantTable;
  reservations: Reservation[];
  orders: Order[];
  selectedReservationId?: string;
  onSelectReservation: (id: string) => void;
  columnWidth: number;
  selectedDate: Date;
  isDragging?: boolean;
  onCreateFromGridClick?: (args: {
    table: RestaurantTable;
    startTime: string;
    endTime: string;
  }) => void;
  draggedReservationId?: string | null;
  targetTableId?: string | null;
  onDragEnter?: (tableId: string, event: React.DragEvent) => void;
  onDragLeave?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (tableId: string, event: React.DragEvent) => void;
  onReservationDragStart?: (reservationId: string, tableId: string, event: React.DragEvent) => void;
  onReservationDragEnd?: (event: React.DragEvent) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
  table,
  reservations,
  orders,
  selectedReservationId,
  onSelectReservation,
  columnWidth,
  selectedDate,
  isDragging,
  onCreateFromGridClick,
  draggedReservationId,
  targetTableId,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onReservationDragStart,
  onReservationDragEnd,
}) => {
  const timelineWidth =
    (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * columnWidth;

  const quarterWidth = columnWidth / GRIDS_PER_HOUR; // 15 minutes

  const handleGridClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Don't create when dragging or clicking on an existing reservation card
    if (isDragging || draggedReservationId) return;
    const target = event.target as HTMLElement;
    if (target?.closest?.('[data-reservation-card="true"]')) return;

    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = event.clientX - rect.left;

    // Convert pixels -> minutes since timeline start
    const minutesFromStart = pxToMinutes(x, columnWidth);

    // Build a Date at the selected day & timeline start, then add minutes.
    const base = new Date(selectedDate);
    base.setHours(TIMELINE_START_HOUR, 0, 0, 0);
    const raw = new Date(base.getTime() + minutesFromStart * 60 * 1000);

    // Round UP to 15-minute grid
    const roundedStart = roundUpToGrid(raw, GRID_MINUTES);
    const roundedEnd = new Date(roundedStart.getTime() + 60 * 60 * 1000); // default 1 hour

    onCreateFromGridClick?.({
      table,
      startTime: toLocalIso(roundedStart),
      endTime: toLocalIso(roundedEnd),
    });
  };

  return (
    <div className="flex border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900/30 transition-colors">
      {/* Table name (sticky) */}
      <div className="sticky left-0 z-30 w-52 bg-white dark:bg-slate-950 p-3 border-r border-gray-200 dark:border-slate-700 flex flex-col justify-center">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
          {table.name}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Seating for {table.capacity}
          {table.capacity === 1 ? " person" : " people"}
        </p>
      </div>

      {/* Timeline area */}
      <div
        className={`relative flex-1 overflow-hidden transition-colors ${
          targetTableId === table.id
            ? "bg-green-50 dark:bg-green-950/20"
            : ""
        }`}
        onDragEnter={(e) => onDragEnter?.(table.id, e)}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop?.(table.id, e)}
        onClick={handleGridClick}
      >
        {/* Grid lines: 15-minute dashed + bold hour boundaries */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from(
            {
              length:
                (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * GRIDS_PER_HOUR,
            },
            (_, i) => {
              const isHourBoundary = i % GRIDS_PER_HOUR === 0;
              return (
                <div
                  key={i}
                  className={
                    isHourBoundary
                      ? "flex-shrink-0 border-r border-gray-300 dark:border-slate-600"
                      : "flex-shrink-0 border-r border-dashed border-gray-200 dark:border-slate-800"
                  }
                  style={{ width: quarterWidth }}
                />
              );
            }
          )}
        </div>

        {/* Reservations */}
        <div className="relative h-20 p-2">
          {reservations.map((reservation) => {
            const order = orders.find(
              (o) =>
                o.tableId === table.id &&
                new Date(o.createdAt).getTime() >=
                  new Date(reservation.startTime).getTime() &&
                new Date(o.createdAt).getTime() <=
                  new Date(reservation.endTime).getTime()
            );

            const position = calculateReservationPosition(
              reservation,
              TIMELINE_START_HOUR,
              TIMELINE_END_HOUR,
              columnWidth
            );

            return (
              <div
                key={reservation.id}
                className="absolute top-2 h-12"
                style={{
                  left: position.left,
                  width: position.width,
                  minWidth: "80px",
                }}
              >
                <ReservationCard
                  reservation={reservation}
                  order={order}
                  isSelected={selectedReservationId === reservation.id}
                  isDragging={draggedReservationId === reservation.id}
                  isDropTarget={targetTableId === table.id && draggedReservationId !== reservation.id}
                  onViewOrder={() => onSelectReservation(reservation.id)}
                  onDragStart={(e) =>
                    onReservationDragStart?.(reservation.id, table.id, e)
                  }
                  onDragEnd={onReservationDragEnd}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
