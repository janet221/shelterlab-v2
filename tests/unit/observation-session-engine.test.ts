import { describe, expect, it } from "vitest";
import type { EngineUser, ResearchLicenseRecord } from "../../lib/research-license/engine";
import {
  addBehaviorEvent,
  calculateObservationDashboardMetrics,
  createObservationSession,
  publishObservationSession,
  shelterReviewSession,
  startObservationSession,
  submitObservationSession,
  teacherReviewSession,
  validateObservationSession,
  type ObservationSessionRecord
} from "../../lib/observations/session-engine";

const student: EngineUser = { id: "student_demo_001", role: "student" };
const teacher: EngineUser = { id: "teacher_demo_001", role: "teacher" };
const shelterStaff: EngineUser = { id: "shelter_staff_demo_001", role: "shelter_staff" };

const activeLicense: ResearchLicenseRecord = {
  id: "license_demo_level_1_001",
  studentId: student.id,
  licenseLevel: "level_1",
  blueprintId: "blueprint_level_1_v1",
  blueprintVersion: 1,
  qualifyingAttemptId: "attempt_demo_passed_001",
  status: "active",
  issuedAt: new Date("2026-01-01T00:00:00.000Z"),
  expiresAt: new Date("2026-07-01T00:00:00.000Z"),
  certificateCode: "SL-L1-DEMO",
  certificateVersion: 1
};

function draftSession(): ObservationSessionRecord {
  return createObservationSession(
    student,
    {
      id: "session-1",
      studentId: student.id,
      dogId: "DOG-TPE-001",
      locationZone: "GREEN_OBSERVATION",
      notes: "Objective demo notes."
    },
    [activeLicense],
    new Date("2026-01-10T00:00:00.000Z")
  ).session;
}

function runningWithEvent() {
  const started = startObservationSession(student, draftSession(), new Date("2026-01-10T00:00:00.000Z")).session;
  return addBehaviorEvent(student, started, {
    timestampSecond: 10,
    behaviorCode: "LOOK_AT_HUMAN",
    durationSec: 5,
    confidence: 0.9,
    observerNote: "Dog looked toward hallway."
  });
}

describe("Observation Session Engine", () => {
  it("requires an active Research License before creating an observation session", () => {
    expect(() =>
      createObservationSession(
        student,
        { studentId: student.id, dogId: "DOG-TPE-001", locationZone: "GREEN_OBSERVATION" },
        [{ ...activeLicense, status: "revoked" }],
        new Date("2026-01-10T00:00:00.000Z")
      )
    ).toThrow("active Research License");
  });

  it("allows a licensed student to start and submit a 300-second session", () => {
    const session = runningWithEvent();
    const result = submitObservationSession(student, session, new Date("2026-01-10T00:05:00.000Z"));

    expect(result.session.status).toBe("submitted");
    expect(result.session.durationSec).toBe(300);
    expect(result.session.validationFlags.map((flag) => flag.code)).not.toContain("SESSION_TOO_LONG");
  });

  it("flags sessions longer than 300 seconds", () => {
    const session = runningWithEvent();
    const result = submitObservationSession(student, session, new Date("2026-01-10T00:05:01.000Z"));

    expect(result.session.validationFlags).toContainEqual(expect.objectContaining({ code: "SESSION_TOO_LONG", severity: "error" }));
  });

  it("requires positive behavior duration and in-session timestamps", () => {
    const session = {
      ...draftSession(),
      durationSec: 300,
      behaviorEvents: [
        {
          id: "event-1",
          sessionId: "session-1",
          timestampSecond: 299,
          behaviorCode: "BARK" as const,
          durationSec: 5,
          confidence: 0.8
        },
        {
          id: "event-2",
          sessionId: "session-1",
          timestampSecond: 20,
          behaviorCode: "SIT" as const,
          durationSec: 0,
          confidence: 0.8
        }
      ]
    };

    expect(validateObservationSession(session).map((flag) => flag.code)).toEqual(
      expect.arrayContaining(["BEHAVIOR_OUTSIDE_SESSION", "NON_POSITIVE_DURATION"])
    );
  });

  it("detects missing behaviors, empty notes, duplicate timestamps, repeated events, and subjective language", () => {
    const session: ObservationSessionRecord = {
      ...draftSession(),
      notes: "very cute and happy",
      durationSec: 300,
      behaviorEvents: Array.from({ length: 6 }, (_, index) => ({
        id: `event-${index}`,
        sessionId: "session-1",
        timestampSecond: 20,
        behaviorCode: "SIT",
        durationSec: 3,
        confidence: 0.9,
        observerNote: index === 0 ? "looks angry" : undefined
      }))
    };

    expect(validateObservationSession({ ...session, behaviorEvents: [] }).map((flag) => flag.code)).toContain("MISSING_BEHAVIORS");
    expect(validateObservationSession({ ...session, notes: " " }).map((flag) => flag.code)).toContain("EMPTY_NOTES");
    expect(validateObservationSession(session).map((flag) => flag.code)).toEqual(
      expect.arrayContaining(["DUPLICATE_TIMESTAMPS", "TOO_MANY_IDENTICAL_EVENTS", "SUBJECTIVE_LANGUAGE"])
    );
  });

  it("prevents student edits after submit", () => {
    const submitted = submitObservationSession(student, runningWithEvent(), new Date("2026-01-10T00:05:00.000Z")).session;

    expect(() =>
      addBehaviorEvent(student, submitted, {
        timestampSecond: 20,
        behaviorCode: "SIT",
        durationSec: 5,
        confidence: 0.8
      })
    ).toThrow("Students cannot edit after submit");
  });

  it("requires teacher and shelter revision reasons", () => {
    const submitted = submitObservationSession(student, runningWithEvent(), new Date("2026-01-10T00:05:00.000Z")).session;
    expect(() => teacherReviewSession(teacher, submitted, "revision")).toThrow("requires a reason");

    const shelterReview = teacherReviewSession(teacher, submitted, "approve").session;
    expect(() => shelterReviewSession(shelterStaff, shelterReview, "revision")).toThrow("requires a reason");
  });

  it("requires separate manual publication after teacher and shelter approval", () => {
    const submitted = submitObservationSession(student, runningWithEvent(), new Date("2026-01-10T00:05:00.000Z")).session;
    const shelterReview = teacherReviewSession(teacher, submitted, "approve").session;
    const confirmed = shelterReviewSession(shelterStaff, shelterReview, "approve").session;
    const published = publishObservationSession(shelterStaff, confirmed, new Date("2026-01-10T00:10:00.000Z")).session;

    expect(confirmed.status).toBe("shelter_confirmed");
    expect(confirmed.publishedAt).toBeUndefined();
    expect(published.status).toBe("published");
    expect(published.publishedAt).toBeInstanceOf(Date);
  });

  it("calculates dashboard metrics", () => {
    const metrics = calculateObservationDashboardMetrics(
      [
        { ...draftSession(), status: "published", durationSec: 300 },
        { ...draftSession(), id: "session-2", status: "teacher_revision", durationSec: 120 }
      ],
      { "DOG-TPE-001": "SHELTER_TPE_001" }
    );

    expect(metrics.observationCount).toBe(2);
    expect(metrics.studentCount).toBe(1);
    expect(metrics.shelterCount).toBe(1);
    expect(metrics.publishedObservations).toBe(1);
    expect(metrics.revisionRate).toBe(50);
    expect(metrics.averageDurationSec).toBe(210);
  });
});
