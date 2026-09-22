import { describe, expect, it } from "vitest";
import { MockGovernmentDatasetAdapter } from "../../lib/government-data/adapter";
import {
  applyGovernmentDatasetSyncFailure,
  applyGovernmentDatasetSyncSuccess,
  defaultGovernmentDatasetSyncCron,
  defaultGovernmentDatasetSyncLocalTime,
  type GovernmentDatasetSyncState
} from "../../lib/government-data/sync";

describe("MockGovernmentDatasetAdapter", () => {
  it("returns configured mock datasets without calling external APIs", async () => {
    const adapter = new MockGovernmentDatasetAdapter();
    const datasets = await adapter.importDatasets();

    expect(datasets).toHaveLength(6);
    expect(datasets.map((dataset) => dataset.datasetId)).toEqual(["41236", "6318", "29027", "15391", "6089", "40121"]);
    expect(datasets.every((dataset) => dataset.status === "mock_synced")).toBe(true);
  });

  it("uses the product default daily 02:00 sync schedule", () => {
    expect(defaultGovernmentDatasetSyncCron).toBe("0 2 * * *");
    expect(defaultGovernmentDatasetSyncLocalTime).toBe("02:00");
  });

  it("keeps previous successful dataset metadata when a sync fails", () => {
    const previous: GovernmentDatasetSyncState = {
      datasetId: "41236",
      name: "previous name",
      agency: "previous agency",
      sourceUrl: "https://example.test/previous",
      updateFrequency: "daily",
      licenseNote: "previous license",
      status: "mock_synced",
      lastSyncedAt: new Date("2026-01-01T02:00:00.000Z"),
      lastSuccessfulSyncedAt: new Date("2026-01-01T02:00:00.000Z"),
      syncCron: defaultGovernmentDatasetSyncCron
    };

    const updated = applyGovernmentDatasetSyncFailure(previous, {
      datasetId: "41236",
      status: "sync_failed",
      attemptedAt: new Date("2026-01-02T02:00:00.000Z"),
      error: "network timeout"
    });

    expect(updated.status).toBe("sync_failed");
    expect(updated.name).toBe("previous name");
    expect(updated.lastSuccessfulSyncedAt).toEqual(new Date("2026-01-01T02:00:00.000Z"));
    expect(updated.lastSyncAttemptedAt).toEqual(new Date("2026-01-02T02:00:00.000Z"));
    expect(updated.lastSyncError).toBe("network timeout");
  });

  it("updates last successful sync metadata on success", () => {
    const previous: GovernmentDatasetSyncState = {
      datasetId: "41236",
      name: "previous name",
      agency: "previous agency",
      sourceUrl: "https://example.test/previous",
      updateFrequency: "daily",
      licenseNote: "previous license",
      status: "configured",
      syncCron: defaultGovernmentDatasetSyncCron
    };

    const updated = applyGovernmentDatasetSyncSuccess(previous, {
      datasetId: "41236",
      name: "new name",
      agency: "new agency",
      sourceUrl: "https://example.test/new",
      updateFrequency: "daily",
      licenseNote: "new license",
      status: "mock_synced",
      lastSyncedAt: new Date("2026-01-02T02:00:00.000Z")
    });

    expect(updated.status).toBe("mock_synced");
    expect(updated.name).toBe("new name");
    expect(updated.lastSuccessfulSyncedAt).toEqual(new Date("2026-01-02T02:00:00.000Z"));
    expect(updated.lastSyncError).toBeUndefined();
  });
});
