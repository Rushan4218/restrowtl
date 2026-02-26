/**
 * Reservations API Route Handler
 * GET /api/timeline/reservations?date=YYYY-MM-DD
 * POST /api/timeline/reservations
 */

import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";
import { validateReservation, calculateEndTime } from "@/lib/reservation-validation";
import type {
  ApiResponse,
  TimelineReservation,
  TimelineTable,
} from "@/types/reservation-timeline";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const reservations = await mockStore.getReservations(date || undefined);

    return NextResponse.json<ApiResponse<TimelineReservation[]>>({
      success: true,
      data: reservations,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "GET_RESERVATIONS_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      tableId,
      startTime,
      guestCount,
      customerName,
      reservationType,
      notes,
    } = body;

    // Validate required fields
    if (!tableId || !startTime || !guestCount || !customerName || !reservationType) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message:
              "Missing required fields: tableId, startTime, guestCount, customerName, reservationType",
          },
        },
        { status: 400 }
      );
    }

    // Get table to check default duration
    const table = (await mockStore.getTableById(tableId)) as TimelineTable | null;
    if (!table) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "TABLE_NOT_FOUND",
            message: `Table ${tableId} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Calculate end time from table's default duration
    const endTime = calculateEndTime(startTime, table.defaultReservationDuration);

    // Get existing reservations for validation
    const date = startTime.split("T")[0];
    const existingReservations = await mockStore.getTableReservations(tableId, date);

    // Validate reservation
    const validation = validateReservation(
      startTime,
      endTime,
      table,
      existingReservations,
      "09:00", // Default open time
      "23:00", // Default close time
      undefined
    );

    if (!validation.valid) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Reservation validation failed",
            details: {
              errors: validation.errors,
            },
          },
        },
        { status: 400 }
      );
    }

    // Create reservation
    const newReservation = await mockStore.createReservation({
      tableId,
      tableName: table.name,
      startTime,
      endTime,
      durationMinutes: table.defaultReservationDuration,
      guestCount,
      customerName,
      reservationType,
      notes,
    });

    return NextResponse.json<ApiResponse<TimelineReservation>>(
      {
        success: true,
        data: newReservation,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "CREATE_RESERVATION_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}
