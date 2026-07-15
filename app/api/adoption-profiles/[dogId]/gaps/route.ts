import { NextResponse } from "next/server";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import { buildEvidenceStory } from "@/lib/adoption-profile/story-engine";

export async function GET(_request: Request, { params }: { params: Promise<{ dogId: string }> }) {
  try {
    const story = buildEvidenceStory(sprint10ADemoService.state, (await params).dogId);
    return NextResponse.json({ gaps: story.gaps, unknowns: story.unknowns, fabricatedInformation: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Evidence gaps unavailable." }, { status: 404 });
  }
}
