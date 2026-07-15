import { z } from "zod";
import { phase2LearningStandards, type LearningModuleCode } from "../research-license/phase2-data";
import { sprint6DatasetRegistry } from "../government-data/sprint6-fixtures";
import type { AuditEvent } from "../research-license/engine";
import {
  phase4CurriculumResources,
  phase4CoursePlan,
  phase4QuestionBlueprints,
  phase4QuestionDrafts,
  phase4ResourceMappings,
  phase4StudentResourceProgress
} from "./phase4-data";
import type {
  CurriculumResource,
  CurriculumUser,
  GeneratedQuestionDraftOutput,
  ImportPreviewRecord,
  ImportSummary,
  QuestionDraft,
  QuestionDraftStatus,
  QuestionGenerationBlueprint,
  ResourceImportProvider,
  ResourceMapping,
  StudentResourceProgress
} from "./types";
import { generatedQuestionDraftSchema } from "./types";

export const resourceReviewSchema = z.object({
  curriculumFit: z.string().trim().min(1),
  copyrightChecked: z.boolean(),
  studentSafetyChecked: z.boolean(),
  notes: z.string().trim().min(1)
});

export const resourceMetadataVerificationSchema = z.object({
  note: z.string().trim().min(1),
  officialSourceVerified: z.boolean().default(false),
  accessMethodVerified: z.boolean().default(false),
  reuseTermsVerified: z.boolean().default(false),
  outboundLinkOnly: z.boolean().default(true)
});

export const questionDraftEditSchema = z.object({
  prompt: z.string().trim().min(1).optional(),
  explanation: z.string().trim().min(1).optional(),
  options: z.array(z.object({ optionKey: z.string().trim().min(1), optionText: z.string().trim().min(1) })).min(2).optional(),
  correctOptionKeys: z.array(z.string().trim().min(1)).min(1).optional(),
  sourceResourceIds: z.array(z.string().min(1)).min(1).optional(),
  learningStandardIds: z.array(z.string().min(1)).min(1).optional(),
  reason: z.string().trim().min(1)
});

export const remediationThresholdPercent = 80;

export const blueprintInputSchema = z.object({
  code: z.string().trim().min(3),
  title: z.string().trim().min(3),
  moduleCode: z.enum(["DOG_BEHAVIOR", "ONE_HEALTH", "URBAN_ECOLOGY", "SHELTER_SAFETY", "RESEARCH_ETHICS"]),
  educationLevel: z.string().trim().min(1),
  gradeBand: z.string().trim().optional(),
  questionType: z.enum(["single_choice", "multiple_choice", "true_false", "scenario_choice"]),
  bloomLevel: z.enum(["remember", "understand", "apply", "analyze", "evaluate"]),
  difficulty: z.enum(["basic", "intermediate", "advanced"]),
  numberOfQuestions: z.number().int().min(1).max(10),
  requiredResourceCount: z.number().int().min(1),
  requiredLearningStandardCount: z.number().int().min(1),
  scenarioContext: z.string().trim().min(1),
  prohibitedContent: z.array(z.string()).default([]),
  promptVersion: z.string().trim().min(1).default("shelterlab-s6-v1"),
  requiresGovernmentData: z.boolean().default(false),
  sourceResourceIds: z.array(z.string().min(1)).default([]),
  learningStandardIds: z.array(z.string().min(1)).default([]),
  governmentDatasetIds: z.array(z.string().min(1)).default([]),
  qualityRules: z.record(z.unknown()).default({})
});

function assertTeacherOrAdmin(user: CurriculumUser) {
  if (user.role !== "teacher" && user.role !== "admin") {
    throw new Error("Only teachers and admins can perform this curriculum action.");
  }
}

function assertAdmin(user: CurriculumUser) {
  if (user.role !== "admin") {
    throw new Error("Only admins can perform this action.");
  }
}

export function listResourcesForTeacher(resources: CurriculumResource[] = phase4CurriculumResources): CurriculumResource[] {
  return [...resources].sort((a, b) => a.title.localeCompare(b.title));
}

