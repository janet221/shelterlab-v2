import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET as getProfile } from "../../app/api/adoption-profiles/[dogId]/route";
import { GET as getEvidence } from "../../app/api/adoption-profiles/[dogId]/evidence/route";
import { GET as getTimeline } from "../../app/api/adoption-profiles/[dogId]/timeline/route";
import { GET as getCompleteness } from "../../app/api/adoption-profiles/[dogId]/completeness/route";
import { GET as getReadiness } from "../../app/api/shelter/adoption-readiness/route";

const context = { params: Promise.resolve({ dogId: "DOG-TPE-001" }) };

describe("Sprint 10A adoption profile API integration", () => {
  it("serves a public shelter-approved profile without AI or probability output", async () => {
    const response = await getProfile(new Request("http://localhost/api/adoption-profiles/DOG-TPE-001"), context);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.profile.status).toBe("published");
    expect(body.profile.syntheticDemo).toBe(true);
    expect(body.adoptionProbabilityCalculated).toBe(false);
    expect(body.aiGenerated).toBe(false);
    expect(body.privacyFiltered).toBe(true);
    expect(JSON.stringify(body)).not.toContain("student_demo_001");
    expect(JSON.stringify(body)).not.toContain("publication_session_mission");
    expect(JSON.stringify(body)).not.toContain("shelter_staff_demo_001");
  });

  it("exposes read-only evidence, timeline, and transparent completeness", async () => {
    const [evidenceResponse, timelineResponse, scoreResponse] = await Promise.all([
      getEvidence(new Request("http://localhost/api/adoption-profiles/DOG-TPE-001/evidence"), context),
      getTimeline(new Request("http://localhost/api/adoption-profiles/DOG-TPE-001/timeline"), context),
      getCompleteness(new Request("http://localhost/api/adoption-profiles/DOG-TPE-001/completeness"), context)
    ]);
    const evidence = await evidenceResponse.json();
    const timeline = await timelineResponse.json();
    const score = await scoreResponse.json();
    expect(evidence.readOnly).toBe(true);
    expect(evidence.evidenceCards.length).toBeGreaterThan(0);
    expect(timeline.futureWorkflowImplemented).toBe(false);
    expect(timeline.timeline.some((item: { state: string }) => item.state === "future_placeholder")).toBe(true);
    expect(score.score.dimensions).toHaveLength(9);
    expect(evidence.evidenceCards.every((item: { reviewer: string }) => !item.reviewer.includes("demo_"))).toBe(true);
    expect(timeline.privacyFiltered).toBe(true);
    expect(score.privacyFiltered).toBe(true);
    expect(JSON.stringify({ evidence, timeline, score })).not.toContain("session_mission");
  });

  it("protects the shelter readiness dashboard at the backend boundary", async () => {
    const denied = await getReadiness(new NextRequest("http://localhost/api/shelter/adoption-readiness"));
    const allowed = await getReadiness(new NextRequest("http://localhost/api/shelter/adoption-readiness", {
      headers: { "x-test-code": "SHF-TEST-001" }
    }));
    expect(denied.status).toBe(403);
    expect(allowed.status).toBe(200);
    expect((await allowed.json()).profiles[0]).toMatchObject({ dogId: "DOG-TPE-001", syntheticDemo: true });
  });

  it("returns not found for a dog without a published profile", async () => {
    const response = await getProfile(new Request("http://localhost/api/adoption-profiles/UNKNOWN"), {
      params: Promise.resolve({ dogId: "UNKNOWN" })
    });
    expect(response.status).toBe(404);
  });
});
