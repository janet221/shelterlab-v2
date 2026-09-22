import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyReviewDraft } from "@/lib/curriculum-library/demo-store";

const schema = z.object({
  decision: z.enum(["approved", "revision_required", "rejected"]),
  reason: z.string().trim().optional()
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const params = await context.params;
    const payload = schema.parse(await request.json());
    return NextResponse.json(await applyReviewDraft(user, params.id, payload.decision, payload.reason));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to review draft." }, { status: 400 });
  }
}
