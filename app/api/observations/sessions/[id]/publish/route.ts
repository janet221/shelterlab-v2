import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { persistAuditEvents } from "@/lib/audit/persistent-audit";
import { publishDemoObservationSession } from "@/lib/observations/demo-store";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const user = requireDemoUser(request.headers.get("x-test-code"), ["shelter_staff", "admin"]); const result = publishDemoObservationSession(user, (await params).id); await persistAuditEvents(result.auditEvents); return NextResponse.json(result); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to publish." }, { status: 400 }); }
}
