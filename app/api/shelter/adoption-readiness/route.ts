import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";

export async function GET(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["shelter_staff", "admin"]);
    return NextResponse.json({ profiles: sprint10ADemoService.getReadinessDashboard(), syntheticDemo: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden" }, { status: 403 });
  }
}
