import { NextResponse, type NextRequest } from "next/server";
import { getLearningModuleByCode } from "@/lib/research-license/demo-store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const learningModule = getLearningModuleByCode(code);

  if (!learningModule) {
    return NextResponse.json({ error: "Module not found." }, { status: 404 });
  }

  return NextResponse.json({ module: learningModule });
}
