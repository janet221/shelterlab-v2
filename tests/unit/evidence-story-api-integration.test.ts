import { describe, expect, it } from "vitest";
import { GET as getStory } from "../../app/api/adoption-profiles/[dogId]/story/route";
import { GET as getGaps } from "../../app/api/adoption-profiles/[dogId]/gaps/route";

const context = { params: Promise.resolve({ dogId: "DOG-TPE-001" }) };

describe("Sprint 10B public story API", () => {
  it("serves the read-only privacy-filtered story", async () => {
    const response = await getStory(new Request("http://localhost/api/adoption-profiles/DOG-TPE-001/story"), context);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.privacyFiltered).toBe(true);
    expect(body.productionMutations).toBe(0);
    expect(body.story.version).toBe("SL-EVIDENCE-STORY-1");
    expect(body.story.statements.length).toBeGreaterThan(0);
    expect(JSON.stringify(body)).not.toContain("student_demo_001");
    expect(JSON.stringify(body)).not.toContain("publication_session_mission");
  });

  it("serves unknown explanations and missing categories without fabrication", async () => {
    const response = await getGaps(new Request("http://localhost/api/adoption-profiles/DOG-TPE-001/gaps"), context);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.fabricatedInformation).toBe(false);
    expect(body.gaps.every((item: { action: string }) => item.action === "COLLECT_MORE_EVIDENCE")).toBe(true);
    expect(body.unknowns.every((item: { value: string; whyUnknown: string; missingEvidence: unknown[] }) => item.value === "UNKNOWN" && item.whyUnknown && item.missingEvidence.length)).toBe(true);
  });

  it("returns not found when no published story exists", async () => {
    const response = await getStory(new Request("http://localhost/api/adoption-profiles/UNKNOWN/story"), {
      params: Promise.resolve({ dogId: "UNKNOWN" })
    });
    expect(response.status).toBe(404);
  });
});
