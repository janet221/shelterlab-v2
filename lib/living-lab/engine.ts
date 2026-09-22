import { z } from "zod";
import type { AuditEvent, ResearchLicenseRecord } from "../research-license/engine";
import { getBehaviorCodeDefinition } from "./behavior-registry";
import { calculateObservationQualityScore } from "./quality-score";
import { validateObservationQuality } from "./quality-validator";
import {
  environmentContextSchema,
  type DogEvidenceProfileRecord,
  type EvidenceTimelineEntryRecord,
  type LivingLabActor,
  type LivingLabBehaviorEvent,
  type LivingLabSessionRecord,
  type LivingLabState,
  type ObservationMissionRecord,
  type ObservationPublicationRecord,
  type ObservationReviewRecord,
  type PrivacyState
} from "./types";

const missionInputSchema = z.object({
  id: z.string().min(1).optional(),
  courseId: z.string().min(1).optional(),
  classroomId: z.string().min(1).optional(),
  teacherId: z.string().min(1),
  studentId: z.string().min(1),
  shelterId: z.string().min(1),
  dogId: z.string().min(1),
  title: z.string().trim().min(1),
  scientificPurpose: z.string().trim().min(1),
  researchQuestion: z.string().trim().optional(),
  allowedZone: z.string().trim().min(1),
  scheduledStart: z.coerce.date(),
  scheduledEnd: z.coerce.date(),
  maximumDurationSec: z.number().int().positive().max(300).default(300),
  protocolVersion: z.string().min(1).default("SL-OBS-1"),
  syntheticDemo: z.boolean().default(false)
});

const eventInputSchema = z.object({
  timestampSecond: z.number().int().min(0),
  behaviorCode: z.string().min(1),
  durationSec: z.number().int().nonnegative().optional(),
  confidenceLevel: z.enum(["low", "medium", "high"]),
  observerNote: z.string().trim().optional(),
  contextCode: z.string().trim().optional(),
  evidenceType: z.enum(["direct_observation", "media_reference", "shelter_record"]).default("direct_observation"),
  mediaAssetId: z.string().optional()
});

function hasActiveLicense(licenses: ResearchLicenseRecord[], studentId: string, now: Date) {
  return licenses.some((license) => license.studentId === studentId && license.status === "active" && license.issuedAt <= now && license.expiresAt > now);
}

function canUseShelter(actor: LivingLabActor, shelterId: string) {
  return actor.role === "admin" || actor.authorizedShelterIds?.includes(shelterId) === true;
}

function audit(actor: LivingLabActor, entityType: string, entityId: string, action: string, now: Date, details: Partial<AuditEvent> = {}): AuditEvent {
  return { actorId: actor.id, actorRole: actor.role, entityType, entityId, action, timestamp: now, ...details };
}

function cloneSession(session: LivingLabSessionRecord): LivingLabSessionRecord {
  return structuredClone(session);
}

export class LivingLabService {
  readonly state: LivingLabState;

  constructor(initial?: Partial<LivingLabState>) {
    this.state = {
      missions: initial?.missions ?? new Map(), sessions: initial?.sessions ?? new Map(), reviews: initial?.reviews ?? [],
      publications: initial?.publications ?? [], timeline: initial?.timeline ?? [], profiles: initial?.profiles ?? [],
      mediaAssets: initial?.mediaAssets ?? [], auditEvents: initial?.auditEvents ?? [], licenses: initial?.licenses ?? [],
      idempotency: initial?.idempotency ?? new Map()
    };
  }

  private record(events: AuditEvent[]) {
    this.state.auditEvents.push(...events);
    return events;
  }

  createMission(actor: LivingLabActor, input: z.input<typeof missionInputSchema>, now: Date) {
    if (!(["teacher", "admin"] as const).includes(actor.role as "teacher" | "admin")) throw new Error("Only teachers and admins can create missions.");
    const parsed = missionInputSchema.parse(input);
    if (actor.role === "teacher") {
      if (parsed.teacherId !== actor.id) throw new Error("Teachers can create only their own missions.");
      if (parsed.courseId && !actor.authorizedCoursePlanIds?.includes(parsed.courseId)) throw new Error("Teacher is not authorized for this course.");
      if (!canUseShelter(actor, parsed.shelterId)) throw new Error("Teacher is not authorized for this shelter relationship.");
    }
    if (parsed.scheduledEnd <= parsed.scheduledStart) throw new Error("Mission schedule end must follow start.");
    const mission: ObservationMissionRecord = {
      ...parsed, id: parsed.id ?? `mission_${now.getTime()}`, assignedBy: actor.id, status: "draft",
      maximumDurationSec: parsed.maximumDurationSec ?? 300, protocolVersion: parsed.protocolVersion ?? "SL-OBS-1",
      syntheticDemo: parsed.syntheticDemo ?? false, createdAt: now, updatedAt: now
    };
    this.state.missions.set(mission.id, mission);
    const events = this.record([audit(actor, "observation_mission", mission.id, "mission_created", now, { courseScope: mission.courseId, organizationScope: mission.shelterId, toStatus: "draft", newState: { ...mission } })]);
    return { mission, auditEvents: events };
  }

