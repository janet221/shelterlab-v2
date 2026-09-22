import { phase4CourseWeeks, phase4CurriculumResources, phase4QuestionDrafts, phase4ResourceMappings, phase4StudentResourceProgress } from "../curriculum-library/phase4-data";
import { sprint6DatasetRegistry } from "../government-data/sprint6-fixtures";
import { phase2LearningStandards, phase2Questions } from "../research-license/phase2-data";
import { buildCompetitionEvidenceChain, competitionDemoResult } from "./evidence";
import { activatedDatasetProductUses } from "../government-data/product-uses";

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

export function getCompetitionEvidenceDashboard() {
  const reviewed = phase4QuestionDrafts.filter((draft) => ["approved", "rejected", "revision_required", "published"].includes(draft.teacherReviewStatus));
  const approved = reviewed.filter((draft) => ["approved", "published"].includes(draft.teacherReviewStatus));
  const rejected = reviewed.filter((draft) => draft.teacherReviewStatus === "rejected");
  const revision = reviewed.filter((draft) => draft.teacherReviewStatus === "revision_required");
  const chain = buildCompetitionEvidenceChain();
  return {
    evidenceLabel: "SYNTHETIC_DEMO" as const,
    openDataDisplayMode: "VERIFIED_FIXTURE + SYNTHETIC_DEMO" as const,
    openData: {
      registered: sprint6DatasetRegistry.length,
      verified: 0,
      officialVerified: sprint6DatasetRegistry.filter((dataset) => dataset.verificationState === "VERIFIED").length,
      syntheticDemo: sprint6DatasetRegistry.filter((dataset) => dataset.verificationState === "SYNTHETIC_DEMO").length,
      agencies: new Set(sprint6DatasetRegistry.map((dataset) => dataset.agency)).size,
      snapshots: sprint6DatasetRegistry.filter((dataset) => dataset.retrievalStatus === "SUCCESS").length,
      lastSuccessfulSync: "2026-07-11T06:00:00.000Z",
      failedSyncs: 0,
      usage: {
        CURRICULUM_DISCOVERY: activatedDatasetProductUses.filter((use) => use.usageModules.includes("CURRICULUM_DISCOVERY")).length,
        LEARNING_RESOURCE_MAPPING: activatedDatasetProductUses.filter((use) => use.usageModules.includes("LEARNING_RESOURCE_MAPPING")).length,
        COMPETENCY_CONTEXT: activatedDatasetProductUses.filter((use) => use.usageModules.includes("COMPETENCY_CONTEXT")).length,
        QUESTION_GENERATION: activatedDatasetProductUses.filter((use) => use.usageModules.includes("QUESTION_GENERATION")).length,
        REMEDIATION: activatedDatasetProductUses.filter((use) => use.usageModules.includes("REMEDIATION")).length,
        INQUIRY_CONTEXT: activatedDatasetProductUses.filter((use) => use.usageModules.includes("INQUIRY_CONTEXT")).length,
        COMPETITION_EVIDENCE: activatedDatasetProductUses.filter((use) => use.usageModules.includes("COMPETITION_EVIDENCE")).length
      }
    },
    curriculum: {
      standardsCovered: phase2LearningStandards.length,
      officialStandards: phase2LearningStandards.filter((standard) => standard.status === "official_verified").length,
      demoStandards: phase2LearningStandards.filter((standard) => standard.status === "demo_reference").length,
      courseWeeksCovered: new Set(phase4ResourceMappings.filter((mapping) => mapping.targetType === "course_week" && mapping.mappingStatus === "active").map((mapping) => mapping.targetId)).size,
      totalCourseWeeks: phase4CourseWeeks.length,
      resourceMappings: phase4ResourceMappings.length,
      competencyCoverage: phase2LearningStandards.map((standard) => ({ standardId: standard.id, modules: standard.moduleCodes, resources: phase4ResourceMappings.filter((mapping) => mapping.targetType === "standard" && mapping.targetId === standard.id).length }))
    },
    aiGovernance: {
      draftsGenerated: phase4QuestionDrafts.length,
      pendingReview: phase4QuestionDrafts.filter((draft) => draft.teacherReviewStatus === "pending_review").length,
      approvalRate: rate(approved.length, reviewed.length),
      rejectionRate: rate(rejected.length, reviewed.length),
      revisionRate: rate(revision.length, reviewed.length),
      qualityFlags: phase4QuestionDrafts.reduce((sum, draft) => sum + draft.riskFlags.length, 0),
      sourceAlignmentFailures: phase4QuestionDrafts.filter((draft) => draft.sourceAlignmentStatus === "failed").length,
      unsafeOutputBlocks: phase4QuestionDrafts.filter((draft) => draft.riskFlags.some((flag) => flag.includes("UNSAFE"))).length,
      publishedQuestions: phase2Questions.filter((question) => question.status === "published").length
    },
    researchLicense: {
      attempts: 1,
      passRate: 100,
      moduleOutcomes: competitionDemoResult.moduleScores,
      competencyGaps: [competitionDemoResult.competencyGap],
      remediationAssignments: 1,
      remediationCompletion: rate(phase4StudentResourceProgress.filter((item) => item.completedAt).length, 1)
    },
    resourceCounts: {
      approved: phase4CurriculumResources.filter((resource) => resource.verificationStatus === "approved_for_course").length,
      unverified: phase4CurriculumResources.filter((resource) => resource.verificationStatus === "unverified").length
    },
    traceability: chain
  };
}
