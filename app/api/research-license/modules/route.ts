import { NextResponse } from "next/server";
import { listPublishedLearningModules } from "@/lib/research-license/demo-store";

export async function GET() {
  return NextResponse.json({ modules: listPublishedLearningModules() });
}
