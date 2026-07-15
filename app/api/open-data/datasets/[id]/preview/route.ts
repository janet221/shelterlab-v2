import { NextResponse, type NextRequest } from "next/server";
import { requireDemoUser } from "@/lib/auth/demo-session";
import { createDatasetAdapter } from "@/lib/government-data/adapters";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireDemoUser(request.headers.get("x-test-code"), ["teacher", "admin"]);
    const { id } = await params;
    const adapter = createDatasetAdapter(id);
    const preview = await adapter.preview();
    if (preview.datasetId !== id) {
      return NextResponse.json({ error: "Dataset adapter is not configured for this ID." }, { status: 404 });
    }
    return NextResponse.json({ preview });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to preview dataset." }, { status: 400 });
  }
}
