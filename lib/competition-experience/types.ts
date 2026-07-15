export const COMPETITION_DEMO_DURATION_SEC = 420;

export type CompetitionExperienceStepId =
  | "overview"
  | "research-license"
  | "observation"
  | "evidence-timeline"
  | "dog-profile"
  | "one-health-inquiry"
  | "impact-dashboard";

export type CompetitionExperienceStep = {
  id: CompetitionExperienceStepId;
  sequence: number;
  title: string;
  shortTitle: string;
  narration: string;
  evidence: string;
  evidenceMode: "SYNTHETIC_DEMO" | "DEMO";
  deepLink: string;
  targetHref: string;
  allocatedSec: number;
};

export type CompetitionTimerStatus = "idle" | "running" | "paused" | "complete";

export type CompetitionExperienceState = {
  version: "SL-COMPETITION-EXPERIENCE-1";
  fixtureId: "shelterlab-synthetic-demo-v1";
  syntheticDemo: true;
  readOnly: true;
  productionMutationCount: 0;
  currentStepId: CompetitionExperienceStepId;
  completedStepIds: CompetitionExperienceStepId[];
  elapsedSec: number;
  timerStatus: CompetitionTimerStatus;
};
