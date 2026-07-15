import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { getDemoAttempt, submitDemoAttempt } from "@/lib/research-license/demo-store";

const submitPayloadSchema = z.object({
  answers: z.record(z.array(z.string())).optional()
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const { id } = await params;
    const attempt = getDemoAttempt(id);
    const payload = submitPayloadSchema.parse(await request.json());

    if (!attempt || attempt.studentId !== user.id) {
      return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
    }

    const result = submitDemoAttempt(user, id, payload.answers ?? attempt.answers);
    return NextResponse.json({
      attempt: {
        id: result.attempt.id,
        status: result.attempt.status,
        totalScore: result.attempt.totalScore,
        moduleScores: result.attempt.moduleScores,
        competencyScores: result.attempt.competencyScores
      },
      license: result.license,
      explanations: result.result.explanations,
      remediationRecommendations: result.remediationRecommendations
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit attempt." }, { status: 400 });
  }
}
