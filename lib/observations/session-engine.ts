import { z } from "zod";
import { canStudentCreateObservation, type EngineUser, type ResearchLicenseRecord, type AuditEvent } from "../research-license/engine";

export const maxObservationSessionDurationSec = 300;

export const sprint3BehaviorCodes = [
  "APPROACH",
  "MOVE_AWAY",
  "STAND",
  "SIT",
  "LIE",
  "PACE",
  "BARK",
  "WHINE",
  "TAIL_WAG",
  "TAIL_TUCK",
  "EARS_FORWARD",
  "EARS_BACK",
  "YAWN",
  "LIP_LICK",
  "JUMP",
  "PLAY_BOW",
  "SNIFF",
  "LOOK_AT_HUMAN",
  "LOOK_AWAY",
  "OTHER"
] as const;

export type Sprint3BehaviorCode = (typeof sprint3BehaviorCodes)[number];

export type ObservationSessionStatus =
  | "draft"
  | "running"
  | "submitted"
  | "teacher_review"
  | "teacher_revision"
  | "shelter_review"
  | "shelter_revision"
  | "shelter_confirmed"
  | "published"
  | "archived";

export type ObservationValidationFlag = {
  code:
    | "MISSING_BEHAVIORS"
    | "EMPTY_NOTES"
    | "DUPLICATE_TIMESTAMPS"
    | "NEGATIVE_DURATION"
    | "NON_POSITIVE_DURATION"
    | "BEHAVIOR_OUTSIDE_SESSION"
    | "SESSION_TOO_LONG"
    | "TOO_MANY_IDENTICAL_EVENTS"
    | "SUBJECTIVE_LANGUAGE";
  severity: "error" | "warning";
  field: string;
  message: string;
};

export type BehaviorEventRecord = {
  id: string;
  sessionId: string;
  timestampSecond: number;
  behaviorCode: Sprint3BehaviorCode;
  durationSec: number;
  confidence: number;
  observerNote?: string;
};

export type ObservationSessionRecord = {
  id: string;
  studentId: string;
  dogId: string;
  teacherId?: string;
  shelterStaffId?: string;
  startedAt?: Date;
  endedAt?: Date;
  status: ObservationSessionStatus;
  durationSec?: number;
  locationZone: string;
  weather?: string;
  temperature?: number;
  notes?: string;
  behaviorEvents: BehaviorEventRecord[];
  validationFlags: ObservationValidationFlag[];
  teacherReviewReason?: string;
  shelterReviewReason?: string;
  publishedAt?: Date;
};

export type ObservationDashboardMetrics = {
  observationCount: number;
  studentCount: number;
  shelterCount: number;
  publishedObservations: number;
  revisionRate: number;
  averageDurationSec: number;
};

const sessionInputSchema = z.object({
  id: z.string().optional(),
  studentId: z.string(),
  dogId: z.string(),
  teacherId: z.string().optional(),
  shelterStaffId: z.string().optional(),
  locationZone: z.string().min(1),
  weather: z.string().optional(),
  temperature: z.number().optional(),
  notes: z.string().optional()
});

const subjectivePatterns = [/very cute/i, /looks angry/i, /\bhappy\b/i];

function secondsBetween(startedAt: Date, endedAt: Date): number {
  return Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));
}

function audit(actorId: string, session: ObservationSessionRecord, action: string, fromStatus?: string, toStatus?: string): AuditEvent {
  return {
    actorId,
    entityType: "observation_session",
    entityId: session.id,
    action,
    fromStatus,
    toStatus
  };
}

export function createObservationSession(
  actor: EngineUser,
  input: z.input<typeof sessionInputSchema>,
  licenses: ResearchLicenseRecord[],
  now: Date
): { session: ObservationSessionRecord; auditEvents: AuditEvent[] } {
  if (!canStudentCreateObservation(actor, licenses, now)) {
    throw new Error("Student must have an active Research License to create an observation session.");
  }

  const parsed = sessionInputSchema.parse(input);
  if (parsed.studentId !== actor.id) {
    throw new Error("Students can only create their own observation sessions.");
  }

  const session: ObservationSessionRecord = {
    id: parsed.id ?? `obs_session_${actor.id}_${now.getTime()}`,
    studentId: parsed.studentId,
    dogId: parsed.dogId,
    teacherId: parsed.teacherId,
    shelterStaffId: parsed.shelterStaffId,
    status: "draft",
    locationZone: parsed.locationZone,
    weather: parsed.weather,
    temperature: parsed.temperature,
    notes: parsed.notes,
    behaviorEvents: [],
    validationFlags: []
  };

  return { session, auditEvents: [audit(actor.id, session, "observation_session_created", undefined, "draft")] };
}

