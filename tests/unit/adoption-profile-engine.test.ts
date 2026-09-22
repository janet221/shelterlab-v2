import { describe, expect, it } from "vitest";
import { AdoptionProfileService } from "../../lib/adoption-profile/engine";
import { buildSprint10ADemo } from "../../lib/adoption-profile/demo-data";
import type { PublishedAdoptionEvidence } from "../../lib/adoption-profile/types";
import { completenessDimensions, gapCodes } from "../../lib/adoption-profile/types";
import { livingLabDemoActors } from "../../lib/living-lab/demo-data";

const now = new Date("2026-07-13T05:00:00.000Z");

describe("Sprint 10A evidence-based adoption profile", () => {
  it("calculates a transparent nine-dimension completeness score between 0 and 100", () => {
    const service = buildSprint10ADemo();
    const score = service.getCompleteness("DOG-TPE-001")!;
    expect(score.dimensions.map((item) => item.dimension)).toEqual(completenessDimensions);
    expect(score.dimensions).toHaveLength(9);
    expect(score.dimensions.every((item) => item.formula && item.denominator > 0)).toBe(true);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(score.formula).toBe("arithmetic_mean_of_nine_dimensions");
    expect(score.version).toBe("SL-ADOPTION-COMPLETE-1");
  });

  it("keeps unknown information explicit and never calculates adoption probability", () => {
    const profile = buildSprint10ADemo().getPublicProfile("DOG-TPE-001")!;
    expect(profile.sections.unknown_information[0].text).toContain("UNKNOWN");
    expect(profile.sections.not_yet_tested[0].text).toContain("尚未觀察");
    expect(profile.aiGenerated).toBe(false);
    expect("adoptionProbability" in profile).toBe(false);
    expect(JSON.stringify(profile)).not.toMatch(/personality|suitable|recommended adopter/i);
  });

  it("requires shelter-approved published evidence for every statement", () => {
    const service = new AdoptionProfileService({
      facts: new Map([["DOG-EMPTY", {
        dogId: "DOG-EMPTY",
        shelterId: "SHELTER_TPE_001",
        publicName: "UNKNOWN",
        sex: "unknown",
        ageBand: "unknown",
        adoptionStatus: "unknown"
      }]])
    });
    expect(() => service.publishProfile(livingLabDemoActors.shelter, "DOG-EMPTY", now)).toThrow("published evidence");
  });

  it("preserves conflicting observations as separate evidence and statements", () => {
    const service = buildSprint10ADemo();
    const original = service.state.evidence.find((item) => item.evidenceType === "observation")!;
    const conflicting: PublishedAdoptionEvidence = {
      ...structuredClone(original),
      id: "adoption_evidence_observation_conflict",
      sourceEntityId: "publication_conflicting_context",
      timelineEntryId: "timeline_observation_DOG-TPE-001",
      observation: {
        behaviorCode: "LOOK_AWAY",
        durationSec: 4,
        observedValue: "LOOK_AWAY observed for 4 seconds."
      },
      context: "Separate published observation with a different visible response."
    };
    service.state.evidence.push(conflicting);
    const result = service.publishProfile(livingLabDemoActors.shelter, "DOG-TPE-001", now);
    expect(result.evidenceCards.map((item) => item.observation)).toEqual(expect.arrayContaining([
      original.observation!.observedValue,
      conflicting.observation!.observedValue
    ]));
    expect(result.profile.sections.observed_behaviors.some((item) => item.evidenceIds.includes(conflicting.id))).toBe(true);
  });

  it("allows only authorized shelter staff or admin to publish", () => {
    expect(() => buildSprint10ADemo().publishProfile(livingLabDemoActors.student, "DOG-TPE-001", now)).toThrow("Shelter approval");
    expect(() => buildSprint10ADemo().publishProfile({ id: "wrong-shelter", role: "shelter_staff", authorizedShelterIds: ["OTHER"] }, "DOG-TPE-001", now)).toThrow("scope");
    expect(buildSprint10ADemo().publishProfile(livingLabDemoActors.admin, "DOG-TPE-001", now).profile.status).toBe("published");
  });

  it("returns traceable evidence cards and current/future timeline states", () => {
    const service = buildSprint10ADemo();
    const cards = service.getEvidenceCards("DOG-TPE-001");
    const timeline = service.getTimeline("DOG-TPE-001");
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.every((card) => card.evidenceSource && card.sourceVersion && card.reviewer && card.context && card.timelineEntryId)).toBe(true);
    expect(cards.every((card) => timeline.some((event) => event.id === card.timelineEntryId))).toBe(true);
    expect(timeline.find((event) => event.eventType === "health_check")?.state).toBe("not_recorded");
    expect(timeline.find((event) => event.eventType === "teacher_approval")?.reviewerRoles).toEqual(["teacher"]);
    expect(timeline.find((event) => event.eventType === "shelter_confirmation")?.reviewerRoles).toEqual(["shelter_staff"]);
    expect(timeline.map((event) => event.eventType)).toEqual([
      "shelter_intake", "health_check", "observation", "teacher_approval", "shelter_confirmation", "publication", "profile_update",
      "foster", "one_day_outing", "trial_adoption", "formal_adoption", "returned"
    ]);
    expect(timeline.filter((event) => ["foster", "one_day_outing", "trial_adoption", "formal_adoption", "returned"].includes(event.eventType)).every((event) => event.state === "future_placeholder")).toBe(true);
  });

  it("detects the seven governed gaps and offers only evidence collection", () => {
    const gaps = buildSprint10ADemo().getGaps("DOG-TPE-001")!;
    expect(gaps.gaps.map((item) => item.code)).toEqual(gapCodes);
    expect(gaps.gaps.every((item) => item.action === "COLLECT_MORE_EVIDENCE")).toBe(true);
    expect(gaps.gaps.find((item) => item.code === "video")?.missing).toBe(true);
    expect(gaps.gaps.find((item) => item.code === "shelter_confirmation")?.missing).toBe(false);
  });

  it("labels demo output and audits profile, score, and gap publication", () => {
    const service = buildSprint10ADemo();
    expect(service.getPublicProfile("DOG-TPE-001")?.syntheticDemo).toBe(true);
    expect(service.getEvidenceCards("DOG-TPE-001").every((item) => item.syntheticDemo && item.verification === "SYNTHETIC_DEMO")).toBe(true);
    expect(service.state.auditEvents.map((item) => item.action)).toEqual(expect.arrayContaining([
      "adoption_profile_published",
      "evidence_completeness_calculated",
      "profile_gaps_assessed"
    ]));
  });
});
