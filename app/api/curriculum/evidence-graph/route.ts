import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import {
  buildCompetitionEvidenceChain,
  listAttemptsUsingQuestion,
  listDatasetsUsedByQuestion,
  listQuestionsDerivedFromResource,
  listResourcesSupportingStandard,
  listStandardsSupportingModule
} from "@/lib/competition/evidence";

export async function GET(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const search = request.nextUrl.searchParams;
    return NextResponse.json({
      chain: buildCompetitionEvidenceChain(),
      resources: search.get("standardId") ? listResourcesSupportingStandard(search.get("standardId")!) : [],
      standards: search.get("moduleCode") ? listStandardsSupportingModule(search.get("moduleCode")!) : [],
      questions: search.get("resourceId") ? listQuestionsDerivedFromResource(search.get("resourceId")!) : [],
      datasets: search.get("questionId") ? listDatasetsUsedByQuestion(search.get("questionId")!) : [],
      attempts: search.get("questionId") ? listAttemptsUsingQuestion(search.get("questionId")!) : []
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 403 });
  }
}
