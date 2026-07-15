import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { runAuditedAdoptionProfileMutation, sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import { asLivingLabActor } from "@/lib/living-lab/demo-store";

export async function POST(request: NextRequest, { params }: { params: Promise<{ dogId: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["shelter_staff", "admin"]);
    const actor = asLivingLabActor(user);
    const dogId = (await params).dogId;
    return NextResponse.json(await runAuditedAdoptionProfileMutation(() => sprint10ADemoService.publishProfile(actor, dogId, new Date())), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Profile publication failed." }, { status: 403 });
  }
}
