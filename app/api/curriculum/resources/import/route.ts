import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { runMockImport } from "@/lib/curriculum-library/demo-store";

const schema = z.object({ provider: z.enum(["ilearn", "government_dataset", "manual_teacher"]) });

export async function POST(request: NextRequest) {
  try {
    const user = requireDemoUser(request.headers.get("x-test-code"), ["admin"]);
    const payload = schema.parse(await request.json());
    return NextResponse.json({ summary: await runMockImport(user, payload.provider) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to import resources." }, { status: 400 });
  }
}
