import { useCallback, useState } from "react";
import { useAdminStore } from "@/store/adminStore";

interface DragState {
  isDragging: boolean;
  draggedReservationId: string | null;
  sourceTableId: string | null;
  targetTableId: string | null;
  offsetX: number;
  offsetY: number;
}

export const useTableExchange = () => {
  const {
    reservations,
    tables,
    exchangeTable,
    setDraggedReservation,
    setTargetTable,
    draggedReservationId,
    targetTableId,
  } = useAdminStore();

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedReservationId: null,
    sourceTableId: null,
    targetTableId: null,
    offsetX: 0,
    offsetY: 0,
  });

  // Start dragging
  const handleDragStart = useCallback(
    (reservationId: string, tableId: string, event: React.DragEvent) => {
      event.dataTransfer!.effectAllowed = "move";
      event.dataTransfer!.setData("text/plain", `${reservationId}:${tableId}`);

      setDragState({
        isDragging: true,
        draggedReservationId: reservationId,
        sourceTableId: tableId,
        targetTableId: null,
        offsetX: event.clientX,
        offsetY: event.clientY,
      });

      setDraggedReservation(reservationId);
    },
    [setDraggedReservation]
  );

  // Handle drag over
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
  }, []);

  // Handle drag enter
  const handleDragEnter = useCallback(
    (tableId: string, event: React.DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer?.getData("text/plain");
      if (data) {
        const [reservationId] = data.split(":");
        if (reservationId) {
          setTargetTable(tableId);
          setDragState((prev) => ({
            ...prev,
            targetTableId: tableId,
          }));
        }
      }
    },
    [setTargetTable]
  );

  // Handle drag leave
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Only clear if leaving the table cell entirely
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      setTargetTable(null);
      setDragState((prev) => ({
        ...prev,
        targetTableId: null,
      }));
    }
  }, [setTargetTable]);

  // Handle drop
  const handleDrop = useCallback(
    (tableId: string, event: React.DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer?.getData("text/plain");

      if (data && dragState.sourceTableId && dragState.sourceTableId !== tableId) {
        const [reservationId] = data.split(":");
        
        // Validate that target table is available
        const targetTable = tables.find((t) => t.id === tableId);
        if (targetTable && targetTable.isEnabled) {
          // Call the exchange function
          exchangeTable(reservationId, tableId);
        }
      }

      // Reset drag state
      setDragState({
        isDragging: false,
        draggedReservationId: null,
        sourceTableId: null,
        targetTableId: null,
        offsetX: 0,
        offsetY: 0,
      });
      setDraggedReservation(null);
      setTargetTable(null);
    },
    [dragState.sourceTableId, tables, exchangeTable, setDraggedReservation, setTargetTable]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedReservationId: null,
      sourceTableId: null,
      targetTableId: null,
      offsetX: 0,
      offsetY: 0,
    });
    setDraggedReservation(null);
    setTargetTable(null);
  }, [setDraggedReservation, setTargetTable]);

  // Validate if a table can accept a reservation
  const canDropOnTable = useCallback(
    (tableId: string): boolean => {
      if (!dragState.sourceTableId || dragState.sourceTableId === tableId) {
        return false;
      }

      const table = tables.find((t) => t.id === tableId);
      if (!table || !table.isEnabled) {
        return false;
      }

      // Check if there are conflicting reservations
      const reservation = reservations.find(
        (r) => r.id === dragState.draggedReservationId
      );
      if (!reservation) {
        return false;
      }

      const hasConflict = reservations.some(
        (r) =>
          r.tableId === tableId &&
          r.id !== dragState.draggedReservationId &&
          ((new Date(r.startTime).getTime() <
            new Date(reservation.endTime).getTime() &&
            new Date(r.endTime).getTime() >
              new Date(reservation.startTime).getTime()))
      );

      return !hasConflict;
    },
    [dragState.sourceTableId, dragState.draggedReservationId, tables, reservations]
  );

  return {
    dragState,
    isDragging: dragState.isDragging,
    draggedReservationId: dragState.draggedReservationId,
    targetTableId: dragState.targetTableId,
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    canDropOnTable,
  };
};