export function listApprovedStudentResources(
  resources: CurriculumResource[] = phase4CurriculumResources,
  mappings: ResourceMapping[] = phase4ResourceMappings
): CurriculumResource[] {
  const activeMappedIds = new Set(
    mappings
      .filter((mapping) => mapping.targetType === "module" && mapping.mappingStatus === "active")
      .map((mapping) => mapping.resourceId)
  );
  return resources.filter(
    (resource) =>
      resource.verificationStatus === "approved_for_course" &&
      resource.availabilityStatus === "active" &&
      activeMappedIds.has(resource.id)
  );
}

export function verifyResourceMetadata(user: CurriculumUser, resource: CurriculumResource, input: unknown, now = new Date()) {
  assertTeacherOrAdmin(user);
  const evidence = resourceMetadataVerificationSchema.parse(typeof input === "string" ? { note: input } : input);
  if (resource.verificationStatus !== "unverified") {
    throw new Error("Only unverified resources can move to metadata_verified.");
  }
  const isExternalOfficialMetadata = resource.providerName !== "ShelterLab teacher-authored";
  if (isExternalOfficialMetadata && (!evidence.officialSourceVerified || !evidence.accessMethodVerified || !evidence.reuseTermsVerified)) {
    throw new Error("External official metadata must remain UNVERIFIED until source access and reuse terms are verified.");
  }
  if (resource.providerName === "NAER iLearn" && !evidence.outboundLinkOnly) {
    throw new Error("iLearn resources are metadata and outbound links only in the MVP.");
  }
  return {
    resource: { ...resource, verificationStatus: "metadata_verified" as const, verificationNote: evidence.note, verifiedBy: user.id, verifiedAt: now },
    auditEvent: statusAudit(user.id, user.role, "curriculum_resource", resource.id, "resource_metadata_verified", resource.verificationStatus, "metadata_verified", evidence, now)
  };
}

export function reviewResourceRelevance(user: CurriculumUser, resource: CurriculumResource, review: unknown, now = new Date()) {
  assertTeacherOrAdmin(user);
  const parsed = resourceReviewSchema.parse(review);
  if (resource.verificationStatus !== "metadata_verified" && resource.verificationStatus !== "content_reviewed") {
    throw new Error("Resource must have verified metadata before relevance review.");
  }
  if (!parsed.copyrightChecked || !parsed.studentSafetyChecked) {
    throw new Error("Copyright and student safety checks are required before course approval.");
  }
  const contentReviewAudit = resource.verificationStatus === "metadata_verified"
    ? statusAudit(user.id, user.role, "curriculum_resource", resource.id, "resource_content_reviewed", "metadata_verified", "content_reviewed", parsed, now)
    : undefined;
  const approvalAudit = statusAudit(user.id, user.role, "curriculum_resource", resource.id, "resource_approved_for_course", "content_reviewed", "approved_for_course", parsed, now);
  return {
    resource: {
      ...resource,
      verificationStatus: "approved_for_course" as const,
      verificationNote: `${parsed.curriculumFit} ${parsed.notes}`,
      verifiedBy: user.id,
      verifiedAt: now
    },
    auditEvent: approvalAudit,
    auditEvents: contentReviewAudit ? [contentReviewAudit, approvalAudit] : [approvalAudit]
  };
}

export function rejectResource(user: CurriculumUser, resource: CurriculumResource, reason: string) {
  assertTeacherOrAdmin(user);
  if (!reason.trim()) {
    throw new Error("Resource rejection requires a reason.");
  }
  return {
    resource: { ...resource, verificationStatus: "rejected" as const, rejectionReason: reason },
    auditEvent: statusAudit(user.id, user.role, "curriculum_resource", resource.id, "resource_rejected", resource.verificationStatus, "rejected", { reason })
  };
}

export function markResourceUnavailable(user: CurriculumUser, resource: CurriculumResource, reason: string) {
  assertTeacherOrAdmin(user);
  if (!reason.trim()) {
    throw new Error("Unavailable resources require a reason.");
  }
  return {
    resource: { ...resource, verificationStatus: "unavailable" as const, availabilityStatus: "unavailable" as const, verificationNote: reason },
    auditEvent: statusAudit(user.id, user.role, "curriculum_resource", resource.id, "resource_marked_unavailable", resource.verificationStatus, "unavailable", { reason })
  };
}

