import { z } from "zod";

export const evidenceVerificationStates = [
  "VERIFIED",
  "METADATA_VERIFIED",
  "UNVERIFIED",
  "UNAVAILABLE",
  "DEMO_REFERENCE",
  "SYNTHETIC_DEMO"
] as const;

export type EvidenceVerificationState = (typeof evidenceVerificationStates)[number];

export const datasetUsageModules = [
  "CURRICULUM_DISCOVERY",
  "LEARNING_RESOURCE_MAPPING",
  "COMPETENCY_CONTEXT",
  "QUESTION_GENERATION",
  "REMEDIATION",
  "INQUIRY_CONTEXT",
  "COMPETITION_EVIDENCE"
] as const;

export type DatasetUsageModule = (typeof datasetUsageModules)[number];

export const governmentDatasetRecordSchema = z.object({
  datasetId: z.string().min(1),
  name: z.string().min(1),
  agency: z.string().min(1),
  sourceUrl: z.string().min(1),
  verificationState: z.enum(evidenceVerificationStates),
  licenseNote: z.string().min(1),
  attribution: z.string().min(1),
  updateFrequency: z.string().min(1),
  schemaVersion: z.string().min(1),
  retrievalStatus: z.enum(["CONFIGURED", "READY", "SUCCESS", "FAILED", "DISABLED"]),
  validationStatus: z.enum(["PENDING", "PASSED", "WARNING", "FAILED"]),
  active: z.boolean(),
  adapterKey: z.string().min(1),
  officialResourceUrl: z.string().url().optional(),
  resourceFormat: z.string().min(1).optional(),
  encoding: z.string().min(1).optional(),
  metadataModifiedAt: z.string().min(1).optional(),
  verificationTimestamp: z.date().optional(),
  verifier: z.string().min(1).optional(),
  sourceContentHash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  displayMode: z.enum(["LIVE", "CACHED_SNAPSHOT", "VERIFIED_FIXTURE", "SYNTHETIC"]).optional(),
  assessmentUseAllowed: z.boolean().default(false),
  allowedUsageModules: z.array(z.enum(datasetUsageModules)).default([]),
  restrictions: z.array(z.string()).default([]),
  lastCheckedAt: z.date().optional(),
  lastSuccessfulSyncAt: z.date().optional(),
  failureMessage: z.string().optional()
});

export type GovernmentDatasetRecord = z.infer<typeof governmentDatasetRecordSchema>;

export type LocalDatasetRow = Record<string, string | number | boolean | null>;

export type DatasetAdapterFixture = {
  dataset: GovernmentDatasetRecord;
  rows: LocalDatasetRow[];
  provenance: {
    mode: "LOCAL_FIXTURE" | "VERIFIED_FIXTURE";
    fixtureId: string;
    externalNetworkCalled: false;
    copyrightContentIncluded: false;
    officialMetadataUrl?: string;
    officialResourceUrl?: string;
    officialRetrievedAt?: string;
    sourceContentHash?: string;
    resourceFormat?: string;
    encoding?: string;
    attribution?: string;
    licenseUrl?: string;
  };
};

export type DatasetPreview = {
  adapterKey: string;
  datasetId: string;
  recordCount: number;
  fieldNames: string[];
  verificationState: EvidenceVerificationState;
  validationFlags: string[];
  provenance: DatasetAdapterFixture["provenance"];
};

export type DatasetSnapshot = {
  id: string;
  datasetId: string;
  snapshotVersion: number;
  schemaVersion: string;
  verificationState: EvidenceVerificationState;
  retrievedAt: Date;
  recordCount: number;
  contentHash: string;
  normalizedRows: LocalDatasetRow[];
  provenance: DatasetAdapterFixture["provenance"];
  isLastSuccessful: boolean;
};

export type DatasetImportResult = {
  dataset: GovernmentDatasetRecord;
  status: "SUCCEEDED" | "FAILED" | "SKIPPED_DUPLICATE";
  snapshot?: DatasetSnapshot;
  preservedSnapshot?: DatasetSnapshot;
  preview: DatasetPreview;
  validationFlags: string[];
  failureMessage?: string;
};
