import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET as listProjects } from "@/app/api/inquiries/projects/route";
import { GET as getReport } from "@/app/api/inquiries/projects/[id]/report/route";

describe("Sprint 9A inquiry API integration", () => {
  it("requires demo authentication for the project list", async () => {
    const denied = await listProjects(new NextRequest("http://localhost/api/inquiries/projects"));
    expect(denied.status).toBe(403);
    const allowed = await listProjects(new NextRequest("http://localhost/api/inquiries/projects", {
      headers: { "x-test-code": "STU-TEST-001" }
    }));
    const body = await allowed.json();
    expect(allowed.status).toBe(200);
    expect(body.projects.length).toBeGreaterThanOrEqual(4);
    expect(body.projects.every((item: { syntheticDemo: boolean }) => item.syntheticDemo)).toBe(true);
  });

  it("serves only the public-safe final report without authentication", async () => {
    const request = new NextRequest("http://localhost/api/inquiries/projects/inquiry_synthetic_41236_complete/report?view=public");
    const response = await getReport(request, { params: Promise.resolve({ id: "inquiry_synthetic_41236_complete" }) });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.publicView).toBe(true);
    expect(body.report.publicSafe).toBe(true);
    expect(body.report.sections).toHaveLength(21);
    expect(body.report.syntheticDemo).toBe(true);
  });

  it("protects the internal evidence report", async () => {
    const request = new NextRequest("http://localhost/api/inquiries/projects/inquiry_synthetic_41236_complete/report?view=internal");
    const response = await getReport(request, { params: Promise.resolve({ id: "inquiry_synthetic_41236_complete" }) });
    expect(response.status).toBe(404);
  });
});