export function canUseResourceAsRequired(resource: CurriculumResource): boolean {
  return resource.verificationStatus === "approved_for_course" && resource.availabilityStatus === "active";
}

export function validateResourceMapping(resource: CurriculumResource, mapping: ResourceMapping) {
  if (mapping.requiredOrOptional === "required" && !canUseResourceAsRequired(resource)) {
    throw new Error("Only approved active resources can be required student material.");
  }
  return { ...mapping, mappingStatus: mapping.mappingStatus };
}

const mockImports: Record<ResourceImportProvider, ImportPreviewRecord[]> = {
  ilearn: [
    {
      provider: "ilearn",
      title: "UNVERIFIED_DEMO iLearn imported metadata placeholder",
      sourceUrl: "UNVERIFIED_DEMO_NO_REAL_URL",
      externalResourceId: "UNVERIFIED_ILEARN_IMPORT_001",
      resourceType: "video",
      validationFlags: ["UNVERIFIED_DEMO_METADATA", "NO_EXTERNAL_API_CALLED"]
    }
  ],
  government_dataset: [
    {
      provider: "government_dataset",
      title: "UNVERIFIED_DEMO data.gov.tw 41236 import candidate",
      sourceUrl: "https://data.gov.tw/dataset/41236",
      externalResourceId: "41236",
      resourceType: "government_dataset",
      validationFlags: ["MOCK_IMPORT_ONLY"]
    }
  ],
  manual_teacher: [
    {
      provider: "manual_teacher",
      title: "ShelterLab Manual Teacher Resource Draft",
      sourceUrl: "internal://shelterlab/manual/import-draft",
      externalResourceId: "MANUAL_TEACHER_IMPORT_001",
      resourceType: "teacher_material",
      validationFlags: ["TEACHER_REVIEW_REQUIRED"]
    }
  ]
};

export function previewResourceImport(provider: ResourceImportProvider, existingResources: CurriculumResource[] = phase4CurriculumResources) {
  const existingKeys = new Map<string, string>();
  for (const resource of existingResources) {
    existingKeys.set(`${resource.providerName}:${resource.externalResourceId ?? resource.sourceUrl}`, resource.id);
  }
  return (mockImports[provider] ?? []).map((record) => {
    const providerName = provider === "government_dataset" ? "data.gov.tw" : provider === "ilearn" ? "NAER iLearn" : "ShelterLab teacher-authored";
    const duplicateOf = existingKeys.get(`${providerName}:${record.externalResourceId ?? record.sourceUrl}`);
    return { ...record, duplicateOf, validationFlags: duplicateOf ? [...record.validationFlags, "DUPLICATE"] : record.validationFlags };
  });
}

export function importMockResources(user: CurriculumUser, provider: ResourceImportProvider, existingResources: CurriculumResource[] = phase4CurriculumResources) {
  assertAdmin(user);
  const preview = previewResourceImport(provider, existingResources);
  const summary: ImportSummary = {
    provider,
    previewCount: preview.length,
    importedCount: preview.filter((record) => !record.duplicateOf && record.validationFlags.length === 0).length,
    duplicateCount: preview.filter((record) => record.duplicateOf).length,
    failedRecords: preview.filter((record) => record.validationFlags.length > 0),
    lastSyncMetadata: {
      mode: "mock",
      externalApiCalled: false,
      completedAt: new Date("2026-01-04T02:00:00.000Z").toISOString()
    }
  };
  return {
    summary,
    auditEvent: statusAudit(user.id, user.role, "resource_import_run", `${provider}_mock_import`, "resource_import", undefined, "completed", {
      provider,
      importedCount: summary.importedCount,
      duplicateCount: summary.duplicateCount,
      externalApiCalled: false
    })
  };
}

