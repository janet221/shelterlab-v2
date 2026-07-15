import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { applyStudentResourceAssignment } from "@/lib/curriculum-library/demo-store";

const schema = z.object({
  studentId: z.string().min(1),
  resourceId: z.string().min(1),
  moduleCode: z.enum(["DOG_BEHAVIOR", "ONE_HEALTH", "URBAN_ECOLOGY", "SHELTER_SAFETY", "RESEARCH_ETHICS"]),
  coursePlanId: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const payload = schema.parse(await request.json());
    return NextResponse.json(await applyStudentResourceAssignment(user, payload.studentId, payload.resourceId, payload.moduleCode, payload.coursePlanId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to assign student resource." }, { status: 400 });
  }
}
