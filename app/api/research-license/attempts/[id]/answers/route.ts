import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { getDemoAttempt } from "@/lib/research-license/demo-store";

const answerPayloadSchema = z.object({
  attemptQuestionId: z.string(),
  selectedOptionIds: z.array(z.string())
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const { id } = await params;
    const attempt = getDemoAttempt(id);
    const payload = answerPayloadSchema.parse(await request.json());

    if (!attempt || attempt.studentId !== user.id || attempt.status !== "in_progress") {
      return NextResponse.json({ error: "Attempt not available." }, { status: 404 });
    }

    attempt.answers[payload.attemptQuestionId] = payload.selectedOptionIds;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save answer." }, { status: 400 });
  }
}
