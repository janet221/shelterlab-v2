import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { phase2Questions } from "@/lib/research-license/phase2-data";

const createQuestionSchema = z.object({
  moduleCode: z.string(),
  prompt: z.string().min(1),
  explanation: z.string().min(1),
  difficulty: z.enum(["basic", "intermediate", "advanced"]),
  questionType: z.enum(["single_choice", "multiple_choice", "true_false", "scenario_choice"])
});

export async function GET(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    return NextResponse.json({
      questions: phase2Questions.map((question) => ({
        id: question.id,
        moduleCode: question.moduleCode,
        prompt: question.prompt,
        difficulty: question.difficulty,
        status: question.status,
        version: question.version
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const payload = createQuestionSchema.parse(await request.json());

    return NextResponse.json(
      {
        question: {
          id: `draft_${Date.now()}`,
          ...payload,
          status: "draft",
          createdBy: user.id
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create question." }, { status: 400 });
  }
}
