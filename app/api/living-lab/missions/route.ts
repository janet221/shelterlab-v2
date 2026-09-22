import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { createMissionApiSchema, missionListQuerySchema } from "@/lib/living-lab/api-schemas";
import { asLivingLabActor, runAuditedLivingLabMutation, sprint7DemoService } from "@/lib/living-lab/demo-store";

export async function GET(request: NextRequest) {
  try {
    const actor = asLivingLabActor(requireDemoUser(request.headers.get("x-test-code")));
    const { at } = missionListQuerySchema.parse({ at: request.nextUrl.searchParams.get("at") ?? undefined });
    const now = at ?? new Date();
    const missions = actor.role === "student" ? sprint7DemoService.listAvailableMissions(actor, now) : [...sprint7DemoService.state.missions.values()].filter((mission) => actor.role === "admin" || mission.teacherId === actor.id || actor.authorizedShelterIds?.includes(mission.shelterId));
    return NextResponse.json({ missions });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list missions." }, { status: error instanceof ZodError ? 400 : 403 }); }
}

export async function POST(request: NextRequest) {
  try {
    const actor = asLivingLabActor(requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]));
    const input = createMissionApiSchema.parse(await request.json());
    const result = await runAuditedLivingLabMutation(() => sprint7DemoService.createMission(actor, input, new Date()));
    return NextResponse.json(result, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create mission." }, { status: 400 }); }
}