  updateDraftMission(actor: LivingLabActor, missionId: string, patch: Partial<Pick<ObservationMissionRecord, "title" | "scientificPurpose" | "researchQuestion" | "allowedZone" | "scheduledStart" | "scheduledEnd">>, now: Date) {
    const mission = this.getMission(missionId);
    if (mission.status !== "draft") throw new Error("Only draft missions can be edited.");
    if (actor.role !== "admin" && (actor.role !== "teacher" || actor.id !== mission.teacherId)) throw new Error("Mission update is not authorized.");
    const previous = { ...mission };
    const updated = { ...mission, ...patch, updatedAt: now };
    if (updated.scheduledEnd <= updated.scheduledStart) throw new Error("Mission schedule end must follow start.");
    this.state.missions.set(missionId, updated);
    const events = this.record([audit(actor, "observation_mission", missionId, "mission_updated", now, { previousState: previous, newState: updated, organizationScope: mission.shelterId, courseScope: mission.courseId })]);
    return { mission: updated, auditEvents: events };
  }

  submitMissionForShelter(actor: LivingLabActor, missionId: string, now: Date) {
    const mission = this.getMission(missionId);
    if (actor.role !== "admin" && (actor.role !== "teacher" || actor.id !== mission.teacherId)) throw new Error("Mission submission is not authorized.");
    if (mission.status !== "draft") throw new Error("Only draft missions can be submitted for shelter confirmation.");
    const updated = { ...mission, status: "awaiting_shelter_confirmation" as const, updatedAt: now };
    this.state.missions.set(missionId, updated);
    const events = this.record([audit(actor, "observation_mission", missionId, "mission_submitted_for_shelter", now, { fromStatus: mission.status, toStatus: updated.status, organizationScope: mission.shelterId, courseScope: mission.courseId })]);
    return { mission: updated, auditEvents: events };
  }

  shelterDecideMission(actor: LivingLabActor, missionId: string, decision: "confirm" | "request_revision" | "reject", reason: string | undefined, now: Date) {
    const mission = this.getMission(missionId);
    if (!(["shelter_staff", "admin"] as const).includes(actor.role as "shelter_staff" | "admin") || !canUseShelter(actor, mission.shelterId)) throw new Error("Shelter mission decision is not authorized.");
    if (mission.status !== "awaiting_shelter_confirmation") throw new Error("Mission is not awaiting shelter confirmation.");
    if (decision !== "confirm" && !reason?.trim()) throw new Error("Shelter revision or rejection requires a reason.");
    const status = decision === "confirm" ? "available" : decision === "request_revision" ? "draft" : "shelter_rejected";
    const updated: ObservationMissionRecord = { ...mission, status, shelterConfirmerId: actor.id, updatedAt: now };
    this.state.missions.set(missionId, updated);
    const events: AuditEvent[] = [audit(actor, "observation_mission", missionId, `mission_shelter_${decision}`, now, { fromStatus: mission.status, toStatus: status, reason, organizationScope: mission.shelterId, courseScope: mission.courseId })];
    if (decision === "confirm") events.push(this.timelineEvent(actor, mission.dogId, now, "mission_assigned", "observation_mission", mission.id, mission.protocolVersion, "internal", `Mission assigned in approved zone ${mission.allowedZone}.`, mission.syntheticDemo));
    this.record(events);
    return { mission: updated, auditEvents: events };
  }

  cancelMission(actor: LivingLabActor, missionId: string, reason: string, now: Date) {
    const mission = this.getMission(missionId);
    if (!reason.trim()) throw new Error("Mission cancellation requires a reason.");
    if (actor.role !== "admin" && actor.id !== mission.teacherId && !(actor.role === "shelter_staff" && canUseShelter(actor, mission.shelterId))) throw new Error("Mission cancellation is not authorized.");
    const updated = { ...mission, status: "cancelled" as const, cancellationReason: reason, updatedAt: now };
    this.state.missions.set(missionId, updated);
    const events = this.record([audit(actor, "observation_mission", missionId, "mission_cancelled", now, { fromStatus: mission.status, toStatus: "cancelled", reason, organizationScope: mission.shelterId, courseScope: mission.courseId })]);
    return { mission: updated, auditEvents: events };
  }

