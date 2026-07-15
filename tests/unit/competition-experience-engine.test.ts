import { describe, expect, it } from "vitest";
import {
  advanceCompetitionExperience,
  beginGuidedCompetitionExperience,
  competitionExperienceSteps,
  createCompetitionExperienceState,
  getCompetitionExperienceManifest,
  resetCompetitionExperienceState,
  setCompetitionTimerStatus,
  tickCompetitionTimer
} from "@/lib/competition-experience/engine";
import { COMPETITION_DEMO_DURATION_SEC } from "@/lib/competition-experience/types";

describe("Sprint 11A competition experience engine", () => {
  it("defines the approved seven-step journey and six guided product scenes", () => {
    expect(competitionExperienceSteps).toHaveLength(7);
    expect(competitionExperienceSteps.map((step) => step.title)).toEqual([
      "ShelterLab 總覽",
      "研究觀察資格",
      "300 秒非接觸觀察",
      "證據時間軸",
      "犬隻證據檔案",
      "One Health 探究",
      "影響力儀表板"
    ]);
    expect(competitionExperienceSteps.reduce((total, step) => total + step.allocatedSec, 0)).toBe(420);
  });

  it("exposes unique presentation deep links and implemented target pages", () => {
    const deepLinks = competitionExperienceSteps.map((step) => step.deepLink);
    expect(new Set(deepLinks).size).toBe(competitionExperienceSteps.length);
    expect(deepLinks.every((link) => link.startsWith("/competition/judge/"))).toBe(true);
    expect(competitionExperienceSteps.every((step) => step.targetHref.startsWith("/"))).toBe(true);
  });

  it("creates and restores one canonical read-only synthetic state", () => {
    const canonical = createCompetitionExperienceState();
    const changed = advanceCompetitionExperience(beginGuidedCompetitionExperience(canonical));
    expect(changed).not.toEqual(canonical);
    expect(resetCompetitionExperienceState()).toEqual(canonical);
    expect(canonical).toMatchObject({
      syntheticDemo: true,
      readOnly: true,
      productionMutationCount: 0,
      elapsedSec: 0,
      timerStatus: "idle"
    });
  });

  it("caps the presentation timer at seven minutes", () => {
    const running = setCompetitionTimerStatus(createCompetitionExperienceState(), "running");
    const complete = tickCompetitionTimer(running, COMPETITION_DEMO_DURATION_SEC + 20);
    expect(complete.elapsedSec).toBe(420);
    expect(complete.timerStatus).toBe("complete");
    expect(tickCompetitionTimer(complete, 1)).toEqual(complete);
  });

  it("publishes a zero-mutation manifest", () => {
    expect(getCompetitionExperienceManifest()).toMatchObject({
      readOnly: true,
      syntheticDemo: true,
      productionMutationCount: 0,
      durationSec: 420
    });
  });
});
