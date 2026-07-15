import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { prisma } from "@/lib/db/prisma";
import { evidenceVerificationStates } from "@/lib/government-data/evidence-types";

const schema = z.object({
  verificationState: z.enum(evidenceVerificationStates),
  licenseNote: z.string().trim().min(1),
  attributionText: z.string().trim().min(1),
  schemaVersion: z.string().trim().min(1),
  active: z.boolean(),
  reason: z.string().trim().min(1),
  correlationId: z.string().trim().min(1)
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["admin"]);
    const { id } = await params;
    const payload = schema.parse(await request.json());
    const current = await prisma.governmentDataset.findUnique({ where: { datasetId: id } });
    if (!current) return NextResponse.json({ error: "Dataset not found." }, { status: 404 });
    if (["UNVERIFIED", "UNAVAILABLE", "DEMO_REFERENCE"].includes(payload.verificationState) && payload.active) {
      throw new Error("Unverified, unavailable, or demo-reference datasets cannot be activated.");
    }
    if (payload.verificationState === "SYNTHETIC_DEMO" && !id.startsWith("SYNTHETIC_")) {
      throw new Error("Only explicitly synthetic dataset identifiers may use SYNTHETIC_DEMO.");
    }
    const next = await prisma.$transaction(async (tx) => {
      const updated = await tx.governmentDataset.update({
        where: { datasetId: id },
        data: {
          verificationState: payload.verificationState,
          licenseNote: payload.licenseNote,
          attributionText: payload.attributionText,
          schemaVersion: payload.schemaVersion,
          active: payload.active,
          lastCheckedAt: new Date()
        }
      });
      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorRole: user.role,
          entityType: "government_dataset",
          entityId: id,
          action: "dataset_verification_changed",
          previousState: { verificationState: current.verificationState, active: current.active } as Prisma.InputJsonValue,
          newState: { verificationState: updated.verificationState, active: updated.active } as Prisma.InputJsonValue,
          changes: { licenseNote: payload.licenseNote, attributionText: payload.attributionText, schemaVersion: payload.schemaVersion } as Prisma.InputJsonValue,
          reason: payload.reason,
          correlationId: payload.correlationId
        }
      });
      return updated;
    });
    return NextResponse.json({ dataset: next });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update dataset." }, { status: 400 });
  }
}
