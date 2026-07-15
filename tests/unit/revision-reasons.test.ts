import { describe, expect, it } from "vitest";
import { teacherRevisionReasons, validateTeacherRevisionRequest } from "../../lib/observations/revision-reasons";

describe("teacher revision reasons", () => {
  it("contains the product-approved revision reason examples", () => {
    expect(teacherRevisionReasons).toEqual([
      "missing_information",
      "incorrect_behavior_classification",
      "poor_media_quality",
      "subjective_description",
      "time_inconsistency",
      "other"
    ]);
  });

  it("requires a valid reason when requesting teacher revision", () => {
    expect(validateTeacherRevisionRequest({ reason: "subjective_description" })).toEqual({
      valid: true,
      reason: "subjective_description"
    });
    expect(validateTeacherRevisionRequest({ note: "Please rewrite this." })).toEqual({ valid: false });
  });
});
