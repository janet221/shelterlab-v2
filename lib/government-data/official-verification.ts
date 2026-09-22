import { z } from "zod";
import type { DatasetAdapterFixture, DatasetUsageModule, GovernmentDatasetRecord, LocalDatasetRow } from "./evidence-types";

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

export const iLearnMetadataRowSchema = z.object({
  recordId: z.string().min(1),
  title: z.string().min(1),
  resourceType: z.string().min(1),
  productionYear: z.string().min(1),
  learningArea: z.string(),
  learningStage: z.string(),
  learningContent: z.string(),
  learningPerformance: z.string(),
  issue: z.string(),
  coreCompetency: z.string(),
  resourceLicense: z.string().min(1),
  outboundUrl: z.string().url().refine((url) => new URL(url).hostname === "stv.naer.edu.tw", "Only official iLearn outbound URLs are allowed")
}).strict();

export const studentPopulationRowSchema = z.object({
  schoolYear: z.number().int().positive(),
  county: z.string().min(1),
  elementaryStudents: z.number().int().nonnegative(),
  juniorHighStudents: z.number().int().nonnegative(),
  seniorGeneralStudents: z.number().int().nonnegative(),
  seniorVocationalStudents: z.number().int().nonnegative()
}).strict();

export const shelterStatisticsRowSchema = z.object({
  recordId: z.number().int().positive(),
  rocYear: z.number().int().positive(),
  countyCode: z.string().min(1),
  county: z.string().min(1),
  month: z.number().int().min(1).max(12),
  intakeCount: z.number().int().nonnegative(),
  adoptedCount: z.number().int().nonnegative(),
  adoptionRate: z.string().regex(/^\d+%$/),
  euthanasiaCount: z.number().int().nonnegative(),
  deathCount: z.number().int().nonnegative()
}).strict();

export const questionBankIndexRowSchema = z.object({
  recordId: z.number().int().positive(),
  rocYear: z.number().int().positive(),
  semester: z.string().min(1),
  county: z.string().min(1),
  school: z.string().min(1),
  grade: z.string().min(1),
  subject: z.string().min(1),
  examType: z.string().min(1),
  viewCount: z.number().int().nonnegative()
}).strict();

export type DatasetVerificationEvidence = {
  officialMetadataValidated: boolean;
  resourceValidated: boolean;
  resourceSchemaValidated: boolean;
  sourceContentHash?: string;
};

export function determineVerificationState(evidence: DatasetVerificationEvidence) {
  if (evidence.officialMetadataValidated && evidence.resourceValidated && evidence.resourceSchemaValidated && sha256Schema.safeParse(evidence.sourceContentHash).success) return "VERIFIED" as const;
  if (evidence.officialMetadataValidated) return "METADATA_VERIFIED" as const;
  return "UNVERIFIED" as const;
}

export function validateActivatedDataset(fixture: DatasetAdapterFixture, rowSchema: z.ZodType<LocalDatasetRow>): string[] {
  const flags: string[] = [];
  const dataset = fixture.dataset;
  if (dataset.active && dataset.verificationState !== "VERIFIED") flags.push("ACTIVE_DATASET_NOT_VERIFIED");
  if (dataset.active && !dataset.officialResourceUrl) flags.push("MISSING_OFFICIAL_RESOURCE_URL");
  if (dataset.active && !dataset.sourceContentHash) flags.push("MISSING_SOURCE_CONTENT_HASH");
  if (dataset.active && !dataset.verificationTimestamp) flags.push("MISSING_VERIFICATION_TIMESTAMP");
  fixture.rows.forEach((row, index) => {
    if (!rowSchema.safeParse(row).success) flags.push(`INVALID_ROW_SCHEMA:${index}`);
  });
  return flags;
}

export function canUseDatasetFor(dataset: GovernmentDatasetRecord, usage: DatasetUsageModule): boolean {
  return dataset.active && dataset.verificationState === "VERIFIED" && dataset.retrievalStatus === "SUCCESS" && dataset.validationStatus === "PASSED" && dataset.allowedUsageModules.includes(usage);
}

export function assertAggregateShelterRows(rows: LocalDatasetRow[]): string[] {
  const forbidden = ["dogId", "dog_id", "publicName", "public_name", "microchip", "observerId"];
  return rows.some((row) => forbidden.some((field) => field in row)) ? ["INDIVIDUAL_DOG_FIELD_FORBIDDEN"] : [];
}

export function assertQuestionBankIndexOnly(rows: LocalDatasetRow[]): string[] {
  const forbidden = ["questionText", "answerKey", "explanation", "examFileUrl"];
  return rows.some((row) => forbidden.some((field) => field in row)) ? ["QUESTION_CONTENT_NOT_VERIFIED"] : [];
}

export function assertILearnMetadataOnly(rows: LocalDatasetRow[]): string[] {
  const forbidden = ["videoBytes", "transcript", "embeddedVideo", "downloadedContent"];
  return rows.some((row) => forbidden.some((field) => field in row)) ? ["ILEARN_CONTENT_COPY_FORBIDDEN"] : [];
}
