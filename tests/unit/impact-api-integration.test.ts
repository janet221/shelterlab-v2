import { describe, expect, it } from "vitest";
import { GET as getImpact } from "@/app/api/competition/impact/route";
import { GET as getDemoManifest } from "@/app/api/competition/demo/route";

describe("Sprint 8 judge API integration", () => {
  it("returns a read-only deterministic impact payload", async () => {
    const response = await getImpact();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ readOnly: true, externalApiCalled: false, aiGeneratedMetrics: false });
    expect(body.snapshot.metrics.length).toBeGreaterThan(20);
    expect(body.scorecard.dimensions).toHaveLength(7);
  });

  it("returns a zero-mutation complete demo manifest", async () => {
    const response = await getDemoManifest();
    const body = await response.json();
    expect(body.readOnly).toBe(true);
    expect(body.productionMutationCount).toBe(0);
    expect(body.steps.at(-1).id).toBe("impact");
  });
});

