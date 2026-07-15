import { describe, expect, it } from "vitest";
import { buildSprint10ADemo } from "../../lib/adoption-profile/demo-data";
import { buildEvidenceStory } from "../../lib/adoption-profile/story-engine";
import { evidenceStoryStages } from "../../lib/adoption-profile/story-types";

describe("Sprint 10B Evidence Story Engine", () => {
  it("expands every published profile statement into the complete five-stage trace", () => {
    const service = buildSprint10ADemo();
    const profile = service.getPublicProfile("DOG-TPE-001")!;
    const story = buildEvidenceStory(service.state, "DOG-TPE-001");
    const statementCount = Object.values(profile.sections).flat().length;
    expect(story.statements).toHaveLength(statementCount);
    expect(story.statements.every((item) => item.traces.length > 0)).toBe(true);
    expect(story.statements.flatMap((item) => item.traces).every((trace) =>
      trace.stageOrder.join("|") === evidenceStoryStages.join("|") &&
      trace.evidence.reference &&
      trace.timeline.state === "evidence" &&
      trace.reviewer.publicReference &&
      trace.publication.status === "published" &&
      trace.publication.shelterApproved
    )).toBe(true);
  });

  it("explains why every profile unknown is unknown and names missing evidence", () => {
    const service = buildSprint10ADemo();
    const profile = service.getPublicProfile("DOG-TPE-001")!;
    const story = buildEvidenceStory(service.state, "DOG-TPE-001");
    expect(story.unknowns.map((item) => item.field)).toEqual(profile.unknownInformation);
    expect(story.unknowns.every((item) =>
      item.value === "UNKNOWN" &&
      item.whyUnknown.trim().length > 0 &&
      item.missingEvidence.length > 0 &&
      item.missingEvidence.every((missing) => missing.category && missing.description)
    )).toBe(true);
  });

  it("shows only missing evidence categories and never recommends adoption", () => {
    const story = buildEvidenceStory(buildSprint10ADemo().state, "DOG-TPE-001");
    expect(story.gaps.map((item) => item.code)).toEqual([
      "walking_observation",
      "video",
      "photo",
      "repeated_observation"
    ]);
    expect(story.gaps.every((item) => item.action === "COLLECT_MORE_EVIDENCE" && item.requiredEvidence)).toBe(true);
    expect(JSON.stringify(story.gaps)).not.toMatch(/recommend adoption|adoption probability|temperament|personality/i);
  });

  it("rejects a story when published evidence is not linked to its timeline event", () => {
    const service = buildSprint10ADemo();
    service.state.timeline = service.state.timeline.filter((item) => item.id !== "timeline_observation_DOG-TPE-001");
    expect(() => buildEvidenceStory(service.state, "DOG-TPE-001")).toThrow("not linked to a published timeline event");
  });

  it("uses NOT_APPLICABLE instead of fabricating observations for non-observation evidence", () => {
    const story = buildEvidenceStory(buildSprint10ADemo().state, "DOG-TPE-001");
    const traces = story.statements.flatMap((item) => item.traces);
    const intake = traces.find((trace) => trace.evidence.evidenceType === "shelter_intake")!;
    const observation = traces.find((trace) => trace.evidence.evidenceType === "observation")!;
    expect(intake.observation).toMatchObject({ status: "not_applicable", value: "NOT_APPLICABLE" });
    expect(observation.observation).toMatchObject({ status: "recorded", behaviorCode: "LOOK_AT_HUMAN" });
  });

  it("returns a privacy-filtered public projection without learner or internal workflow identifiers", () => {
    const story = buildEvidenceStory(buildSprint10ADemo().state, "DOG-TPE-001");
    const serialized = JSON.stringify(story);
    expect(serialized).not.toContain("student_demo_001");
    expect(serialized).not.toContain("publication_session_mission");
    expect(serialized).not.toContain("review_teacher_session");
    expect(serialized).not.toContain("GREEN_OBSERVATION");
    expect(serialized).not.toMatch(/incident[_ -]?detail|private[_ -]?zone/i);
    expect(story.readOnly).toBe(true);
    expect(story.aiGenerated).toBe(false);
  });
});
