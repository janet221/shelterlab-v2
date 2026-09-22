import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { reviewQuestion } from "@/lib/research-license/engine";

const reviewPayloadSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  createdById: z.string().optional(),
  reason: z.string().trim().optional()
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const { id } = await params;
    const payload = reviewPayloadSchema.parse(await request.json());
    const result = reviewQuestion({
      actor,
      question: {
        id,
        createdById: payload.createdById,
        status: "pending_review"
      },
      decision: payload.decision,
      reason: payload.reason
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to review question." }, { status: 400 });
  }
}
