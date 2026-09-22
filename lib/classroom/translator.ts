import type { QuestionSet } from "./data-types";

const wording = {
  compare: ["請挑選至少兩個案例，說明你從表格看見的相同與不同，並指出使用了哪些紀錄。", "如果同學只看其中一個案例，他可能忽略什麼？請用至少兩筆紀錄來比較。"],
  limits: ["這份資料沒有正式入所日。把資料建立日當成代理值，可能讓我們看漏什麼？", "如果某筆資料晚了才建立，天數比較會受到什麼影響？還需要查證什麼？"],
  causality: ["這些差異就能證明因果關係嗎？試著提出其他可能影響結果、但表格沒有記錄的條件。", "若要驗證自己的解釋，你還需要哪些資料？如何避免把相關當成因果？"]
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
