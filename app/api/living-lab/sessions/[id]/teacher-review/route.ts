import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { teacherReviewApiSchema } from "@/lib/living-lab/api-schemas";
import { asLivingLabActor, runAuditedLivingLabMutation, sprint7DemoService } from "@/lib/living-lab/demo-store";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const actor = asLivingLabActor(requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"])); const input = teacherReviewApiSchema.parse(await request.json()); const { id } = await params; const result = await runAuditedLivingLabMutation(() => sprint7DemoService.teacherReview(actor, id, input.decision, input.reasonCode, input.reasonText, input.rubric, input.idempotencyKey, new Date())); return NextResponse.json(result); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to review." }, { status: 400 }); }
}