  listAvailableMissions(actor: LivingLabActor, now: Date) {
    if (actor.role !== "student") return [];
    return [...this.state.missions.values()].filter((mission) => mission.studentId === actor.id && mission.status === "available" && mission.scheduledStart <= now && mission.scheduledEnd >= now);
  }

  startMission(actor: LivingLabActor, missionId: string, idempotencyKey: string, now: Date, clientStartedAt?: Date) {
    if (actor.role !== "student") throw new Error("Only students can start missions.");
    const mission = this.getMission(missionId);
    if (mission.studentId !== actor.id) throw new Error("Student does not own this mission.");
    const previousId = this.state.idempotency.get(`start:${idempotencyKey}`);
    if (previousId) return { session: this.getSession(previousId), auditEvents: [] };
    if (!hasActiveLicense(this.state.licenses, actor.id, now)) throw new Error("An active Research License is required to start a mission.");
    if (mission.status !== "available") throw new Error("Mission is not confirmed and available.");
    if (now < mission.scheduledStart || now > mission.scheduledEnd) throw new Error("Mission cannot start outside its scheduled window.");
    if ([...this.state.sessions.values()].some((session) => session.missionId === missionId && ["running", "submitted", "teacher_review", "shelter_review", "shelter_confirmed", "published"].includes(session.status))) throw new Error("Only one active session is allowed per mission.");
    const deadline = new Date(Math.min(mission.scheduledEnd.getTime(), now.getTime() + mission.maximumDurationSec * 1000));
    const session: LivingLabSessionRecord = {
      id: `session_${mission.id}_v1`, missionId, revisionNumber: 1, studentId: actor.id, dogId: mission.dogId, shelterId: mission.shelterId,
      startedAtServer: now, deadlineAtServer: deadline, clientStartedAt, status: "running", rowVersion: 0, protocolVersion: mission.protocolVersion,
      environmentContext: { observationZone: mission.allowedZone, setting: "indoor", noiseLevel: "moderate", visitorPresence: false, staffPresence: true, otherDogsVisible: true, feedingPeriod: false, cleaningPeriod: false, temperatureBand: "mild", timeOfDay: "morning", distanceFromDog: "2_to_5m", barriersPresent: ["kennel_gate"], contextualNote: "Non-contact observation from the approved zone." },
      generalNotes: "", validationFlags: [], incidentFlag: false, privacyState: "pending", syntheticDemo: mission.syntheticDemo, behaviorEvents: []
    };
    this.state.sessions.set(session.id, session);
    this.state.idempotency.set(`start:${idempotencyKey}`, session.id);
    this.state.missions.set(missionId, { ...mission, status: "in_progress", updatedAt: now });
    const events = this.record([
      audit(actor, "observation_session", session.id, "session_started", now, { organizationScope: mission.shelterId, courseScope: mission.courseId, toStatus: "running", correlationId: idempotencyKey }),
      this.timelineEvent(actor, mission.dogId, now, "observation_started", "observation_session", session.id, "1", "internal", "A non-contact observation session started.", mission.syntheticDemo)
    ]);
    return { session, auditEvents: events };
  }

  autosaveSession(actor: LivingLabActor, sessionId: string, expectedRowVersion: number, patch: { environmentContext?: unknown; generalNotes?: string; incidentFlag?: boolean }, idempotencyKey: string, now: Date) {
    const session = this.requireStudentEditable(actor, sessionId);
    if (this.state.idempotency.has(`autosave:${idempotencyKey}`)) return { session, auditEvents: [] };
    if (session.rowVersion !== expectedRowVersion) {
      const events = this.record([audit(actor, "observation_session", sessionId, "autosave_conflict", now, { changes: { expectedRowVersion, actualRowVersion: session.rowVersion }, correlationId: idempotencyKey })]);
      throw Object.assign(new Error("Autosave row version conflict."), { auditEvents: events });
    }
    if (now > session.deadlineAtServer) throw new Error("Server observation deadline has passed.");
    const context = patch.environmentContext === undefined ? session.environmentContext : environmentContextSchema.parse(patch.environmentContext);
    const updated = { ...session, environmentContext: context, generalNotes: patch.generalNotes ?? session.generalNotes, incidentFlag: patch.incidentFlag ?? session.incidentFlag, rowVersion: session.rowVersion + 1, lastAutosavedAt: now };
    this.state.sessions.set(sessionId, updated);
    this.state.idempotency.set(`autosave:${idempotencyKey}`, sessionId);
    const events = this.record([audit(actor, "observation_session", sessionId, "session_autosaved", now, { changes: { rowVersion: updated.rowVersion }, correlationId: idempotencyKey })]);
    return { session: updated, auditEvents: events };
  }

