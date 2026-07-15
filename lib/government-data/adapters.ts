import { createHash } from "node:crypto";
import type {
  DatasetAdapterFixture,
  DatasetImportResult,
  DatasetPreview,
  DatasetSnapshot,
  GovernmentDatasetRecord,
  LocalDatasetRow
} from "./evidence-types";
import { governmentDatasetRecordSchema } from "./evidence-types";
import {
  assertAggregateShelterRows,
  assertILearnMetadataOnly,
  assertQuestionBankIndexOnly,
  iLearnMetadataRowSchema,
  questionBankIndexRowSchema,
  shelterStatisticsRowSchema,
  studentPopulationRowSchema,
  validateActivatedDataset
} from "./official-verification";
import {
  configuredGovernmentDatasets,
  iLearnMetadataFixture,
  questionBankIndexFixture,
  shelterStatisticsFixture,
  studentPopulationFixture,
  syntheticEducationFixture,
  verifiedDatasetFixtures
} from "./sprint6-fixtures";
import type { z } from "zod";

export type DatasetImportContext = {
  existingSnapshots?: DatasetSnapshot[];
  now?: Date;
  correlationId?: string;
};

export interface GovernmentOpenDataAdapter {
  readonly key: string;
  readonly enabled: boolean;
  preview(): Promise<DatasetPreview>;
  validate(): Promise<string[]>;
  normalize(): Promise<LocalDatasetRow[]>;
  detectDuplicate(existingSnapshots: DatasetSnapshot[]): Promise<DatasetSnapshot | undefined>;
  createSnapshot(context?: DatasetImportContext): Promise<DatasetSnapshot>;
  import(context?: DatasetImportContext): Promise<DatasetImportResult>;
}

function canonicalJson(rows: LocalDatasetRow[]): string {
  return JSON.stringify(rows.map((row) => Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b)))));
}

export abstract class LocalFixtureDatasetAdapter implements GovernmentOpenDataAdapter {
  abstract readonly key: string;
  abstract readonly enabled: boolean;

  protected constructor(
    protected readonly fixture: DatasetAdapterFixture,
    private readonly rowSchema?: z.ZodTypeAny,
    private readonly policyValidation: (rows: LocalDatasetRow[]) => string[] = () => []
  ) {}

  async preview(): Promise<DatasetPreview> {
    const rows = await this.normalize();
    return {
      adapterKey: this.key,
      datasetId: this.fixture.dataset.datasetId,
      recordCount: rows.length,
      fieldNames: [...new Set(rows.flatMap((row) => Object.keys(row)))].sort(),
      verificationState: this.fixture.dataset.verificationState,
      validationFlags: await this.validate(),
      provenance: this.fixture.provenance
    };
  }

  async validate(): Promise<string[]> {
    const flags: string[] = [];
    const result = governmentDatasetRecordSchema.safeParse(this.fixture.dataset);
    if (!result.success) flags.push("INVALID_DATASET_METADATA");
    if (!this.enabled) flags.push("ADAPTER_DISABLED");
    if (this.fixture.dataset.verificationState === "UNVERIFIED") flags.push("UNVERIFIED_SOURCE");
    if (this.fixture.rows.length === 0) flags.push("EMPTY_FIXTURE");
    if (this.rowSchema) flags.push(...validateActivatedDataset(this.fixture, this.rowSchema));
    flags.push(...this.policyValidation(this.fixture.rows));
    return flags;
  }

  async normalize(): Promise<LocalDatasetRow[]> {
    return this.fixture.rows.map((row) => Object.fromEntries(Object.entries({
      ...row,
      _sourceDatasetId: this.fixture.dataset.datasetId,
      _sourceAttribution: this.fixture.dataset.attribution,
      _verificationState: this.fixture.dataset.verificationState
    }).sort(([a], [b]) => a.localeCompare(b))));
  }

  async detectDuplicate(existingSnapshots: DatasetSnapshot[]): Promise<DatasetSnapshot | undefined> {
    const rows = await this.normalize();
    const hash = createHash("sha256").update(canonicalJson(rows)).digest("hex");
    return existingSnapshots.find((snapshot) => snapshot.datasetId === this.fixture.dataset.datasetId && snapshot.contentHash === hash);
  }

  async createSnapshot(context: DatasetImportContext = {}): Promise<DatasetSnapshot> {
    const rows = await this.normalize();
    const contentHash = createHash("sha256").update(canonicalJson(rows)).digest("hex");
    const existing = context.existingSnapshots ?? [];
    const version = existing.filter((snapshot) => snapshot.datasetId === this.fixture.dataset.datasetId).length + 1;
    return {
      id: `snapshot_${this.fixture.dataset.datasetId.toLowerCase()}_${contentHash.slice(0, 12)}`,
      datasetId: this.fixture.dataset.datasetId,
      snapshotVersion: version,
      schemaVersion: this.fixture.dataset.schemaVersion,
      verificationState: this.fixture.dataset.verificationState,
      retrievedAt: context.now ?? new Date("2026-07-11T02:00:00.000Z"),
      recordCount: rows.length,
      contentHash,
      normalizedRows: rows,
      provenance: this.fixture.provenance,
      isLastSuccessful: true
    };
  }

