import type { WeekAuditEntry } from "./data-types";

export type QuestionReviewComments = Record<string, string>;

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
    "回答有直接回應題目，並清楚指出犬隻角色、需求或照護責任。",
    "能引用題目提供的觀察或資料作為依據，而不只陳述個人感想。",
    "能區分資料支持的現象與仍需查證的原因，避免把相關性直接寫成因果。",
    "文字能呈現對動物福祉與人類責任的具體理解。"
  ],
  2: [
    "描述具體可觀察的現象，避免只用籠統或帶評價的形容詞。",
    "推論有對應的觀察證據，並能說明證據與判斷之間的關係。",
    "有辨認資料不足、例外情況或需要繼續蒐集的資訊。",
    "回答用語尊重個體差異，不以單一特徵替動物貼標籤。"
  ],
  3: [
    "分類依據明確且前後一致，讀者能理解如何判斷。",
    "能用題目資料支持分類，而不是憑直覺選擇答案。",
    "有處理不確定、重疊或無法分類的情況。",
    "結論沒有超出目前資料可以支持的範圍。"
  ],
  4: [
    "有辨識資料來源、發布者與資料產生方式。",
    "能檢查資料時間、範圍、缺漏與可能限制。",
    "能比較不同來源是否互相支持或存在差異。",
    "引用資料後的結論保持可追溯，沒有加入來源未提供的事實。"
  ],
  5: [
    "能呈現至少一個與自身不同的利害關係人觀點。",
    "各觀點的需求、風險與責任有具體證據支持。",
    "能辨認觀點之間的衝突或可協調之處。",
    "提出的判斷兼顧動物福祉、公共安全與執行可行性。"
  ],
  6: [
    "行動建議與前面蒐集的資料或觀察結果有清楚連結。",
    "有交代執行者、步驟、所需資源與可檢核的完成條件。",
    "有考量學生安全、動物福祉、隱私與聯絡單位規範。",
    "能說明行動限制、備援方式或後續如何追蹤成效。"
  ]
};

export function gradingGuidelines(week: number, entry?: Pick<WeekAuditEntry, "prompt">) {
  const weeklyGuidelines = WEEK_GUIDELINES[week] ?? WEEK_GUIDELINES[1];
  if (!entry) return weeklyGuidelines;
  const prompt = entry.prompt.replace(/\s+/g, " ").trim().slice(0, 80);
  return [
    `確認學生的回答有直接回應「${prompt}」，且意思清楚、前後一致。`,
    ...weeklyGuidelines.slice(1)
  ];
}

export function parseQuestionReviewComments(value: string | null | undefined): QuestionReviewComments {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as { version?: unknown; questionComments?: unknown };
    if (parsed.version !== 1 || !parsed.questionComments || typeof parsed.questionComments !== "object") return {};
    return Object.fromEntries(Object.entries(parsed.questionComments).flatMap(([id, comment]) =>
      typeof comment === "string" && comment.trim() ? [[id, comment.slice(0, 500)]] : []
    ));
  } catch {
    return {};
  }
}

export function serializeQuestionReviewComments(comments: QuestionReviewComments) {
  const questionComments = Object.fromEntries(Object.entries(comments).flatMap(([id, comment]) => {
    const normalized = comment.trim().slice(0, 500);
    return normalized ? [[id, normalized]] : [];
  }));
  return JSON.stringify({ version: 1, questionComments });
}
