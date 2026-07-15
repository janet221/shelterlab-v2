import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { generatedQuestionDraftSchema } from "@/lib/curriculum-library/types";
import { validateGeneratedQuestionQuality } from "@/lib/question-generation/quality";

const schema = z.object({
  draft: generatedQuestionDraftSchema,
  requiresGovernmentData: z.boolean().default(false),
  knownResourceIds: z.array(z.string()),
  knownStandardIds: z.array(z.string()),
  knownDatasetIds: z.array(z.string()),
  existingPrompts: z.array(z.string()).default([]),
  gradeBand: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const payload = schema.parse(await request.json());
    return NextResponse.json({ flags: validateGeneratedQuestionQuality(payload.draft, {
      requiresGovernmentData: payload.requiresGovernmentData,
      knownResourceIds: new Set(payload.knownResourceIds),
      knownStandardIds: new Set(payload.knownStandardIds),
      knownDatasetIds: new Set(payload.knownDatasetIds),
      existingPrompts: payload.existingPrompts,
      gradeBand: payload.gradeBand
    }) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to validate draft." }, { status: 400 });
  }
}
