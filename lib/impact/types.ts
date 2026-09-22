export const impactEvidenceStatuses = ["VERIFIED", "DEMO", "SYNTHETIC", "UNVERIFIED"] as const;
export type ImpactEvidenceStatus = (typeof impactEvidenceStatuses)[number];

export const impactConfidenceLevels = ["HIGH", "MEDIUM", "LOW", "INSUFFICIENT", "DEMO_ONLY"] as const;
export type ImpactConfidenceLevel = (typeof impactConfidenceLevels)[number];

export type ImpactDomain = "EDUCATION" | "LIVING_LAB" | "SHELTER" | "ADOPTION_SUPPORT" | "GOVERNMENT_OPEN_DATA" | "ONE_HEALTH" | "SOCIAL" | "SDG";

export type MetricProvenance = {
  sourceType: string;
  sourceId: string;
  sourceVersion: string;
  evidenceStatus: ImpactEvidenceStatus;
  label: string;
};

export type ImpactMetric = {
  id: string;
  code: string;
  domain: ImpactDomain;
  label: string;
  description: string;
  value: number;
  unit: "count" | "percent" | "score" | "percentage_points";
  formula: string;
  numerator: number;
  denominator: number;
  confidenceLevel: ImpactConfidenceLevel;
  evidenceStatus: ImpactEvidenceStatus;
  syntheticDemo: boolean;
  provenance: MetricProvenance[];
  limitations: string[];
  metricVersion: string;
  calculatedAt: Date;
};

export type LearningEvidenceInput = {
  studentId: string;
  enrolled: boolean;
  completed: boolean;
  pretestScore?: number;
  posttestScore?: number;
  researchLicenseCompleted: boolean;
};

export type QualityRevisionInput = {
  sessionId: string;
  baselineScore: number;
  latestScore: number;
};

export type ImpactEngineInput = {
  calculatedAt: Date;
  cohortId: string;
  learning: LearningEvidenceInput[];
  qualityRevisions: QualityRevisionInput[];
  missionCount: number;
  completedMissionCount: number;
  observationEventCount: number;
  publishedEvidenceCount: number;
  observationQualityScores: number[];
  observedDogIds: string[];
  updatedDogIds: string[];
  profileCompletenessScores: number[];
  approvedProfileDogIds: string[];
  eligibleTeacherIds: string[];
  engagedTeacherIds: string[];
  eligibleShelterIds: string[];
  engagedShelterIds: string[];
  communityParticipantIds: string[];
  completedContextCount: number;
  verifiedDatasetIds: string[];
  activeDatasetIds: string[];
  attributedDatasetIds: string[];
  evidenceChainNodeCount: number;
  tracedEvidenceChainNodeCount: number;
};

export type SdgMapping = {
  goal: string;
  title: string;
  contribution: string;
  metricCodes: string[];
  evidenceStatus: ImpactEvidenceStatus;
  limitation: string;
};

export type ImpactSnapshot = {
  id: string;
  version: string;
  evidenceStatus: "SYNTHETIC";
  calculatedAt: Date;
  metrics: ImpactMetric[];
  sdgMappings: SdgMapping[];
  warnings: string[];
};

export type CompetitionDimension = "Innovation" | "Technical Quality" | "Educational Value" | "Open Data Utilization" | "Social Impact" | "Sustainability" | "Scalability";

export type CompetitionCriterion = {
  id: string;
  feature: string;
  modulePath: string;
  evidenceHref: string;
  evidence: string;
  points: number;
  maxPoints: number;
  evidenceStatus: ImpactEvidenceStatus;
};

export type CompetitionDimensionScore = {
  dimension: CompetitionDimension;
  score: number;
  numerator: number;
  denominator: number;
  formula: string;
  evidenceStatus: "DEMO";
  criteria: CompetitionCriterion[];
};

export type CompetitionScorecard = {
  version: string;
  label: "DEMO";
  disclaimer: string;
  dimensions: CompetitionDimensionScore[];
  overall: number;
};
