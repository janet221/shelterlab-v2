import { phase4CoursePlan, phase4CourseWeeks, phase4CurriculumResources, phase4QuestionBlueprints, phase4QuestionDrafts, phase4ResourceMappings } from "../curriculum-library/phase4-data";
import { sprint6DatasetRegistry } from "../government-data/sprint6-fixtures";
import { phase2LearningModules, phase2LearningStandards, phase2Questions, type LearningModuleCode } from "../research-license/phase2-data";
import type { EvidenceVerificationState } from "../government-data/evidence-types";

export type EvidenceChainNode = {
  id: string;
  type: string;
  label: string;
  state: EvidenceVerificationState | "AI_DRAFT" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED" | "PASSED" | "ASSIGNED";
  version: string;
  attribution?: string;
  synthetic: boolean;
};

export type EvidenceChainLink = {
  from: string;
  to: string;
  relation: string;
};

const traceDatasetId = "SYNTHETIC_EDUOD_001";
const traceResourceId = "res_synthetic_eduod_literacy";
const traceStandardId = "std_demo_data_interpretation";
const traceBlueprintId = "qgb_urban_ecology_v1";
const traceDraft = phase4QuestionDrafts.find((draft) => draft.generationBlueprintId === traceBlueprintId && draft.teacherReviewStatus === "published")!;
const traceQuestion = phase2Questions.find((question) => question.id === "q_eco_synthetic_data_01")!;

export const competitionDemoResult = {
  attemptId: "attempt_synthetic_sprint6_001",
  studentCode: "SYNTHETIC_STUDENT_001",
  totalScore: 85,
  status: "passed" as const,
  moduleScores: {
    DOG_BEHAVIOR: 90,
    ONE_HEALTH: 85,
    URBAN_ECOLOGY: 60,
    SHELTER_SAFETY: 95,
    RESEARCH_ETHICS: 95
  },
  competencyGap: traceStandardId,
  remediationResourceId: "res_teacher_urban_ecology_primer",
  verificationState: "SYNTHETIC_DEMO" as const
};