  async import(context: DatasetImportContext = {}): Promise<DatasetImportResult> {
    const preview = await this.preview();
    const previous = [...(context.existingSnapshots ?? [])]
      .filter((snapshot) => snapshot.datasetId === this.fixture.dataset.datasetId && snapshot.isLastSuccessful)
      .sort((a, b) => b.snapshotVersion - a.snapshotVersion)[0];
    if (!this.enabled || preview.validationFlags.some((flag) => flag === "INVALID_DATASET_METADATA" || flag === "UNVERIFIED_SOURCE" || flag.startsWith("INVALID_ROW_SCHEMA") || flag.includes("FORBIDDEN") || flag === "QUESTION_CONTENT_NOT_VERIFIED")) {
      return {
        dataset: this.fixture.dataset,
        status: "FAILED",
        preview,
        validationFlags: preview.validationFlags,
        preservedSnapshot: previous,
        failureMessage: this.enabled ? "Dataset validation failed." : "Adapter is disabled by configuration."
      };
    }
    const duplicate = await this.detectDuplicate(context.existingSnapshots ?? []);
    if (duplicate) {
      return {
        dataset: this.fixture.dataset,
        status: "SKIPPED_DUPLICATE",
        preview,
        snapshot: duplicate,
        preservedSnapshot: duplicate,
        validationFlags: ["DUPLICATE_CONTENT_HASH"]
      };
    }
    const snapshot = await this.createSnapshot(context);
    return { dataset: this.fixture.dataset, status: "SUCCEEDED", preview, snapshot, validationFlags: [] };
  }
}

export class DataGovTwDatasetAdapter extends LocalFixtureDatasetAdapter {
  readonly key = "data-gov-tw";
  readonly enabled: boolean;

  constructor(datasetId = "15391") {
    const fixture = verifiedDatasetFixtures.get(datasetId) ?? {
      dataset: configuredGovernmentDatasets.find((dataset) => dataset.datasetId === datasetId) ?? configuredGovernmentDatasets[3],
      rows: [],
      provenance: { mode: "LOCAL_FIXTURE" as const, fixtureId: `${datasetId}-disabled`, externalNetworkCalled: false as const, copyrightContentIncluded: false as const }
    };
    const rowSchema = datasetId === "40121" ? studentPopulationRowSchema : datasetId === "41236" ? shelterStatisticsRowSchema : datasetId === "29027" ? questionBankIndexRowSchema : undefined;
    const policy = datasetId === "41236" ? assertAggregateShelterRows : datasetId === "29027" ? assertQuestionBankIndexOnly : undefined;
    super(fixture, rowSchema, policy);
    this.enabled = fixture.dataset.active;
  }
}

export class ILearnMetadataAdapter extends LocalFixtureDatasetAdapter {
  readonly key = "ilearn-metadata";
  readonly enabled: boolean;

  constructor(enabled = false) {
    const fixture = enabled ? iLearnMetadataFixture : {
      ...iLearnMetadataFixture,
      dataset: { ...iLearnMetadataFixture.dataset, verificationState: "UNVERIFIED" as const, active: false, retrievalStatus: "DISABLED" as const, validationStatus: "PENDING" as const }
    };
    super(fixture, iLearnMetadataRowSchema, assertILearnMetadataOnly);
    this.enabled = enabled;
  }
}

export class StudentPopulationDatasetAdapter extends LocalFixtureDatasetAdapter {
  readonly key = "moe-student-population";
  readonly enabled = true;
  constructor() { super(studentPopulationFixture, studentPopulationRowSchema); }
}

export class ShelterStatisticsDatasetAdapter extends LocalFixtureDatasetAdapter {
  readonly key = "moa-shelter-statistics";
  readonly enabled = true;
  constructor() { super(shelterStatisticsFixture, shelterStatisticsRowSchema, assertAggregateShelterRows); }
}

export class QuestionBankIndexAdapter extends LocalFixtureDatasetAdapter {
  readonly key = "question-bank-index";
  readonly enabled = false;
  constructor() { super(questionBankIndexFixture, questionBankIndexRowSchema, assertQuestionBankIndexOnly); }
}

export class ManualVerifiedResourceAdapter extends LocalFixtureDatasetAdapter {
  readonly key = "manual-verified-resource";
  readonly enabled = true;

  constructor() {
    super(syntheticEducationFixture);
  }
}

export class SyntheticDemoDatasetAdapter extends LocalFixtureDatasetAdapter {
  readonly key = "synthetic-demo";
  readonly enabled = true;

  constructor() {
    super(syntheticEducationFixture);
  }
}

export function createDatasetAdapter(datasetId: string): GovernmentOpenDataAdapter {
  if (datasetId === "SYNTHETIC_EDUOD_001") return new SyntheticDemoDatasetAdapter();
  if (datasetId === "6318") return new ILearnMetadataAdapter(true);
  if (datasetId === "40121") return new StudentPopulationDatasetAdapter();
  if (datasetId === "41236") return new ShelterStatisticsDatasetAdapter();
  if (datasetId === "29027") return new QuestionBankIndexAdapter();
  return new DataGovTwDatasetAdapter(datasetId);
}

export function canDatasetFeedAssessment(dataset: GovernmentDatasetRecord, demoMode: boolean): boolean {
  if (!dataset.active || dataset.retrievalStatus !== "SUCCESS" || dataset.validationStatus !== "PASSED") return false;
  if (!dataset.assessmentUseAllowed) return false;
  if (dataset.verificationState === "VERIFIED") return dataset.allowedUsageModules.includes("QUESTION_GENERATION");
  return demoMode && dataset.verificationState === "SYNTHETIC_DEMO";
}
