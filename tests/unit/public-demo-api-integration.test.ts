import { describe, expect, it } from "vitest";
import * as publicDemoRoute from "@/app/api/public-demo/route";

describe("Sprint 11C public demo API", () => {
  it("exposes GET only", async () => {
    const response = await publicDemoRoute.GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ version: "SL-PUBLIC-DEMO-1", readOnly: true, productionMutationCount: 0 });
    expect(body.accounts).toHaveLength(4);
    expect("POST" in publicDemoRoute).toBe(false);
  });
});
