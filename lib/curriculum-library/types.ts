import { z } from "zod";
import type { LearningModuleCode } from "@/lib/research-license/phase2-data";
import type { QuestionDifficulty, QuestionType, UserRole } from "@/lib/research-license/types";

export type ResourceType =
  | "video"
  | "article"
  | "lesson_plan"
  | "government_dataset"
  | "image"
  | "interactive_resource"
  | "teacher_material";

export type VerificationStatus =
  | "unverified"
  | "metadata_verified"
  | "content_reviewed"
  | "approved_for_course"
  | "rejected"
  | "unavailable";

export type AvailabilityStatus = "active" | "unavailable" | "archived";
export type RequiredOrOptional = "required" | "optional";
export type MappingStatus = "draft" | "active" | "archived";
export type BloomLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate";
export type QuestionDraftStatus = "ai_draft" | "draft" | "pending_review" | "revision_required" | "approved" | "rejected" | "published" | "archived";
export type LearningStandardVerificationStatus = "official_verified" | "demo_reference" | "unverified";
export type EvidenceVerificationState =
  | "VERIFIED"
  | "METADATA_VERIFIED"
  | "UNVERIFIED"
  | "UNAVAILABLE"
  | "DEMO_REFERENCE"
  | "SYNTHETIC_DEMO";
export type GenerationMethod = "manual" | "ai_assisted" | "imported_metadata";
export type DraftCheckStatus = "pending" | "passed" | "warning" | "failed";
export type ResourceImportProvider = "ilearn" | "government_dataset" | "manual_teacher";

export type CurriculumResource = {
  id: string;
  title: string;
  resourceType: ResourceType;
  providerName: string;
  sourceAgency?: string;
  sourceUrl: string;
  governmentDatasetId?: string;
  externalResourceId?: string;
  subject: string;
  educationLevel: string;
  gradeBand?: string;
  topicTags: string[];
  learningContentCodes: string[];
  learningPerformanceCodes: string[];
  coreCompetencyCodes: string[];
  durationMinutes?: number;
  language: string;
  description: string;
  copyrightNote: string;
  licenseNote: string;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  rejectionReason?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  lastCheckedAt?: Date;
  availabilityStatus: AvailabilityStatus;
  evidenceVerificationState?: EvidenceVerificationState;
};

export type ResourceMapping = {
  resourceId: string;
  targetType: "module" | "standard" | "quiz_blueprint" | "course_week" | "question";
  targetId: string;
  requiredOrOptional: RequiredOrOptional;
  displayOrder: number;
  teacherNote?: string;
  startTimeSec?: number;
  endTimeSec?: number;
  remediationPriority: number;
  mappingStatus: MappingStatus;
};

export type CoursePlan = {
  id: string;
  code: string;
  title: string;
  educationLevel: string;
  gradeBand?: string;
  description: string;
  status: "draft" | "published" | "archived";
  version: number;
};

export type CourseWeek = {
  id: string;
  coursePlanId: string;
  weekNumber: number;
  title: string;
  focus: string;
  moduleCode?: LearningModuleCode;
  learningGoals: string[];
  assessmentNote?: string;
};

export type QuestionGenerationBlueprint = {
  id: string;
  code: string;
  title: string;
  moduleCode: LearningModuleCode;
  educationLevel: string;
  gradeBand?: string;
  questionType: QuestionType;
  bloomLevel: BloomLevel;
  difficulty: QuestionDifficulty;
  numberOfQuestions: number;
  requiredResourceCount: number;
  requiredLearningStandardCount: number;
  scenarioContext: string;
  prohibitedContent: string[];
  promptVersion: string;
  requiresGovernmentData: boolean;
  sourceResourceIds: string[];
  learningStandardIds: string[];
  governmentDatasetIds: string[];
  qualityRules: Record<string, unknown>;
  status: "draft" | "active" | "archived";
  version: number;
  createdBy: string;
  reviewedBy?: string;
};

export type DraftQuestionOption = {
  optionKey: string;
  optionText: string;
};

export type QuestionDraft = {
  id: string;
  generationBlueprintId: string;
  coursePlanId: string;
  moduleCode: LearningModuleCode;
  version: number;
  parentDraftId?: string;
  prompt: string;
  questionType: QuestionType;
  options: DraftQuestionOption[];
  correctOptionKeys: string[];
  explanation: string;
  sourceResourceIds: string[];
  sourceExcerptNotes?: string;
  learningStandardIds: string[];
  governmentDatasetIds: string[];
  generationMethod: GenerationMethod;
  modelName?: string;
  modelVersion?: string;
  providerName?: string;
  providerVersion?: string;
  promptVersion?: string;
  generationTimestamp?: Date;
  factualityCheckStatus: DraftCheckStatus;
  sourceAlignmentStatus: DraftCheckStatus;
  teacherReviewStatus: QuestionDraftStatus;
  teacherRevisionNotes?: string;
  riskFlags: string[];
  similarityFlags: string[];
  unsupportedClaimFlags: string[];
  bloomLevel: BloomLevel;
  difficulty: QuestionDifficulty;
  confidenceNote: string;
  createdBy: string;
  reviewedBy?: string;
  publishedBy?: string;
  publishedQuestionId?: string;
  approvedAt?: Date;
  publishedAt?: Date;
};

export type ImportPreviewRecord = {
  provider: ResourceImportProvider;
  title: string;
  sourceUrl: string;
  externalResourceId?: string;
  resourceType: ResourceType;
  validationFlags: string[];
  duplicateOf?: string;
};

export type ImportSummary = {
  provider: ResourceImportProvider;
  previewCount: number;
  importedCount: number;
  duplicateCount: number;
  failedRecords: ImportPreviewRecord[];
  lastSyncMetadata: Record<string, unknown>;
};

export type StudentResourceProgress = {
  studentId: string;
  resourceId: string;
  moduleCode: LearningModuleCode;
  openedAt?: Date;
  completedAt?: Date;
  progressState: "assigned" | "opened" | "completed";
};

export type CurriculumUser = {
  id: string;
  role: UserRole;
  authorizedCoursePlanIds?: string[];
};

export const generatedQuestionDraftSchema = z.object({
  prompt: z.string().min(1),
  question_type: z.enum(["single_choice", "multiple_choice", "true_false", "scenario_choice"]),
  options: z.array(z.object({ optionKey: z.string().min(1), optionText: z.string().min(1) })).min(2),
  correct_option_keys: z.array(z.string()).min(1),
  explanation: z.string().min(1),
  source_resource_ids: z.array(z.string()).min(1),
  learning_standard_ids: z.array(z.string()).min(1),
  government_dataset_ids: z.array(z.string()),
  bloom_level: z.enum(["remember", "understand", "apply", "analyze", "evaluate"]),
  difficulty: z.enum(["basic", "intermediate", "advanced"]),
  risk_flags: z.array(z.string()),
  unsupported_claim_flags: z.array(z.string()),
  similarity_flags: z.array(z.string()),
  confidence_note: z.string().min(1),
  provider_name: z.string().min(1),
  provider_version: z.string().min(1),
  prompt_version: z.string().min(1),
  generated_timestamp: z.string().datetime()
});

export type GeneratedQuestionDraftOutput = z.infer<typeof generatedQuestionDraftSchema>;
