import { z } from "zod";

export const teacherRevisionReasons = [
  "missing_information",
  "incorrect_behavior_classification",
  "poor_media_quality",
  "subjective_description",
  "time_inconsistency",
  "other"
] as const;

export type TeacherRevisionReason = (typeof teacherRevisionReasons)[number];

export const teacherRevisionRequestSchema = z.object({
  reason: z.enum(teacherRevisionReasons),
  note: z.string().trim().optional()
});

export function validateTeacherRevisionRequest(input: unknown): {
  valid: boolean;
  reason?: TeacherRevisionReason;
  note?: string;
} {
  const parsed = teacherRevisionRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { valid: false };
  }

  return {
    valid: true,
    reason: parsed.data.reason,
    note: parsed.data.note
  };
}
