import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { revokeLicense, type ResearchLicenseRecord } from "@/lib/research-license/engine";

const revokePayloadSchema = z.object({
  studentId: z.string(),
  reason: z.string().min(1)
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = requireDemoUser(request.headers.get("x-test-code"), ["admin"]);
    const { id } = await params;
    const payload = revokePayloadSchema.parse(await request.json());
    const now = new Date();
    const placeholderLicense: ResearchLicenseRecord = {
      id,
      studentId: payload.studentId,
      licenseLevel: "level_1",
      blueprintId: "blueprint_level_1_v1",
      blueprintVersion: 1,
      qualifyingAttemptId: "unknown",
      status: "active",
      issuedAt: now,
      expiresAt: now,
      certificateCode: `SL-L1-${payload.studentId}-placeholder`,
      certificateVersion: 1
    };

    return NextResponse.json(revokeLicense(actor, placeholderLicense, payload.reason, now));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to revoke license." }, { status: 400 });
  }
}
