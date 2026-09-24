import type { WeekAuditEntry } from "./data-types";

export type QuestionReviewComments = Record<string, string>;
export type ReviewDecision = "approve" | "reject";
export type StudentReviewFeedback = {
  decision: ReviewDecision;
  items: Array<{ entryId: string; section: string; prompt: string; comment: string }>;
};

export function isGradableAuditEntry(entry: WeekAuditEntry) {
  const excludedLabel = `${entry.section} ${entry.prompt}`;
  return entry.answered &&
    entry.answers.length > 0 &&
    entry.kind !== "action" &&
    !excludedLabel.includes("互動題目") &&
    !excludedLabel.includes("影像觀察站");
}

const WEEK_GUIDELINES: Record<number, string[]> = {
  1: [
    "角色、需求與照護責任清楚。",
    "以題目資料支持判斷。",
    "區分現象、推論與待查資訊。",
    "兼顧動物福祉與人類責任。"
  ],
  2: [
    "描述具體可觀察的現象。",
    "推論有對應證據。",
    "指出資料不足或例外。",
    "尊重個體差異，避免貼標籤。"
  ],
  3: [
    "分類依據明確且一致。",
    "分類有資料支持。",
    "處理不確定或重疊情況。",
    "結論未超出資料範圍。"
  ],
  4: [
    "辨識來源與發布者。",
    "檢查時間、範圍與缺漏。",
    "比較來源間的支持或差異。",
    "結論可回溯至資料。"
  ],
  5: [
    "呈現不同利害關係人觀點。",
    "需求、風險與責任有依據。",
    "指出衝突或協調空間。",
    "兼顧福祉、安全與可行性。"
  ],
  6: [
    "行動與資料或觀察相連。",
    "執行者、步驟與完成條件清楚。",
    "兼顧安全、福祉與隱私。",
    "說明限制、備援或追蹤方式。"
  ]
};

export function gradingGuidelines(week: number, entry?: Pick<WeekAuditEntry, "prompt">) {
  const weeklyGuidelines = WEEK_GUIDELINES[week] ?? WEEK_GUIDELINES[1];
  if (!entry) return weeklyGuidelines;
  const prompt = entry.prompt.replace(/\s+/g, " ").trim().slice(0, 80);
  return [
    `直接回應「${prompt}」。`,
    ...weeklyGuidelines.slice(1)
  ];
}

export function parseQuestionReviewComments(value: string | null | undefined): QuestionReviewComments {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as { version?: unknown; questionComments?: unknown };
    if (![1, 2].includes(Number(parsed.version)) || !parsed.questionComments || typeof parsed.questionComments !== "object") return {};
    return Object.fromEntries(Object.entries(parsed.questionComments).flatMap(([id, comment]) =>
      typeof comment === "string" && comment.trim() ? [[id, comment.slice(0, 500)]] : []
    ));
  } catch {
    return {};
  }
}

export function serializeQuestionReviewComments(comments: QuestionReviewComments, entries: WeekAuditEntry[] = [], decision: ReviewDecision = "approve") {
  const questionComments = Object.fromEntries(Object.entries(comments).flatMap(([id, comment]) => {
    const normalized = comment.trim().slice(0, 500);
    return normalized ? [[id, normalized]] : [];
  }));
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const items = Object.entries(questionComments).flatMap(([entryId, comment]) => {
    const entry = entryById.get(entryId);
    return entry ? [{ entryId, section: entry.section, prompt: entry.prompt, comment }] : [];
  });
  return JSON.stringify({ version: 2, decision, questionComments, items });
}

export function parseStudentReviewFeedback(value: string | null | undefined): StudentReviewFeedback | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { version?: unknown; decision?: unknown; items?: unknown };
    if (parsed.version !== 2 || (parsed.decision !== "approve" && parsed.decision !== "reject") || !Array.isArray(parsed.items)) return null;
    const items = parsed.items.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const source = item as Record<string, unknown>;
      if ([source.entryId, source.section, source.prompt, source.comment].some((field) => typeof field !== "string")) return [];
      return [{ entryId: String(source.entryId), section: String(source.section), prompt: String(source.prompt), comment: String(source.comment) }];
    });
    return { decision: parsed.decision, items };
  } catch {
    return null;
  }
}
