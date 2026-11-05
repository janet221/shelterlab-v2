import type { QuestionSet } from "./data-types";

const wording = {
  compare: ["請挑選至少兩個案例，說明表格中呈現的相同與差異，並指出使用的紀錄。", "若僅檢視其中一個案例，可能忽略哪些資訊？請至少使用兩筆紀錄進行比較。"],
  limits: ["這份資料未提供正式入所日。將資料建立日作為代理值，可能遺漏哪些資訊？", "若部分紀錄延後建立，天數比較將受到何種影響？尚須查證哪些資料？"],
  causality: ["這些差異是否足以證明因果關係？請提出其他可能影響結果、但表格未記錄的條件。", "若要驗證此項解釋，尚須取得哪些資料？應如何避免將相關性誤認為因果關係？"]
} as const;
export function applyTranslationChoices(set: QuestionSet, choices: unknown): QuestionSet {
  if (!choices || typeof choices !== "object" || Array.isArray(choices)) return set;
  const value = choices as Record<string, unknown>;
  if (Object.keys(value).length !== 3 || Object.keys(wording).some(k => value[k] !== 0 && value[k] !== 1)) return set;
  return { ...set, wordingSource: "constrained_ai", questions: set.questions.map(q => ({ ...q, prompt: wording[q.id as keyof typeof wording][value[q.id] as 0 | 1] })) };
}
// A configured gateway may select vetted high-school wording only. It cannot return
// numbers, formulas, source URLs, facts or arbitrary prose to the student interface.
export async function translateQuestions(set: QuestionSet): Promise<QuestionSet> {
  const endpoint = process.env.QUESTION_TRANSLATOR_URL;
  if (!endpoint || new URL(endpoint).protocol !== "https:") return set;
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", ...(process.env.QUESTION_TRANSLATOR_TOKEN ? { Authorization: `Bearer ${process.env.QUESTION_TRANSLATOR_TOKEN}` } : {}) },
      body: JSON.stringify({ instruction: "Select a 0 or 1 wording index for each question appropriate for high-school students. Return only {compare,limits,causality}. Never create facts or numeric values.", facts: set.questions.map(q => ({ id: q.id, fact: q.fact, focus: q.focus })), options: wording }), signal: AbortSignal.timeout(5000), cache: "no-store" });
    if (!response.ok) return set;
    return applyTranslationChoices(set, await response.json());
  } catch { return set; }
}
