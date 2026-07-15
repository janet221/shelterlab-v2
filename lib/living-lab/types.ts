import { z } from "zod";
import type { UserRole } from "../auth/roles";
import type { AuditEvent, ResearchLicenseRecord } from "../research-license/engine";
import { sprint3BehaviorCodes, type Sprint3BehaviorCode } from "../observations/session-engine";

export const missionStatuses = [
  "draft", "awaiting_shelter_confirmation", "assigned", "available", "in_progress", "submitted",
  "teacher_revision", "teacher_rejected", "shelter_revision", "shelter_rejected", "shelter_confirmed",
  "published", "cancelled", "archived"
] as const;
export type MissionStatus = (typeof missionStatuses)[number];

export const livingLabSessionStatuses = [
  "draft", "running", "submitted", "teacher_review", "teacher_revision", "teacher_rejected",
  "shelter_review", "shelter_revision", "shelter_rejected", "shelter_confirmed", "published", "archived"
] as const;
export type LivingLabSessionStatus = (typeof livingLabSessionStatuses)[number];

export const confidenceLevels = ["low", "medium", "high"] as const;
export type ConfidenceLevel = (typeof confidenceLevels)[number];
export const evidenceTypes = ["direct_observation", "media_reference", "shelter_record"] as const;
export type ObservationEvidenceType = (typeof evidenceTypes)[number];
export const privacyStates = ["pending", "approved_internal", "approved_public", "rejected", "quarantined"] as const;
export type PrivacyState = (typeof privacyStates)[number];

export type LivingLabActor = {
  id: string;
  role: UserRole;
  authorizedCoursePlanIds?: string[];
  authorizedShelterIds?: string[];
};

export const environmentContextSchema = z.object({
  observationZone: z.string().min(1),
  setting: z.enum(["indoor", "outdoor"]),
  noiseLevel: z.enum(["low", "moderate", "high"]),
  visitorPresence: z.boolean(),
  staffPresence: z.boolean(),
  otherDogsVisible: z.boolean(),
  feedingPeriod: z.boolean(),
  cleaningPeriod: z.boolean(),
  weatherContext: z.string().optional(),
  temperatureBand: z.enum(["cool", "mild", "warm", "hot", "unknown"]),
  timeOfDay: z.enum(["morning", "afternoon", "evening"]),
  distanceFromDog: z.enum(["under_2m", "2_to_5m", "over_5m", "unknown"]),
  barriersPresent: z.array(z.string()).min(1),
  unusualEvent: z.string().optional(),
  contextualNote: z.string().optional()
}).strict();
export type EnvironmentContext = z.infer<typeof environmentContextSchema>;

