import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { addQuestionBlueprint, getCurriculumStoreSnapshot } from "@/lib/curriculum-library/demo-store";

export async function GET(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    return NextResponse.json({ blueprints: getCurriculumStoreSnapshot().blueprints });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    return NextResponse.json({ blueprint: await addQuestionBlueprint(user, await request.json()) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create blueprint." }, { status: 400 });
  }
}
