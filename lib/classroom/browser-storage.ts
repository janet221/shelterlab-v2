"use client";
let scope = "";
export const EVALUATOR_UNLOCK_STORAGE_KEY = "shelterlab-evaluator-preview-unlocked-v1";
export type EvaluatorDemoStatus = "in_progress" | "returned" | "pending" | "completed";
export type EvaluatorDemoState = { status: EvaluatorDemoStatus; feedback?: string; updatedAt: string };
const EVALUATOR_AUDIT_STORAGE_KEY = "shelterlab-evaluator-audit-cycle-v1";
const EVALUATOR_DRAFT_SNAPSHOT_KEY = "shelterlab-evaluator-draft-snapshots-v1";
const EVALUATOR_PREVIEW_REWARD_KEY = "shelterlab-evaluator-preview-reward-v1";
export function isEvaluatorPreviewUnlocked() { return typeof window !== "undefined" && window.sessionStorage.getItem(EVALUATOR_UNLOCK_STORAGE_KEY) === "true"; }
export function setEvaluatorPreviewUnlocked(unlocked: boolean) {
  if (typeof window === "undefined") return;
  if (unlocked) window.sessionStorage.setItem(EVALUATOR_UNLOCK_STORAGE_KEY, "true");
  else window.sessionStorage.removeItem(EVALUATOR_UNLOCK_STORAGE_KEY);
}
export function evaluatorDemoStates(): Partial<Record<number, EvaluatorDemoState>> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.sessionStorage.getItem(EVALUATOR_AUDIT_STORAGE_KEY) ?? "{}"); } catch { return {}; }
}
export function evaluatorDemoState(week: number) { return evaluatorDemoStates()[week]; }
export function setEvaluatorDemoState(week: number, state: EvaluatorDemoState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(EVALUATOR_AUDIT_STORAGE_KEY, JSON.stringify({ ...evaluatorDemoStates(), [week]: state }));
  window.dispatchEvent(new Event("shelterlab-evaluator-demo"));
}
export function clearEvaluatorDemoStates() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(EVALUATOR_AUDIT_STORAGE_KEY);
  window.dispatchEvent(new Event("shelterlab-evaluator-demo"));
}
export function evaluatorPreviewReward() {
  if (typeof window === "undefined") return null;
  const week = Number(window.sessionStorage.getItem(EVALUATOR_PREVIEW_REWARD_KEY));
  return Number.isInteger(week) && week >= 1 && week <= 6 ? week : null;
}
export function setEvaluatorPreviewReward(week: number | null) {
  if (typeof window === "undefined") return;
  if (week === null) window.sessionStorage.removeItem(EVALUATOR_PREVIEW_REWARD_KEY);
  else window.sessionStorage.setItem(EVALUATOR_PREVIEW_REWARD_KEY, String(week));
}
export function setLearningStorageScope(accountId: string) { scope = `shelterlab-classroom:${accountId}:`; }
export function clearLearningDrafts() {
  if (!scope) return;
  for (let i = localStorage.length - 1; i >= 0; i--) { const key = localStorage.key(i); if (key?.startsWith(scope)) localStorage.removeItem(key); }
}
const WEEK_DRAFT_KEYS: Record<number, string[]> = {
  2: ["shelterlab-week2-v3"],
  3: ["shelterlab-week3-v2"],
  4: ["shelterlab-week4-v1"],
  5: ["shelterlab-week5-v1"],
  6: ["shelterlab-week6-action-draft-v2"]
};
type EvaluatorDraftSnapshots = Partial<Record<number, Record<string, string | null>>>;
function evaluatorDraftKeys(accountId: string, week: number) {
  const keys = week === 1
    ? [`shelterlab-classroom:${accountId}:shelterlab-learning-progress-v2`]
    : (WEEK_DRAFT_KEYS[week] ?? []);
  keys.push(`shelterlab-classroom:${accountId}:shelterlab-week-game-audit-v1:${week}`);
  return keys;
}
export function snapshotEvaluatorLearningDrafts(accountId: string, week: number) {
  if (typeof window === "undefined") return;
  let snapshots: EvaluatorDraftSnapshots = {};
  try { snapshots = JSON.parse(window.sessionStorage.getItem(EVALUATOR_DRAFT_SNAPSHOT_KEY) ?? "{}"); } catch {}
  if (snapshots[week]) return;
  snapshots[week] = Object.fromEntries(evaluatorDraftKeys(accountId, week).map((key) => [key, window.localStorage.getItem(key)]));
  window.sessionStorage.setItem(EVALUATOR_DRAFT_SNAPSHOT_KEY, JSON.stringify(snapshots));
}
export function clearEvaluatorLearningDrafts(accountId: string, week: number) {
  if (typeof window === "undefined") return;
  for (const key of evaluatorDraftKeys(accountId, week)) window.localStorage.removeItem(key);
}
export function restoreEvaluatorLearningDrafts(accountId: string, week?: number) {
  if (typeof window === "undefined") return false;
  let snapshots: EvaluatorDraftSnapshots = {};
  try { snapshots = JSON.parse(window.sessionStorage.getItem(EVALUATOR_DRAFT_SNAPSHOT_KEY) ?? "{}"); } catch {}
  const weeks = week ? [week] : Object.keys(snapshots).map(Number);
  let restored = false;
  for (const targetWeek of weeks) {
    const snapshot = snapshots[targetWeek];
    if (!snapshot) continue;
    for (const [key, value] of Object.entries(snapshot)) {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    }
    delete snapshots[targetWeek];
    restored = true;
  }
  if (Object.keys(snapshots).length) window.sessionStorage.setItem(EVALUATOR_DRAFT_SNAPSHOT_KEY, JSON.stringify(snapshots));
  else window.sessionStorage.removeItem(EVALUATOR_DRAFT_SNAPSHOT_KEY);
  return restored;
}
export function clearLearningDraftsFromWeek(startWeek: number) {
  if (!scope) return;
  const firstWeek = Math.min(6, Math.max(1, Math.trunc(startWeek)));
  for (let week = firstWeek; week <= 6; week += 1) {
    localStorage.removeItem(`${scope}shelterlab-week-game-audit-v1:${week}`);
    for (const key of WEEK_DRAFT_KEYS[week] ?? []) localStorage.removeItem(key);
  }
  if (firstWeek === 1) localStorage.removeItem(`${scope}shelterlab-learning-progress-v2`);
}
export const learningStorage = {
  getItem(key: string) { return scope ? localStorage.getItem(scope + key) : null; },
  setItem(key: string, value: string) { if (scope) localStorage.setItem(scope + key, value); },
  removeItem(key: string) { if (scope) localStorage.removeItem(scope + key); }
};
