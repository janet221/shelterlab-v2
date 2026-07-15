import { z } from "zod";
import { environmentContextSchema, missionStatuses, privacyStates } from "./types";
import { sprint3BehaviorCodes } from "../observations/session-engine";

export const createMissionApiSchema = z.object({
  id: z.string().optional(), courseId: z.string().optional(), classroomId: z.string().optional(), teacherId: z.string(), studentId: z.string(), shelterId: z.string(), dogId: z.string(),
  title: z.string().trim().min(1), scientificPurpose: z.string().trim().min(1), researchQuestion: z.string().optional(), allowedZone: z.string().min(1),
  scheduledStart: z.coerce.date(), scheduledEnd: z.coerce.date(), maximumDurationSec: z.number().int().positive().max(300).default(300), protocolVersion: z.string().default("SL-OBS-1"), syntheticDemo: z.boolean().default(false)
});
export const missionListQuerySchema = z.object({ at: z.coerce.date().optional() });
export const missionUpdateApiSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("update"), patch: z.object({ title: z.string().optional(), scientificPurpose: z.string().optional(), researchQuestion: z.string().optional(), allowedZone: z.string().optional(), scheduledStart: z.coerce.date().optional(), scheduledEnd: z.coerce.date().optional() }) }),
  z.object({ action: z.literal("submit_for_shelter") }),
  z.object({ action: z.literal("cancel"), reason: z.string().trim().min(1) }),
  z.object({ action: z.literal("admin_override"), status: z.enum(missionStatuses), reason: z.string().trim().min(1) })
]);
export const missionShelterDecisionSchema = z.object({ decision: z.enum(["confirm", "request_revision", "reject"]), reason: z.string().optional() });
export const startMissionSchema = z.object({ idempotencyKey: z.string().min(1), clientStartedAt: z.coerce.date().optional() });
export const autosaveSchema = z.object({ expectedRowVersion: z.number().int().nonnegative(), idempotencyKey: z.string().min(1), environmentContext: environmentContextSchema.optional(), generalNotes: z.string().optional(), incidentFlag: z.boolean().optional() });
export const behaviorEventApiSchema = z.object({ timestampSecond: z.number().int().min(0), behaviorCode: z.enum(sprint3BehaviorCodes), durationSec: z.number().int().nonnegative().optional(), confidenceLevel: z.enum(["low", "medium", "high"]), observerNote: z.string().optional(), contextCode: z.string().optional(), evidenceType: z.enum(["direct_observation", "media_reference", "shelter_record"]).default("direct_observation"), mediaAssetId: z.string().optional() });
export const idempotencySchema = z.object({ idempotencyKey: z.string().min(1) });
export const teacherReviewApiSchema = z.object({ decision: z.enum(["approve", "request_revision", "reject"]), reasonCode: z.string().optional(), reasonText: z.string().optional(), rubric: z.record(z.union([z.number(), z.string(), z.boolean()])).default({}), idempotencyKey: z.string().min(1) });
export const shelterReviewApiSchema = z.object({ decision: z.enum(["confirm", "request_revision", "reject"]), reasonCode: z.string().optional(), reasonText: z.string().optional(), privacyState: z.enum(privacyStates), professionalContextNote: z.string().optional(), idempotencyKey: z.string().min(1) });
export const unpublishSchema = z.object({ reason: z.string().trim().min(1) });
export const professionalNoteSchema = z.object({ note: z.string().trim().min(1), visibility: z.enum(["internal", "public"]) });
