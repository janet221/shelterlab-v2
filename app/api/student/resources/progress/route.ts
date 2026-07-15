import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyResourceProgress } from "@/lib/curriculum-library/demo-store";

const schema = z.object({
  resourceId: z.string().min(1),
  action: z.enum(["opened", "completed"])
});

export async function POST(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const payload = schema.parse(await request.json());
    return NextResponse.json({ progress: await applyResourceProgress(user, payload.resourceId, payload.action) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to record progress." }, { status: 400 });
  }
}
