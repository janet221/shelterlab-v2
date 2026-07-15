import type { LivingLabSessionRecord, ObservationQualityScore, ObservationReviewRecord } from "./types";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function calculateObservationQualityScore(
  session: LivingLabSessionRecord,
  reviews: ObservationReviewRecord[] = []
): ObservationQualityScore {
  const codes = new Set(session.behaviorEvents.map((event) => event.behaviorCode));
  const blocking = session.validationFlags.filter((item) => item.severity === "blocking").length;
  const temporal = session.validationFlags.filter((item) => ["INVALID_TIMESTAMP", "NEGATIVE_DURATION", "EVENT_OUTSIDE_SESSION", "SESSION_DURATION_MISMATCH"].includes(item.code)).length;
  const coding = session.validationFlags.filter((item) => ["INVALID_BEHAVIOR_CODE", "DUPLICATE_EVENT_PATTERN", "EXCESSIVE_IDENTICAL_EVENTS", "DISALLOWED_OVERLAP"].includes(item.code)).length;
  const contextValues = [session.environmentContext.observationZone, session.environmentContext.setting, session.environmentContext.noiseLevel, session.environmentContext.timeOfDay, session.environmentContext.distanceFromDog];
  const confidenceCount = session.behaviorEvents.filter((event) => event.confidenceLevel).length;
  const teacher = reviews.find((review) => review.sessionId === session.id && review.role === "teacher");
  const shelter = reviews.find((review) => review.sessionId === session.id && review.role === "shelter_staff");
  const reviewerAgreement = teacher && shelter ? (teacher.decision === "approve" && shelter.decision === "confirm" ? 100 : 40) : teacher ? 70 : 50;
  const dimensions = {
    completeness: clamp((session.behaviorEvents.length > 0 ? 45 : 0) + (session.generalNotes.trim() ? 25 : 0) + (contextValues.every(Boolean) ? 30 : 0)),
    protocolCompliance: clamp(100 - blocking * 35),
    temporalValidity: clamp(100 - temporal * 30),
    contextCompleteness: clamp((contextValues.filter(Boolean).length / contextValues.length) * 100),
    codingConsistency: clamp(100 - coding * 20),
    confidenceCoverage: clamp(session.behaviorEvents.length === 0 ? 0 : (confidenceCount / session.behaviorEvents.length) * 100),
    evidenceRichness: clamp(codes.size * 15 + session.behaviorEvents.length * 5 + (session.behaviorEvents.some((event) => event.observerNote?.trim()) ? 15 : 0)),
    reviewerAgreement,
    revisionHistory: clamp(100 - Math.max(0, session.revisionNumber - 1) * 15)
  };
  const values = Object.values(dimensions);
  return {
    total: clamp(values.reduce((sum, value) => sum + value, 0) / values.length),
    dimensions,
    explanation: [
      "SL-OQS-1 is an equal-weight arithmetic mean of nine transparent dimensions.",
      "The score prioritizes reviewer attention only; it is not a temperament, safety, diagnosis, or publication decision.",
      `Calculated from ${session.behaviorEvents.length} events, ${codes.size} unique codes, ${session.validationFlags.length} flags, and revision ${session.revisionNumber}.`
    ],
    version: "SL-OQS-1"
  };
}
