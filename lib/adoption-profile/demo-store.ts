import { persistAuditEvents } from "../audit/persistent-audit";
import type { AuditEvent } from "../research-license/engine";
import { sprint10ADemoService } from "./demo-data";
import type { AdoptionProfileState } from "./types";

function snapshot(state: AdoptionProfileState): AdoptionProfileState {
  return {
    facts: new Map(structuredClone([...state.facts.entries()])),
    evidence: structuredClone(state.evidence),
    profiles: structuredClone(state.profiles),
    evidenceCards: structuredClone(state.evidenceCards),
    completenessScores: structuredClone(state.completenessScores),
    gapAssessments: structuredClone(state.gapAssessments),
    timeline: structuredClone(state.timeline),
    auditEvents: structuredClone(state.auditEvents)
  };
}

export async function runAuditedAdoptionProfileMutation<T extends { auditEvents: AuditEvent[] }>(mutation: () => T): Promise<T> {
  const backup = snapshot(sprint10ADemoService.state);
  try {
    const result = mutation();
    if (result.auditEvents.length) await persistAuditEvents(result.auditEvents);
    return result;
  } catch (error) {
    Object.assign(sprint10ADemoService.state, backup);
    throw error;
  }
}

export { sprint10ADemoService };
