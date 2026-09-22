import { describe, expect, it } from "vitest";
import {
  DataGovTwDatasetAdapter,
  ILearnMetadataAdapter,
  SyntheticDemoDatasetAdapter,
  canDatasetFeedAssessment
} from "../../lib/government-data/adapters";
import { configuredGovernmentDatasets, syntheticEducationDataset } from "../../lib/government-data/sprint6-fixtures";

describe("Sprint 6 open-data evidence layer", () => {
  it("does not allow an unverified dataset to feed an assessment", () => {
    expect(canDatasetFeedAssessment(configuredGovernmentDatasets[0], false)).toBe(false);
    expect(canDatasetFeedAssessment(configuredGovernmentDatasets[0], true)).toBe(false);
  });

  it("allows the labeled synthetic fixture only in demo mode", () => {
    expect(canDatasetFeedAssessment(syntheticEducationDataset, false)).toBe(false);
    expect(canDatasetFeedAssessment(syntheticEducationDataset, true)).toBe(true);
  });

  it("preserves the last successful snapshot when a disabled synchronization fails", async () => {
    const successful = await new SyntheticDemoDatasetAdapter().createSnapshot();
    const result = await new DataGovTwDatasetAdapter().import({ existingSnapshots: [successful] });

    expect(result.status).toBe("FAILED");
    expect(result.preservedSnapshot).toBeUndefined();

    const failedSameDataset = new ILearnMetadataAdapter();
    const iLearnPrevious = { ...successful, id: "snapshot_6318_previous", datasetId: "6318" };
    const iLearnResult = await failedSameDataset.import({ existingSnapshots: [iLearnPrevious] });
    expect(iLearnResult.status).toBe("FAILED");
    expect(iLearnResult.preservedSnapshot?.id).toBe("snapshot_6318_previous");
  });

  it("makes duplicate fixture imports idempotent by content hash", async () => {
    const adapter = new SyntheticDemoDatasetAdapter();
    const first = await adapter.import();
    const second = await adapter.import({ existingSnapshots: [first.snapshot!] });

    expect(first.status).toBe("SUCCEEDED");
    expect(second.status).toBe("SKIPPED_DUPLICATE");
    expect(second.snapshot?.contentHash).toBe(first.snapshot?.contentHash);
  });

  it("preserves attribution and fixture provenance in preview and snapshot", async () => {
    const adapter = new SyntheticDemoDatasetAdapter();
    const preview = await adapter.preview();
    const snapshot = await adapter.createSnapshot();

    expect(syntheticEducationDataset.attribution).toContain("SYNTHETIC_DEMO");
    expect(preview.provenance.externalNetworkCalled).toBe(false);
    expect(snapshot.provenance.fixtureId).toBe("synthetic-education-v1");
    expect(snapshot.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("keeps iLearn metadata outbound-only and disabled while unverified", async () => {
    const preview = await new ILearnMetadataAdapter().preview();

    expect(preview.validationFlags).toContain("ADAPTER_DISABLED");
    expect(preview.validationFlags).toContain("UNVERIFIED_SOURCE");
    expect(preview.provenance.copyrightContentIncluded).toBe(false);
  });
});
