import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { getDemoAttempt } from "@/lib/research-license/demo-store";
import { sanitizeAttemptQuestions } from "@/lib/research-license/engine";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const { id } = await params;
    const attempt = getDemoAttempt(id);

    if (!attempt || attempt.studentId !== user.id) {
      return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
    }

    return NextResponse.json({
      attemptId: attempt.id,
      status: attempt.status,
      expiresAt: attempt.expiresAt,
      questions: sanitizeAttemptQuestions(attempt)
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 403 });
  }
}
