import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { shelterReviewDemoObservationSession } from "@/lib/observations/demo-store";

const reviewSchema = z.object({
  decision: z.enum(["approve", "revision", "reject"]),
  reason: z.string().optional()
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["shelter_staff", "admin"]);
    const { id } = await params;
    const payload = reviewSchema.parse(await request.json());
    return NextResponse.json(shelterReviewDemoObservationSession(user, id, payload.decision, payload.reason));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to confirm session." }, { status: 400 });
  }
}
