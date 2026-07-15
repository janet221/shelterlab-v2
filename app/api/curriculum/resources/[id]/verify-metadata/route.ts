import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyMetadataVerification } from "@/lib/curriculum-library/demo-store";

const schema = z.object({
  note: z.string().trim().min(1),
  officialSourceVerified: z.boolean().default(false),
  accessMethodVerified: z.boolean().default(false),
  reuseTermsVerified: z.boolean().default(false),
  outboundLinkOnly: z.boolean().default(true)
});

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const payload = schema.parse(await request.json());
    const params = await context.params;
    return NextResponse.json(await applyMetadataVerification(user, params.id, payload));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to verify metadata." }, { status: 400 });
  }
}
