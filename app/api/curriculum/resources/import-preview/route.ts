import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { getImportPreview } from "@/lib/curriculum-library/demo-store";

const schema = z.object({ provider: z.enum(["ilearn", "government_dataset", "manual_teacher"]) });

export async function POST(request: NextRequest) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const payload = schema.parse(await request.json());
    return NextResponse.json({ preview: getImportPreview(payload.provider) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to preview import." }, { status: 400 });
  }
}
