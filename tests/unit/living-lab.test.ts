import { describe, expect, it } from "vitest";
import type { ResearchLicenseRecord } from "../../lib/research-license/engine";
import { toAuditLogCreateInput } from "../../lib/audit/persistent-audit";
import { behaviorEventApiSchema } from "../../lib/living-lab/api-schemas";
import { buildSprint7Demo, livingLabDemoActors } from "../../lib/living-lab/demo-data";
import { LivingLabService } from "../../lib/living-lab/engine";
import { calculateObservationQualityScore } from "../../lib/living-lab/quality-score";

const student = livingLabDemoActors.student;
const teacher = livingLabDemoActors.teacher;
const shelter = livingLabDemoActors.shelter;
const admin = livingLabDemoActors.admin;
const start = new Date("2026-07-12T01:00:00.000Z");

function license(): ResearchLicenseRecord {
  return { id: "license-test", studentId: student.id, licenseLevel: "level_1", blueprintId: "bp", blueprintVersion: 1, qualifyingAttemptId: "attempt", status: "active", issuedAt: new Date("2026-07-01T00:00:00.000Z"), expiresAt: new Date("2026-12-01T00:00:00.000Z"), certificateCode: "CERT", certificateVersion: 1 };
}

function setup(includeLicense = true) {
  const service = new LivingLabService({ licenses: includeLicense ? [license()] : [] });
  const mission = service.createMission(teacher, { id: "mission-test", courseId: "course_plan_shelterlab_16w_v1", teacherId: teacher.id, studentId: student.id, shelterId: "SHELTER_TPE_001", dogId: "DOG-TPE-001", title: "Test mission", scientificPurpose: "Objective non-contact protocol test.", allowedZone: "GREEN_OBSERVATION", scheduledStart: start, scheduledEnd: new Date("2026-07-12T02:00:00.000Z"), maximumDurationSec: 300, protocolVersion: "SL-OBS-1", syntheticDemo: true }, new Date("2026-07-11T00:00:00.000Z")).mission;
  service.submitMissionForShelter(teacher, mission.id, new Date("2026-07-11T00:01:00.000Z"));
  service.shelterDecideMission(shelter, mission.id, "confirm", undefined, new Date("2026-07-11T00:02:00.000Z"));
  return { service, mission: service.getMission(mission.id) };
}

function running() {
  const context = setup();
  const session = context.service.startMission(student, context.mission.id, "start-key", start).session;
  context.service.autosaveSession(student, session.id, 0, { generalNotes: "Dog looked toward hallway movement while remaining behind the gate." }, "save-key", new Date("2026-07-12T01:00:01.000Z"));
  context.service.addBehaviorEvent(student, session.id, { timestampSecond: 10, behaviorCode: "LOOK_AT_HUMAN", durationSec: 5, confidenceLevel: "high", observerNote: "Dog looked toward the hallway.", evidenceType: "direct_observation" }, new Date("2026-07-12T01:00:10.000Z"));
  return { ...context, session: context.service.getSession(session.id) };
}

function submitted() {
  const context = running();
  const session = context.service.submitSession(student, context.session.id, "submit-key", new Date("2026-07-12T01:05:00.000Z")).session;
  return { ...context, session };
}

function confirmed() {
  const context = submitted();
  context.service.teacherReview(teacher, context.session.id, "approve", undefined, undefined, { protocol: 4 }, "teacher-key", new Date("2026-07-12T01:06:00.000Z"));
  const session = context.service.shelterReview(shelter, context.session.id, "confirm", undefined, undefined, "approved_public", "Identity and zone confirmed.", "shelter-key", new Date("2026-07-12T01:07:00.000Z")).session;
  return { ...context, session };
}