  addBehaviorEvent(actor: LivingLabActor, sessionId: string, input: z.input<typeof eventInputSchema>, now: Date) {
    const session = this.requireStudentEditable(actor, sessionId);
    if (now > session.deadlineAtServer) throw new Error("Server observation deadline has passed.");
    const parsed = eventInputSchema.parse(input);
    if (!getBehaviorCodeDefinition(parsed.behaviorCode)) throw new Error("Invalid or inactive behavior code.");
    const maximum = Math.round((session.deadlineAtServer.getTime() - session.startedAtServer.getTime()) / 1000);
    if (parsed.timestampSecond > maximum || parsed.timestampSecond + (parsed.durationSec ?? 0) > maximum) throw new Error("Behavior event is outside the session window.");
    const event: LivingLabBehaviorEvent = {
      ...parsed, behaviorCode: parsed.behaviorCode as LivingLabBehaviorEvent["behaviorCode"], evidenceType: parsed.evidenceType ?? "direct_observation",
      id: `event_${session.id}_${session.behaviorEvents.length + 1}`, sessionId, sequenceNumber: session.behaviorEvents.length + 1, createdAt: now, updatedAt: now
    };
    const updated = { ...session, behaviorEvents: [...session.behaviorEvents, event], rowVersion: session.rowVersion + 1 };
    this.state.sessions.set(sessionId, updated);
    const events = this.record([audit(actor, "behavior_event", event.id, "behavior_event_changed", now, { organizationScope: session.shelterId, changes: { sessionId, sequenceNumber: event.sequenceNumber } })]);
    return { event, session: updated, auditEvents: events };
  }

  submitSession(actor: LivingLabActor, sessionId: string, idempotencyKey: string, now: Date) {
    const session = this.getSession(sessionId);
    if (actor.role !== "student" || actor.id !== session.studentId) throw new Error("Only the owning student can submit.");
    const previousId = this.state.idempotency.get(`submit:${idempotencyKey}`);
    if (previousId) return { session: this.getSession(previousId), auditEvents: [] };
    if (session.status === "submitted") return { session, auditEvents: [] };
    if (session.status !== "running") throw new Error("Only a running revision can be submitted.");
    if (now > session.deadlineAtServer) throw new Error("Server observation deadline has passed.");
    const durationSec = Math.round((now.getTime() - session.startedAtServer.getTime()) / 1000);
    const ended: LivingLabSessionRecord = { ...session, endedAtServer: now, submittedAt: now, durationSec, status: "submitted", rowVersion: session.rowVersion + 1 };
    ended.validationFlags = validateObservationQuality(ended);
    ended.qualityScore = calculateObservationQualityScore(ended, this.state.reviews);
    this.state.sessions.set(sessionId, ended);
    this.state.idempotency.set(`submit:${idempotencyKey}`, sessionId);
    const mission = this.getMission(session.missionId);
    this.state.missions.set(mission.id, { ...mission, status: "submitted", updatedAt: now });
    const events = this.record([
      audit(actor, "observation_session", sessionId, "session_submitted", now, { fromStatus: session.status, toStatus: "submitted", correlationId: idempotencyKey, organizationScope: session.shelterId, changes: { durationSec, validationFlags: ended.validationFlags } }),
      audit({ id: "system", role: "admin" }, "observation_quality_score", sessionId, "quality_score_calculated", now, { changes: { score: ended.qualityScore.total, version: ended.qualityScore.version } }),
      this.timelineEvent(actor, session.dogId, now, "observation_submitted", "observation_session", sessionId, String(session.revisionNumber), "internal", "Student submitted an immutable observation version.", session.syntheticDemo)
    ]);
    return { session: ended, auditEvents: events };
  }

