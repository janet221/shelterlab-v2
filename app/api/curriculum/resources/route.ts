import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { getTeacherResources } from "@/lib/curriculum-library/demo-store";

export async function GET(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    return NextResponse.json({ resources: getTeacherResources() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 403 });
  }
}
