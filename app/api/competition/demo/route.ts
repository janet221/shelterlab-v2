import { NextResponse } from "next/server";
import { competitionDemoManifest } from "@/lib/impact/demo-mode";

export async function GET() {
  return NextResponse.json(competitionDemoManifest);
}

