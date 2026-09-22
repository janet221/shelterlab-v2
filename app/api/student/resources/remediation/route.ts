import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { recommendRemediationResources } from "@/lib/curriculum-library/services";

const schema = z.object({
  moduleScores: z.record(z.number().int().min(0).max(100))
});

export async function POST(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const payload = schema.parse(await request.json());
    return NextResponse.json({ recommendations: recommendRemediationResources(payload.moduleScores) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to recommend resources." }, { status: 400 });
  }
}
