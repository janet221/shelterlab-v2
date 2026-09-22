import { NextResponse } from "next/server";
import { getPublicDemoManifest } from "@/lib/public-demo/engine";

export async function GET() {
  return NextResponse.json(getPublicDemoManifest());
}