export function createQuestionGenerationBlueprint(user: CurriculumUser, input: unknown) {
  assertTeacherOrAdmin(user);
  const parsed = blueprintInputSchema.parse(input);
  const blueprint: QuestionGenerationBlueprint = {
    id: `qgb_${parsed.code.toLowerCase()}_draft`,
    ...parsed,
    status: "draft",
    version: 1,
    createdBy: user.id
  };
  return {
    blueprint,
    auditEvent: statusAudit(user.id, user.role, "question_generation_blueprint", blueprint.id, "generation_blueprint_created", undefined, "draft", { blueprint })
  };
}

export function deterministicQuestionDraftGenerator(
  blueprint: QuestionGenerationBlueprint,
  approvedResources: CurriculumResource[],
  learningStandardIds: string[]
): GeneratedQuestionDraftOutput[] {
  if (approvedResources.length < blueprint.requiredResourceCount) {
    throw new Error("Blueprint does not have enough approved resources.");
  }
  if (learningStandardIds.length < blueprint.requiredLearningStandardCount) {
    throw new Error("Blueprint does not have enough learning standards.");
  }

  return Array.from({ length: blueprint.numberOfQuestions }, (_, index) =>
    generatedQuestionDraftSchema.parse({
      prompt: `DEMO_AI_DRAFT ${index + 1}: Which option best matches ${blueprint.moduleCode} with approved source evidence?`,
      question_type: blueprint.questionType,
      options: [
        { optionKey: "A", optionText: "A claim supported by the approved resource and learning standard." },
        { optionKey: "B", optionText: "A copied passage from a source." },
        { optionKey: "C", optionText: "A subjective statement without evidence." },
        { optionKey: "D", optionText: "A final diagnosis or adoption claim." }
      ],
      correct_option_keys: ["A"],
      explanation: "DEMO_AI_DRAFT explanation: approved questions must be evidence-aligned and teacher reviewed.",
      source_resource_ids: approvedResources.slice(0, blueprint.requiredResourceCount).map((resource) => resource.id),
      learning_standard_ids: learningStandardIds.slice(0, blueprint.requiredLearningStandardCount),
      government_dataset_ids: blueprint.governmentDatasetIds,
      bloom_level: blueprint.bloomLevel,
      difficulty: blueprint.difficulty,
      risk_flags: ["DEMO_AI_DRAFT", "TEACHER_REVIEW_REQUIRED"],
      unsupported_claim_flags: [],
      similarity_flags: [],
      confidence_note: "Deterministic mock generator; no LLM used.",
      provider_name: "deterministic",
      provider_version: "shelterlab-s6-v1",
      prompt_version: blueprint.promptVersion,
      generated_timestamp: new Date("2026-07-11T02:00:00.000Z").toISOString()
    })
  );
}

export function runDraftGeneration(user: CurriculumUser, blueprint: QuestionGenerationBlueprint) {
  assertTeacherOrAdmin(user);
  const approvedResources = listApprovedStudentResources().filter((resource) =>
    phase4ResourceMappings.some(
      (mapping) => mapping.resourceId === resource.id && mapping.targetType === "module" && mapping.targetId === blueprint.moduleCode
    )
  );
  const standardIds = phase2LearningStandards
    .filter((standard) => standard.moduleCodes.includes(blueprint.moduleCode))
    .map((standard) => standard.id);

  const drafts: QuestionDraft[] = deterministicQuestionDraftGenerator(blueprint, approvedResources, standardIds).map((draft, index) => ({
    id: `qd_generated_${blueprint.code.toLowerCase()}_${index + 1}`,
    generationBlueprintId: blueprint.id,
    coursePlanId: phase4CoursePlan.id,
    moduleCode: blueprint.moduleCode,
    version: 1,
    prompt: draft.prompt,
    questionType: draft.question_type,
    options: draft.options,
    correctOptionKeys: draft.correct_option_keys,
    explanation: draft.explanation,
    sourceResourceIds: draft.source_resource_ids,
    sourceExcerptNotes: "DEMO_AI_DRAFT generated from resource metadata and teacher-authored summaries only.",
    learningStandardIds: draft.learning_standard_ids,
    governmentDatasetIds: draft.government_dataset_ids,
    generationMethod: "ai_assisted",
    modelName: "DEMO_DETERMINISTIC_GENERATOR",
    modelVersion: "phase4-mock-v1",
    providerName: draft.provider_name,
    providerVersion: draft.provider_version,
    promptVersion: draft.prompt_version,
    generationTimestamp: new Date(draft.generated_timestamp),
    factualityCheckStatus: "warning",
    sourceAlignmentStatus: "passed",
    teacherReviewStatus: "ai_draft",
    riskFlags: draft.risk_flags,
    similarityFlags: draft.similarity_flags,
    unsupportedClaimFlags: draft.unsupported_claim_flags,
    bloomLevel: draft.bloom_level,
    difficulty: draft.difficulty,
    confidenceNote: draft.confidence_note,
    createdBy: user.id
  }));
  return {
    drafts,
    auditEvent: statusAudit(user.id, user.role, "question_generation_blueprint", blueprint.id, "question_generation", blueprint.status, blueprint.status, {
      generationMethod: "DEMO_DETERMINISTIC_GENERATOR",
      generatedDraftIds: drafts.map((draft) => draft.id),
      automaticPublication: false
    })
  };
}

