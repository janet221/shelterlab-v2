import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { getTraceability } from "@/lib/curriculum-library/demo-store";

export async function GET(request: NextRequest, context: { params: Promise<{ resourceId: string }> }) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const params = await context.params;
    return NextResponse.json({ traceability: getTraceability(params.resourceId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build traceability." }, { status: 400 });
  }
}
