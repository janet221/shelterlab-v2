import { NextResponse } from "next/server";
import { getShelterStatsSnapshot } from "@/lib/government-open-data";

export const dynamic = "force-dynamic";
export async function GET() {
  const payload = await getShelterStatsSnapshot();
  return NextResponse.json(payload, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
