import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { missionUpdateApiSchema } from "@/lib/living-lab/api-schemas";
import { asLivingLabActor, runAuditedLivingLabMutation, sprint7DemoService } from "@/lib/living-lab/demo-store";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { requireDemoUser(request.headers.get("x-test-code")); return NextResponse.json({ mission: sprint7DemoService.getMission((await params).id) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Mission not found." }, { status: 404 }); }
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = asLivingLabActor(requireDemoUser(request.headers.get("x-test-code"), ["teacher", "shelter_staff", "admin"])); const { id } = await params;
    const input = missionUpdateApiSchema.parse(await request.json());
    const result = await runAuditedLivingLabMutation(() => input.action === "update" ? sprint7DemoService.updateDraftMission(actor, id, input.patch, new Date()) : input.action === "submit_for_shelter" ? sprint7DemoService.submitMissionForShelter(actor, id, new Date()) : input.action === "cancel" ? sprint7DemoService.cancelMission(actor, id, input.reason, new Date()) : sprint7DemoService.adminOverride(actor, "mission", id, input.status, input.reason, new Date()));
    return NextResponse.json(result);
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update mission." }, { status: 400 }); }
}