export function buildCompetitionEvidenceChain(): { nodes: EvidenceChainNode[]; links: EvidenceChainLink[]; complete: boolean } {
  const dataset = sprint6DatasetRegistry.find((item) => item.datasetId === traceDatasetId)!;
  const resource = phase4CurriculumResources.find((item) => item.id === traceResourceId)!;
  const standard = phase2LearningStandards.find((item) => item.id === traceStandardId)!;
  const blueprint = phase4QuestionBlueprints.find((item) => item.id === traceBlueprintId)!;
  const week = phase4CourseWeeks.find((item) => item.moduleCode === "URBAN_ECOLOGY")!;
  const nodes: EvidenceChainNode[] = [
    { id: dataset.datasetId, type: "GovernmentDataset", label: dataset.name, state: dataset.verificationState, version: dataset.schemaVersion, attribution: dataset.attribution, synthetic: true },
    { id: resource.id, type: "CurriculumResource", label: resource.title, state: "SYNTHETIC_DEMO", version: "1", attribution: resource.providerName, synthetic: true },
    { id: standard.id, type: "LearningStandard", label: standard.learningContentText, state: "DEMO_REFERENCE", version: standard.version, attribution: standard.sourceAgency, synthetic: true },
    { id: `module_${blueprint.moduleCode}`, type: "LearningModule", label: phase2LearningModules.find((item) => item.code === blueprint.moduleCode)!.title, state: "DEMO_REFERENCE", version: "1", synthetic: true },
    { id: week.id, type: "CourseWeek", label: `Week ${week.weekNumber}: ${week.title}`, state: "DEMO_REFERENCE", version: phase4CoursePlan.version.toString(), synthetic: true },
    { id: blueprint.id, type: "QuestionGenerationBlueprint", label: blueprint.title, state: "APPROVED", version: blueprint.version.toString(), synthetic: true },
    { id: `${traceDraft.id}:generated`, type: "AI Draft", label: traceDraft.prompt, state: "AI_DRAFT", version: traceDraft.version.toString(), synthetic: true },
    { id: `${traceDraft.id}:review`, type: "Teacher Review", label: "Independent admin demo review", state: "APPROVED", version: traceDraft.version.toString(), synthetic: true },
    { id: traceQuestion.id, type: "Published Question", label: traceQuestion.prompt, state: "PUBLISHED", version: traceQuestion.version.toString(), synthetic: true },
    { id: competitionDemoResult.attemptId, type: "Quiz Attempt", label: `Research License attempt ${competitionDemoResult.totalScore}%`, state: "PASSED", version: "1", synthetic: true },
    { id: "license_synthetic_sprint6_001", type: "Research License Result", label: "Level 1 active demo license", state: "PASSED", version: "1", synthetic: true },
    { id: "remediation_synthetic_sprint6_001", type: "Targeted Remediation", label: "Urban ecology competency remediation", state: "ASSIGNED", version: "1", synthetic: true }
  ];
  const links: EvidenceChainLink[] = [
    { from: dataset.datasetId, to: resource.id, relation: "SUPPORTS_RESOURCE" },
    { from: resource.id, to: standard.id, relation: "MAPS_TO_STANDARD" },
    { from: standard.id, to: `module_${blueprint.moduleCode}`, relation: "SUPPORTS_MODULE" },
    { from: `module_${blueprint.moduleCode}`, to: week.id, relation: "TAUGHT_IN_WEEK" },
    { from: week.id, to: blueprint.id, relation: "INFORMS_BLUEPRINT" },
    { from: blueprint.id, to: `${traceDraft.id}:generated`, relation: "GENERATES_DRAFT" },
    { from: `${traceDraft.id}:generated`, to: `${traceDraft.id}:review`, relation: "INDEPENDENT_REVIEW" },
    { from: `${traceDraft.id}:review`, to: traceQuestion.id, relation: "SEPARATE_PUBLICATION" },
    { from: traceQuestion.id, to: competitionDemoResult.attemptId, relation: "SNAPSHOTTED_IN_ATTEMPT" },
    { from: competitionDemoResult.attemptId, to: "license_synthetic_sprint6_001", relation: "QUALIFIES" },
    { from: competitionDemoResult.attemptId, to: "remediation_synthetic_sprint6_001", relation: "MODULE_BELOW_80" }
  ];
  return { nodes, links, complete: links.every((link) => nodes.some((node) => node.id === link.from) && nodes.some((node) => node.id === link.to)) };
}

export function listResourcesSupportingStandard(standardId: string) {
  const ids = phase4ResourceMappings.filter((mapping) => mapping.targetType === "standard" && mapping.targetId === standardId).map((mapping) => mapping.resourceId);
  return phase4CurriculumResources.filter((resource) => ids.includes(resource.id));
}

export function listStandardsSupportingModule(moduleCode: string) {
  return phase2LearningStandards.filter((standard) => standard.moduleCodes.includes(moduleCode as LearningModuleCode));
}

export function listQuestionsDerivedFromResource(resourceId: string) {
  const draftModuleCodes = phase4QuestionDrafts.filter((draft) => draft.sourceResourceIds.includes(resourceId)).map((draft) => draft.moduleCode);
  return phase2Questions.filter((question) => question.resourceIds.includes(resourceId) || draftModuleCodes.includes(question.moduleCode));
}

export function listDatasetsUsedByQuestion(questionId: string) {
  const question = phase2Questions.find((item) => item.id === questionId);
  const ids = question?.id === traceQuestion.id ? [traceDatasetId] : question?.datasetIds ?? [];
  return sprint6DatasetRegistry.filter((dataset) => ids.includes(dataset.datasetId));
}

export function listAttemptsUsingQuestion(questionId: string) {
  return questionId === traceQuestion.id ? [competitionDemoResult] : [];
}
