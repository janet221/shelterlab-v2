import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { TAIWAN_COUNTIES } from "@/lib/action-opportunities/types";
import type { AnimalCase, DataLensMetadata, QuestionSet } from "./data-types";

// Fixed analysis cutoff supplied with this project's COA snapshot and analysis script.
export const COA_SNAPSHOT_DATE = "2026-09-05";
export const COA_FIELDS = ["animal_id", "animal_status", "animal_createtime", "animal_colour", "animal_bodytype", "animal_Variety", "animal_age", "animal_sex", "shelter_name", "shelter_address"];
export function parseCsv(input: string): Record<string, string>[] {
  const rows: string[][] = []; let row: string[] = [], field = "", quoted = false;
  const text = input.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === "," && !quoted) { row.push(field); field = ""; }
    else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && text[i + 1] === "\n") i++; row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (quoted) throw new Error("Unterminated COA CSV field");
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift(); if (!headers || COA_FIELDS.some(f => !headers.includes(f))) throw new Error("COA schema is incomplete");
  return rows.map(values => { if (values.length !== headers.length) throw new Error("Invalid COA row width"); return Object.fromEntries(headers.map((h, i) => [h, values[i].trim()])); });
}
export function parseDate(value: string): string | null {
  const m = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[ T].*)?$/.exec(value);
  if (!m) return null;
  const [year, month, day] = m.slice(1).map(Number); const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day ? d.toISOString().slice(0, 10) : null;
}
export function elapsedDays(value: string, cutoff = COA_SNAPSHOT_DATE): number | null {
  const date = parseDate(value); if (!date) return null;
  const days = (Date.parse(cutoff) - Date.parse(date)) / 86400000;
  return Number.isInteger(days) && days >= 0 ? days : null;
}
export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
const normalize = (s: string) => s.replaceAll("台", "臺");
export function countyOf(row: Record<string, string>) {
  return TAIWAN_COUNTIES.find(c => normalize(row.shelter_address || "").startsWith(c)) || TAIWAN_COUNTIES.find(c => normalize(row.shelter_name || "").startsWith(c)) || "未知縣市";
}
export function analyzeCoa(rows: Record<string, string>[], county: string, checksum = "") {
  const scoped = rows.filter(row => countyOf(row) === county);
  const seen = new Set<string>(); let excluded = 0;
  const animals: AnimalCase[] = [];
  for (const row of scoped) {
    if (row.animal_status !== "OPEN" || !row.animal_id || seen.has(row.animal_id)) { excluded++; continue; }
    seen.add(row.animal_id);
    animals.push({ id: row.animal_id, county, shelter: row.shelter_name || "未提供", colour: row.animal_colour || "未提供", body: row.animal_bodytype || "未提供", variety: row.animal_Variety || "未提供", age: row.animal_age || "未提供", sex: row.animal_sex || "未提供", createdDate: parseDate(row.animal_createtime), days: elapsedDays(row.animal_createtime) });
  }
  animals.sort((a, b) => a.id.localeCompare(b.id));
  const days = animals.flatMap(a => a.days === null ? [] : [a.days]);
  const metadata: DataLensMetadata = {
    name: "動物認領養 COA_OpenData.csv", agency: "農業部", url: "https://data.moa.gov.tw/open_detail.aspx?id=QcbUEzN6E6DL",
    updatedAt: scoped.map(r => parseDate(r.animal_update)).filter((s): s is string => Boolean(s)).sort().at(-1) || "未提供",
    snapshotDate: COA_SNAPSHOT_DATE, fields: COA_FIELDS, rowCount: scoped.length,
    missingValues: Object.fromEntries(COA_FIELDS.map(f => [f, scoped.filter(r => !r[f] || r[f] === "N" || (f === "animal_createtime" && elapsedDays(r[f]) === null)).length])),
    formulas: ["推定留所天數 ＝ 2026-09-05（分析截止日）－ animal_createtime（資料建立日代理值）", "中位數：有效天數排序後取中央值；偶數筆取中央兩值平均", "只納入 OPEN、具識別碼且未重複的紀錄；無效／未來日期不計入天數統計"],
    scope: `${county}，快照時標為 OPEN 的紀錄；並非目前即時待認養狀態`, checksum, excludedCount: excluded,
    canExplain: "可以比較這份快照中不同個案的資料紀錄時間與分布，提出待驗證問題。",
    cannotInfer: "資料建立日不是正式入所日，開放認養日也不是入所日；無法計算真實認養率，不能證明毛色、品種或年齡造成認養困難，也不能推論個體性格或目前仍待認養。"
  };
  return { animals, count: animals.length, validDays: days.length, medianDays: median(days), metadata };
}
export function chooseContrasts(animals: AnimalCase[]): AnimalCase[] {
  const valid = animals.filter(a => a.days !== null).sort((a, b) => a.days! - b.days! || a.id.localeCompare(b.id));
  const selected = new Map<string, AnimalCase>();
  const criteria = [(a: AnimalCase, b: AnimalCase) => a.colour !== b.colour && a.colour !== "未提供" && b.colour !== "未提供", (a: AnimalCase, b: AnimalCase) => a.body === b.body && a.body !== "未提供" && a.days !== b.days, (a: AnimalCase, b: AnimalCase) => a.age === b.age && a.age !== "未提供" && a.shelter !== b.shelter];
  // Sorted extremes prioritize visibly different records, without claiming statistical significance.
  for (const criterion of criteria) {
    if (selected.size >= 4) break;
    let pair: [AnimalCase, AnimalCase] | undefined, gap = -1;
    for (const a of valid) { const b = valid.findLast(b => b.id !== a.id && criterion(a, b)); if (b && b.days! - a.days! > gap) { pair = [a, b]; gap = b.days! - a.days!; } }
    if (pair) for (const a of pair) if (selected.size < 4) selected.set(a.id, a);
  }
  if (selected.size < 2) for (const a of [valid[0], valid.at(-1)]) if (a) selected.set(a.id, a);
  return [...selected.values()];
}
let cached: Promise<{ rows: Record<string, string>[]; checksum: string }> | undefined;
export function loadCoa() {
  return cached ??= readFile(path.join(process.cwd(), "COA_OpenData.csv"), "utf8").then(text => ({ rows: parseCsv(text), checksum: createHash("sha256").update(text).digest("hex") })).catch(error => { cached = undefined; throw error; });
}
export async function countyData(county: string) { const { rows, checksum } = await loadCoa(); return analyzeCoa(rows, county, checksum); }
export function buildQuestionSet(data: ReturnType<typeof analyzeCoa>, week: number, county: string): QuestionSet {
  const cases = chooseContrasts(data.animals), focus = ["毛色", "體型", "品種標籤", "性別", "年齡", "多重變項與行動"][(week - 1) % 6];
  const fact = `本縣市納入 ${data.count} 筆，其中 ${data.validDays} 筆有有效日期；推定留所天數中位數為 ${data.medianDays === null ? "無法計算" : data.medianDays + " 天"}。`;
  return { version: 1, week, county, cases, count: data.count, validDays: data.validDays, medianDays: data.medianDays, metadata: data.metadata, wordingSource: "template",
    comparisonNote: cases.length < 2 ? "本縣市不足兩筆有效個案，暫不生成比較題；請檢查來源資料。" : "系統刻意挑選差異個案，並非隨機抽樣，也不是已證實的因果對照實驗。",
    questions: [
      { id: "compare", focus, fact, prompt: `比較至少兩個個案。${focus}與紀錄天數有什麼不同？請指出你引用的個案和資料。` },
      { id: "limits", focus, fact: "目前以資料建立日期作為入所日期代理值。", prompt: "這個日期能代表真正入所日嗎？若紀錄延遲或缺漏，會如何影響你的比較？" },
      { id: "causality", focus, fact: "對照案例不是隨機抽樣；資料沒有完整記錄所有影響認養的條件。", prompt: `僅憑${focus}是否足以解釋天數差異？提出其他可能未記錄的變項，以及可以如何查證。` }
    ] };
}
