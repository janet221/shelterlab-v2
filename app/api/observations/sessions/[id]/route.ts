import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { getDemoObservationSession, startDemoObservationSession } from "@/lib/observations/demo-store";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireDemoUser(request.headers.get("x-test-code"));
    const { id } = await params;
    return NextResponse.json({ session: getDemoObservationSession(id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Session not found." }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const { id } = await params;
    const body = await request.json();
    if (body.action !== "start") {
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    }
    return NextResponse.json(startDemoObservationSession(user, id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update session." }, { status: 400 });
  }
}