  teacherReview(actor: LivingLabActor, sessionId: string, decision: "approve" | "request_revision" | "reject", reasonCode: string | undefined, reasonText: string | undefined, rubric: ObservationReviewRecord["rubric"], idempotencyKey: string, now: Date) {
    const session = this.getSession(sessionId);
    const mission = this.getMission(session.missionId);
    if (actor.role !== "admin" && (actor.role !== "teacher" || actor.id !== mission.teacherId)) throw new Error("Teacher review is not authorized.");
    const existing = this.state.reviews.find((review) => review.idempotencyKey === idempotencyKey);
    if (existing) return { session, review: existing, auditEvents: [] };
    if (session.status !== "submitted" && session.status !== "teacher_review") throw new Error("Teacher reviews only submitted immutable versions.");
    if (decision !== "approve" && (!reasonCode?.trim() || !reasonText?.trim())) throw new Error("Teacher revision or rejection requires a reason.");
    const status = decision === "approve" ? "shelter_review" : decision === "request_revision" ? "teacher_revision" : "teacher_rejected";
    const updated: LivingLabSessionRecord = { ...session, status, teacherReviewedAt: now };
    const review: ObservationReviewRecord = { id: `review_teacher_${sessionId}_${this.state.reviews.length + 1}`, sessionId, reviewerId: actor.id, role: actor.role === "admin" ? "admin" : "teacher", decision, reasonCode, reasonText, reviewedSessionVersion: session.revisionNumber, rubric, idempotencyKey, createdAt: now };
    this.state.sessions.set(sessionId, updated); this.state.reviews.push(review);
    this.state.missions.set(mission.id, { ...mission, status: decision === "approve" ? "submitted" : decision === "request_revision" ? "teacher_revision" : "teacher_rejected", updatedAt: now });
    updated.qualityScore = calculateObservationQualityScore(updated, this.state.reviews);
    const events = this.record([
      audit(actor, "observation_review", review.id, `teacher_${decision}`, now, { fromStatus: session.status, toStatus: status, reason: reasonText, correlationId: idempotencyKey, courseScope: mission.courseId, organizationScope: mission.shelterId }),
      this.timelineEvent(actor, session.dogId, now, "teacher_review", "observation_review", review.id, String(session.revisionNumber), "internal", `Teacher decision: ${decision}.`, session.syntheticDemo)
    ]);
    return { session: updated, review, auditEvents: events };
  }

  createRevision(actor: LivingLabActor, parentSessionId: string, idempotencyKey: string, now: Date) {
    const parent = this.getSession(parentSessionId);
    if (actor.role !== "student" || actor.id !== parent.studentId) throw new Error("Only the owning student can create a revision.");
    const previousId = this.state.idempotency.get(`revision:${idempotencyKey}`);
    if (previousId) return { session: this.getSession(previousId), auditEvents: [] };
    if (!["teacher_revision", "shelter_revision", "teacher_rejected", "shelter_rejected"].includes(parent.status)) throw new Error("This version does not permit a revision.");
    const mission = this.getMission(parent.missionId);
    const child: LivingLabSessionRecord = {
      ...cloneSession(parent), id: `session_${mission.id}_v${parent.revisionNumber + 1}`, parentSessionId: parent.id, revisionNumber: parent.revisionNumber + 1,
      startedAtServer: now, deadlineAtServer: new Date(Math.min(mission.scheduledEnd.getTime(), now.getTime() + mission.maximumDurationSec * 1000)), endedAtServer: undefined,
      submittedAt: undefined, teacherReviewedAt: undefined, shelterConfirmedAt: undefined, publishedAt: undefined, status: "running", rowVersion: 0,
      validationFlags: [], qualityScore: undefined, behaviorEvents: parent.behaviorEvents.map((event, index) => ({ ...event, id: `event_${mission.id}_v${parent.revisionNumber + 1}_${index + 1}`, sessionId: `session_${mission.id}_v${parent.revisionNumber + 1}` }))
    };
    this.state.sessions.set(child.id, child); this.state.idempotency.set(`revision:${idempotencyKey}`, child.id);
    this.state.missions.set(mission.id, { ...mission, status: "in_progress", updatedAt: now });
    const events = this.record([
      audit(actor, "observation_session", child.id, "revision_created", now, { previousState: { parentSessionId: parent.id, parentStatus: parent.status }, newState: { revisionNumber: child.revisionNumber, status: child.status }, correlationId: idempotencyKey }),
      this.timelineEvent(actor, child.dogId, now, "revision", "observation_session", child.id, String(child.revisionNumber), "internal", "A linked revision version was created; the submitted parent remains immutable.", child.syntheticDemo)
    ]);
    return { session: child, auditEvents: events };
  }

