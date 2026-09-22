import { describe, expect, it } from "vitest";
import { calculateAnalysis, exportDatasetCsv, validateChart } from "../../lib/inquiry/analysis";
import { buildSprint9ADemo, inquiryDemoActors } from "../../lib/inquiry/demo-data";
import type { InquiryDatasetVersion } from "../../lib/inquiry/types";
import { validateCER, validateProjectFoundation, validateResearchDesign } from "../../lib/inquiry/validation";

const now = new Date("2026-07-13T03:00:00.000Z");

describe("Sprint 9A One Health Inquiry Engine", () => {
  it("requires at least two connected One Health dimensions", () => {
    const service = buildSprint9ADemo();
    const project = {
      ...service.getProject("inquiry_synthetic_40121_context"),
      oneHealthDimensions: ["education" as const],
      oneHealthConnection: ""
    };
    const flags = validateProjectFoundation(project, []);
    expect(flags.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "TWO_ONE_HEALTH_DIMENSIONS_REQUIRED",
        "ONE_HEALTH_CONNECTION_REQUIRED",
        "APPROVED_EVIDENCE_REQUIRED"
      ])
    );
  });

  it("advises when the evidence type does not match the inquiry design", () => {
    const service = buildSprint9ADemo();
    const project = { ...service.getProject("inquiry_synthetic_41236_complete"), inquiryType: "shelter_behavior" as const };
    const design = service.state.designs.find((item) => item.projectId === project.id)!;
    expect(validateResearchDesign(project, design, []).map((item) => item.code)).toContain("EVIDENCE_SOURCE_MISMATCH");
  });

  it("blocks unverified evidence from supporting a final factual claim", () => {
    const flags = validateCER(
      {
        claim: "The summaries differ.",
        evidenceLinkIds: ["unverified"],
        reasoning: "A category comparison shows a descriptive difference.",
        alternativeExplanation: "Reporting practices may differ.",
        limitation: "This is a small aggregate sample."
      },
      [{
        id: "unverified",
        projectId: "p1",
        evidenceType: "teacher_reference",
        sourceEntityId: "external-record",
        sourceVersion: "unknown",
        verificationState: "UNVERIFIED",
        usagePurpose: "Background only",
        citationText: "Unverified external metadata",
        includedAt: now,
        includedBy: "teacher_demo_001",
        privacyClassification: "public"
      }],
      false
    );
    expect(flags.map((item) => item.code)).toContain("UNVERIFIED_EVIDENCE_FOR_FINAL_CLAIM");
  });

  it("preserves the immutable original dataset and source provenance", () => {
    const service = buildSprint9ADemo();
    const dataset = service.state.datasets.find((item) => item.id === "inquiry_dataset_41236_county")!;
    const original = dataset.versions[0];
    const cleaned = dataset.versions[1];
    expect(original.kind).toBe("original");
    expect(original.immutable).toBe(true);
    expect(original.rows).toHaveLength(5);
    expect(cleaned.rows).toHaveLength(4);
    expect(cleaned.sourceProvenance).toEqual(original.sourceProvenance);
    expect(original.cleaningActions).toEqual([]);
  });

  it("requires reasons for correcting or excluding data", () => {
    const service = buildSprint9ADemo();
    const projectId = "inquiry_synthetic_40121_context";
    const dataset = service.createDataset(inquiryDemoActors.student, projectId, {
      name: "Reason test",
      columns: [{ name: "value", type: "number" }],
      rows: [{ value: 1 }],
      sourceProvenance: ["evidence_40121_demo"],
      syntheticDemo: true
    }, now).dataset;
    expect(() => service.transformDataset(inquiryDemoActors.student, projectId, dataset.id, {
      action: "exclude_with_reason",
      rowIndex: 0
    }, now)).toThrow("requires a reason");
  });

  it("flags causal wording for a correlational analysis", () => {
    const dataset: InquiryDatasetVersion = {
      id: "v1",
      datasetId: "d1",
      version: 1,
      kind: "original",
      rows: [{ x: 1, y: 2 }, { x: 2, y: 4 }],
      sourceProvenance: ["verified-source"],
      cleaningActions: [],
      immutable: true,
      createdAt: now
    };
    const result = calculateAnalysis({
      id: "a1",
      projectId: "p1",
      dataset,
      method: "simple_correlation",
      variables: ["x", "y"],
      filteredPopulation: "Synthetic pair",
      interpretationNote: "X causes Y.",
      limitationNote: "Correlation only.",
      chart: { type: "scatterplot", title: "X and Y", unit: "index", evidenceLabel: "SYNTHETIC_DEMO" },
      generatedAt: now
    });
    expect(result.flags.map((item) => item.code)).toContain("CAUSAL_WORDING_FOR_CORRELATION");
    expect(result.sourceDatasetVersions).toEqual(["v1"]);
  });

  it("requires claim evidence and complete chart provenance", () => {
    const claimFlags = validateCER({
      claim: "A descriptive difference appears.",
      evidenceLinkIds: [],
      reasoning: "The categories were compared.",
      alternativeExplanation: "Sampling may differ.",
      limitation: "Small sample."
    }, [], false);
    expect(claimFlags.map((item) => item.code)).toContain("CLAIM_REQUIRES_EVIDENCE");
    expect(validateChart({
      type: "bar",
      title: "",
      unit: "",
      source: "",
      sampleSize: 0,
      evidenceLabel: "SYNTHETIC_DEMO"
    }).map((item) => item.code)).toEqual(expect.arrayContaining([
      "CHART_SOURCE_REQUIRED",
      "CHART_SAMPLE_SIZE_REQUIRED",
      "CHART_LABELS_REQUIRED"
    ]));
  });

  it("requires teacher approval and shelter confirmation before finalization", () => {
    const service = buildSprint9ADemo();
    const id = "inquiry_synthetic_41236_complete";
    const project = service.getProject(id);
    service.state.projects.set(id, {
      ...project,
      status: "teacher_approved",
      teacherApprovedAt: now,
      shelterConfirmedAt: undefined,
      publishedAt: undefined
    });
    expect(() => service.finalize(inquiryDemoActors.teacher, id, now)).toThrow("Shelter confirmation");
    service.state.projects.set(id, {
      ...project,
      status: "shelter_confirmed",
      teacherApprovedAt: undefined,
      shelterConfirmedAt: now,
      publishedAt: undefined
    });
    expect(() => service.finalize(inquiryDemoActors.teacher, id, now)).toThrow("Teacher approval");
    expect(() => service.finalize(inquiryDemoActors.student, id, now)).toThrow("not authorized");
  });

  it("requires review reasons and keeps submitted projects immutable", () => {
    const service = buildSprint9ADemo();
    const id = "inquiry_synthetic_41236_complete";
    const project = service.getProject(id);
    service.state.projects.set(id, { ...project, status: "submitted", publishedAt: undefined });
    expect(() => service.teacherReview(inquiryDemoActors.teacher, id, "request_revision", "", {}, now)).toThrow("requires a reason");
    expect(() => service.updateProject(inquiryDemoActors.student, id, { title: "Changed" }, project.rowVersion, now)).toThrow("immutable");
  });

  it("filters private evidence from public reports and keeps the internal appendix complete", () => {
    const service = buildSprint9ADemo();
    const id = "inquiry_synthetic_41236_complete";
    const internal = service.getReport(id, false);
    const publicReport = service.getReport(id, true);
    const linked = service.state.evidenceLinks.filter((item) => item.projectId === id);
    expect(internal.evidenceAppendix).toHaveLength(linked.length);
    expect(publicReport.evidenceAppendix.every((item) => item.id !== linked.find((entry) => entry.privacyClassification === "restricted")?.id)).toBe(true);
    expect(JSON.stringify(publicReport)).not.toContain("publication_session_mission");
    expect(publicReport.publicSafe).toBe(true);
  });

  it("keeps demo labels, competency evidence, audits, and CSV output deterministic", () => {
    const service = buildSprint9ADemo();
    const project = service.getProject("inquiry_synthetic_41236_complete");
    const dataset = service.state.datasets[0];
    expect(project.syntheticDemo).toBe(true);
    expect(dataset.syntheticDemo).toBe(true);
    expect(service.getReport(project.id, true).syntheticDemo).toBe(true);
    expect(service.state.competencyEvidence.length).toBeGreaterThan(0);
    expect(service.state.competencyEvidence.every((item) => item.syntheticDemo)).toBe(true);
    expect(service.state.auditEvents.map((item) => item.action)).toEqual(expect.arrayContaining([
      "inquiry_project_created",
      "inquiry_evidence_linked",
      "inquiry_data_transformed",
      "inquiry_analysis_calculated",
      "inquiry_teacher_approve",
      "inquiry_shelter_confirm",
      "inquiry_final_approved"
    ]));
    expect(service.state.auditEvents.map((item) => item.action)).toContain("inquiry_recommendation_reviewed");
    expect(service.state.recommendations.find((item) => item.projectId === project.id)?.status).toBe("shelter_confirmed");
    expect(exportDatasetCsv(dataset.versions.at(-1)!, ["county", "adoption_rate"]).split("\n")).toHaveLength(5);
  });
});
