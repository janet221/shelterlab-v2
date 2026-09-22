import { NextResponse } from "next/server";
import { getCompetitionEvidenceDashboard } from "@/lib/competition/dashboard";

export async function GET() {
  return NextResponse.json(getCompetitionEvidenceDashboard(), {
    headers: { "Cache-Control": "public, max-age=60" }
  });
}