export function startObservationSession(actor: EngineUser, session: ObservationSessionRecord, now: Date) {
  if (actor.role !== "student" || actor.id !== session.studentId) {
    throw new Error("Only the owning student can start an observation session.");
  }
  if (session.status !== "draft") {
    throw new Error("Only draft sessions can be started.");
  }

  const updated = { ...session, status: "running" as const, startedAt: now };
  return { session: updated, auditEvents: [audit(actor.id, updated, "observation_session_started", "draft", "running")] };
}

export function addBehaviorEvent(
  actor: EngineUser,
  session: ObservationSessionRecord,
  event: Omit<BehaviorEventRecord, "id" | "sessionId">
): ObservationSessionRecord {
  if (actor.role !== "student" || actor.id !== session.studentId) {
    throw new Error("Only the owning student can record behavior events.");
  }
  if (session.status === "published") {
    throw new Error("Published sessions cannot be modified.");
  }
  if (session.status !== "running" && session.status !== "draft" && session.status !== "teacher_revision" && session.status !== "shelter_revision") {
    throw new Error("Students cannot edit after submit.");
  }

  return {
    ...session,
    behaviorEvents: [
      ...session.behaviorEvents,
      {
        ...event,
        id: `event_${session.id}_${session.behaviorEvents.length + 1}`,
        sessionId: session.id
      }
    ]
  };
}

export function validateObservationSession(session: ObservationSessionRecord): ObservationValidationFlag[] {
  const flags: ObservationValidationFlag[] = [];
  const durationSec = session.durationSec ?? (session.startedAt && session.endedAt ? secondsBetween(session.startedAt, session.endedAt) : undefined);

  if (durationSec !== undefined && durationSec > maxObservationSessionDurationSec) {
    flags.push({
      code: "SESSION_TOO_LONG",
      severity: "error",
      field: "durationSec",
      message: "Observation session cannot exceed 300 seconds."
    });
  }

  if (session.behaviorEvents.length === 0) {
    flags.push({
      code: "MISSING_BEHAVIORS",
      severity: "error",
      field: "behaviorEvents",
      message: "At least one behavior event is required."
    });
  }

  if (!session.notes || session.notes.trim().length === 0) {
    flags.push({
      code: "EMPTY_NOTES",
      severity: "warning",
      field: "notes",
      message: "Session notes are empty."
    });
  }

  const timestamps = new Map<number, number>();
  const identicalEvents = new Map<string, number>();

  for (const event of session.behaviorEvents) {
    timestamps.set(event.timestampSecond, (timestamps.get(event.timestampSecond) ?? 0) + 1);

    if (event.durationSec < 0) {
      flags.push({
        code: "NEGATIVE_DURATION",
        severity: "error",
        field: "behaviorEvents.durationSec",
        message: "Behavior duration cannot be negative."
      });
    }

    if (event.durationSec <= 0) {
      flags.push({
        code: "NON_POSITIVE_DURATION",
        severity: "error",
        field: "behaviorEvents.durationSec",
        message: "Behavior duration must be positive."
      });
    }

    if (event.timestampSecond < 0 || event.timestampSecond > maxObservationSessionDurationSec || event.timestampSecond + event.durationSec > maxObservationSessionDurationSec) {
      flags.push({
        code: "BEHAVIOR_OUTSIDE_SESSION",
        severity: "error",
        field: "behaviorEvents.timestampSecond",
        message: "Behavior timestamp and duration must stay within the 300-second session."
      });
    }

    const identicalKey = `${event.behaviorCode}:${event.durationSec}`;
    identicalEvents.set(identicalKey, (identicalEvents.get(identicalKey) ?? 0) + 1);

    if (event.observerNote && subjectivePatterns.some((pattern) => pattern.test(event.observerNote!))) {
      flags.push({
        code: "SUBJECTIVE_LANGUAGE",
        severity: "warning",
        field: "behaviorEvents.observerNote",
        message: "Subjective wording should be rewritten as observable behavior."
      });
    }
  }

  if ([...timestamps.values()].some((count) => count > 1)) {
    flags.push({
      code: "DUPLICATE_TIMESTAMPS",
      severity: "warning",
      field: "behaviorEvents.timestampSecond",
      message: "Multiple behavior events use the same timestamp."
    });
  }

  if ([...identicalEvents.values()].some((count) => count > 5)) {
    flags.push({
      code: "TOO_MANY_IDENTICAL_EVENTS",
      severity: "warning",
      field: "behaviorEvents",
      message: "Many identical events may indicate low-quality repeated entry."
    });
  }

  if (session.notes && subjectivePatterns.some((pattern) => pattern.test(session.notes!))) {
    flags.push({
      code: "SUBJECTIVE_LANGUAGE",
      severity: "warning",
      field: "notes",
      message: "Subjective wording should be rewritten as observable behavior."
    });
  }

  return flags;
}

