import type { LearningStandardSeed } from "../research-license/phase2-data";

export type OfficialStandardEvidence = Pick<
  LearningStandardSeed,
  | "learningContentCode"
  | "learningContentText"
  | "learningPerformanceCode"
  | "learningPerformanceText"
  | "coreCompetencyCode"
  | "coreCompetencyText"
  | "sourceAgency"
  | "sourceUrl"
  | "version"
>;

export function canMarkLearningStandardOfficial(evidence: OfficialStandardEvidence): boolean {
  const values = [
    evidence.learningContentCode,
    evidence.learningContentText,
    evidence.learningPerformanceCode,
    evidence.learningPerformanceText,
    evidence.coreCompetencyCode,
    evidence.coreCompetencyText,
    evidence.sourceAgency,
    evidence.sourceUrl,
    evidence.version
  ];
  if (values.some((value) => !value.trim() || value === "UNVERIFIED" || value.includes("TO_BE_VERIFIED"))) return false;
  if ([evidence.learningContentCode, evidence.learningPerformanceCode, evidence.coreCompetencyCode].some((code) => code.startsWith("DEMO-"))) return false;
  if (!/^https:\/\//.test(evidence.sourceUrl)) return false;
  return true;
}
