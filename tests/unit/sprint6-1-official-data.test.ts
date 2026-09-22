import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  DataGovTwDatasetAdapter,
  ILearnMetadataAdapter,
  ShelterStatisticsDatasetAdapter,
  StudentPopulationDatasetAdapter,
  SyntheticDemoDatasetAdapter,
  canDatasetFeedAssessment
} from "../../lib/government-data/adapters";
import {
  assertAggregateShelterRows,
  assertILearnMetadataOnly,
  assertQuestionBankIndexOnly,
  determineVerificationState,
  validateActivatedDataset
} from "../../lib/government-data/official-verification";
import {
  activatedOfficialDatasets,
  dataset29027,
  dataset40121,
  dataset6318,
  iLearnMetadataFixture,
  questionBankIndexFixture,
  shelterStatisticsFixture,
  studentPopulationFixture,
  syntheticEducationDataset
} from "../../lib/government-data/sprint6-fixtures";
import { activatedDatasetProductUses, validateActivatedDatasetUsage } from "../../lib/government-data/product-uses";
import { getCompetitionEvidenceDashboard } from "../../lib/competition/dashboard";

describe("Sprint 6.1 official open-data verification", () => {
  it("requires validated official metadata, resource schema, and SHA-256 before VERIFIED", () => {
    expect(determineVerificationState({ officialMetadataValidated: true, resourceValidated: false, resourceSchemaValidated: false })).toBe("METADATA_VERIFIED");
    expect(determineVerificationState({ officialMetadataValidated: true, resourceValidated: true, resourceSchemaValidated: true, sourceContentHash: dataset40121.sourceContentHash })).toBe("VERIFIED");
  });

  it("does not let metadata-only iLearn verification activate assessment use", () => {
    expect(dataset6318.verificationState).toBe("VERIFIED");
    expect(dataset6318.assessmentUseAllowed).toBe(false);
    expect(canDatasetFeedAssessment(dataset6318, false)).toBe(false);
  });

  it("prevents activation when normalized rows fail the dataset schema", () => {
    const invalid = { ...studentPopulationFixture, rows: [{ schoolYear: 114, county: "臺北市", juniorHighStudents: -1 }] };
    const flags = validateActivatedDataset(invalid, z.object({ schoolYear: z.number(), county: z.string(), juniorHighStudents: z.number().nonnegative() }).strict());
    expect(flags).toContain("INVALID_ROW_SCHEMA:0");
  });

  it("retains the last successful snapshot when a later synchronization fails", async () => {
    const previous = await new DataGovTwDatasetAdapter("15391").createSnapshot();
    const result = await new DataGovTwDatasetAdapter("15391").import({ existingSnapshots: [previous] });
    expect(result.status).toBe("FAILED");
    expect(result.preservedSnapshot?.id).toBe(previous.id);
  });

  it("keeps verified fixture imports idempotent by normalized content hash", async () => {
    const adapter = new StudentPopulationDatasetAdapter();
    const first = await adapter.import();
    const second = await adapter.import({ existingSnapshots: [first.snapshot!] });
    expect(first.status).toBe("SUCCEEDED");
    expect(second.status).toBe("SKIPPED_DUPLICATE");
    expect(second.snapshot?.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("attaches attribution and source identity to every normalized record", async () => {
    const rows = await new ShelterStatisticsDatasetAdapter().normalize();
    expect(rows.every((row) => row._sourceDatasetId === "41236")).toBe(true);
    expect(rows.every((row) => String(row._sourceAttribution).includes("農業部"))).toBe(true);
  });

  it("keeps verified-fixture and synthetic provenance visibly different", async () => {
    const verified = await new StudentPopulationDatasetAdapter().preview();
    const synthetic = await new SyntheticDemoDatasetAdapter().preview();
    expect(verified.verificationState).toBe("VERIFIED");
    expect(verified.provenance.mode).toBe("VERIFIED_FIXTURE");
    expect(synthetic.verificationState).toBe("SYNTHETIC_DEMO");
    expect(synthetic.provenance.mode).toBe("LOCAL_FIXTURE");
    expect(syntheticEducationDataset.sourceUrl).toMatch(/^internal:/);
  });

  it("keeps dataset 6318 metadata and official outbound links only", async () => {
    const preview = await new ILearnMetadataAdapter(true).preview();
    expect(preview.validationFlags).toEqual([]);
    expect(assertILearnMetadataOnly(iLearnMetadataFixture.rows)).toEqual([]);
    expect(preview.fieldNames).toContain("outboundUrl");
    expect(preview.fieldNames).not.toContain("transcript");
    expect(preview.provenance.copyrightContentIncluded).toBe(false);
  });

  it("does not treat dataset 29027 as reusable question content", () => {
    expect(assertQuestionBankIndexOnly(questionBankIndexFixture.rows)).toEqual([]);
    expect(dataset29027.assessmentUseAllowed).toBe(false);
    expect(dataset29027.restrictions.join(" ")).toContain("no question text");
    expect(Object.keys(questionBankIndexFixture.rows[0])).not.toEqual(expect.arrayContaining(["questionText", "answerKey", "explanation", "examFileUrl"]));
  });

  it("keeps dataset 41236 at county-month aggregate granularity", () => {
    expect(assertAggregateShelterRows(shelterStatisticsFixture.rows)).toEqual([]);
    expect(Object.keys(shelterStatisticsFixture.rows[0])).not.toEqual(expect.arrayContaining(["dogId", "publicName", "observerId"]));
  });

  it("requires a scoped real product use for every activated official dataset", () => {
    expect(validateActivatedDatasetUsage()).toEqual([]);
    expect(activatedDatasetProductUses.map((use) => use.datasetId).sort()).toEqual(activatedOfficialDatasets.map((dataset) => dataset.datasetId).sort());
  });

  it("reports exact official provenance separately from the retained synthetic chain", () => {
    const dashboard = getCompetitionEvidenceDashboard();
    expect(dashboard.openData.officialVerified).toBe(6);
    expect(dashboard.openDataDisplayMode).toBe("VERIFIED_FIXTURE + SYNTHETIC_DEMO");
    expect(dataset40121.name).toBe("各級學校縣市別學生人數");
    expect(dataset40121.sourceUrl).toBe("https://data.gov.tw/dataset/40121");
  });
});
