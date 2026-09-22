import { NextResponse } from "next/server";
import { sprint7DemoService } from "@/lib/living-lab/demo-store";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = sprint7DemoService.getPublicProfile((await params).id);
  return profile ? NextResponse.json({ profile }) : NextResponse.json({ error: "No shelter-approved evidence profile." }, { status: 404 });
}
