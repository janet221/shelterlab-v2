import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET as listMissions, POST as createMission } from "../../app/api/living-lab/missions/route";
import { GET as getDogTimeline } from "../../app/api/living-lab/dogs/[id]/timeline/route";

describe("Living Lab API boundary integration", () => {
  it("requires a demo identity to list missions", async () => {
    const response = await listMissions(new NextRequest("http://localhost/api/living-lab/missions"));
    expect(response.status).toBe(403);
  });

  it("returns only student-available missions inside the requested window", async () => {
    const request = new NextRequest(
      "http://localhost/api/living-lab/missions?at=2026-07-12T05:30:00.000Z",
      { headers: { "x-test-code": "STU-TEST-001" } }
    );
    const response = await listMissions(request);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.missions).toHaveLength(1);
    expect(body.missions[0]).toMatchObject({
      id: "mission_synthetic_available_001",
      status: "available",
      syntheticDemo: true
    });
  });

  it("rejects an invalid mission date query through Zod", async () => {
    const request = new NextRequest("http://localhost/api/living-lab/missions?at=not-a-date", {
      headers: { "x-test-code": "STU-TEST-001" }
    });
    const response = await listMissions(request);
    expect(response.status).toBe(400);
  });

  it("rejects malformed teacher mission input through Zod before mutation", async () => {
    const request = new NextRequest("http://localhost/api/living-lab/missions", {
      method: "POST",
      headers: { "content-type": "application/json", "x-test-code": "TEA-TEST-001" },
      body: JSON.stringify({ title: "missing required mission fields" })
    });
    const response = await createMission(request);
    expect(response.status).toBe(400);
  });

  it("keeps unauthenticated dog timeline output on the public boundary", async () => {
    const response = await getDogTimeline(
      new NextRequest("http://localhost/api/living-lab/dogs/DOG-TPE-001/timeline"),
      { params: Promise.resolve({ id: "DOG-TPE-001" }) }
    );
    const body = await response.json();
    expect(body.visibility).toBe("public");
    expect(body.timeline.length).toBeGreaterThan(0);
    expect(body.timeline.every((entry: { visibility: string }) => entry.visibility === "public")).toBe(true);
    expect(JSON.stringify(body)).not.toContain("student_demo_001");
    expect(JSON.stringify(body)).not.toContain("GREEN_OBSERVATION");
  });
});
