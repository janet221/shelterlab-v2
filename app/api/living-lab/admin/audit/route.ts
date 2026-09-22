import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { sprint7DemoService } from "@/lib/living-lab/demo-store";
export async function GET(request: NextRequest) {
  try { requireDemoUser(request.headers.get("x-test-code"), ["admin"]); return NextResponse.json({ auditEvents: sprint7DemoService.state.auditEvents }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden." }, { status: 403 }); }
}
