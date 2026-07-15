import type { ResearchLicenseRecord } from "../research-license/engine";
import { LivingLabService } from "./engine";
import type { LivingLabActor } from "./types";

export const livingLabDemoActors: Record<"student" | "teacher" | "shelter" | "admin", LivingLabActor> = {
  student: { id: "student_demo_001", role: "student" },
  teacher: { id: "teacher_demo_001", role: "teacher", authorizedCoursePlanIds: ["course_plan_shelterlab_16w_v1"], authorizedShelterIds: ["SHELTER_TPE_001"] },
  shelter: { id: "shelter_staff_demo_001", role: "shelter_staff", authorizedShelterIds: ["SHELTER_TPE_001"] },
  admin: { id: "admin_demo_001", role: "admin", authorizedShelterIds: ["SHELTER_TPE_001"] }
};

export const sprint7DemoLicense: ResearchLicenseRecord = {
  id: "license_sprint7_demo_001", studentId: livingLabDemoActors.student.id, licenseLevel: "level_1", blueprintId: "blueprint_level_1_v1",
  blueprintVersion: 1, qualifyingAttemptId: "attempt_synthetic_sprint7_001", status: "active",
  issuedAt: new Date("2026-07-01T00:00:00.000Z"), expiresAt: new Date("2026-12-28T00:00:00.000Z"), certificateCode: "SL-L1-SYNTHETIC-SPRINT7", certificateVersion: 1
};

