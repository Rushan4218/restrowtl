/**
 * Single Table API Route Handler
 * GET /api/timeline/tables/:id
 * PUT /api/timeline/tables/:id
 * DELETE /api/timeline/tables/:id
 */

import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";
import type { ApiResponse, TimelineTable } from "@/types/reservation-timeline";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;
    const table = await mockStore.getTableById(id);

    if (!table) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "TABLE_NOT_FOUND",
            message: `Table ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<TimelineTable>>({
      success: true,
      data: table,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "GET_TABLE_ERROR",
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

    // Validate table exists
    const existing = await mockStore.getTableById(id);
    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "TABLE_NOT_FOUND",
            message: `Table ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    // Validate default duration if provided
    if (
      body.defaultReservationDuration &&
      ![15, 30, 45, 60].includes(body.defaultReservationDuration)
    ) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "INVALID_DURATION",
            message:
              "Default reservation duration must be 15, 30, 45, or 60 minutes",
          },
        },
        { status: 400 }
      );
    }

    const updated = await mockStore.updateTable(id, body);
    return NextResponse.json<ApiResponse<TimelineTable>>({
      success: true,
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "UPDATE_TABLE_ERROR",
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

    // Verify table exists
    const existing = await mockStore.getTableById(id);
    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "TABLE_NOT_FOUND",
            message: `Table ${id} not found`,
          },
        },
        { status: 404 }
      );
    }

    await mockStore.deleteTable(id);
    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "DELETE_TABLE_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}
