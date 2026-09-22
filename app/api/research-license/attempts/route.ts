import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { startDemoAttempt } from "@/lib/research-license/demo-store";

export async function POST(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const result = startDemoAttempt(user);

    return NextResponse.json({
      attemptId: result.attempt.id,
      expiresAt: result.attempt.expiresAt,
      questions: result.questions
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start attempt." }, { status: 403 });
  }
}