export function submitDraftForReview(user: CurriculumUser, draft: QuestionDraft) {
  assertTeacherOrAdmin(user);
  if (!(["ai_draft", "draft", "revision_required"] as QuestionDraftStatus[]).includes(draft.teacherReviewStatus)) {
    throw new Error("Only AI drafts, drafts, or revision-required drafts can be submitted for review.");
  }
  return {
    draft: { ...draft, teacherReviewStatus: "pending_review" as const },
    auditEvent: statusAudit(user.id, user.role, "question_draft", draft.id, "question_draft_submitted", draft.teacherReviewStatus, "pending_review")
  };
}

export function reviewQuestionDraft(
  user: CurriculumUser,
  draft: QuestionDraft,
  decision: "approved" | "revision_required" | "rejected",
  reason?: string,
  now = new Date()
) {
  assertTeacherOrAdmin(user);
  if (draft.teacherReviewStatus !== "pending_review") {
    throw new Error("Only PENDING_REVIEW question drafts can be reviewed.");
  }
  if (user.role !== "admin" && draft.createdBy === user.id && decision === "approved") {
    throw new Error("Question draft authors cannot approve their own draft unless admin.");
  }
  if ((decision === "revision_required" || decision === "rejected") && !reason?.trim()) {
    throw new Error("Revision or rejection requires a reason.");
  }
  if (decision === "approved") {
    assertQuestionDraftApprovable(draft);
  }
  const next: QuestionDraftStatus = decision === "approved" ? "approved" : decision;
  return {
    draft: {
      ...draft,
      teacherReviewStatus: next,
      teacherRevisionNotes: reason,
      reviewedBy: user.id,
      approvedAt: decision === "approved" ? now : draft.approvedAt
    },
    auditEvent: statusAudit(user.id, user.role, "question_draft", draft.id, `question_draft_${next}`, draft.teacherReviewStatus, next, { reason }, now)
  };
}

export function publishQuestionDraft(user: CurriculumUser, draft: QuestionDraft, resources: CurriculumResource[] = phase4CurriculumResources) {
  assertTeacherOrAdmin(user);
  if (draft.teacherReviewStatus !== "approved") {
    throw new Error("Only approved drafts can be published.");
  }
  const sourceResources = resources.filter((resource) => draft.sourceResourceIds.includes(resource.id));
  if (sourceResources.length === 0 || !sourceResources.every(canUseResourceAsRequired)) {
    throw new Error("Publishing requires approved active source resources.");
  }
  if (draft.learningStandardIds.length === 0) {
    throw new Error("Publishing requires at least one learning standard.");
  }
  assertQuestionDraftApprovable(draft, resources);
  if (user.role === "teacher" && !user.authorizedCoursePlanIds?.includes(draft.coursePlanId)) {
    throw new Error("Teachers may publish only within authorized courses or classes.");
  }
  const now = new Date();
  return {
    draft: {
      ...draft,
      teacherReviewStatus: "published" as const,
      publishedQuestionId: `published_${draft.id}`,
      publishedBy: user.id,
      publishedAt: now
    },
    auditEvent: statusAudit(user.id, user.role, "question_draft", draft.id, "question_draft_published", "approved", "published", {
      coursePlanId: draft.coursePlanId,
      publicationScope: user.role === "admin" ? "global" : "authorized_course"
    }, now)
  };
}

