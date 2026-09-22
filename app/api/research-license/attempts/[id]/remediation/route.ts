import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { getDemoAttempt } from "@/lib/research-license/demo-store";
import { phase4CurriculumResources } from "@/lib/curriculum-library/phase4-data";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    const { id } = await params;
    const attempt = getDemoAttempt(id);
    if (!attempt || attempt.studentId !== user.id || attempt.status === "in_progress") {
      return NextResponse.json({ error: "Submitted attempt not found." }, { status: 404 });
    }
    const recommendations = attempt.remediationRecommendations.flatMap((recommendation) => {
      const resource = phase4CurriculumResources.find((item) => item.id === recommendation.resourceId);
      if (!resource || resource.verificationStatus !== "approved_for_course" || resource.availabilityStatus !== "active") return [];
      return [{ ...recommendation, resource: { id: resource.id, title: resource.title, sourceAgency: resource.sourceAgency ?? resource.providerName, sourceUrl: resource.sourceUrl, verificationState: resource.evidenceVerificationState } }];
    });
    return NextResponse.json({ attemptId: attempt.id, threshold: 80, recommendations });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 403 });
  }
}
