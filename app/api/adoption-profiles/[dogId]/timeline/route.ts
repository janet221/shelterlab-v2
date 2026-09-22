import { NextResponse } from "next/server";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import { buildEvidenceStory } from "@/lib/adoption-profile/story-engine";

export async function GET(_request: Request, { params }: { params: Promise<{ dogId: string }> }) {
  const dogId = (await params).dogId;
  if (!sprint10ADemoService.getPublicProfile(dogId)) return NextResponse.json({ error: "Profile unavailable." }, { status: 404 });
  const story = buildEvidenceStory(sprint10ADemoService.state, dogId);
  const traces = story.statements.flatMap((item) => item.traces);
  const timeline = sprint10ADemoService.getTimeline(dogId).map(({ evidenceIds, sourceVersions, ...event }) => {
    const eventTraces = traces.filter((trace) => trace.timeline.id === event.id);
    return {
      ...event,
      evidenceReferences: [...new Set(eventTraces.map((trace) => trace.evidence.reference))],
      evidenceCount: evidenceIds.length,
      sourceVersions: [...new Set(eventTraces.map((trace) => trace.evidence.sourceVersion))],
      internalSourceVersionCount: sourceVersions.length
    };
  });
  return NextResponse.json({ timeline, futureWorkflowImplemented: false, privacyFiltered: true });
}
