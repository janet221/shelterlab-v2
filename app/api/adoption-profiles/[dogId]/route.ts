import { NextResponse } from "next/server";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import { buildEvidenceStory } from "@/lib/adoption-profile/story-engine";
import { profileSections } from "@/lib/adoption-profile/types";

export async function GET(_request: Request, { params }: { params: Promise<{ dogId: string }> }) {
  const dogId = (await params).dogId;
  const profile = sprint10ADemoService.getPublicProfile(dogId);
  if (!profile) return NextResponse.json({ error: "No shelter-approved published adoption profile." }, { status: 404 });
  const story = buildEvidenceStory(sprint10ADemoService.state, dogId);
  const publicSections = Object.fromEntries(profileSections.map((section) => [section, story.statements.filter((item) => item.section === section).map((item) => ({
    id: item.statementId,
    section: item.section,
    text: item.statement,
    evidenceReferences: [...new Set(item.traces.map((trace) => trace.evidence.reference))],
    timelineEntryIds: [...new Set(item.traces.map((trace) => trace.timeline.id))],
    reviewerReferences: [...new Set(item.traces.map((trace) => trace.reviewer.publicReference))],
    verificationStates: [...new Set(item.traces.map((trace) => trace.evidence.verification))]
  }))]));
  const completeness = sprint10ADemoService.getCompleteness(dogId)!;
  return NextResponse.json({
    profile: {
      id: profile.id,
      dogId: profile.dogId,
      version: profile.version,
      status: profile.status,
      sections: publicSections,
      evidenceCardIds: profile.evidenceCardIds,
      unknownInformation: profile.unknownInformation,
      notYetTested: profile.notYetTested,
      latestEvidenceAt: profile.latestEvidenceAt,
      publishedAt: profile.publishedAt,
      generationMethod: profile.generationMethod,
      aiGenerated: profile.aiGenerated,
      syntheticDemo: profile.syntheticDemo
    },
    completeness: {
      ...completeness,
      dimensions: completeness.dimensions.map(({ evidenceIds, ...dimension }) => ({ ...dimension, evidenceCount: evidenceIds.length }))
    },
    gaps: story.gaps,
    adoptionProbabilityCalculated: false,
    aiGenerated: false,
    privacyFiltered: true
  });
}
