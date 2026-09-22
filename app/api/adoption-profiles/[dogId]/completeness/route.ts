import { NextResponse } from "next/server";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";

export async function GET(_request: Request, { params }: { params: Promise<{ dogId: string }> }) {
  const score = sprint10ADemoService.getCompleteness((await params).dogId);
  if (!score) return NextResponse.json({ error: "Score unavailable." }, { status: 404 });
  return NextResponse.json({
    score: {
      ...score,
      dimensions: score.dimensions.map(({ evidenceIds, ...dimension }) => ({ ...dimension, evidenceCount: evidenceIds.length }))
    },
    privacyFiltered: true
  });
}
