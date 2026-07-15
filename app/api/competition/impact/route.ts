import { NextResponse } from "next/server";
import { sprint8ImpactSnapshot } from "@/lib/impact/demo-data";
import { sprint8CompetitionScorecard } from "@/lib/impact/scorecard";

export async function GET() {
  return NextResponse.json({
    readOnly: true,
    externalApiCalled: false,
    aiGeneratedMetrics: false,
    snapshot: sprint8ImpactSnapshot,
    scorecard: sprint8CompetitionScorecard
  });
}

