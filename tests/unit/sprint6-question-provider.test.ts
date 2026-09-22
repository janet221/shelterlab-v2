import { describe, expect, it } from "vitest";
import { phase4CurriculumResources, phase4QuestionDrafts } from "../../lib/curriculum-library/phase4-data";
import { assertQuestionDraftApprovable, reviewQuestionDraft } from "../../lib/curriculum-library/services";
import { canMarkLearningStandardOfficial } from "../../lib/curriculum-library/standard-verification";
import { sprint6DatasetRegistry } from "../../lib/government-data/sprint6-fixtures";
import { phase2LearningStandards } from "../../lib/research-license/phase2-data";
import {
  DeterministicQuestionGenerationProvider,
  ExternalAIQuestionGenerationProvider,
  MockAIQuestionGenerationProvider,
  type QuestionGenerationInput
} from "../../lib/question-generation/provider";
import { hasBlockingQualityFlags, validateGeneratedQuestionQuality } from "../../lib/question-generation/quality";

const input: QuestionGenerationInput = {
  blueprintId: "qgb_urban_ecology_v1",
  moduleCode: "URBAN_ECOLOGY",
  approvedResourceIds: ["res_synthetic_eduod_literacy"],
  learningStandardIds: ["std_demo_data_interpretation"],
  governmentDatasetIds: ["SYNTHETIC_EDUOD_001"],
  requiresGovernmentData: true,
  educationLevel: "junior_high",
  gradeBand: "7-9",
  bloomLevel: "apply",
  difficulty: "intermediate",
  questionType: "single_choice",
  scenarioContext: "Interpret a clearly labeled synthetic completion-rate fixture.",
  prohibitedContent: ["diagnosis", "official-code fabrication", "copyrighted exam text"],
  promptVersion: "shelterlab-s6-v1"
};

const context = {
  resourceIds: new Set(phase4CurriculumResources.filter((resource) => resource.verificationStatus === "approved_for_course").map((resource) => resource.id)),
  standardIds: new Set(phase2LearningStandards.map((standard) => standard.id)),
  datasetStates: new Map(sprint6DatasetRegistry.map((dataset) => [dataset.datasetId, dataset.verificationState] as const)),
  demoMode: true,
  generatedAt: new Date("2026-07-11T02:00:00.000Z")
};

describe("Sprint 6 provider-neutral question generation", () => {
  it("generates a typed AI draft without publishing or approving it", async () => {
    const output = await new DeterministicQuestionGenerationProvider().generate(input, context);

    expect(output.provider_name).toBe("deterministic");
    expect(output.risk_flags).toContain("AI_DRAFT");
    expect(output.risk_flags).toContain("TEACHER_REVIEW_REQUIRED");
    expect(JSON.stringify(output)).not.toContain('"status":"published"');
  });

  it("supports a mock provider without credentials and keeps the external provider disabled", async () => {
    expect((await new MockAIQuestionGenerationProvider().generate(input, context)).provider_name).toBe("mock-ai");
    await expect(new ExternalAIQuestionGenerationProvider().generate(input, context)).rejects.toThrow("disabled");
  });

  it("rejects fabricated source IDs before generation", async () => {
    await expect(new DeterministicQuestionGenerationProvider().generate({ ...input, governmentDatasetIds: ["FABRICATED-999"] }, context)).rejects.toThrow("invalid");
  });

  it("blocks question approval when resource or standard mappings are missing", () => {
    const draft = { ...phase4QuestionDrafts[0], teacherReviewStatus: "pending_review" as const, createdBy: "teacher_a" };

    expect(() => assertQuestionDraftApprovable({ ...draft, sourceResourceIds: [] })).toThrow("source resources");
    expect(() => assertQuestionDraftApprovable({ ...draft, learningStandardIds: [] })).toThrow("learning-standard");
  });

  it("blocks unverified dataset provenance from question approval", () => {
    const draft = { ...phase4QuestionDrafts[0], governmentDatasetIds: ["6318"] };

    expect(() => assertQuestionDraftApprovable(draft)).toThrow("Unverified datasets");
  });

  it("requires exactly one valid answer for single-choice approval", () => {
    const draft = { ...phase4QuestionDrafts[0], questionType: "single_choice" as const, correctOptionKeys: ["A", "B"] };

    expect(() => assertQuestionDraftApprovable(draft)).toThrow("exactly one");
  });

  it("returns deterministic quality flags without rewriting the draft", async () => {
    const output = await new DeterministicQuestionGenerationProvider().generate(input, context);
    const original = structuredClone(output);
    const flagged = {
      ...output,
      prompt: "This very cute dog always has rabies.",
      options: output.options.map((option, index) => index === 1 ? { ...option, optionText: output.options[0].optionText } : option)
    };
    const flags = validateGeneratedQuestionQuality(flagged, {
      requiresGovernmentData: true,
      knownResourceIds: context.resourceIds,
      knownStandardIds: context.standardIds,
      knownDatasetIds: new Set(context.datasetStates.keys()),
      existingPrompts: [flagged.prompt]
    });

    expect(flags.map((flag) => flag.code)).toEqual(expect.arrayContaining(["DUPLICATE_OPTIONS", "ABSOLUTE_WORDING", "SUBJECTIVE_WORDING", "UNSUPPORTED_HEALTH_CLAIM", "HIGH_SIMILARITY"]));
    expect(hasBlockingQualityFlags(flags)).toBe(true);
    expect(output).toEqual(original);
  });

  it("keeps independent approval and separate publication governance", () => {
    const draft = { ...phase4QuestionDrafts[0], teacherReviewStatus: "pending_review" as const, createdBy: "teacher_a" };
    expect(() => reviewQuestionDraft({ id: "teacher_a", role: "teacher" }, draft, "approved")).toThrow("cannot approve");
    const approved = reviewQuestionDraft({ id: "teacher_b", role: "teacher" }, draft, "approved");
    expect(approved.draft.teacherReviewStatus).toBe("approved");
    expect(approved.auditEvent.action).toBe("question_draft_approved");
  });

  it("does not allow demo curriculum codes to become official", () => {
    const demo = phase2LearningStandards[0];
    expect(canMarkLearningStandardOfficial(demo)).toBe(false);
  });
});
