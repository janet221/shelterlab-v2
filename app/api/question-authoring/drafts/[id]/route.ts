import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyEditDraft } from "@/lib/curriculum-library/demo-store";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const { id } = await context.params;
    return NextResponse.json(await applyEditDraft(user, id, await request.json()));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to edit question draft." }, { status: 400 });
  }
}