  shelterReview(actor: LivingLabActor, sessionId: string, decision: "confirm" | "request_revision" | "reject", reasonCode: string | undefined, reasonText: string | undefined, privacyState: PrivacyState, professionalContextNote: string | undefined, idempotencyKey: string, now: Date) {
    const session = this.getSession(sessionId); const mission = this.getMission(session.missionId);
    if (!(["shelter_staff", "admin"] as const).includes(actor.role as "shelter_staff" | "admin") || !canUseShelter(actor, mission.shelterId)) throw new Error("Shelter review is not authorized.");
    const existing = this.state.reviews.find((review) => review.idempotencyKey === idempotencyKey);
    if (existing) return { session, review: existing, auditEvents: [] };
    if (session.status !== "shelter_review") throw new Error("Shelter cannot bypass teacher approval.");
    if (decision !== "confirm" && (!reasonCode?.trim() || !reasonText?.trim())) throw new Error("Shelter revision or rejection requires a reason.");
    const status = decision === "confirm" ? "shelter_confirmed" : decision === "request_revision" ? "shelter_revision" : "shelter_rejected";
    const updated: LivingLabSessionRecord = { ...session, status, shelterConfirmedAt: decision === "confirm" ? now : undefined, privacyState };
    const review: ObservationReviewRecord = { id: `review_shelter_${sessionId}_${this.state.reviews.length + 1}`, sessionId, reviewerId: actor.id, role: actor.role === "admin" ? "admin" : "shelter_staff", decision, reasonCode, reasonText, reviewedSessionVersion: session.revisionNumber, rubric: { dogIdentity: true, zone: true, safety: true, privacy: privacyState }, professionalContextNote, idempotencyKey, createdAt: now };
    this.state.sessions.set(sessionId, updated); this.state.reviews.push(review);
    this.state.missions.set(mission.id, { ...mission, status: decision === "confirm" ? "shelter_confirmed" : decision === "request_revision" ? "shelter_revision" : "shelter_rejected", updatedAt: now });
    updated.qualityScore = calculateObservationQualityScore(updated, this.state.reviews);
    const events = this.record([
      audit(actor, "observation_review", review.id, `shelter_${decision}`, now, { fromStatus: session.status, toStatus: status, reason: reasonText, correlationId: idempotencyKey, organizationScope: mission.shelterId }),
      this.timelineEvent(actor, session.dogId, now, "shelter_confirmation", "observation_review", review.id, String(session.revisionNumber), "internal", `Shelter decision: ${decision}.`, session.syntheticDemo)
    ]);
    return { session: updated, review, auditEvents: events };
  }

  publish(actor: LivingLabActor, sessionId: string, idempotencyKey: string, now: Date) {
    const session = this.getSession(sessionId); const mission = this.getMission(session.missionId);
    if (!(["shelter_staff", "admin"] as const).includes(actor.role as "shelter_staff" | "admin") || !canUseShelter(actor, mission.shelterId)) throw new Error("Publication is not authorized.");
    const priorId = this.state.idempotency.get(`publish:${idempotencyKey}`);
    if (priorId) return { session, publication: this.state.publications.find((item) => item.id === priorId)!, auditEvents: [] };
    if (session.status !== "shelter_confirmed") throw new Error("Publish requires the current teacher-approved and shelter-confirmed version.");
    if (session.incidentFlag) throw new Error("An incident blocks publication.");
    if (session.privacyState !== "approved_public") throw new Error("Privacy state must be approved_public before publication.");
    if (session.validationFlags.some((item) => item.severity === "blocking")) throw new Error("Blocking validation flags must be resolved before publication.");
    const teacherApproved = this.state.reviews.some((review) => review.sessionId === sessionId && (review.role === "teacher" || review.role === "admin") && review.decision === "approve");
    const shelterConfirmed = this.state.reviews.some((review) => review.sessionId === sessionId && (review.role === "shelter_staff" || review.role === "admin") && review.decision === "confirm");
    if (!teacherApproved || !shelterConfirmed) throw new Error("Required review audit records are missing.");
    const teacherAudit = this.state.auditEvents.some((event) => event.entityType === "observation_review" && event.action === "teacher_approve" && this.state.reviews.some((review) => review.id === event.entityId && review.sessionId === sessionId));
    const shelterAudit = this.state.auditEvents.some((event) => event.entityType === "observation_review" && event.action === "shelter_confirm" && this.state.reviews.some((review) => review.id === event.entityId && review.sessionId === sessionId));
    if (!teacherAudit || !shelterAudit) throw new Error("Required review audit records are missing.");
    const updated = { ...session, status: "published" as const, publishedAt: now };
    const publication: ObservationPublicationRecord = { id: `publication_${session.id}_${session.revisionNumber}`, sessionId, versionIdentifier: `${session.id}:v${session.revisionNumber}`, publishedById: actor.id, publishedAt: now, idempotencyKey, snapshot: cloneSession(updated) };
    this.state.sessions.set(sessionId, updated); this.state.publications.push(publication); this.state.idempotency.set(`publish:${idempotencyKey}`, publication.id);
    this.state.missions.set(mission.id, { ...mission, status: "published", updatedAt: now });
    const publicationAudit = audit(actor, "observation_publication", publication.id, "observation_published", now, { fromStatus: session.status, toStatus: "published", correlationId: idempotencyKey, organizationScope: mission.shelterId, newState: { versionIdentifier: publication.versionIdentifier } });
    const timeline = this.timelineEvent(actor, session.dogId, now, "publication", "observation_publication", publication.id, publication.versionIdentifier, "public", "經收容所確認的觀察證據已由人員發布。", session.syntheticDemo, publicationAudit.entityId);
    const profile = this.buildDogProfile(session.dogId, actor.id, now);
    const profileAudit = audit(actor, "dog_evidence_profile", profile.id, "evidence_profile_updated", now, { newState: { version: profile.version, evidenceCount: profile.evidenceCount } });
    this.timelineEvent(actor, session.dogId, now, "evidence_profile_update", "dog_evidence_profile", profile.id, String(profile.version), "public", "收容所核准的犬隻證據檔案已依據發布證據更新。", session.syntheticDemo, profileAudit.entityId);
    const events = this.record([publicationAudit, timeline, profileAudit]);
    return { session: updated, publication, profile, auditEvents: events };
  }

