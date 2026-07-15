import type { Metadata } from "next";
import { JudgeExperience } from "./judge-experience";

export const metadata: Metadata = {
  title: "評審導覽",
  description: "七分鐘唯讀導覽，展示 ShelterLab 的教育、證據鏈、One Health 與影響力。"
};

export default function JudgeLandingPage() {
  return <JudgeExperience initialStepId="overview" />;
}