export type ObservationMissionRecord = {
  id: string;
  courseId?: string;
  classroomId?: string;
  teacherId: string;
  studentId: string;
  shelterId: string;
  dogId: string;
  assignedBy: string;
  shelterConfirmerId?: string;
  title: string;
  scientificPurpose: string;
  researchQuestion?: string;
  allowedZone: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  maximumDurationSec: number;
  protocolVersion: string;
  status: MissionStatus;
  cancellationReason?: string;
  syntheticDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LivingLabBehaviorEvent = {
  id: string;
  sessionId: string;
  sequenceNumber: number;
  timestampSecond: number;
  behaviorCode: Sprint3BehaviorCode;
  durationSec?: number;
  confidenceLevel: ConfidenceLevel;
  observerNote?: string;
  contextCode?: string;
  evidenceType: ObservationEvidenceType;
  mediaAssetId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type QualityFlagSeverity = "blocking" | "error" | "warning" | "info";
export type ObservationQualityFlag = {
  code: string;
  severity: QualityFlagSeverity;
  field: string;
  message: string;
};

export type LivingLabSessionRecord = {
  id: string;
  missionId: string;
  parentSessionId?: string;
  revisionNumber: number;
  studentId: string;
  dogId: string;
  shelterId: string;
  startedAtServer: Date;
  endedAtServer?: Date;
  deadlineAtServer: Date;
  clientStartedAt?: Date;
  lastAutosavedAt?: Date;
  submittedAt?: Date;
  teacherReviewedAt?: Date;
  shelterConfirmedAt?: Date;
  publishedAt?: Date;
  status: LivingLabSessionStatus;
  rowVersion: number;
  protocolVersion: string;
  environmentContext: EnvironmentContext;
  generalNotes: string;
  validationFlags: ObservationQualityFlag[];
  incidentFlag: boolean;
  privacyState: PrivacyState;
  syntheticDemo: boolean;
  behaviorEvents: LivingLabBehaviorEvent[];
  durationSec?: number;
  qualityScore?: ObservationQualityScore;
};

export type ObservationReviewRecord = {
  id: string;
  sessionId: string;
  reviewerId: string;
  role: "teacher" | "shelter_staff" | "admin";
  decision: "approve" | "request_revision" | "reject" | "confirm";
  reasonCode?: string;
  reasonText?: string;
  reviewedSessionVersion: number;
  rubric: Record<string, number | string | boolean>;
  professionalContextNote?: string;
  idempotencyKey: string;
  createdAt: Date;
};

export type ObservationQualityScore = {
  total: number;
  dimensions: {
    completeness: number;
    protocolCompliance: number;
    temporalValidity: number;
    contextCompleteness: number;
    codingConsistency: number;
    confidenceCoverage: number;
    evidenceRichness: number;
    reviewerAgreement: number;
    revisionHistory: number;
  };
  explanation: string[];
  version: "SL-OQS-1";
};

export type ObservationPublicationRecord = {
  id: string;
  sessionId: string;
  versionIdentifier: string;
  publishedById: string;
  publishedAt: Date;
  unpublishedById?: string;
  unpublishedAt?: Date;
  unpublishReason?: string;
  idempotencyKey: string;
  snapshot: LivingLabSessionRecord;
};

export type EvidenceTimelineEntryRecord = {
  id: string;
  dogId: string;
  sessionId?: string;
  eventDate: Date;
  eventType: string;
  sourceEntityType: string;
  sourceEntityId: string;
  sourceVersion: string;
  visibility: "internal" | "public";
  verificationState: "SYNTHETIC_DEMO" | "VERIFIED";
  actorRole: string;
  summary: string;
  evidenceLinks: string[];
  auditReference: string;
  syntheticDemo: boolean;
};

export type DogEvidenceProfileStatement = {
  id: string;
  dimension: string;
  statement: string;
  evidenceSourceIds: string[];
  evidenceDates: Date[];
  confirmationState: "shelter_confirmed";
  shelterApproved: true;
  version: number;
};

export type DogEvidenceProfileRecord = {
  id: string;
  dogId: string;
  version: number;
  status: "shelter_approved";
  evidenceCount: number;
  latestConfirmedAt?: Date;
  contextDiversity: number;
  completenessScore: number;
  approvedById: string;
  approvedAt: Date;
  syntheticDemo: boolean;
  statements: DogEvidenceProfileStatement[];
};

export type MediaAssetRecord = {
  id: string;
  sourceSessionId: string;
  storageProvider?: string;
  storageKey?: string;
  checksumSha256: string;
  mimeType: string;
  sizeBytes: number;
  captureTime?: Date;
  uploaderRole: UserRole;
  privacyState: PrivacyState;
  facePresent?: boolean;
  studentPresent?: boolean;
  reviewerId?: string;
  reviewReason?: string;
  syntheticDemo: boolean;
  createdAt: Date;
};

export type LivingLabState = {
  missions: Map<string, ObservationMissionRecord>;
  sessions: Map<string, LivingLabSessionRecord>;
  reviews: ObservationReviewRecord[];
  publications: ObservationPublicationRecord[];
  timeline: EvidenceTimelineEntryRecord[];
  profiles: DogEvidenceProfileRecord[];
  mediaAssets: MediaAssetRecord[];
  auditEvents: AuditEvent[];
  licenses: ResearchLicenseRecord[];
  idempotency: Map<string, string>;
};

export const activeBehaviorCodes = new Set<Sprint3BehaviorCode>(sprint3BehaviorCodes);
