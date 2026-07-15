import { z } from "zod";
import { generatedQuestionDraftSchema, type GeneratedQuestionDraftOutput } from "../curriculum-library/types";
import { evidenceVerificationStates } from "../government-data/evidence-types";

export const questionGenerationInputSchema = z.object({
  blueprintId: z.string().min(1),
  moduleCode: z.enum(["DOG_BEHAVIOR", "ONE_HEALTH", "URBAN_ECOLOGY", "SHELTER_SAFETY", "RESEARCH_ETHICS"]),
  approvedResourceIds: z.array(z.string().min(1)).min(1),
  learningStandardIds: z.array(z.string().min(1)).min(1),
  governmentDatasetIds: z.array(z.string().min(1)),
  requiresGovernmentData: z.boolean(),
  educationLevel: z.string().min(1),
  gradeBand: z.string().min(1),
  bloomLevel: z.enum(["remember", "understand", "apply", "analyze", "evaluate"]),
  difficulty: z.enum(["basic", "intermediate", "advanced"]),
  questionType: z.enum(["single_choice", "multiple_choice", "true_false", "scenario_choice"]),
  scenarioContext: z.string().min(1),
  prohibitedContent: z.array(z.string()),
  promptVersion: z.string().min(1)
});

export type QuestionGenerationInput = z.infer<typeof questionGenerationInputSchema>;

export type QuestionGenerationContext = {
  resourceIds: Set<string>;
  standardIds: Set<string>;
  datasetStates: Map<string, (typeof evidenceVerificationStates)[number]>;
  demoMode: boolean;
  generatedAt?: Date;
};

export interface QuestionGenerationProvider {
  readonly name: string;
  readonly version: string;
  readonly enabled: boolean;
  generate(input: QuestionGenerationInput, context: QuestionGenerationContext): Promise<GeneratedQuestionDraftOutput>;
}

function assertSourceIntegrity(input: QuestionGenerationInput, context: QuestionGenerationContext) {
  const missingResources = input.approvedResourceIds.filter((id) => !context.resourceIds.has(id));
  const missingStandards = input.learningStandardIds.filter((id) => !context.standardIds.has(id));
  const missingDatasets = input.governmentDatasetIds.filter((id) => !context.datasetStates.has(id));
  if (missingResources.length || missingStandards.length || missingDatasets.length) {
    throw new Error(`Generation source IDs are invalid: ${[...missingResources, ...missingStandards, ...missingDatasets].join(", ")}`);
  }
  if (input.requiresGovernmentData && input.governmentDatasetIds.length === 0) {
    throw new Error("Blueprint requires government-data provenance.");
  }
  const blockedDatasets = input.governmentDatasetIds.filter((id) => {
    const state = context.datasetStates.get(id);
    return state !== "VERIFIED" && !(context.demoMode && state === "SYNTHETIC_DEMO");
  });
  if (blockedDatasets.length) {
    throw new Error(`Unverified datasets cannot feed generated assessment drafts: ${blockedDatasets.join(", ")}`);
  }
}

function buildDeterministicOutput(
  input: QuestionGenerationInput,
  context: QuestionGenerationContext,
  providerName: string,
  providerVersion: string
): GeneratedQuestionDraftOutput {
  assertSourceIntegrity(input, context);
  const dataSentence = input.governmentDatasetIds.length
    ? "The source is a clearly labeled synthetic dataset used to practice evidence interpretation."
    : "The source is an approved ShelterLab-authored learning resource.";
  return generatedQuestionDraftSchema.parse({
    prompt: `SYNTHETIC_DEMO AI_DRAFT: Which statement best applies ${input.moduleCode} evidence in this scenario?`,
    question_type: input.questionType,
    options: [
      { optionKey: "A", optionText: "Describe the observed or supplied evidence and state its limits." },
      { optionKey: "B", optionText: "Infer a permanent trait from one signal." },
      { optionKey: "C", optionText: "Treat a demo source as a verified government record." },
      { optionKey: "D", optionText: "Skip teacher review because the draft was generated." }
    ],
    correct_option_keys: ["A"],
    explanation: `Option A is correct because evidence must be described with limits. ${dataSentence}`,
    source_resource_ids: input.approvedResourceIds,
    learning_standard_ids: input.learningStandardIds,
    government_dataset_ids: input.governmentDatasetIds,
    bloom_level: input.bloomLevel,
    difficulty: input.difficulty,
    risk_flags: ["AI_DRAFT", "TEACHER_REVIEW_REQUIRED", "SYNTHETIC_DEMO"],
    unsupported_claim_flags: [],
    similarity_flags: [],
    confidence_note: "Structured draft generated from supplied IDs; human review is required.",
    provider_name: providerName,
    provider_version: providerVersion,
    prompt_version: input.promptVersion,
    generated_timestamp: (context.generatedAt ?? new Date("2026-07-11T02:00:00.000Z")).toISOString()
  });
}

export class DeterministicQuestionGenerationProvider implements QuestionGenerationProvider {
  readonly name = "deterministic";
  readonly version = "shelterlab-s6-v1";
  readonly enabled = true;

  async generate(input: QuestionGenerationInput, context: QuestionGenerationContext) {
    return buildDeterministicOutput(questionGenerationInputSchema.parse(input), context, this.name, this.version);
  }
}

export class MockAIQuestionGenerationProvider implements QuestionGenerationProvider {
  readonly name = "mock-ai";
  readonly version = "shelterlab-s6-mock-v1";
  readonly enabled = true;

  async generate(input: QuestionGenerationInput, context: QuestionGenerationContext) {
    return buildDeterministicOutput(questionGenerationInputSchema.parse(input), context, this.name, this.version);
  }
}

export class ExternalAIQuestionGenerationProvider implements QuestionGenerationProvider {
  readonly name = "external-disabled";
  readonly version = "not-configured";
  readonly enabled = false;

  async generate(input: QuestionGenerationInput, context: QuestionGenerationContext): Promise<GeneratedQuestionDraftOutput> {
    void input;
    void context;
    throw new Error("External AI provider is disabled. Use deterministic or mock generation.");
  }
}

export function getQuestionGenerationProvider(name: string | undefined): QuestionGenerationProvider {
  if (name === "mock-ai") return new MockAIQuestionGenerationProvider();
  if (name === "external") return new ExternalAIQuestionGenerationProvider();
  return new DeterministicQuestionGenerationProvider();
}
