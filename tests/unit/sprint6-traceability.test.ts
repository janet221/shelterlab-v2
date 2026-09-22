import { describe, expect, it } from "vitest";
import { buildCompetitionEvidenceChain, listAttemptsUsingQuestion, listDatasetsUsedByQuestion, listQuestionsDerivedFromResource, listResourcesSupportingStandard, listStandardsSupportingModule } from "../../lib/competition/evidence";
import { getCompetitionEvidenceDashboard } from "../../lib/competition/dashboard";
import { phase2Questions } from "../../lib/research-license/phase2-data";
import { startQuizAttempt, submitQuizAttempt } from "../../lib/research-license/engine";
import { recommendRemediationResources } from "../../lib/curriculum-library/services";
import { phase4CurriculumResources } from "../../lib/curriculum-library/phase4-data";

const student = { id: "student_sprint6", role: "student" as const };

describe("Sprint 6 Research License traceability", () => {
  it("selects only published questions and preserves evidence snapshots", () => {
    expect(phase2Questions.every((question) => question.status === "published")).toBe(true);
    const { attempt } = startQuizAttempt({ user: student, now: new Date("2026-07-11T04:00:00.000Z"), previousAttempts: [], randomSeed: "sprint6-snapshot" });

    expect(attempt.questions).toHaveLength(20);
    expect(attempt.questions.every((question) => question.questionVersion > 0 && question.resourceIds.length > 0 && question.learningStandardIds.length > 0)).toBe(true);
    expect(attempt.evidenceSnapshot.questionVersions).toBeTruthy();
  });

  it("creates targeted remediation for a passing attempt with one module below 80", () => {
    const { attempt } = startQuizAttempt({ user: student, now: new Date("2026-07-11T04:00:00.000Z"), previousAttempts: [], randomSeed: "sprint6-remediation" });
    const answers = Object.fromEntries(attempt.questions.map((question) => [question.id, [...question.correctOptionIds]]));
    const target = attempt.questions.find((question) => question.moduleCode === "URBAN_ECOLOGY")!;
    answers[target.id] = [];
    const result = submitQuizAttempt({ actor: student, attempt, selectedOptionIdsByAttemptQuestionId: answers, now: new Date("2026-07-11T04:10:00.000Z"), existingLicenses: [] });

    expect(result.attempt.status).toBe("passed");
    expect(result.attempt.moduleScores.URBAN_ECOLOGY).toBe(75);
    expect(result.remediationRecommendations.some((item) => item.moduleCode === "URBAN_ECOLOGY")).toBe(true);
    expect(result.auditEvents.some((event) => event.action === "remediation_generated")).toBe(true);
  });

  it("excludes unavailable resources from remediation", () => {
    const unavailable = phase4CurriculumResources.map((resource) => resource.id === "res_teacher_urban_ecology_primer" ? { ...resource, availabilityStatus: "unavailable" as const } : resource);
    const recommendations = recommendRemediationResources({ URBAN_ECOLOGY: 60 }, unavailable);

    expect(recommendations.some((item) => item.resource.id === "res_teacher_urban_ecology_primer")).toBe(false);
    expect(recommendations.every((item) => item.resource.availabilityStatus === "active")).toBe(true);
  });

  it("returns all required curriculum graph directions", () => {
    expect(listResourcesSupportingStandard("std_demo_data_interpretation").length).toBeGreaterThan(0);
    expect(listStandardsSupportingModule("URBAN_ECOLOGY").length).toBeGreaterThan(0);
    expect(listQuestionsDerivedFromResource("res_synthetic_eduod_literacy").length).toBeGreaterThan(0);
    expect(listDatasetsUsedByQuestion("q_eco_synthetic_data_01")[0].datasetId).toBe("SYNTHETIC_EDUOD_001");
    expect(listAttemptsUsingQuestion("q_eco_synthetic_data_01")).toHaveLength(1);
  });

  it("builds a complete, visibly synthetic competition evidence chain", () => {
    const chain = buildCompetitionEvidenceChain();
    const dashboard = getCompetitionEvidenceDashboard();

    expect(chain.complete).toBe(true);
    expect(chain.nodes.map((node) => node.type)).toEqual(expect.arrayContaining(["GovernmentDataset", "CurriculumResource", "LearningStandard", "AI Draft", "Teacher Review", "Published Question", "Quiz Attempt", "Targeted Remediation"]));
    expect(chain.nodes.every((node) => node.synthetic)).toBe(true);
    expect(dashboard.evidenceLabel).toBe("SYNTHETIC_DEMO");
    expect(dashboard.openData.verified).toBe(0);
  });
});
