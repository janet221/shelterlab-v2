export type DataLensMetadata = {
  name: string; agency: string; url: string; updatedAt: string; snapshotDate: string;
  fields: string[]; rowCount: number; missingValues: Record<string, number>; formulas: string[];
  canExplain: string; cannotInfer: string; scope: string; checksum?: string; excludedCount?: number;
};
export type AnimalCase = { id: string; county: string; shelter: string; colour: string; body: string; variety: string; age: string; sex: string; createdDate: string | null; days: number | null };
export type EvidenceQuestion = { id: string; prompt: string; fact: string; focus: string };
export type QuestionSet = {
  version: 1; week: number; county: string; cases: AnimalCase[]; questions: EvidenceQuestion[];
  metadata: DataLensMetadata; count: number; validDays: number; medianDays: number | null;
  comparisonNote: string; wordingSource: "template" | "constrained_ai";
};
export type SubmittedAnswer = { questionId: string; text: string; selectedAnimalIds: string[] };
