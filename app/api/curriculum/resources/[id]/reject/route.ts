import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyResourceRejection } from "@/lib/curriculum-library/demo-store";

const schema = z.object({ reason: z.string().trim().min(1) });

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const params = await context.params;
    const payload = schema.parse(await request.json());
    return NextResponse.json(await applyResourceRejection(user, params.id, payload.reason));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to reject resource." }, { status: 400 });
  }
}
