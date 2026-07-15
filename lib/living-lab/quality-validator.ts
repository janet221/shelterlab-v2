import { canBehaviorEventsOverlap, getBehaviorCodeDefinition } from "./behavior-registry";
import { environmentContextSchema, type LivingLabSessionRecord, type ObservationQualityFlag } from "./types";

const subjectivePatterns = [/very cute/i, /cute/i, /looks angry/i, /happy/i, /friendly/i, /很可愛/u, /很兇/u, /很友善/u];
const emotionalConclusionPatterns = [/is angry/i, /is afraid/i, /is aggressive/i, /is friendly/i, /牠很生氣/u, /牠很害怕/u, /有攻擊性/u];

function flag(code: string, severity: ObservationQualityFlag["severity"], field: string, message: string): ObservationQualityFlag {
  return { code, severity, field, message };
}

export function validateObservationQuality(
  session: LivingLabSessionRecord,
  options: { reviewerRequiredEvidence?: boolean } = {}
): ObservationQualityFlag[] {
  const flags: ObservationQualityFlag[] = [];
  const maximum = Math.round((session.deadlineAtServer.getTime() - session.startedAtServer.getTime()) / 1000);
  const duration = session.durationSec ?? (session.endedAtServer ? Math.round((session.endedAtServer.getTime() - session.startedAtServer.getTime()) / 1000) : 0);

  if (session.behaviorEvents.length === 0) flags.push(flag("NO_BEHAVIOR_EVENTS", "blocking", "behaviorEvents", "At least one observable behavior event is required."));
  if (!environmentContextSchema.safeParse(session.environmentContext).success) flags.push(flag("MISSING_ENVIRONMENT_CONTEXT", "error", "environmentContext", "Structured environment context is incomplete."));
  if (!session.generalNotes.trim()) flags.push(flag("EMPTY_GENERAL_NOTES", "warning", "generalNotes", "General notes are empty."));
  if (duration < 60) flags.push(flag("SUSPICIOUSLY_FAST_COMPLETION", "warning", "durationSec", "The session ended unusually quickly for the standard protocol."));
  if (duration < 0 || duration > maximum) flags.push(flag("SESSION_DURATION_MISMATCH", "blocking", "durationSec", "Session duration does not match the server-authoritative observation window."));
  if (session.endedAtServer && Math.round((session.endedAtServer.getTime() - session.startedAtServer.getTime()) / 1000) !== duration) flags.push(flag("SESSION_DURATION_MISMATCH", "error", "durationSec", "Stored duration differs from server timestamps."));
  if (session.incidentFlag && !session.environmentContext.unusualEvent?.trim()) flags.push(flag("INCIDENT_WITHOUT_DESCRIPTION", "blocking", "environmentContext.unusualEvent", "An incident requires a contextual description."));
  if (session.environmentContext.feedingPeriod && session.environmentContext.cleaningPeriod) flags.push(flag("CONFLICTING_CONTEXT", "warning", "environmentContext", "Feeding and cleaning are both marked active; reviewer confirmation is recommended."));
  if (options.reviewerRequiredEvidence && !session.behaviorEvents.some((event) => event.evidenceType !== "direct_observation")) flags.push(flag("MISSING_REVIEWER_REQUIRED_EVIDENCE", "error", "behaviorEvents.evidenceType", "Reviewer-requested supporting evidence is missing."));

  const duplicateKeys = new Map<string, number>();
  const codeCounts = new Map<string, number>();
  for (const event of session.behaviorEvents) {
    if (!getBehaviorCodeDefinition(event.behaviorCode)) flags.push(flag("INVALID_BEHAVIOR_CODE", "blocking", `behaviorEvents.${event.sequenceNumber}.behaviorCode`, "Behavior code is not active in the registry."));
    if (!event.confidenceLevel) flags.push(flag("MISSING_CONFIDENCE", "error", `behaviorEvents.${event.sequenceNumber}.confidenceLevel`, "Confidence level is required."));
    if (event.timestampSecond < 0 || event.timestampSecond > maximum) flags.push(flag("INVALID_TIMESTAMP", "blocking", `behaviorEvents.${event.sequenceNumber}.timestampSecond`, "Event timestamp is outside the server observation window."));
    if (event.durationSec !== undefined && event.durationSec < 0) flags.push(flag("NEGATIVE_DURATION", "blocking", `behaviorEvents.${event.sequenceNumber}.durationSec`, "Event duration cannot be negative."));
    if (event.timestampSecond + (event.durationSec ?? 0) > maximum) flags.push(flag("EVENT_OUTSIDE_SESSION", "blocking", `behaviorEvents.${event.sequenceNumber}`, "Event extends beyond the session."));
    const note = event.observerNote ?? "";
    if (subjectivePatterns.some((pattern) => pattern.test(note))) flags.push(flag("SUBJECTIVE_TERMS", "warning", `behaviorEvents.${event.sequenceNumber}.observerNote`, "Use observable language instead of subjective wording."));
    if (emotionalConclusionPatterns.some((pattern) => pattern.test(note))) flags.push(flag("UNSUPPORTED_EMOTIONAL_CONCLUSION", "warning", `behaviorEvents.${event.sequenceNumber}.observerNote`, "One signal cannot prove an emotional state."));
    const key = `${event.timestampSecond}:${event.behaviorCode}:${event.durationSec ?? "none"}`;
    duplicateKeys.set(key, (duplicateKeys.get(key) ?? 0) + 1);
    codeCounts.set(event.behaviorCode, (codeCounts.get(event.behaviorCode) ?? 0) + 1);
  }
  if ([...duplicateKeys.values()].some((count) => count > 1)) flags.push(flag("DUPLICATE_EVENT_PATTERN", "warning", "behaviorEvents", "Duplicate events are retained and flagged for review."));
  if ([...codeCounts.values()].some((count) => count > 8)) flags.push(flag("EXCESSIVE_IDENTICAL_EVENTS", "warning", "behaviorEvents", "A high number of identical behavior codes requires review."));

  const sorted = [...session.behaviorEvents].sort((a, b) => a.timestampSecond - b.timestampSecond || a.sequenceNumber - b.sequenceNumber);
  for (let index = 0; index < sorted.length - 1; index += 1) {
    const first = sorted[index];
    const second = sorted[index + 1];
    const firstEnd = first.timestampSecond + (first.durationSec ?? 0);
    if (firstEnd > second.timestampSecond && !canBehaviorEventsOverlap(first.behaviorCode, second.behaviorCode)) {
      flags.push(flag("DISALLOWED_OVERLAP", "error", "behaviorEvents", `${first.behaviorCode} and ${second.behaviorCode} cannot overlap under the current registry.`));
    }
  }

  const allNotes = `${session.generalNotes}\n${session.environmentContext.contextualNote ?? ""}`;
  if (subjectivePatterns.some((pattern) => pattern.test(allNotes))) flags.push(flag("SUBJECTIVE_TERMS", "warning", "generalNotes", "Use observable language instead of subjective wording."));
  if (emotionalConclusionPatterns.some((pattern) => pattern.test(allNotes))) flags.push(flag("UNSUPPORTED_EMOTIONAL_CONCLUSION", "warning", "generalNotes", "Do not infer an emotional state from limited evidence."));
  return flags.filter((item, index, all) => all.findIndex((candidate) => candidate.code === item.code && candidate.field === item.field) === index);
}
