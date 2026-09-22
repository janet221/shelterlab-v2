import type { AuditEvent } from "../research-license/engine";
import type { LivingLabActor } from "../living-lab/types";

export const profileSections = [
  "basic_information",
  "observed_behaviors",
  "observed_contexts",
  "activity",
  "human_interaction",
  "environmental_responses",
  "known_information",
  "unknown_information",
  "not_yet_tested",
  "evidence_coverage",
  "latest_evidence",
  "profile_version"
] as const;
export type AdoptionProfileSection = (typeof profileSections)[number];

export const adoptionEvidenceTypes = [
  "shelter_intake",
  "health_check",
  "observation",
  "teacher_approval",
  "shelter_confirmation",
  "publication",
  "media_photo",
  "media_video",
  "profile_update"
] as const;
export type AdoptionEvidenceType = (typeof adoptionEvidenceTypes)[number];

export type DogPublicFacts = {
  dogId: string;
  shelterId: string;
  publicName: string;
  sex: "female" | "male" | "unknown";
  ageBand: "puppy" | "young" | "adult" | "senior" | "unknown";
  adoptionStatus: "available" | "pending" | "adopted" | "unavailable" | "unknown";
};

export type PublishedAdoptionEvidence = {
  id: string;
  dogId: string;
  evidenceType: AdoptionEvidenceType;
  sourceEntityType: string;
  sourceEntityId: string;
  sourceVersion: string;
  publishedAt: Date;
  reviewerId: string;
  reviewerRole: "teacher" | "shelter_staff" | "admin";
  confidence: "low" | "medium" | "high" | "not_applicable";
  context: string;
  observation?: {
    behaviorCode: string;
    durationSec?: number;
    observedValue: string;
  };
  facts?: Record<string, string>;
  timelineEntryId: string;
  verificationState: "SYNTHETIC_DEMO" | "VERIFIED";
  status: "published";
  shelterApproved: true;
  syntheticDemo: boolean;
};

export type AdoptionEvidenceCard = {
  id: string;
  observation: string;
  date: Date;
  evidenceSource: string;
  sourceVersion: string;
  reviewer: string;
  reviewerRole: PublishedAdoptionEvidence["reviewerRole"];
  confidence: PublishedAdoptionEvidence["confidence"];
  context: string;
  timelineEntryId: string;
  verification: PublishedAdoptionEvidence["verificationState"];
  syntheticDemo: boolean;
};

export type AdoptionProfileStatement = {
  id: string;
  section: AdoptionProfileSection;
  text: string;
  evidenceIds: string[];
  timelineEntryIds: string[];
  reviewerIds: string[];
  confidence: PublishedAdoptionEvidence["confidence"];
  verificationStates: PublishedAdoptionEvidence["verificationState"][];
};

export const completenessDimensions = [
  "basic_information",
  "health_metadata",
  "observation_coverage",
  "observation_diversity",
  "timeline_coverage",
  "shelter_confirmation",
  "media_completeness",
  "adoption_information",
  "unknown_disclosure"
] as const;
export type CompletenessDimension = (typeof completenessDimensions)[number];

export type CompletenessDimensionResult = {
  dimension: CompletenessDimension;
  score: number;
  formula: string;
  numerator: number;
  denominator: number;
  evidenceIds: string[];
  limitation: string;
};

export type EvidenceCompletenessScore = {
  id: string;
  dogId: string;
  profileId: string;
  total: number;
  dimensions: CompletenessDimensionResult[];
  formula: "arithmetic_mean_of_nine_dimensions";
  version: "SL-ADOPTION-COMPLETE-1";
  syntheticDemo: boolean;
  calculatedAt: Date;
};

export const gapCodes = [
  "walking_observation",
  "human_interaction",
  "environmental_observation",
  "video",
  "photo",
  "repeated_observation",
  "shelter_confirmation"
] as const;
export type ProfileGapCode = (typeof gapCodes)[number];

export type ProfileGap = {
  code: ProfileGapCode;
  missing: boolean;
  label: string;
  reason: string;
  evidenceIds: string[];
  action: "COLLECT_MORE_EVIDENCE";
};

export type ProfileGapAssessment = {
  id: string;
  dogId: string;
  profileId: string;
  gaps: ProfileGap[];
  version: "SL-PROFILE-GAP-1";
  syntheticDemo: boolean;
  calculatedAt: Date;
};

export const adoptionTimelineTypes = [
  "shelter_intake",
  "health_check",
  "observation",
  "teacher_approval",
  "shelter_confirmation",
  "publication",
  "profile_update",
  "foster",
  "one_day_outing",
  "trial_adoption",
  "formal_adoption",
  "returned"
] as const;
export type AdoptionTimelineType = (typeof adoptionTimelineTypes)[number];

export type AdoptionTimelineEvent = {
  id: string;
  dogId: string;
  eventType: AdoptionTimelineType;
  eventDate?: Date;
  state: "evidence" | "not_recorded" | "future_placeholder";
  label: string;
  evidenceIds: string[];
  sourceVersions: string[];
  reviewerRoles: string[];
  verificationStates: string[];
  syntheticDemo: boolean;
};

export type AdoptionProfile = {
  id: string;
  dogId: string;
  shelterId: string;
  version: number;
  status: "published";
  sections: Record<AdoptionProfileSection, AdoptionProfileStatement[]>;
  evidenceCardIds: string[];
  unknownInformation: string[];
  notYetTested: string[];
  latestEvidenceAt: Date;
  approvedById: string;
  approvedAt: Date;
  publishedAt: Date;
  generationMethod: "deterministic_evidence_projection";
  aiGenerated: false;
  adoptionProbability?: never;
  syntheticDemo: boolean;
};

export type AdoptionProfileState = {
  facts: Map<string, DogPublicFacts>;
  evidence: PublishedAdoptionEvidence[];
  profiles: AdoptionProfile[];
  evidenceCards: AdoptionEvidenceCard[];
  completenessScores: EvidenceCompletenessScore[];
  gapAssessments: ProfileGapAssessment[];
  timeline: AdoptionTimelineEvent[];
  auditEvents: AuditEvent[];
};

export type AdoptionProfileActor = LivingLabActor;
