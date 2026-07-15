import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { persistAuditEvent } from "@/lib/audit/persistent-audit";
import { setBehaviorCodeActive } from "@/lib/living-lab/behavior-registry";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["admin"]); const { active, reason } = z.object({ active: z.boolean(), reason: z.string().trim().min(1) }).parse(await request.json()); const { code } = await params;
    const definition = setBehaviorCodeActive(code, active);
    try { await persistAuditEvent({ actorId: user.id, actorRole: user.role, entityType: "behavior_code_definition", entityId: code, action: "behavior_code_activation_changed", changes: { active, version: definition.version }, reason, timestamp: new Date() }); }
    catch (error) { setBehaviorCodeActive(code, !active); throw error; }
    return NextResponse.json({ definition });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update behavior code." }, { status: 400 }); }
}