  unpublish(actor: LivingLabActor, sessionId: string, reason: string, now: Date) {
    const session = this.getSession(sessionId); const mission = this.getMission(session.missionId);
    if (!(["shelter_staff", "admin"] as const).includes(actor.role as "shelter_staff" | "admin") || !canUseShelter(actor, mission.shelterId)) throw new Error("Unpublication is not authorized.");
    if (!reason.trim()) throw new Error("Unpublishing requires a reason.");
    const publication = [...this.state.publications].reverse().find((item) => item.sessionId === sessionId && !item.unpublishedAt);
    if (!publication) throw new Error("No active publication exists.");
    publication.unpublishedAt = now; publication.unpublishedById = actor.id; publication.unpublishReason = reason;
    const updated = { ...session, status: "archived" as const };
    this.state.sessions.set(sessionId, updated); this.state.missions.set(mission.id, { ...mission, status: "archived", updatedAt: now });
    const events = this.record([
      audit(actor, "observation_publication", publication.id, "observation_unpublished", now, { fromStatus: "published", toStatus: "archived", reason }),
      this.timelineEvent(actor, session.dogId, now, "unpublication", "observation_publication", publication.id, publication.versionIdentifier, "internal", "Published evidence was withdrawn with a retained reason.", session.syntheticDemo)
    ]);
    return { session: updated, publication, auditEvents: events };
  }

  addProfessionalNote(actor: LivingLabActor, sessionId: string, note: string, visibility: "internal" | "public", now: Date) {
    const session = this.getSession(sessionId); const mission = this.getMission(session.missionId);
    if (!(["shelter_staff", "admin"] as const).includes(actor.role as "shelter_staff" | "admin") || !canUseShelter(actor, mission.shelterId)) throw new Error("Professional note is not authorized.");
    if (!note.trim()) throw new Error("Professional note is required.");
    if (visibility === "public" && session.status !== "published") throw new Error("Public notes require published evidence.");
    const entry = this.timelineEvent(actor, session.dogId, now, "professional_note", "observation_session", session.id, String(session.revisionNumber), visibility, note, session.syntheticDemo);
    const events = this.record([audit(actor, "shelter_professional_note", entry.id, "professional_note_added", now, { organizationScope: mission.shelterId, newState: { visibility, note } })]);
    return { timelineEntry: entry, auditEvents: events };
  }

  adminOverride(actor: LivingLabActor, entityType: "mission" | "session", entityId: string, status: string, reason: string, now: Date) {
    if (actor.role !== "admin") throw new Error("Only admin can override workflow state.");
    if (!reason.trim()) throw new Error("Admin override requires a reason.");
    if (entityType === "mission") {
      const mission = this.getMission(entityId); const previous = mission.status;
      if (!z.enum(["draft", "awaiting_shelter_confirmation", "assigned", "available", "in_progress", "submitted", "teacher_revision", "teacher_rejected", "shelter_revision", "shelter_rejected", "shelter_confirmed", "published", "cancelled", "archived"]).safeParse(status).success) throw new Error("Invalid mission status.");
      this.state.missions.set(entityId, { ...mission, status: status as ObservationMissionRecord["status"], updatedAt: now });
      const events = this.record([audit(actor, "observation_mission", entityId, "admin_override", now, { fromStatus: previous, toStatus: status, reason, organizationScope: mission.shelterId })]);
      return { entity: this.getMission(entityId), auditEvents: events };
    }
    const session = this.getSession(entityId); const previous = session.status;
    if (!z.enum(["draft", "running", "submitted", "teacher_review", "teacher_revision", "teacher_rejected", "shelter_review", "shelter_revision", "shelter_rejected", "shelter_confirmed", "published", "archived"]).safeParse(status).success) throw new Error("Invalid session status.");
    this.state.sessions.set(entityId, { ...session, status: status as LivingLabSessionRecord["status"] });
    const events = this.record([audit(actor, "observation_session", entityId, "admin_override", now, { fromStatus: previous, toStatus: status, reason, organizationScope: session.shelterId })]);
    return { entity: this.getSession(entityId), auditEvents: events };
  }

