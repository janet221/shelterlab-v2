import type {
  AdoptionProfileSection,
  AdoptionTimelineType,
  ProfileGapCode,
  PublishedAdoptionEvidence
} from "./types";

export const evidenceStoryStages = ["evidence", "observation", "timeline", "reviewer", "publication"] as const;
export type EvidenceStoryStage = (typeof evidenceStoryStages)[number];

export type PublicEvidenceReference = {
  reference: string;
  evidenceType: PublishedAdoptionEvidence["evidenceType"];
  sourceType: string;
  sourceVersion: string;
  context: string;
  confidence: PublishedAdoptionEvidence["confidence"];
  verification: PublishedAdoptionEvidence["verificationState"];
};

export type StoryObservation = {
  status: "recorded" | "not_applicable";
  value: string;
  behaviorCode?: string;
  durationSec?: number;
  explanation?: string;
};

export type EvidenceStoryTrace = {
  id: string;
  stageOrder: readonly EvidenceStoryStage[];
  evidence: PublicEvidenceReference;
  observation: StoryObservation;
  timeline: {
    id: string;
    eventType: AdoptionTimelineType;
    label: string;
    state: "evidence";
    eventDate?: Date;
  };
  reviewer: {
    role: PublishedAdoptionEvidence["reviewerRole"];
    publicReference: string;
  };
  publication: {
    status: "published";
    evidencePublishedAt: Date;
    profilePublishedAt: Date;
    profileVersion: number;
    shelterApproved: true;
    authority: "shelter_authority";
    verification: PublishedAdoptionEvidence["verificationState"];
  };
};

export type EvidenceStatementStory = {
  statementId: string;
  section: AdoptionProfileSection;
  statement: string;
  traces: EvidenceStoryTrace[];
};

export type MissingEvidenceExplanation = {
  category: string;
  description: string;
};

export type UnknownExplanation = {
  id: string;
  field: string;
  value: "UNKNOWN";
  whyUnknown: string;
  missingEvidence: MissingEvidenceExplanation[];
  statementIds: string[];
};

export type EvidenceGapStory = {
  code: ProfileGapCode;
  category: string;
  whyMissing: string;
  requiredEvidence: string;
  currentEvidenceCount: number;
  action: "COLLECT_MORE_EVIDENCE";
};

export type EvidenceStoryView = {
  version: "SL-EVIDENCE-STORY-1";
  dogId: string;
  publicName: string;
  profileId: string;
  profileVersion: number;
  profilePublishedAt: Date;
  statements: EvidenceStatementStory[];
  unknowns: UnknownExplanation[];
  gaps: EvidenceGapStory[];
  readOnly: true;
  deterministic: true;
  aiGenerated: false;
  syntheticDemo: boolean;
};
