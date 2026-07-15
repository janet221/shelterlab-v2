import type { EngineUser, ResearchLicenseRecord } from "@/lib/research-license/engine";
import {
  addBehaviorEvent,
  calculateObservationDashboardMetrics,
  createObservationSession,
  publishObservationSession,
  shelterReviewSession,
  sprint3BehaviorCodes,
  startObservationSession,
  submitObservationSession,
  teacherReviewSession,
  type BehaviorEventRecord,
  type ObservationSessionRecord
} from "./session-engine";

const demoNow = new Date("2026-01-10T00:00:00.000Z");
const demoLicenses: ResearchLicenseRecord[] = [
  {
    id: "license_demo_level_1_001",
    studentId: "student_demo_001",
    licenseLevel: "level_1",
    blueprintId: "blueprint_level_1_v1",
    blueprintVersion: 1,
    qualifyingAttemptId: "attempt_demo_passed_001",
    status: "active",
    issuedAt: new Date("2026-01-02T01:20:00.000Z"),
    expiresAt: new Date("2026-07-01T01:20:00.000Z"),
    certificateCode: "SL-L1-STU-TEST-001-DEMO",
    certificateVersion: 1
  }
];

const sessions = new Map<string, ObservationSessionRecord>();

export const demoTasks = [
  {
    id: "task_green_biscuit",
    shelterId: "SHELTER_TPE_001",
    shelterName: "Taipei Demo Public Animal Shelter",
    dogId: "DOG-TPE-001",
    dogName: "Biscuit",
    locationZone: "GREEN_OBSERVATION",
    teacherId: "teacher_demo_001",
    shelterStaffId: "shelter_staff_demo_001"
  }
];

export function listTodayObservationTasks(user: EngineUser) {
  if (user.role !== "student") {
    return [];
  }

  return demoTasks;
}

export function createDemoObservationSession(user: EngineUser, taskId: string, now = demoNow) {
  const task = demoTasks.find((item) => item.id === taskId);
  if (!task) {
    throw new Error("Task not found.");
  }

  const created = createObservationSession(
    user,
    {
      studentId: user.id,
      dogId: task.dogId,
      teacherId: task.teacherId,
      shelterStaffId: task.shelterStaffId,
      locationZone: task.locationZone,
      weather: "clear",
      temperature: 24,
      notes: "Demo non-contact observation session."
    },
    demoLicenses,
    now
  );
  sessions.set(created.session.id, created.session);
  return created;
}

export function startDemoObservationSession(user: EngineUser, sessionId: string, now = demoNow) {
  const session = getDemoObservationSession(sessionId);
  const result = startObservationSession(user, session, now);
  sessions.set(sessionId, result.session);
  return result;
}

export function getDemoObservationSession(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found.");
  }
  return session;
}

export function addDemoBehaviorEvent(user: EngineUser, sessionId: string, event: Omit<BehaviorEventRecord, "id" | "sessionId">) {
  if (!sprint3BehaviorCodes.includes(event.behaviorCode)) {
    throw new Error("Invalid behavior code.");
  }

  const updated = addBehaviorEvent(user, getDemoObservationSession(sessionId), event);
  sessions.set(sessionId, updated);
  return updated;
}

export function submitDemoObservationSession(user: EngineUser, sessionId: string, now = new Date("2026-01-10T00:05:00.000Z")) {
  const result = submitObservationSession(user, getDemoObservationSession(sessionId), now);
  sessions.set(sessionId, result.session);
  return result;
}

export function teacherReviewDemoObservationSession(user: EngineUser, sessionId: string, decision: "approve" | "revision" | "reject", reason?: string) {
  const result = teacherReviewSession(user, getDemoObservationSession(sessionId), decision, reason);
  sessions.set(sessionId, result.session);
  return result;
}

export function shelterReviewDemoObservationSession(user: EngineUser, sessionId: string, decision: "approve" | "revision" | "reject", reason?: string) {
  const result = shelterReviewSession(user, getDemoObservationSession(sessionId), decision, reason);
  sessions.set(sessionId, result.session);
  return result;
}

export function publishDemoObservationSession(user: EngineUser, sessionId: string, now = new Date("2026-01-10T00:10:00.000Z")) {
  const result = publishObservationSession(user, getDemoObservationSession(sessionId), now);
  sessions.set(sessionId, result.session);
  return result;
}

export function listObservationSessions() {
  return [...sessions.values()];
}

export function observationDashboardMetrics() {
  return calculateObservationDashboardMetrics(listObservationSessions(), { "DOG-TPE-001": "SHELTER_TPE_001" });
}
