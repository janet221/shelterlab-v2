import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { getActiveDemoLicense } from "@/lib/research-license/demo-store";

export async function GET(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    return NextResponse.json({ license: getActiveDemoLicense(user.id) ?? null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 403 });
  }
}
