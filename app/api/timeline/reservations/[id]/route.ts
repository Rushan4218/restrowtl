/**
 * Single Reservation API Route Handler
 * GET /api/timeline/reservations/:id
 * PUT /api/timeline/reservations/:id
 * DELETE /api/timeline/reservations/:id
 */

import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";
import {
  validateReservation,
  calculateEndTime,
} from "@/lib/reservation-validation";
import type {
  ApiResponse,
  TimelineReservation,
  TimelineTable,
} from "@/types/reservation-timeline";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    const reservation = await mockStore.getReservationById(id);

    if (!reservation) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "RESERVATION_NOT_FOUND",
            message: `Reservation ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<TimelineReservation>>({
      success: true,
      data: reservation,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "GET_RESERVATION_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    const body = await request.json();

    // Get existing reservation
    const existing = await mockStore.getReservationById(id);
    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "RESERVATION_NOT_FOUND",
            message: `Reservation ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Get table info
    const table = (await mockStore.getTableById(existing.tableId)) as
      | TimelineTable
      | null;
    if (!table) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "TABLE_NOT_FOUND",
            message: "Associated table not found",
          },
        },
        { status: 404 }
      );
    }

    // Use provided times or fallback to existing
    const startTime = body.startTime || existing.startTime;
    const endTime = body.endTime || existing.endTime;

    // Get other reservations for overlap check (excluding current)
    const date = startTime.split("T")[0];
    const otherReservations = (
      await mockStore.getTableReservations(table.id, date)
    ).filter((r) => r.id !== id);

    // Validate
    const validation = validateReservation(
      startTime,
      endTime,
      table,
      otherReservations,
      "09:00",
      "23:00"
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

    // Update
    const updated = await mockStore.updateReservation(id, {
      ...body,
      startTime,
      endTime,
    });

    return NextResponse.json<ApiResponse<TimelineReservation>>({
      success: true,
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "UPDATE_RESERVATION_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;

    const existing = await mockStore.getReservationById(id);
    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "RESERVATION_NOT_FOUND",
            message: `Reservation ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    await mockStore.deleteReservation(id);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "DELETE_RESERVATION_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}
