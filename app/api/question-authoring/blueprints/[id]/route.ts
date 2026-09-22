import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyEditQuestionBlueprint } from "@/lib/curriculum-library/demo-store";

const schema = z.object({
  reason: z.string().trim().min(1),
  blueprint: z.unknown()
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const { id } = await context.params;
    const payload = schema.parse(await request.json());
    return NextResponse.json(await applyEditQuestionBlueprint(user, id, payload.blueprint, payload.reason));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to edit blueprint." }, { status: 400 });
  }
}
