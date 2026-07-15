import { NextResponse, type NextRequest } from "next/server";
import { getDemoUserByTestCode } from "@/lib/auth/demo-session";
import { sprint7DemoService } from "@/lib/living-lab/demo-store";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getDemoUserByTestCode(request.headers.get("x-test-code"));
  const visibility = user && ["teacher", "shelter_staff", "admin"].includes(user.role) ? "internal" : "public";
  return NextResponse.json({ visibility, timeline: sprint7DemoService.listTimeline((await params).id, visibility) });
}