describe("Sprint 7 Living Laboratory", () => {
  it("blocks a student without an active Research License", () => {
    const { service, mission } = setup(false);
    expect(() => service.startMission(student, mission.id, "start", start)).toThrow("active Research License");
  });

  it("hides an unconfirmed mission from the student", () => {
    const service = new LivingLabService({ licenses: [license()] });
    service.createMission(teacher, { id: "draft", courseId: "course_plan_shelterlab_16w_v1", teacherId: teacher.id, studentId: student.id, shelterId: "SHELTER_TPE_001", dogId: "DOG-TPE-001", title: "Draft", scientificPurpose: "Test", allowedZone: "GREEN_OBSERVATION", scheduledStart: start, scheduledEnd: new Date("2026-07-12T02:00:00.000Z") }, start);
    expect(service.listAvailableMissions(student, start)).toEqual([]);
  });

  it("prevents mission start outside the confirmed schedule", () => {
    const { service, mission } = setup();
    expect(() => service.startMission(student, mission.id, "early", new Date("2026-07-12T00:59:59.000Z"))).toThrow("scheduled window");
  });

  it("uses server time and enforces the session deadline", () => {
    const { service, session } = running();
    expect(session.deadlineAtServer.toISOString()).toBe("2026-07-12T01:05:00.000Z");
    expect(() => service.addBehaviorEvent(student, session.id, { timestampSecond: 20, behaviorCode: "SIT", confidenceLevel: "high" }, new Date("2026-07-12T01:05:01.000Z"))).toThrow("deadline");
  });

  it("caps the standard mission and session at 300 seconds", () => {
    const { mission, session } = running();
    expect(mission.maximumDurationSec).toBe(300);
    expect((session.deadlineAtServer.getTime() - session.startedAtServer.getTime()) / 1000).toBe(300);
  });

  it("detects stale autosave row versions", () => {
    const { service, session } = running();
    expect(() => service.autosaveSession(student, session.id, 0, { generalNotes: "stale" }, "stale-save", new Date("2026-07-12T01:00:20.000Z"))).toThrow("row version conflict");
    expect(service.state.auditEvents.some((event) => event.action === "autosave_conflict")).toBe(true);
  });

  it("makes duplicate submission idempotent", () => {
    const context = running();
    const first = context.service.submitSession(student, context.session.id, "same-submit", new Date("2026-07-12T01:05:00.000Z"));
    const second = context.service.submitSession(student, context.session.id, "same-submit", new Date("2026-07-12T01:05:00.000Z"));
    expect(second.session.id).toBe(first.session.id);
    expect(second.auditEvents).toEqual([]);
  });

  it("keeps submitted versions immutable", () => {
    const { service, session } = submitted();
    expect(() => service.addBehaviorEvent(student, session.id, { timestampSecond: 20, behaviorCode: "SIT", confidenceLevel: "medium" }, new Date("2026-07-12T01:05:00.000Z"))).toThrow("immutable");
  });

  it("creates a linked child revision and preserves the parent", () => {
    const { service, session } = submitted();
    service.teacherReview(teacher, session.id, "request_revision", "insufficient_context", "Add context.", {}, "review-revision", new Date("2026-07-12T01:06:00.000Z"));
    const child = service.createRevision(student, session.id, "child-key", new Date("2026-07-12T01:07:00.000Z")).session;
    expect(child.parentSessionId).toBe(session.id);
    expect(child.revisionNumber).toBe(2);
    expect(service.getSession(session.id).status).toBe("teacher_revision");
  });

  it("rejects an inactive behavior code and invalid timestamps", () => {
    const { service, session } = running();
    expect(() => service.addBehaviorEvent(student, session.id, { timestampSecond: 20, behaviorCode: "NOT_A_CODE" as never, confidenceLevel: "high" }, new Date("2026-07-12T01:00:20.000Z"))).toThrow("Invalid");
    expect(() => service.addBehaviorEvent(student, session.id, { timestampSecond: 301, behaviorCode: "SIT", confidenceLevel: "high" }, new Date("2026-07-12T01:00:20.000Z"))).toThrow("outside");
  });

  it("requires confidence at the API boundary", () => {
    expect(behaviorEventApiSchema.safeParse({ timestampSecond: 1, behaviorCode: "SIT" }).success).toBe(false);
  });

  it("flags subjective wording without rewriting the evidence", () => {
    const context = running();
    context.service.addBehaviorEvent(student, context.session.id, { timestampSecond: 50, behaviorCode: "YAWN", durationSec: 1, confidenceLevel: "medium", observerNote: "very cute and happy" }, new Date("2026-07-12T01:00:50.000Z"));
    const result = context.service.submitSession(student, context.session.id, "subjective-submit", new Date("2026-07-12T01:05:00.000Z")).session;
    expect(result.validationFlags.map((item) => item.code)).toContain("SUBJECTIVE_TERMS");
    expect(result.behaviorEvents.at(-1)?.observerNote).toBe("very cute and happy");
  });

  it("calculates a deterministic transparent quality score", () => {
    const { session } = submitted();
    expect(calculateObservationQualityScore(session)).toEqual(calculateObservationQualityScore(session));
    expect(session.qualityScore?.total).toBeGreaterThanOrEqual(0);
    expect(Object.keys(session.qualityScore?.dimensions ?? {})).toHaveLength(9);
    expect(session.qualityScore?.version).toBe("SL-OQS-1");
  });

  it("never allows the quality score to publish automatically", () => {
    const { service, session } = submitted();
    expect(session.qualityScore).toBeDefined();
    expect(session.status).toBe("submitted");
    expect(() => service.publish(shelter, session.id, "publish-too-soon", new Date("2026-07-12T01:06:00.000Z"))).toThrow("teacher-approved");
  });

  it("prevents teacher shelter confirmation and shelter bypass", () => {
    const first = submitted();
    expect(() => first.service.shelterReview(teacher, first.session.id, "confirm", undefined, undefined, "approved_public", undefined, "wrong-role", new Date("2026-07-12T01:06:00.000Z"))).toThrow("not authorized");
    const second = submitted();
    expect(() => second.service.shelterReview(shelter, second.session.id, "confirm", undefined, undefined, "approved_public", undefined, "bypass", new Date("2026-07-12T01:06:00.000Z"))).toThrow("bypass teacher");
  });

  it("keeps shelter confirmation separate from manual publication", () => {
    const { session } = confirmed();
    expect(session.status).toBe("shelter_confirmed");
    expect(session.publishedAt).toBeUndefined();
  });

  it("publishes only the current approved, confirmed, privacy-approved version", () => {
    const { service, session } = confirmed();
    const result = service.publish(shelter, session.id, "publish-key", new Date("2026-07-12T01:08:00.000Z"));
    expect(result.session.status).toBe("published");
    expect(result.publication.snapshot.status).toBe("published");
    expect(result.profile).toBeDefined();
    expect(result.profile!.statements.every((statement) => statement.shelterApproved)).toBe(true);
  });

  it("requires teacher and shelter decision audit evidence before publication", () => {
    const { service, session } = confirmed();
    service.state.auditEvents = service.state.auditEvents.filter((event) => event.action !== "shelter_confirm");
    expect(() => service.publish(shelter, session.id, "publish-missing-audit", new Date("2026-07-12T01:08:00.000Z"))).toThrow("audit records are missing");
  });

  it("blocks publication when an incident is present", () => {
    const { service, session } = confirmed();
    service.state.sessions.set(session.id, { ...session, incidentFlag: true });
    expect(() => service.publish(shelter, session.id, "incident-publish", new Date("2026-07-12T01:08:00.000Z"))).toThrow("incident blocks");
  });

  it("filters private timeline data from public view", () => {
    const service = buildSprint7Demo();
    const publicTimeline = service.listTimeline("DOG-TPE-001", "public");
    expect(publicTimeline.every((entry) => entry.visibility === "public")).toBe(true);
    expect(publicTimeline.some((entry) => entry.eventType === "teacher_review")).toBe(false);
    expect(JSON.stringify(publicTimeline)).not.toContain(student.id);
  });

  it("requires published evidence for every profile statement", () => {
    const service = buildSprint7Demo(); const profile = service.getPublicProfile("DOG-TPE-001")!;
    expect(profile.statements.every((statement) => statement.evidenceSourceIds.length > 0 && statement.evidenceDates.length > 0 && statement.confirmationState === "shelter_confirmed")).toBe(true);
    expect(service.state.publications.map((publication) => publication.id)).toEqual(expect.arrayContaining(profile.statements.flatMap((statement) => statement.evidenceSourceIds)));
  });

  it("does not create a public profile from unconfirmed evidence", () => {
    const { service } = submitted();
    expect(service.getPublicProfile("DOG-TPE-001")).toBeUndefined();
  });

  it("requires a reason to unpublish and retains history", () => {
    const { service, session } = confirmed(); service.publish(shelter, session.id, "publish", new Date("2026-07-12T01:08:00.000Z"));
    expect(() => service.unpublish(shelter, session.id, "", new Date("2026-07-12T01:09:00.000Z"))).toThrow("requires a reason");
    const result = service.unpublish(shelter, session.id, "Privacy review reopened.", new Date("2026-07-12T01:09:00.000Z"));
    expect(result.publication.unpublishReason).toBe("Privacy review reopened.");
    expect(result.session.status).toBe("archived");
  });

  it("generates persistent-audit-compatible records for every mutation", () => {
    const { service } = confirmed();
    const teacherAudit = service.state.auditEvents.find((event) => event.action === "teacher_approve")!;
    const input = toAuditLogCreateInput(teacherAudit);
    expect(input.actorId).toBe(teacher.id);
    expect(input.entityType).toBe("observation_review");
    expect(service.state.auditEvents.map((event) => event.action)).toEqual(expect.arrayContaining(["mission_created", "session_started", "session_submitted", "quality_score_calculated", "teacher_approve", "shelter_confirm"]));
  });

  it("keeps all competition demo records visibly synthetic", () => {
    const service = buildSprint7Demo();
    expect([...service.state.missions.values()].every((item) => item.syntheticDemo)).toBe(true);
    expect([...service.state.sessions.values()].every((item) => item.syntheticDemo)).toBe(true);
    expect(service.state.timeline.every((item) => item.syntheticDemo && item.verificationState === "SYNTHETIC_DEMO")).toBe(true);
    expect(service.state.profiles.every((item) => item.syntheticDemo)).toBe(true);
  });

  it("requires reasons for admin overrides", () => {
    const { service, mission } = setup();
    expect(() => service.adminOverride(admin, "mission", mission.id, "archived", "", start)).toThrow("requires a reason");
  });
});
