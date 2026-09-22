import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyArchiveDraft } from "@/lib/curriculum-library/demo-store";

const schema = z.object({ reason: z.string().trim().min(1) });

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const { id } = await context.params;
    const { reason } = schema.parse(await request.json());
    return NextResponse.json(await applyArchiveDraft(user, id, reason));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to archive question draft." }, { status: 400 });
  }
}
