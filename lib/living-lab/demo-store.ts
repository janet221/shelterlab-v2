import type { EngineUser } from "../research-license/engine";
import { persistAuditEvents } from "../audit/persistent-audit";
import { livingLabDemoActors, sprint7DemoService } from "./demo-data";
import type { AuditEvent } from "../research-license/engine";
import type { LivingLabActor, LivingLabState } from "./types";

export function asLivingLabActor(user: EngineUser): LivingLabActor {
  if (user.id === livingLabDemoActors.teacher.id) return livingLabDemoActors.teacher;
  if (user.id === livingLabDemoActors.shelter.id) return livingLabDemoActors.shelter;
  if (user.id === livingLabDemoActors.admin.id) return livingLabDemoActors.admin;
  return { id: user.id, role: user.role, authorizedCoursePlanIds: user.authorizedCoursePlanIds };
}

function snapshotState(state: LivingLabState): LivingLabState {
  return {
    missions: new Map(structuredClone([...state.missions.entries()])),
    sessions: new Map(structuredClone([...state.sessions.entries()])),
    reviews: structuredClone(state.reviews), publications: structuredClone(state.publications), timeline: structuredClone(state.timeline),
    profiles: structuredClone(state.profiles), mediaAssets: structuredClone(state.mediaAssets), auditEvents: structuredClone(state.auditEvents),
    licenses: structuredClone(state.licenses), idempotency: new Map(state.idempotency)
  };
}

function restoreState(target: LivingLabState, backup: LivingLabState) {
  target.missions = backup.missions;
  target.sessions = backup.sessions;
  target.reviews = backup.reviews;
  target.publications = backup.publications;
  target.timeline = backup.timeline;
  target.profiles = backup.profiles;
  target.mediaAssets = backup.mediaAssets;
  target.auditEvents = backup.auditEvents;
  target.licenses = backup.licenses;
  target.idempotency = backup.idempotency;
}

export async function runAuditedLivingLabMutation<T extends { auditEvents: AuditEvent[] }>(mutation: () => T): Promise<T> {
  const backup = snapshotState(sprint7DemoService.state);
  try {
    const result = mutation();
    if (result.auditEvents.length > 0) await persistAuditEvents(result.auditEvents);
    return result;
  } catch (error) {
    const failureAuditEvents = typeof error === "object" && error !== null && "auditEvents" in error && Array.isArray(error.auditEvents)
      ? error.auditEvents as AuditEvent[]
      : [];
    restoreState(sprint7DemoService.state, backup);
    if (failureAuditEvents.length > 0) {
      await persistAuditEvents(failureAuditEvents);
      sprint7DemoService.state.auditEvents.push(...failureAuditEvents);
    }
    throw error;
  }
}

export { sprint7DemoService };
