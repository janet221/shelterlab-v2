import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { idempotencySchema } from "@/lib/living-lab/api-schemas";
import { asLivingLabActor, runAuditedLivingLabMutation, sprint7DemoService } from "@/lib/living-lab/demo-store";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const actor = asLivingLabActor(requireDemoUser(request.headers.get("x-test-code"), ["student"])); const input = idempotencySchema.parse(await request.json()); const { id } = await params; const result = await runAuditedLivingLabMutation(() => sprint7DemoService.createRevision(actor, id, input.idempotencyKey, new Date())); return NextResponse.json(result, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create revision." }, { status: 400 }); }
}
