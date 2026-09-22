import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";

const providers = [
  { key: "deterministic", mode: "LOCAL_DETERMINISTIC", enabled: true, credentialsRequired: false },
  { key: "mock-ai", mode: "LOCAL_MOCK", enabled: true, credentialsRequired: false },
  { key: "external", mode: "DISABLED_STUB", enabled: false, credentialsRequired: true }
];

export async function GET(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    return NextResponse.json({ providers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 403 });
  }
}
