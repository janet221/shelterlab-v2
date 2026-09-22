import { buildCompetitionEvidenceChain } from "../competition/evidence";
import { activatedOfficialDatasets, sprint6DatasetRegistry } from "../government-data/sprint6-fixtures";
import { sprint7DemoService } from "../living-lab/demo-data";
import { calculateImpactSnapshot } from "./engine";
import type { ImpactEngineInput } from "./types";

const sessions = [...sprint7DemoService.state.sessions.values()];
const profiles = sprint7DemoService.state.profiles.filter((item) => item.status === "shelter_approved");
const publications = sprint7DemoService.state.publications.filter((item) => !item.unpublishedAt);
const evidenceChain = buildCompetitionEvidenceChain();

export const sprint8ImpactInput: ImpactEngineInput = {
  calculatedAt: new Date("2026-07-12T12:00:00.000Z"),
  cohortId: "sprint8-synthetic-cohort-v1",
  learning: [
    { studentId: "SYN-STU-001", enrolled: true, completed: true, pretestScore: 62, posttestScore: 84, researchLicenseCompleted: true },
    { studentId: "SYN-STU-002", enrolled: true, completed: true, pretestScore: 71, posttestScore: 88, researchLicenseCompleted: true },
    { studentId: "SYN-STU-003", enrolled: true, completed: true, pretestScore: 68, posttestScore: 80, researchLicenseCompleted: true },
    { studentId: "SYN-STU-004", enrolled: true, completed: false, pretestScore: 75, researchLicenseCompleted: false }
  ],
  qualityRevisions: [
    { sessionId: "SYN-REV-001", baselineScore: 64, latestScore: 82 },
    { sessionId: "SYN-REV-002", baselineScore: 72, latestScore: 88 }
  ],
  missionCount: sprint7DemoService.state.missions.size,
  completedMissionCount: [...sprint7DemoService.state.missions.values()].filter((item) => item.status === "published").length,
  observationEventCount: sessions.reduce((sum, item) => sum + item.behaviorEvents.length, 0),
  publishedEvidenceCount: publications.length,
  observationQualityScores: sessions.flatMap((item) => item.qualityScore ? [item.qualityScore.total] : []),
  observedDogIds: [...new Set(sessions.map((item) => item.dogId))],
  updatedDogIds: [...new Set(publications.map((item) => item.snapshot.dogId))],
  profileCompletenessScores: profiles.map((item) => item.completenessScore),
  approvedProfileDogIds: profiles.map((item) => item.dogId),
  eligibleTeacherIds: ["SYN-TEA-001", "SYN-TEA-002"],
  engagedTeacherIds: ["SYN-TEA-001"],
  eligibleShelterIds: ["SYN-SHELTER-001", "SYN-SHELTER-002"],
  engagedShelterIds: ["SYN-SHELTER-001"],
  communityParticipantIds: ["SYN-COM-001", "SYN-COM-002", "SYN-COM-003"],
  completedContextCount: publications.filter((item) => Boolean(item.snapshot.environmentContext.observationZone && item.snapshot.environmentContext.setting && item.snapshot.environmentContext.timeOfDay)).length,
  verifiedDatasetIds: sprint6DatasetRegistry.filter((item) => item.verificationState === "VERIFIED").map((item) => item.datasetId),
  activeDatasetIds: activatedOfficialDatasets.map((item) => item.datasetId),
  attributedDatasetIds: activatedOfficialDatasets.filter((item) => item.attribution.trim().length > 0).map((item) => item.datasetId),
  evidenceChainNodeCount: evidenceChain.nodes.length,
  tracedEvidenceChainNodeCount: evidenceChain.complete ? evidenceChain.nodes.length : evidenceChain.nodes.filter((node) => evidenceChain.links.some((link) => link.from === node.id || link.to === node.id)).length
};

export const sprint8ImpactSnapshot = calculateImpactSnapshot(sprint8ImpactInput);