export function assertQuestionDraftApprovable(
  draft: QuestionDraft,
  resources: CurriculumResource[] = phase4CurriculumResources
) {
  const sourceResources = resources.filter((resource) => draft.sourceResourceIds.includes(resource.id));
  if (draft.sourceResourceIds.length === 0 || sourceResources.length !== draft.sourceResourceIds.length || !sourceResources.every(canUseResourceAsRequired)) {
    throw new Error("Question approval requires approved active source resources.");
  }
  const standards = phase2LearningStandards.filter((standard) => draft.learningStandardIds.includes(standard.id));
  if (draft.learningStandardIds.length === 0 || standards.length !== draft.learningStandardIds.length) {
    throw new Error("Question approval requires valid learning-standard mappings.");
  }
  const blueprint = phase4QuestionBlueprints.find((item) => item.id === draft.generationBlueprintId);
  if (blueprint?.requiresGovernmentData && draft.governmentDatasetIds.length === 0) {
    throw new Error("Question approval requires government-data provenance for this blueprint.");
  }
  const datasetStates = new Map(sprint6DatasetRegistry.map((dataset) => [dataset.datasetId, dataset] as const));
  if (draft.governmentDatasetIds.some((id) => {
    const dataset = datasetStates.get(id);
    return !dataset || !dataset.active || !dataset.assessmentUseAllowed || !["VERIFIED", "SYNTHETIC_DEMO"].includes(dataset.verificationState);
  })) {
    throw new Error("Unverified datasets cannot feed an approved assessment question.");
  }
  const optionKeys = draft.options.map((option) => option.optionKey);
  if (new Set(optionKeys).size !== optionKeys.length || draft.correctOptionKeys.some((key) => !optionKeys.includes(key))) {
    throw new Error("Question approval requires valid unique options and answer keys.");
  }
  if (draft.questionType === "single_choice" && draft.correctOptionKeys.length !== 1) {
    throw new Error("Single-choice questions require exactly one correct answer.");
  }
  if (!draft.explanation.trim() || !draft.bloomLevel || !draft.difficulty || draft.version < 1) {
    throw new Error("Question approval requires explanation, Bloom level, difficulty, and version.");
  }
}

export function recommendRemediationResources(
  moduleScores: Partial<Record<LearningModuleCode, number>>,
  resources: CurriculumResource[] = phase4CurriculumResources,
  mappings: ResourceMapping[] = phase4ResourceMappings
) {
  const weakModules = Object.entries(moduleScores)
    .filter(([, score]) => (score ?? 100) < remediationThresholdPercent)
    .map(([moduleCode]) => moduleCode as LearningModuleCode);
  return weakModules.flatMap((moduleCode) =>
    mappings
      .filter((mapping) => mapping.targetType === "module" && mapping.targetId === moduleCode && mapping.mappingStatus === "active")
      .sort((a, b) => b.remediationPriority - a.remediationPriority)
      .map((mapping) => resources.find((resource) => resource.id === mapping.resourceId))
      .filter((resource): resource is CurriculumResource => Boolean(resource))
      .filter((resource) => canUseResourceAsRequired(resource))
      .map((resource) => ({ moduleCode, resource }))
  );
}

