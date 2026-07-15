import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { phase4CurriculumResources } from "@/lib/curriculum-library/phase4-data";
import { sprint6DatasetRegistry } from "@/lib/government-data/sprint6-fixtures";
import { phase2LearningStandards } from "@/lib/research-license/phase2-data";
import { getQuestionGenerationProvider, questionGenerationInputSchema } from "@/lib/question-generation/provider";
import { validateGeneratedQuestionQuality } from "@/lib/question-generation/quality";

const requestSchema = z.object({
  provider: z.enum(["deterministic", "mock-ai", "external"]).default("deterministic"),
  input: questionGenerationInputSchema
});

export async function POST(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const payload = requestSchema.parse(await request.json());
    const provider = getQuestionGenerationProvider(payload.provider);
    const context = {
      resourceIds: new Set(phase4CurriculumResources.filter((resource) => resource.verificationStatus === "approved_for_course" && resource.availabilityStatus === "active").map((resource) => resource.id)),
      standardIds: new Set(phase2LearningStandards.map((standard) => standard.id)),
      datasetStates: new Map(sprint6DatasetRegistry.map((dataset) => [dataset.datasetId, dataset.verificationState] as const)),
      demoMode: true
    };
    const draft = await provider.generate(payload.input, context);
    const qualityFlags = validateGeneratedQuestionQuality(draft, {
      requiresGovernmentData: payload.input.requiresGovernmentData,
      knownResourceIds: context.resourceIds,
      knownStandardIds: context.standardIds,
      knownDatasetIds: new Set(context.datasetStates.keys()),
      gradeBand: payload.input.gradeBand
    });
    return NextResponse.json({ status: "AI_DRAFT", draft, qualityFlags }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate draft." }, { status: 400 });
  }
}
