import { NextResponse } from "next/server";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";

export async function GET(_request: Request, { params }: { params: Promise<{ dogId: string }> }) {
  const dogId = (await params).dogId;
  if (!sprint10ADemoService.getPublicProfile(dogId)) return NextResponse.json({ error: "Profile unavailable." }, { status: 404 });
  return NextResponse.json({ evidenceCards: sprint10ADemoService.getEvidenceCards(dogId), readOnly: true, aiGenerated: false });
}