  listTimeline(dogId: string, visibility: "internal" | "public") {
    return this.state.timeline.filter((entry) => entry.dogId === dogId && (visibility === "internal" || entry.visibility === "public") && (visibility === "internal" || !["observation_started", "observation_submitted", "teacher_review", "revision", "shelter_confirmation", "unpublication"].includes(entry.eventType)));
  }

  getPublicProfile(dogId: string) {
    return [...this.state.profiles].reverse().find((profile) => profile.dogId === dogId && profile.status === "shelter_approved");
  }

  getMission(id: string) { const value = this.state.missions.get(id); if (!value) throw new Error("Mission not found."); return value; }
  getSession(id: string) { const value = this.state.sessions.get(id); if (!value) throw new Error("Session not found."); return value; }

  private requireStudentEditable(actor: LivingLabActor, id: string) {
    const session = this.getSession(id);
    if (actor.role !== "student" || actor.id !== session.studentId) throw new Error("Only the owning student can edit.");
    if (session.status !== "running") throw new Error("Submitted versions are immutable.");
    return session;
  }

  private timelineEvent(actor: LivingLabActor, dogId: string, now: Date, eventType: string, sourceEntityType: string, sourceEntityId: string, sourceVersion: string, visibility: "internal" | "public", summary: string, syntheticDemo: boolean, auditReference = `${sourceEntityType}:${sourceEntityId}`): EvidenceTimelineEntryRecord & AuditEvent {
    const id = `timeline_${eventType}_${sourceEntityId}_${this.state.timeline.length + 1}`;
    const entry: EvidenceTimelineEntryRecord = { id, dogId, eventDate: now, eventType, sourceEntityType, sourceEntityId, sourceVersion, visibility, verificationState: syntheticDemo ? "SYNTHETIC_DEMO" : "VERIFIED", actorRole: actor.role, summary, evidenceLinks: [`${sourceEntityType}:${sourceEntityId}`], auditReference, syntheticDemo };
    this.state.timeline.push(entry);
    return { ...entry, actorId: actor.id, actorRole: actor.role, entityType: "evidence_timeline_entry", entityId: id, action: "timeline_updated", timestamp: now };
  }

  private buildDogProfile(dogId: string, approvedById: string, now: Date): DogEvidenceProfileRecord {
    const publications = this.state.publications.filter((publication) => !publication.unpublishedAt && publication.snapshot.dogId === dogId);
    if (publications.length === 0) throw new Error("Profile statements require published evidence.");
    const sources = publications.map((publication) => publication.id);
    const dates = publications.map((publication) => publication.publishedAt);
    const events = publications.flatMap((publication) => publication.snapshot.behaviorEvents);
    const dimensions = new Map<string, string>();
    if (events.some((event) => ["APPROACH", "LOOK_AT_HUMAN"].includes(event.behaviorCode))) dimensions.set("human_presence", "在這些已發布情境中，曾觀察到犬隻看向或接近人員。");
    if (events.some((event) => ["MOVE_AWAY", "LOOK_AWAY"].includes(event.behaviorCode))) dimensions.set("distance_maintaining", "在這些已發布情境中，曾觀察到犬隻維持或增加距離。");
    if (events.some((event) => ["BARK", "WHINE"].includes(event.behaviorCode))) dimensions.set("vocalization", "在已記錄情境中曾觀察到發聲行為。");
    if (events.some((event) => event.behaviorCode === "PACE")) dimensions.set("movement", "在已記錄的環境情境中曾觀察到來回走動。");
    if (dimensions.size === 0) dimensions.set("activity", "目前活動紀錄僅限於已發布證據所涵蓋的情境。");
    dimensions.set("unknowns", "尚未在已記錄的收容所非接觸情境以外進行觀察，目前證據有限。");
    const version = this.state.profiles.filter((profile) => profile.dogId === dogId).length + 1;
    const profile: DogEvidenceProfileRecord = {
      id: `profile_${dogId}_v${version}`, dogId, version, status: "shelter_approved", evidenceCount: publications.length,
      latestConfirmedAt: new Date(Math.max(...dates.map((date) => date.getTime()))), contextDiversity: new Set(publications.map((publication) => publication.snapshot.environmentContext.observationZone)).size,
      completenessScore: Math.min(100, dimensions.size * 20), approvedById, approvedAt: now, syntheticDemo: publications.every((publication) => publication.snapshot.syntheticDemo),
      statements: [...dimensions].map(([dimension, statement], index) => ({ id: `profile_statement_${dogId}_${version}_${index + 1}`, dimension, statement, evidenceSourceIds: sources, evidenceDates: dates, confirmationState: "shelter_confirmed", shelterApproved: true, version }))
    };
    this.state.profiles.push(profile);
    return profile;
  }
}
