import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyPublishDraft } from "@/lib/curriculum-library/demo-store";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const params = await context.params;
    return NextResponse.json(await applyPublishDraft(user, params.id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to publish draft." }, { status: 400 });
  }
}
