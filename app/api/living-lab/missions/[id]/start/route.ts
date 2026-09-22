import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { startMissionSchema } from "@/lib/living-lab/api-schemas";
import { asLivingLabActor, runAuditedLivingLabMutation, sprint7DemoService } from "@/lib/living-lab/demo-store";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const actor = asLivingLabActor(requireDemoUser(request.headers.get("x-test-code"), ["student"])); const input = startMissionSchema.parse(await request.json()); const { id } = await params; const result = await runAuditedLivingLabMutation(() => sprint7DemoService.startMission(actor, id, input.idempotencyKey, new Date(), input.clientStartedAt)); return NextResponse.json(result, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start mission." }, { status: 400 }); }
}