export function recordResourceProgress(
  user: CurriculumUser,
  resourceId: string,
  action: "opened" | "completed",
  existing: StudentResourceProgress[] = phase4StudentResourceProgress,
  now = new Date()
) {
  if (user.role !== "student") {
    throw new Error("Only students can update resource progress.");
  }
  const current = existing.find((item) => item.studentId === user.id && item.resourceId === resourceId);
  const moduleMapping = phase4ResourceMappings.find((mapping) => mapping.resourceId === resourceId && mapping.targetType === "module");
  if (!moduleMapping) {
    throw new Error("Resource is not mapped to a module.");
  }
  const next: StudentResourceProgress = {
    studentId: user.id,
    resourceId,
    moduleCode: moduleMapping.targetId as LearningModuleCode,
    openedAt: current?.openedAt ?? now,
    completedAt: action === "completed" ? now : current?.completedAt,
    progressState: action
  };
  return {
    progress: next,
    auditEvent: statusAudit(user.id, user.role, "student_resource_progress", `${user.id}:${resourceId}`, "student_resource_progress_changed", current?.progressState, next.progressState, {
      resourceId,
      moduleCode: next.moduleCode
    }, now)
  };
}

export function learningStandardStatusLabel(status: "official_verified" | "demo_reference" | "unverified" | "archived") {
  if (status === "official_verified") return "OFFICIAL_VERIFIED";
  if (status === "demo_reference") return "DEMO_REFERENCE";
  if (status === "unverified") return "UNVERIFIED";
  return "ARCHIVED";
}

export function upsertResourceMapping(
  user: CurriculumUser,
  resource: CurriculumResource,
  mapping: ResourceMapping,
  previous?: ResourceMapping,
  now = new Date()
) {
  assertTeacherOrAdmin(user);
  const next = validateResourceMapping(resource, mapping);
  const actionByTarget = {
    module: "resource_to_module_mapping",
    standard: "resource_to_standard_mapping",
    quiz_blueprint: "resource_to_quiz_blueprint_mapping",
    course_week: "resource_to_week_mapping",
    question: "resource_to_question_mapping"
  } as const;
  return {
    mapping: next,
    auditEvent: statusAudit(user.id, user.role, "curriculum_resource_mapping", `${mapping.resourceId}:${mapping.targetType}:${mapping.targetId}`, actionByTarget[mapping.targetType], previous?.mappingStatus, next.mappingStatus, {
      previous,
      next
    }, now)
  };
}

export function editQuestionGenerationBlueprint(
  user: CurriculumUser,
  current: QuestionGenerationBlueprint,
  input: unknown,
  reason: string,
  now = new Date()
) {
  assertTeacherOrAdmin(user);
  if (!reason.trim()) {
    throw new Error("Blueprint editing requires a reason.");
  }
  const parsed = blueprintInputSchema.parse(input);
  const blueprint: QuestionGenerationBlueprint = {
    ...current,
    ...parsed,
    id: `qgb_${parsed.code.toLowerCase()}_v${current.version + 1}`,
    status: "draft",
    version: current.version + 1,
    createdBy: user.id,
    reviewedBy: undefined
  };
  return {
    blueprint,
    auditEvent: statusAudit(user.id, user.role, "question_generation_blueprint", blueprint.id, "generation_blueprint_edited", current.status, "draft", {
      previousVersionId: current.id,
      previousVersion: current.version,
      newVersion: blueprint.version,
      reason
    }, now)
  };
}

export function editQuestionDraft(user: CurriculumUser, draft: QuestionDraft, input: unknown, now = new Date()) {
  assertTeacherOrAdmin(user);
  const parsed = questionDraftEditSchema.parse(input);
  if (draft.teacherReviewStatus === "published" || draft.teacherReviewStatus === "archived") {
    throw new Error("Published or archived question drafts cannot be edited.");
  }
  if (draft.teacherReviewStatus === "pending_review") {
    throw new Error("Pending review drafts must be returned for revision before editing.");
  }
  const createsVersion = draft.teacherReviewStatus === "approved" || draft.teacherReviewStatus === "rejected";
  const nextVersion = createsVersion ? draft.version + 1 : draft.version;
  const next: QuestionDraft = {
    ...draft,
    ...parsed,
    id: createsVersion ? `${draft.id}_v${nextVersion}` : draft.id,
    version: nextVersion,
    parentDraftId: createsVersion ? draft.id : draft.parentDraftId,
    teacherReviewStatus: "draft",
    teacherRevisionNotes: parsed.reason,
    reviewedBy: undefined,
    publishedBy: undefined,
    publishedQuestionId: undefined,
    approvedAt: undefined,
    publishedAt: undefined,
    createdBy: user.id
  };
  return {
    draft: next,
    auditEvent: statusAudit(user.id, user.role, "question_draft", next.id, createsVersion ? "question_version_created" : "question_draft_edited", draft.teacherReviewStatus, "draft", {
      previousDraftId: draft.id,
      previousVersion: draft.version,
      newVersion: next.version,
      reason: parsed.reason
    }, now)
  };
}

