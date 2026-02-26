import type { Reservation } from "@/types";
import { mockReservations } from "@/lib/mock-data";
import { simulateDelay } from "./api";

const reservations = [...mockReservations];

export async function getReservations(): Promise<Reservation[]> {
  await simulateDelay();
  return [...reservations];
}

export async function getReservationsByTable(
  tableId: string
): Promise<Reservation[]> {
  await simulateDelay();
  return reservations
    .filter((r) => r.tableId === tableId)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
}

export async function getActiveReservationForTable(
  tableId: string
): Promise<Reservation | undefined> {
  await simulateDelay();
  return reservations.find(
    (r) => r.tableId === tableId && (r.status === "active" || r.status === "upcoming")
  );
}
