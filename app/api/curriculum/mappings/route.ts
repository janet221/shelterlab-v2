import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyResourceMapping } from "@/lib/curriculum-library/demo-store";

const schema = z.object({
  resourceId: z.string().min(1),
  targetType: z.enum(["module", "standard", "quiz_blueprint", "course_week", "question"]),
  targetId: z.string().min(1),
  requiredOrOptional: z.enum(["required", "optional"]),
  displayOrder: z.number().int().nonnegative(),
  teacherNote: z.string().optional(),
  startTimeSec: z.number().int().nonnegative().optional(),
  endTimeSec: z.number().int().nonnegative().optional(),
  remediationPriority: z.number().int().nonnegative(),
  mappingStatus: z.enum(["draft", "active", "archived"])
});

export async function POST(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const mapping = schema.parse(await request.json());
    return NextResponse.json(await applyResourceMapping(user, mapping));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save resource mapping." }, { status: 400 });
  }
}