export function archiveQuestionDraft(user: CurriculumUser, draft: QuestionDraft, reason: string, now = new Date()) {
  assertTeacherOrAdmin(user);
  if (!reason.trim()) {
    throw new Error("Question archival requires a reason.");
  }
  if (user.role === "teacher" && !user.authorizedCoursePlanIds?.includes(draft.coursePlanId)) {
    throw new Error("Teachers may archive only within authorized courses or classes.");
  }
  const next = { ...draft, teacherReviewStatus: "archived" as const };
  return {
    draft: next,
    auditEvent: statusAudit(user.id, user.role, "question_draft", draft.id, "question_draft_archived", draft.teacherReviewStatus, "archived", { reason }, now)
  };
}

export function assignStudentResource(
  user: CurriculumUser,
  studentId: string,
  resource: CurriculumResource,
  moduleCode: LearningModuleCode,
  coursePlanId: string,
  previous?: StudentResourceProgress,
  now = new Date()
) {
  assertTeacherOrAdmin(user);
  if (!canUseResourceAsRequired(resource)) {
    throw new Error("Only approved and available resources can be assigned to students.");
  }
  if (user.role === "teacher" && !user.authorizedCoursePlanIds?.includes(coursePlanId)) {
    throw new Error("Teachers may assign resources only within authorized courses or classes.");
  }
  const progress: StudentResourceProgress = {
    studentId,
    resourceId: resource.id,
    moduleCode,
    progressState: "assigned"
  };
  return {
    progress,
    auditEvent: statusAudit(user.id, user.role, "student_resource_assignment", `${studentId}:${resource.id}`, "student_resource_assignment_changed", previous?.progressState, "assigned", {
      coursePlanId,
      moduleCode,
      previous,
      next: progress
    }, now)
  };
}

export function buildTraceability(resourceId: string, draftId?: string) {
  const resource = phase4CurriculumResources.find((item) => item.id === resourceId);
  if (!resource) {
    throw new Error("Resource not found.");
  }
  const mappings = phase4ResourceMappings.filter((mapping) => mapping.resourceId === resourceId);
  const drafts = phase4QuestionDrafts.filter((draft) => draft.sourceResourceIds.includes(resourceId) && (!draftId || draft.id === draftId));
  return {
    resource,
    standards: mappings.filter((mapping) => mapping.targetType === "standard").map((mapping) => mapping.targetId),
    modules: mappings.filter((mapping) => mapping.targetType === "module").map((mapping) => mapping.targetId),
    blueprints: drafts.map((draft) => draft.generationBlueprintId),
    teacherReviewedQuestions: drafts.filter((draft) => ["approved", "published"].includes(draft.teacherReviewStatus)).map((draft) => draft.id),
    quizBlueprints: ["LEVEL_1_RESEARCH_LICENSE"],
    quizAttempts: ["attempt_demo_passed_001"],
    researchLicenses: ["license_demo_level_1_001"]
  };
}

function statusAudit(
  actorId: string,
  actorRole: CurriculumUser["role"],
  entityType: string,
  entityId: string,
  action: string,
  fromStatus?: string,
  toStatus?: string,
  changes?: Record<string, unknown>,
  timestamp = new Date()
): AuditEvent {
  const reason = typeof changes?.reason === "string" ? changes.reason : undefined;
  return {
    actorId,
    actorRole,
    entityType,
    entityId,
    action,
    fromStatus,
    toStatus,
    changes,
    previousState: fromStatus ? { status: fromStatus } : undefined,
    newState: toStatus ? { status: toStatus } : undefined,
    reason,
    timestamp
  };
}
