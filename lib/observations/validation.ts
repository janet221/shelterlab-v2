import { z } from "zod";
import { behaviorCodes, isBehaviorCode } from "./behavior-codes";

export const maxObservationDurationSec = 300;

export type ValidationSeverity = "error" | "warning";

export type ValidationFlag = {
  code:
    | "INVALID_DURATION_NEGATIVE"
    | "INVALID_DURATION_TOO_LONG"
    | "CONTEXT_REQUIRED"
    | "INVALID_BEHAVIOR_CODE"
    | "SUBJECTIVE_LANGUAGE"
    | "DUPLICATE_MEDIA_CHECKSUM";
  severity: ValidationSeverity;
  message: string;
  field: string;
};

export const observationInputSchema = z.object({
  dogId: z.string().min(1),
  observerId: z.string().min(1),
  timestamp: z.coerce.date(),
  behaviorCode: z.string(),
  durationSec: z.number().int(),
  context: z.string(),
  notes: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  incidentFlag: z.boolean().default(false)
});

export type ObservationValidationInput = z.input<typeof observationInputSchema>;

export type ObservationValidationOptions = {
  backendMediaChecksum?: string;
  existingMediaChecksums?: Set<string>;
};

const subjectivePatterns = [
  /\u4e00\u76f4\u53eb/u,
  /\u5f88\u5147/u,
  /\u5f88\u53ef\u611b/u
];

export function validateObservationDeterministically(
  input: ObservationValidationInput,
  options: ObservationValidationOptions = {}
): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  const parsed = observationInputSchema.safeParse(input);
  const behaviorCode = typeof input.behaviorCode === "string" ? input.behaviorCode : "";
  const context = typeof input.context === "string" ? input.context : "";
  const notes = typeof input.notes === "string" ? input.notes : "";
  const durationSec = typeof input.durationSec === "number" ? input.durationSec : Number.NaN;

  if (!parsed.success || !isBehaviorCode(behaviorCode)) {
    flags.push({
      code: "INVALID_BEHAVIOR_CODE",
      severity: "error",
      message: `behavior_code must be one of: ${behaviorCodes.join(", ")}`,
      field: "behaviorCode"
    });
  }

  if (Number.isFinite(durationSec) && durationSec < 0) {
    flags.push({
      code: "INVALID_DURATION_NEGATIVE",
      severity: "error",
      message: "duration_sec cannot be negative.",
      field: "durationSec"
    });
  }

  if (Number.isFinite(durationSec) && durationSec > maxObservationDurationSec) {
    flags.push({
      code: "INVALID_DURATION_TOO_LONG",
      severity: "error",
      message: `duration_sec cannot exceed ${maxObservationDurationSec} seconds.`,
      field: "durationSec"
    });
  }

  if (context.trim().length === 0) {
    flags.push({
      code: "CONTEXT_REQUIRED",
      severity: "error",
      message: "context is required.",
      field: "context"
    });
  }

  if (subjectivePatterns.some((pattern) => pattern.test(`${context}\n${notes}`))) {
    flags.push({
      code: "SUBJECTIVE_LANGUAGE",
      severity: "warning",
      message: "Replace vague or subjective wording with observable behavior.",
      field: "notes"
    });
  }

  if (options.backendMediaChecksum && options.existingMediaChecksums?.has(options.backendMediaChecksum)) {
    flags.push({
      code: "DUPLICATE_MEDIA_CHECKSUM",
      severity: "warning",
      message: "This backend-calculated media checksum already exists. Confirm whether it is a duplicate upload.",
      field: "media_checksum"
    });
  }

  return flags;
}
