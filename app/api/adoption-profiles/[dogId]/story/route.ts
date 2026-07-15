import { NextResponse } from "next/server";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import { buildEvidenceStory } from "@/lib/adoption-profile/story-engine";

export async function GET(_request: Request, { params }: { params: Promise<{ dogId: string }> }) {
  try {
    const story = buildEvidenceStory(sprint10ADemoService.state, (await params).dogId);
    return NextResponse.json({ story, privacyFiltered: true, productionMutations: 0 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Evidence story unavailable." }, { status: 404 });
  }
}
