import { NextResponse } from "next/server";
import { getShelterNeedsSnapshot } from "@/lib/government-open-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getShelterNeedsSnapshot();
  return NextResponse.json(payload, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}

