import { livingLabDemoActors, sprint7DemoService } from "../living-lab/demo-data";
import { AdoptionProfileService } from "./engine";
import type { PublishedAdoptionEvidence } from "./types";

const dogId = "DOG-TPE-001";
const publication = sprint7DemoService.state.publications.find((item) => item.snapshot.dogId === dogId && !item.unpublishedAt)!;
const teacherReview = sprint7DemoService.state.reviews.find((item) => item.sessionId === publication.sessionId && item.role === "teacher" && item.decision === "approve")!;
const shelterReview = sprint7DemoService.state.reviews.find((item) => item.sessionId === publication.sessionId && item.role === "shelter_staff" && item.decision === "confirm")!;

const common = {
  dogId,
  reviewerId: livingLabDemoActors.shelter.id,
  reviewerRole: "shelter_staff" as const,
  verificationState: "SYNTHETIC_DEMO" as const,
  status: "published" as const,
  shelterApproved: true as const,
  syntheticDemo: true
};

const publishedEvidence: PublishedAdoptionEvidence[] = [
  {
    ...common,
    id: "adoption_evidence_intake_biscuit_v1",
    evidenceType: "shelter_intake",
    sourceEntityType: "shelter_public_fact",
    sourceEntityId: "shelter_fact_DOG-TPE-001_v1",
    sourceVersion: "v1",
    publishedAt: new Date("2026-07-10T08:00:00.000Z"),
    confidence: "not_applicable",
    context: "由收容所管理的公開基本資訊。",
    facts: { public_name: "Biscuit", sex: "female", age_band: "adult", adoption_status: "available", contact_process: "Contact shelter staff for current process." },
    timelineEntryId: `timeline_shelter_intake_${dogId}`
  },
  ...publication.snapshot.behaviorEvents.map((event): PublishedAdoptionEvidence => ({
    ...common,
    id: `adoption_evidence_observation_${event.id}`,
    evidenceType: "observation",
    sourceEntityType: "observation_publication",
    sourceEntityId: publication.id,
    sourceVersion: "published-observation-v1",
    publishedAt: publication.publishedAt,
    confidence: event.confidenceLevel,
    context: `收容所情境代碼 ${event.contextCode ?? "尚無代碼"}；場域 ${publication.snapshot.environmentContext.setting}；噪音程度 ${publication.snapshot.environmentContext.noiseLevel}`,
    observation: { behaviorCode: event.behaviorCode, durationSec: event.durationSec, observedValue: `觀察到行為代碼 ${event.behaviorCode}${event.durationSec ? `，持續 ${event.durationSec} 秒` : ""}。` },
    timelineEntryId: `timeline_observation_${dogId}`
  })),
  {
    ...common,
    id: "adoption_evidence_teacher_approval_biscuit_v1",
    evidenceType: "teacher_approval",
    sourceEntityType: "observation_review",
    sourceEntityId: teacherReview.id,
    sourceVersion: `session-v${teacherReview.reviewedSessionVersion}`,
    publishedAt: teacherReview.createdAt,
    reviewerId: livingLabDemoActors.teacher.id,
    reviewerRole: "teacher",
    confidence: "not_applicable",
    context: "只公開教師審核已完成；評分規準與意見不對外公開。",
    timelineEntryId: `timeline_teacher_approval_${dogId}`
  },
  {
    ...common,
    id: "adoption_evidence_shelter_confirmation_biscuit_v1",
    evidenceType: "shelter_confirmation",
    sourceEntityType: "observation_review",
    sourceEntityId: shelterReview.id,
    sourceVersion: `session-v${shelterReview.reviewedSessionVersion}`,
    publishedAt: shelterReview.createdAt,
    confidence: "not_applicable",
    context: "收容所已確認犬隻身分、觀察規範與公開證據資格。",
    timelineEntryId: `timeline_shelter_confirmation_${dogId}`
  },
  {
    ...common,
    id: "adoption_evidence_publication_biscuit_v1",
    evidenceType: "publication",
    sourceEntityType: "observation_publication",
    sourceEntityId: publication.id,
    sourceVersion: "published-observation-v1",
    publishedAt: publication.publishedAt,
    confidence: "not_applicable",
    context: "完成教師核准與收容所確認後，由收容所人工發布。",
    timelineEntryId: `timeline_publication_${dogId}`
  }
];

export function buildSprint10ADemo() {
  const service = new AdoptionProfileService({
    facts: new Map([[dogId, { dogId, shelterId: "SHELTER_TPE_001", publicName: "Biscuit", sex: "female", ageBand: "adult", adoptionStatus: "available" }]]),
    evidence: structuredClone(publishedEvidence)
  });
  service.publishProfile(livingLabDemoActors.shelter, dogId, new Date("2026-07-13T04:00:00.000Z"));
  return service;
}

export const sprint10ADemoService = buildSprint10ADemo();
export const sprint10ADemoProfile = sprint10ADemoService.getPublicProfile(dogId)!;
export const sprint10ACompleteness = sprint10ADemoService.getCompleteness(dogId)!;
export const sprint10AGaps = sprint10ADemoService.getGaps(dogId)!;
export const sprint10AEvidenceCards = sprint10ADemoService.getEvidenceCards(dogId);
export const sprint10ATimeline = sprint10ADemoService.getTimeline(dogId);
