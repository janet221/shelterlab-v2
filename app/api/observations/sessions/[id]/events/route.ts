import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { addDemoBehaviorEvent } from "@/lib/observations/demo-store";
import { sprint3BehaviorCodes } from "@/lib/observations/session-engine";

const eventSchema = z.object({
  timestampSecond: z.number().int(),
  behaviorCode: z.enum(sprint3BehaviorCodes),
  durationSec: z.number().int(),
  confidence: z.number().min(0).max(1),
  observerNote: z.string().optional()
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const { id } = await params;
    const payload = eventSchema.parse(await request.json());
    return NextResponse.json({ session: addDemoBehaviorEvent(user, id, payload) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to add event." }, { status: 400 });
  }
}
