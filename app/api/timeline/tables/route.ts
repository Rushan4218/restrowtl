/**
 * Tables API Route Handler
 * GET /api/timeline/tables
 * PUT /api/timeline/tables/:id
 * DELETE /api/timeline/tables/:id
 */

import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";
import type { ApiResponse, TimelineTable } from "@/types/reservation-timeline";

export async function GET(request: NextRequest) {
  try {
    const tables = await mockStore.getTables();
    return NextResponse.json<ApiResponse<TimelineTable[]>>({
      success: true,
      data: tables,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "GET_TABLES_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "POST not supported. Use PUT to update a table.",
      },
    },
    { status: 405 }
  );
}
