import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { listTodayObservationTasks } from "@/lib/observations/demo-store";

export async function GET(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["student"]);
    return NextResponse.json({ tasks: listTodayObservationTasks(user) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 403 });
  }
}
