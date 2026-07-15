import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { competitionExperienceSteps, isCompetitionStepId } from "@/lib/competition-experience/engine";
import { JudgeExperience } from "../judge-experience";

export const metadata: Metadata = {
  title: "評審導覽章節",
  description: "ShelterLab 七分鐘評審導覽的深層連結章節。"
};

export function generateStaticParams() {
  return competitionExperienceSteps.map((step) => ({ step: step.id }));
}

export default async function JudgeStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!isCompetitionStepId(step)) notFound();
  return <JudgeExperience initialStepId={step} />;
}