export function buildSprint7Demo() {
  const service = new LivingLabService({ licenses: [sprint7DemoLicense] });
  const teacher = livingLabDemoActors.teacher; const student = livingLabDemoActors.student; const shelter = livingLabDemoActors.shelter;
  const start = new Date("2026-07-12T01:00:00.000Z");
  const mission = service.createMission(teacher, {
    id: "mission_synthetic_biscuit_001", courseId: "course_plan_shelterlab_16w_v1", classroomId: "classroom_synthetic_001", teacherId: teacher.id,
    studentId: student.id, shelterId: "SHELTER_TPE_001", dogId: "DOG-TPE-001", title: "SYNTHETIC_DEMO Biscuit non-contact behavior mission",
    scientificPurpose: "Practice objective behavior coding and contextual evidence collection.", researchQuestion: "How does visible hallway activity relate to observed orientation and posture?",
    allowedZone: "GREEN_OBSERVATION", scheduledStart: start, scheduledEnd: new Date("2026-07-12T02:00:00.000Z"), maximumDurationSec: 300, protocolVersion: "SL-OBS-1", syntheticDemo: true
  }, new Date("2026-07-11T08:00:00.000Z")).mission;
  service.submitMissionForShelter(teacher, mission.id, new Date("2026-07-11T08:05:00.000Z"));
  service.shelterDecideMission(shelter, mission.id, "confirm", undefined, new Date("2026-07-11T08:10:00.000Z"));
  const session = service.startMission(student, mission.id, "demo-start-001", start, start).session;
  service.autosaveSession(student, session.id, 0, { generalNotes: "Dog remained behind the gate and looked toward hallway movement." }, "demo-autosave-001", new Date("2026-07-12T01:00:10.000Z"));
  service.addBehaviorEvent(student, session.id, { timestampSecond: 12, behaviorCode: "LOOK_AT_HUMAN", durationSec: 4, confidenceLevel: "high", observerNote: "Dog looked toward the hallway after footsteps.", contextCode: "HALLWAY_SOUND", evidenceType: "direct_observation" }, new Date("2026-07-12T01:00:12.000Z"));
  service.addBehaviorEvent(student, session.id, { timestampSecond: 30, behaviorCode: "SIT", durationSec: 15, confidenceLevel: "high", observerNote: "Dog sat near the rear wall.", contextCode: "STAFF_PRESENT", evidenceType: "direct_observation" }, new Date("2026-07-12T01:00:30.000Z"));
  service.addBehaviorEvent(student, session.id, { timestampSecond: 70, behaviorCode: "YAWN", durationSec: 2, confidenceLevel: "medium", observerNote: "very cute yawn", contextCode: "VISITOR_VISIBLE", evidenceType: "direct_observation" }, new Date("2026-07-12T01:01:10.000Z"));
  const submitted = service.submitSession(student, session.id, "demo-submit-001", new Date("2026-07-12T01:05:00.000Z")).session;
  service.teacherReview(teacher, submitted.id, "approve", undefined, undefined, { objectiveLanguage: 4, protocol: 4, context: 4 }, "demo-teacher-review-001", new Date("2026-07-12T01:10:00.000Z"));
  service.shelterReview(shelter, submitted.id, "confirm", undefined, undefined, "approved_public", "Shelter confirms dog identity, green zone, and non-contact protocol.", "demo-shelter-review-001", new Date("2026-07-12T01:15:00.000Z"));
  service.state.mediaAssets.push({ id: "media_synthetic_metadata_001", sourceSessionId: submitted.id, checksumSha256: "d6f6f5d197a15f5978b20e2531c2d8f8e774f7da5e6a163e9d22f06d6f4f67ab", mimeType: "image/jpeg", sizeBytes: 245760, captureTime: new Date("2026-07-12T01:02:00.000Z"), uploaderRole: "student", privacyState: "approved_internal", facePresent: false, studentPresent: false, reviewerId: shelter.id, reviewReason: "Metadata fixture only; no binary upload or public URL.", syntheticDemo: true, createdAt: new Date("2026-07-12T01:15:00.000Z") });
  service.publish(shelter, submitted.id, "demo-publish-001", new Date("2026-07-12T01:20:00.000Z"));

  const revisionMission = service.createMission(teacher, { ...mission, id: "mission_synthetic_revision_001", title: "SYNTHETIC_DEMO revision path", scheduledStart: new Date("2026-07-12T03:00:00.000Z"), scheduledEnd: new Date("2026-07-12T04:00:00.000Z") }, new Date("2026-07-11T09:00:00.000Z")).mission;
  service.submitMissionForShelter(teacher, revisionMission.id, new Date("2026-07-11T09:01:00.000Z")); service.shelterDecideMission(shelter, revisionMission.id, "confirm", undefined, new Date("2026-07-11T09:02:00.000Z"));
  const revisionParent = service.startMission(student, revisionMission.id, "revision-start", new Date("2026-07-12T03:00:00.000Z")).session;
  service.addBehaviorEvent(student, revisionParent.id, { timestampSecond: 5, behaviorCode: "SIT", durationSec: 5, confidenceLevel: "low" }, new Date("2026-07-12T03:00:05.000Z"));
  service.autosaveSession(student, revisionParent.id, 1, { generalNotes: "Short context requires clarification." }, "revision-save", new Date("2026-07-12T03:00:10.000Z"));
  service.submitSession(student, revisionParent.id, "revision-submit", new Date("2026-07-12T03:01:00.000Z"));
  service.teacherReview(teacher, revisionParent.id, "request_revision", "insufficient_context", "Add environmental context and objective details.", { context: 1 }, "revision-review", new Date("2026-07-12T03:05:00.000Z"));
  service.createRevision(student, revisionParent.id, "revision-child", new Date("2026-07-12T03:10:00.000Z"));

  const incidentSession: typeof submitted = { ...structuredClone(submitted), id: "session_synthetic_incident_001", missionId: mission.id, status: "shelter_confirmed", incidentFlag: true, privacyState: "approved_public" };
  service.state.sessions.set(incidentSession.id, incidentSession);

  const available = service.createMission(teacher, {
    id: "mission_synthetic_available_001", courseId: "course_plan_shelterlab_16w_v1", classroomId: "classroom_synthetic_001", teacherId: teacher.id,
    studentId: student.id, shelterId: "SHELTER_TPE_001", dogId: "DOG-TPE-001", title: "SYNTHETIC_DEMO available observation mission",
    scientificPurpose: "Collect a second non-contact context sample.", researchQuestion: "Which observable behaviors occur when visitor presence is low?",
    allowedZone: "GREEN_OBSERVATION", scheduledStart: new Date("2026-07-12T05:00:00.000Z"), scheduledEnd: new Date("2026-07-12T06:00:00.000Z"), maximumDurationSec: 300, protocolVersion: "SL-OBS-1", syntheticDemo: true
  }, new Date("2026-07-11T10:00:00.000Z")).mission;
  service.submitMissionForShelter(teacher, available.id, new Date("2026-07-11T10:01:00.000Z"));
  service.shelterDecideMission(shelter, available.id, "confirm", undefined, new Date("2026-07-11T10:02:00.000Z"));
  return service;
}

export const sprint7DemoService = buildSprint7Demo();
export const sprint7DemoSession = sprint7DemoService.getSession("session_mission_synthetic_biscuit_001_v1");
export const sprint7DemoMission = sprint7DemoService.getMission("mission_synthetic_biscuit_001");
export const sprint7DemoTimeline = sprint7DemoService.listTimeline("DOG-TPE-001", "internal");
export const sprint7PublicTimeline = sprint7DemoService.listTimeline("DOG-TPE-001", "public");
export const sprint7DemoProfile = sprint7DemoService.getPublicProfile("DOG-TPE-001")!;
