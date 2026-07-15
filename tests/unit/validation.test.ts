import { describe, expect, it } from "vitest";
import {
  maxObservationDurationSec,
  validateObservationDeterministically
} from "../../lib/observations/validation";

const baseInput = {
  dogId: "DOG-TPE-001",
  observerId: "STU-TEST-001",
  timestamp: new Date("2026-01-01T00:00:00.000Z"),
  behaviorCode: "BARK",
  durationSec: 60,
  context: "\u6838\u51c6\u89c0\u5bdf\u5340 A, dog stands and looks toward the hallway.",
  notes: "Observation distance is about 3 meters.",
  incidentFlag: false
};

describe("validateObservationDeterministically", () => {
  it("accepts objective observation input without flags", () => {
    const flags = validateObservationDeterministically(baseInput);

    expect(flags).toEqual([]);
  });

  it("allows observations up to exactly 300 seconds", () => {
    const flags = validateObservationDeterministically({
      ...baseInput,
      durationSec: maxObservationDurationSec
    });

    expect(flags).toEqual([]);
  });

  it("rejects observations longer than 300 seconds", () => {
    const flags = validateObservationDeterministically({
      ...baseInput,
      durationSec: maxObservationDurationSec + 1
    });

    expect(flags).toContainEqual(
      expect.objectContaining({
        code: "INVALID_DURATION_TOO_LONG",
        field: "durationSec",
        severity: "error"
      })
    );
  });

  it("flags invalid duration, empty context, invalid behavior, subjective notes, and duplicate media", () => {
    const flags = validateObservationDeterministically(
      {
        ...baseInput,
        behaviorCode: "CUTE",
        durationSec: -1,
        context: " ",
        notes: "\u4e00\u76f4\u53eb, \u5f88\u53ef\u611b.",
      },
      {
        backendMediaChecksum: "sha256-duplicate",
        existingMediaChecksums: new Set(["sha256-duplicate"])
      }
    );

    expect(flags.map((flag) => flag.code)).toEqual(
      expect.arrayContaining([
        "INVALID_BEHAVIOR_CODE",
        "INVALID_DURATION_NEGATIVE",
        "CONTEXT_REQUIRED",
        "SUBJECTIVE_LANGUAGE",
        "DUPLICATE_MEDIA_CHECKSUM"
      ])
    );
    expect(flags).toContainEqual(
      expect.objectContaining({
        code: "DUPLICATE_MEDIA_CHECKSUM",
        field: "media_checksum"
      })
    );
  });

  it("does not trust a client-provided media_checksum for duplicate checks", () => {
    const clientInputWithChecksum = {
      ...baseInput,
      media_checksum: "sha256-duplicate"
    };

    const flags = validateObservationDeterministically(clientInputWithChecksum, {
      existingMediaChecksums: new Set(["sha256-duplicate"])
    });

    expect(flags.map((flag) => flag.code)).not.toContain("DUPLICATE_MEDIA_CHECKSUM");
  });
});
