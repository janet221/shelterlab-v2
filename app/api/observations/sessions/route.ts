import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { createDemoObservationSession } from "@/lib/observations/demo-store";

const createSessionSchema = z.object({ taskId: z.string() });

export async function POST(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const payload = createSessionSchema.parse(await request.json());
    const result = createDemoObservationSession(user, payload.taskId);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create session." }, { status: 400 });
  }
}
