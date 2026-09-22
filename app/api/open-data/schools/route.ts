import { NextResponse } from "next/server";
import { getSchoolDirectorySnapshot } from "@/lib/government-open-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getSchoolDirectorySnapshot();
  return NextResponse.json(payload, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } });
}

