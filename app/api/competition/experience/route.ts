import { NextResponse } from "next/server";
import { getCompetitionExperienceManifest } from "@/lib/competition-experience/engine";

export async function GET() {
  return NextResponse.json(getCompetitionExperienceManifest());
}
