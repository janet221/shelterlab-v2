import { MockGovernmentDatasetAdapter, type GovernmentDatasetImportResult } from "./adapter";

export const defaultGovernmentDatasetSyncCron = "0 2 * * *";
export const defaultGovernmentDatasetSyncLocalTime = "02:00";

export type GovernmentDatasetSyncState = {
  datasetId: string;
  name: string;
  agency: string;
  sourceUrl: string;
  updateFrequency: string;
  licenseNote: string;
  status: "configured" | "mock_synced" | "sync_failed" | "disabled";
  lastSyncedAt?: Date;
  lastSuccessfulSyncedAt?: Date;
  lastSyncAttemptedAt?: Date;
  lastSyncError?: string;
  syncCron: string;
};

export type GovernmentDatasetSyncFailure = {
  datasetId: string;
  status: "sync_failed";
  attemptedAt: Date;
  error: string;
};

export function applyGovernmentDatasetSyncSuccess(
  previous: GovernmentDatasetSyncState,
  result: GovernmentDatasetImportResult
): GovernmentDatasetSyncState {
  return {
    ...previous,
    name: result.name,
    agency: result.agency,
    sourceUrl: result.sourceUrl,
    updateFrequency: result.updateFrequency,
    licenseNote: result.licenseNote,
    status: result.status,
    lastSyncedAt: result.lastSyncedAt,
    lastSuccessfulSyncedAt: result.lastSyncedAt,
    lastSyncAttemptedAt: result.lastSyncedAt,
    lastSyncError: undefined,
    syncCron: previous.syncCron || defaultGovernmentDatasetSyncCron
  };
}

export function applyGovernmentDatasetSyncFailure(
  previous: GovernmentDatasetSyncState,
  failure: GovernmentDatasetSyncFailure
): GovernmentDatasetSyncState {
  return {
    ...previous,
    status: "sync_failed",
    lastSyncAttemptedAt: failure.attemptedAt,
    lastSyncError: failure.error,
    syncCron: previous.syncCron || defaultGovernmentDatasetSyncCron
  };
}

export async function runMockGovernmentDatasetSyncNow(): Promise<GovernmentDatasetImportResult[]> {
  const adapter = new MockGovernmentDatasetAdapter();
  return adapter.importDatasets();
}
