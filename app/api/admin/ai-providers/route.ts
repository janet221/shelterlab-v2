import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({
  providerKey: z.enum(["deterministic", "mock-ai", "external"]),
  enabled: z.boolean(),
  mode: z.enum(["LOCAL_DETERMINISTIC", "LOCAL_MOCK", "DISABLED_STUB", "EXTERNAL_CONFIGURED"]),
  reason: z.string().trim().min(1),
  correlationId: z.string().trim().min(1)
});

export async function PATCH(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["admin"]);
    const payload = schema.parse(await request.json());
    if (payload.providerKey === "external" && payload.enabled) throw new Error("External providers remain disabled until credentials, privacy, and evaluation approval exist.");
    const provider = await prisma.$transaction(async (tx) => {
      const updated = await tx.aIProviderConfiguration.upsert({
        where: { providerKey: payload.providerKey },
        update: { enabled: payload.enabled, mode: payload.mode, updatedById: user.id },
        create: { providerKey: payload.providerKey, displayName: payload.providerKey, enabled: payload.enabled, mode: payload.mode, updatedById: user.id }
      });
      await tx.auditLog.create({ data: { actorId: user.id, actorRole: user.role, entityType: "ai_provider_configuration", entityId: updated.id, action: "provider_configuration_changed", newState: { providerKey: updated.providerKey, mode: updated.mode, enabled: updated.enabled } as Prisma.InputJsonValue, reason: payload.reason, correlationId: payload.correlationId } });
      return updated;
    });
    return NextResponse.json({ provider });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to configure provider." }, { status: 400 });
  }
}
