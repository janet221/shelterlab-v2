import { describe, expect, it } from "vitest";
import { certificateStatusForScore, curriculumModules, passingScore } from "../../lib/research-license/curriculum";

describe("research license curriculum", () => {
  it("contains the five MVP curriculum modules", () => {
    expect(curriculumModules.map((module) => module.title)).toEqual([
      "Dog behavior and stress signals",
      "One Health and zoonotic disease prevention",
      "Urban ecology, population, and habitat",
      "Shelter safety rules",
      "Research ethics and data quality"
    ]);
  });

  it("requires at least 80 points for certificate eligibility", () => {
    expect(passingScore).toBe(80);
    expect(certificateStatusForScore(79)).toBe("unavailable");
    expect(certificateStatusForScore(80)).toBe("eligible");
  });
});