export function submitObservationSession(actor: EngineUser, session: ObservationSessionRecord, now: Date) {
  if (actor.role !== "student" || actor.id !== session.studentId) {
    throw new Error("Only the owning student can submit an observation session.");
  }
  if (session.status !== "running" && session.status !== "teacher_revision" && session.status !== "shelter_revision") {
    throw new Error("Only running or revision sessions can be submitted.");
  }

  const durationSec = session.startedAt ? secondsBetween(session.startedAt, now) : session.durationSec ?? 0;
  const ended = { ...session, endedAt: now, durationSec, status: "submitted" as const };
  const validationFlags = validateObservationSession(ended);
  const updated = { ...ended, validationFlags };

  return { session: updated, auditEvents: [audit(actor.id, updated, "observation_session_submitted", session.status, "submitted")] };
}

export function teacherReviewSession(
  actor: EngineUser,
  session: ObservationSessionRecord,
  decision: "approve" | "revision" | "reject",
  reason?: string
) {
  if (actor.role !== "teacher" && actor.role !== "admin") {
    throw new Error("Only teachers and admins can review observation sessions.");
  }
  if (session.status !== "submitted" && session.status !== "teacher_review") {
    throw new Error("Only submitted sessions can enter teacher review.");
  }
  if ((decision === "revision" || decision === "reject") && !reason?.trim()) {
    throw new Error("Teacher revision or rejection requires a reason.");
  }

  const status: ObservationSessionStatus = decision === "approve" ? "shelter_review" : "teacher_revision";
  const updated = { ...session, status, teacherId: actor.id, teacherReviewReason: reason };
  return { session: updated, auditEvents: [audit(actor.id, updated, `teacher_${decision}`, session.status, status)] };
}

export function shelterReviewSession(
  actor: EngineUser,
  session: ObservationSessionRecord,
  decision: "approve" | "revision" | "reject",
  reason?: string
) {
  if (actor.role !== "shelter_staff" && actor.role !== "admin") {
    throw new Error("Only shelter staff and admins can review shelter confirmation.");
  }
  if (session.status !== "shelter_review") {
    throw new Error("Only shelter review sessions can be confirmed.");
  }
  if ((decision === "revision" || decision === "reject") && !reason?.trim()) {
    throw new Error("Shelter revision or rejection requires a reason.");
  }

  const status: ObservationSessionStatus = decision === "approve" ? "shelter_confirmed" : "shelter_revision";
  const updated = {
    ...session,
    status,
    shelterStaffId: actor.id,
    shelterReviewReason: reason,
    publishedAt: session.publishedAt
  };
  return { session: updated, auditEvents: [audit(actor.id, updated, `shelter_${decision}`, session.status, status)] };
}

export function publishObservationSession(actor: EngineUser, session: ObservationSessionRecord, now: Date) {
  if (actor.role !== "shelter_staff" && actor.role !== "admin") throw new Error("Only shelter staff and admins can publish observation sessions.");
  if (session.status !== "shelter_confirmed") throw new Error("Publication requires shelter confirmation.");
  const updated = { ...session, status: "published" as const, publishedAt: now };
  return { session: updated, auditEvents: [audit(actor.id, updated, "observation_manually_published", "shelter_confirmed", "published")] };
}

export function calculateObservationDashboardMetrics(
  sessions: ObservationSessionRecord[],
  shelterIdsByDogId: Record<string, string> = {}
): ObservationDashboardMetrics {
  const publishedObservations = sessions.filter((session) => session.status === "published").length;
  const revisionCount = sessions.filter((session) => session.status === "teacher_revision" || session.status === "shelter_revision").length;
  const durations = sessions.map((session) => session.durationSec ?? 0).filter((duration) => duration > 0);

  return {
    observationCount: sessions.length,
    studentCount: new Set(sessions.map((session) => session.studentId)).size,
    shelterCount: new Set(sessions.map((session) => shelterIdsByDogId[session.dogId]).filter(Boolean)).size,
    publishedObservations,
    revisionRate: sessions.length === 0 ? 0 : Math.round((revisionCount / sessions.length) * 100),
    averageDurationSec: durations.length === 0 ? 0 : Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
  };
}
