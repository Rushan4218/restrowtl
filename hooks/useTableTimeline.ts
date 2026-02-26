import { useEffect, useState, useCallback } from "react";
import { useAdminStore } from "@/store/adminStore";
import { adminTableService } from "@/services/adminTableService";
import { adminOrderService } from "@/services/adminOrderService";
import { Reservation } from "@/types";

export const useTableTimeline = (date: Date) => {
  const {
    tables,
    reservations,
    orders,
    setTables,
    setReservations,
    setOrders,
    setIsLoading,
    isLoading,
  } = useAdminStore();

  const fetchDataForDate = useCallback(async (selectedDate: Date) => {
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];

      // Fetch all data in parallel
      const [tablesData, reservationsData, ordersData] = await Promise.all([
        adminTableService.getTables(),
        adminTableService.getReservations(dateStr),
        adminOrderService.getOrders(dateStr),
      ]);

      setTables(tablesData);
      setReservations(reservationsData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching timeline data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setTables, setReservations, setOrders, setIsLoading]);

  useEffect(() => {
    fetchDataForDate(date);
  }, [date, fetchDataForDate]);

  // Get reservations for a specific table
  const getTableReservations = useCallback(
    (tableId: string): Reservation[] => {
      return reservations.filter((r) => r.tableId === tableId);
    },
    [reservations]
  );

  // Filter reservations within time range
  const getReservationsInTimeRange = useCallback(
    (timeStart: number, timeEnd: number): Reservation[] => {
      return reservations.filter((r) => {
        const resStart = new Date(r.startTime).getHours();
        const resEnd = new Date(r.endTime).getHours();
        return resStart < timeEnd && resEnd > timeStart;
      });
    },
    [reservations]
  );

  // Get order for a reservation (match by tableId and time)
  const getReservationOrder = useCallback(
    (reservation: Reservation) => {
      return orders.find(
        (o) =>
          o.tableId === reservation.tableId &&
          new Date(o.createdAt).getTime() >=
            new Date(reservation.startTime).getTime() &&
          new Date(o.createdAt).getTime() <=
            new Date(reservation.endTime).getTime()
      );
    },
    [orders]
  );

  return {
    tables,
    reservations,
    orders,
    isLoading,
    getTableReservations,
    getReservationsInTimeRange,
    getReservationOrder,
    refetch: () => fetchDataForDate(date),
  };
};
