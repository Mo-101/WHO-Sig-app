import { NextRequest, NextResponse } from "next/server";
import { fetchBackendSignals, fetchLatestBackendSignals } from "@/lib/backend-client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 5000);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build filters from query params
    const filters: Record<string, string> = {};
    const filterKeys = ["Country", "Signal", "Source", "Admin1"];
    filterKeys.forEach((key) => {
      const value = searchParams.get(key);
      if (value) filters[key] = value;
    });

    const data = await fetchBackendSignals(limit, offset, filters);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    // Silently return empty response if backend unavailable
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn("[v0] Backend signals route error (using fallback):", errorMessage);
    
    return NextResponse.json(
      { error: null, total: 0, limit: 100, offset: 0, items: [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  }
}
