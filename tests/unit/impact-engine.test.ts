import { describe, expect, it } from "vitest";
import { calculateImpactSnapshot, metricByCode } from "@/lib/impact/engine";
import { sprint8ImpactInput, sprint8ImpactSnapshot } from "@/lib/impact/demo-data";
import { sprint8CompetitionScorecard } from "@/lib/impact/scorecard";
import { generateImpactReport } from "@/lib/impact/report";
import { competitionDemoManifest } from "@/lib/impact/demo-mode";

describe("Sprint 8 deterministic Impact Evidence Engine", () => {
  it("calculates paired learning gain from explicit numerator and denominator", () => {
    const result = metricByCode(sprint8ImpactSnapshot, "LEARNING_GAIN");
    expect(result.value).toBe(17);
    expect(result.numerator).toBe(51);
    expect(result.denominator).toBe(3);
    expect(result.formula).toContain("posttest - pretest");
    expect(result.confidenceLevel).toBe("DEMO_ONLY");
  });

  it("is deterministic for an identical input snapshot", () => {
    const again = calculateImpactSnapshot(structuredClone(sprint8ImpactInput));
    expect(again).toEqual(sprint8ImpactSnapshot);
  });

  it("provides the full metric evidence contract", () => {
    for (const metric of sprint8ImpactSnapshot.metrics) {
      expect(metric.formula.length).toBeGreaterThan(0);
      expect(Number.isFinite(metric.numerator)).toBe(true);
      expect(Number.isFinite(metric.denominator)).toBe(true);
      expect(metric.confidenceLevel).toMatch(/HIGH|MEDIUM|LOW|INSUFFICIENT|DEMO_ONLY/);
      expect(metric.provenance.length).toBeGreaterThan(0);
      expect(metric.metricVersion).toBe("SL-IMPACT-1");
      expect(metric.syntheticDemo).toBe(metric.evidenceStatus === "SYNTHETIC");
    }
  });

  it("handles a zero denominator without NaN or an unsupported confidence claim", () => {
    const empty = calculateImpactSnapshot({
      ...structuredClone(sprint8ImpactInput), learning: [], qualityRevisions: [], missionCount: 0,
      completedMissionCount: 0, observationQualityScores: [], observedDogIds: [], approvedProfileDogIds: [],
      profileCompletenessScores: [], eligibleTeacherIds: [], engagedTeacherIds: [], eligibleShelterIds: [],
      engagedShelterIds: [], verifiedDatasetIds: [], activeDatasetIds: [], attributedDatasetIds: [],
      completedContextCount: 0, evidenceChainNodeCount: 0, tracedEvidenceChainNodeCount: 0
    });
    const completion = metricByCode(empty, "LEARNING_COMPLETION_RATE");
    expect(completion.value).toBe(0);
    expect(completion.confidenceLevel).toBe("INSUFFICIENT");
  });

  it("distinguishes verified government evidence from synthetic impact", () => {
    expect(metricByCode(sprint8ImpactSnapshot, "VERIFIED_DATASETS")).toMatchObject({ evidenceStatus: "VERIFIED", confidenceLevel: "HIGH", syntheticDemo: false });
    expect(metricByCode(sprint8ImpactSnapshot, "SHELTER_PARTICIPATION")).toMatchObject({ evidenceStatus: "SYNTHETIC", confidenceLevel: "DEMO_ONLY", syntheticDemo: true });
  });

  it("reports adoption support readiness without inventing adoption outcomes", () => {
    const adoption = metricByCode(sprint8ImpactSnapshot, "ADOPTION_SUPPORT_READINESS");
    expect(adoption.description).toContain("future adoption support");
    expect(adoption.limitations.join(" ")).toContain("no inquiry, adoption, retention");
  });

  it("maps human, animal and environment indicators without health or welfare causality", () => {
    const codes = ["ONE_HEALTH_HUMAN", "ONE_HEALTH_ANIMAL", "ONE_HEALTH_ENVIRONMENT"];
    expect(codes.every((code) => metricByCode(sprint8ImpactSnapshot, code).domain === "ONE_HEALTH")).toBe(true);
    expect(sprint8ImpactSnapshot.sdgMappings.map((item) => item.goal)).toEqual(["SDG 3", "SDG 4", "SDG 11", "SDG 15", "SDG 17"]);
  });

  it("builds all seven competition dimensions as a labeled internal scorecard", () => {
    expect(sprint8CompetitionScorecard.dimensions).toHaveLength(7);
    expect(sprint8CompetitionScorecard.label).toBe("DEMO");
    expect(sprint8CompetitionScorecard.disclaimer).toContain("not an official InnoServe score");
    for (const dimension of sprint8CompetitionScorecard.dimensions) {
      expect(dimension.score).toBe(Math.round((dimension.numerator / dimension.denominator) * 100));
      expect(dimension.criteria.every((item) => item.modulePath && item.evidenceHref)).toBe(true);
    }
  });

  it("generates the required deterministic Markdown evidence report", () => {
    const report = generateImpactReport(sprint8ImpactSnapshot);
    expect(report).toContain("# ShelterLab Impact Report");
    expect(report).toContain("## EDUCATION");
    expect(report).toContain("## ONE HEALTH");
    expect(report).toContain("## SDG Mapping");
    expect(report).toContain("## Open Data Utilization");
    expect(report).toContain("## Remaining Work");
    expect(report).toContain("no AI-generated metric");
  });

  it("keeps Demo Mode read-only and complete", () => {
    expect(competitionDemoManifest.readOnly).toBe(true);
    expect(competitionDemoManifest.productionMutationCount).toBe(0);
    expect(competitionDemoManifest.steps.map((item) => item.id)).toEqual(["student", "learning", "license", "mission", "observation", "teacher", "shelter", "timeline", "profile", "impact"]);
  });
});

