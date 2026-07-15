import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { submitDemoObservationSession } from "@/lib/observations/demo-store";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const { id } = await params;
    return NextResponse.json(submitDemoObservationSession(user, id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit session." }, { status: 400 });
  }
}
