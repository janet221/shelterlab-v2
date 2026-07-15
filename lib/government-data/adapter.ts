import { governmentDatasetSeeds, type GovernmentDatasetSeed } from "./datasets";

export type GovernmentDatasetImportResult = GovernmentDatasetSeed & {
  status: "mock_synced";
  verificationState?: "UNVERIFIED";
  dataLabel?: "SYNTHETIC_DEMO";
  lastSyncedAt: Date;
};

export interface GovernmentDatasetAdapter {
  importDatasets(): Promise<GovernmentDatasetImportResult[]>;
}

export class MockGovernmentDatasetAdapter implements GovernmentDatasetAdapter {
  async importDatasets(): Promise<GovernmentDatasetImportResult[]> {
    const syncedAt = new Date("2026-01-01T00:00:00.000Z");

    return governmentDatasetSeeds.map((dataset) => ({
      ...dataset,
      status: "mock_synced",
      verificationState: "UNVERIFIED",
      dataLabel: "SYNTHETIC_DEMO",
      lastSyncedAt: syncedAt
    }));
  }
}
