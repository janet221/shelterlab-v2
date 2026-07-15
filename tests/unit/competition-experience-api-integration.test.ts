import { describe, expect, it } from "vitest";
import * as experienceRoute from "@/app/api/competition/experience/route";

describe("Sprint 11A competition experience API", () => {
  it("returns only the deterministic read-only presentation contract", async () => {
    const response = await experienceRoute.GET();
    const body = await response.json();
    const serialized = JSON.stringify(body);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      version: "SL-COMPETITION-EXPERIENCE-1",
      readOnly: true,
      syntheticDemo: true,
      productionMutationCount: 0,
      durationSec: 420
    });
    expect(body.steps).toHaveLength(7);
    expect(serialized).not.toContain("studentId");
    expect(serialized).not.toContain("reviewerId");
    expect(serialized).not.toContain("mediaUrl");
    expect("POST" in experienceRoute).toBe(false);
  });
});
