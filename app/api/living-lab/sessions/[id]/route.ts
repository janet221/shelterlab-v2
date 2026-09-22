import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { asLivingLabActor, sprint7DemoService } from "@/lib/living-lab/demo-store";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const actor = asLivingLabActor(requireDemoUser(request.headers.get("x-test-code"))); const session = sprint7DemoService.getSession((await params).id); const mission = sprint7DemoService.getMission(session.missionId); const allowed = actor.role === "admin" || actor.id === session.studentId || actor.id === mission.teacherId || actor.authorizedShelterIds?.includes(session.shelterId); if (!allowed) throw new Error("Session access is forbidden."); return NextResponse.json({ session, reviews: sprint7DemoService.state.reviews.filter((review) => review.sessionId === session.id) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Session not found." }, { status: 403 }); }
}
