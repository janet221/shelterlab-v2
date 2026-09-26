"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { api } from "@/app/_components/classroom-ui";
import type { WeekAuditEntry, WeekGameAudit } from "@/lib/classroom/data-types";
import { learningStorage } from "@/lib/classroom/browser-storage";
import { parseStudentReviewFeedback } from "@/lib/classroom/review-guidelines";

const AUDIT_KEY_PREFIX = "shelterlab-week-game-audit-v1";
const WEEK_STATE_KEYS: Record<number, string[]> = {
  1: ["shelterlab-learning-progress-v2"],
  2: ["shelterlab-week2-v3"],
  3: ["shelterlab-week3-v2"],
  4: ["shelterlab-week4-v1"],
  5: ["shelterlab-week5-v1"],
  6: ["shelterlab-week6-action-draft-v2"]
};

type StoredAudit = Omit<WeekGameAudit, "completed" | "completedAt"> & {
  completed: boolean;
  completedAt: string;
};

function compact(value: string | null | undefined, fallback = "未命名題目") {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  return (normalized || fallback).slice(0, 500);
}

function auditKey(accountId: string, week: number) {
  return `shelterlab-classroom:${accountId}:${AUDIT_KEY_PREFIX}:${week}`;
}

function emptyAudit(week: number): StoredAudit {
  return { version: 1, week, completed: false, completedAt: "", entries: [], gameState: {} };
}

function readAudit(accountId: string, week: number): StoredAudit {
  try {
    const parsed = JSON.parse(localStorage.getItem(auditKey(accountId, week)) ?? "null") as Partial<StoredAudit> | null;
    if (parsed?.version === 1 && parsed.week === week && Array.isArray(parsed.entries)) {
      return { ...emptyAudit(week), ...parsed, entries: parsed.entries.slice(0, 500) as WeekAuditEntry[] };
    }
  } catch {}
  return emptyAudit(week);
}

function writeAudit(accountId: string, audit: StoredAudit) {
  try { localStorage.setItem(auditKey(accountId, audit.week), JSON.stringify(audit)); } catch {}
}

function readGameState(week: number) {
  const result: Record<string, unknown> = {};
  for (const key of WEEK_STATE_KEYS[week] ?? []) {
    try {
      const raw = week === 1 ? learningStorage.getItem(key) : localStorage.getItem(key);
      if (raw) result[key] = JSON.parse(raw);
    } catch {}
  }
  return result;
}

function nearestHeading(element: Element | null) {
  const scope = element?.closest("fieldset, article, section, label, [role='group']");
  const heading = scope?.querySelector(":scope > legend, :scope > h2, :scope > h3, :scope > h4, :scope > span, :scope > p");
  return compact(heading?.textContent, "互動題目");
}

function sectionName(element: Element | null) {
  const stage = element?.closest("[class*='stagePaper'], [class*='stageCard'], [class*='stageShell']");
  const stageLabel = stage?.querySelector("[class*='stageLabel']");
  if (stageLabel?.textContent) return compact(stageLabel.textContent, "本週關卡");
  const section = element?.closest("section, article");
  const heading = section?.querySelector("h2, h3, [class*='stageLabel'], small");
  return compact(heading?.textContent, "本週關卡");
}

function auditSurface(element: Element | null) {
  return element?.closest("[class*='stagePaper'], [class*='stageCard'], [class*='stageShell']");
}

function entryId(kind: WeekAuditEntry["kind"], section: string, prompt: string) {
  return `${kind}:${section}:${prompt}`.slice(0, 700);
}

function upsert(accountId: string, week: number, entry: WeekAuditEntry) {
  const audit = readAudit(accountId, week);
  const existingIndex = audit.entries.findIndex((item) => item.id === entry.id);
  if (existingIndex >= 0) {
    const existing = audit.entries[existingIndex];
    audit.entries[existingIndex] = entry.kind === "choice" || entry.kind === "action"
      ? { ...entry, answers: Array.from(new Set([...existing.answers, ...entry.answers])).slice(-30) }
      : entry;
  } else {
    audit.entries.push(entry);
  }
  audit.gameState = readGameState(week);
  writeAudit(accountId, audit);
}

function registerUnanswered(accountId: string, week: number, root: HTMLElement) {
  root.querySelectorAll("[class*='stagePaper'] fieldset, [class*='stagePaper'] textarea, [class*='stagePaper'] select, [class*='stagePaper'] input[type='checkbox'], [class*='stagePaper'] input[type='radio'], [class*='stagePaper'] button[aria-pressed], [class*='stageCard'] fieldset, [class*='stageCard'] textarea, [class*='stageCard'] select, [class*='stageCard'] input[type='checkbox'], [class*='stageCard'] input[type='radio'], [class*='stageCard'] button[aria-pressed]").forEach((element) => {
    const kind: WeekAuditEntry["kind"] = element instanceof HTMLTextAreaElement ? "text"
      : element instanceof HTMLSelectElement ? "select"
        : element instanceof HTMLInputElement ? "checkbox" : "choice";
    const section = sectionName(element);
    const prompt = element instanceof HTMLFieldSetElement
      ? compact(element.querySelector("legend")?.textContent, nearestHeading(element))
      : nearestHeading(element);
    const id = entryId(kind, section, prompt);
    if (kind === "text") {
      element.setAttribute("data-audit-entry-id", id);
      element.setAttribute("data-revision-answer", "true");
    }
    const current = readAudit(accountId, week);
    if (!current.entries.some((entry) => entry.id === id)) {
      upsert(accountId, week, { id, section, prompt, kind, answers: [], answered: false, updatedAt: new Date().toISOString() });
    }
  });
}

function capture(accountId: string, week: number, target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return;
  if (!auditSurface(target)) return;
  const section = sectionName(target);
  const prompt = target.closest("fieldset")
    ? compact(target.closest("fieldset")?.querySelector("legend")?.textContent, nearestHeading(target))
    : nearestHeading(target);
  const updatedAt = new Date().toISOString();

  if (target instanceof HTMLTextAreaElement || (target instanceof HTMLInputElement && !["checkbox", "radio"].includes(target.type))) {
    const answer = target.value.trim();
    const kind = "text" as const;
    const id = entryId(kind, section, prompt);
    target.setAttribute("data-audit-entry-id", id);
    target.setAttribute("data-revision-answer", "true");
    upsert(accountId, week, { id, section, prompt, kind, answers: answer ? [answer.slice(0, 3000)] : [], answered: Boolean(answer), updatedAt });
    return;
  }
  if (target instanceof HTMLSelectElement) {
    const answer = target.selectedOptions[0]?.textContent?.trim() ?? "";
    const kind = "select" as const;
    upsert(accountId, week, { id: entryId(kind, section, prompt), section, prompt, kind, answers: answer ? [answer] : [], answered: Boolean(target.value), updatedAt });
    return;
  }
  if (target instanceof HTMLInputElement && ["checkbox", "radio"].includes(target.type)) {
    const label = compact(target.closest("label")?.textContent, target.value || "選項");
    const kind = "checkbox" as const;
    upsert(accountId, week, { id: entryId(kind, section, prompt), section, prompt, kind, answers: [target.checked ? `已選：${label}` : `取消：${label}`], answered: target.checked, updatedAt });
    return;
  }
  const button = target.closest("button");
  if (!button || button.disabled) return;
  if (button.closest("nav, [class*='stageRail'], [class*='buttonRow'], [class*='stageActions'], [class*='completionActions']")) return;
  const answer = compact(button.textContent, "未命名操作");
  if (/^(上一|下一|返回|關閉|開啟|重新體驗|收下寶物|完成任務)/.test(answer)) return;
  if (button.hasAttribute("aria-pressed")) {
    const scope = button.closest("fieldset, [role='group'], section, article") ?? button.parentElement;
    window.setTimeout(() => {
      const answers = Array.from(scope?.querySelectorAll("button[aria-pressed='true']") ?? []).map((item) => compact(item.textContent, "未命名選項"));
      const kind = "choice" as const;
      upsert(accountId, week, { id: entryId(kind, section, prompt), section, prompt, kind, answers, answered: answers.length > 0, updatedAt: new Date().toISOString() });
    });
    return;
  }
  const kind = button.closest("fieldset") ? "choice" as const : "action" as const;
  upsert(accountId, week, { id: entryId(kind, section, prompt), section, prompt, kind, answers: [answer], answered: true, updatedAt });
}

export default function WeekAuditTracker({ accountId, week, status, reviewFeedback, submittedAudit, children }: { accountId: string; week: number; status: string; reviewFeedback?: string; submittedAudit?: WeekGameAudit | null; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const review = parseStudentReviewFeedback(reviewFeedback);
  const isRevision = status === "in_progress" && review?.decision === "reject";
  const [revisionReady, setRevisionReady] = useState(!isRevision);

  useLayoutEffect(() => {
    if (!isRevision) { setRevisionReady(true); return; }
    if (submittedAudit?.gameState) {
      for (const key of WEEK_STATE_KEYS[week] ?? []) {
        const saved = submittedAudit.gameState[key];
        if (saved === undefined) continue;
        try {
          const storage = week === 1 ? learningStorage : window.localStorage;
          storage.setItem(key, JSON.stringify(saved));
        } catch {}
      }
      writeAudit(accountId, { ...submittedAudit, completed: false, completedAt: "" });
    }
    for (const key of WEEK_STATE_KEYS[week] ?? []) {
      try {
        const storage = week === 1 ? learningStorage : window.localStorage;
        const raw = storage.getItem(key);
        if (!raw) continue;
        const state = JSON.parse(raw) as Record<string, unknown>;
        if (week === 1 && state.weekOne && typeof state.weekOne === "object") {
          const weekOne = state.weekOne as Record<string, unknown>;
          state.weekOne = { ...weekOne, completed: false, completedAt: null, stage: Math.min(Number(weekOne.stage) || 5, 5) };
        } else {
          if ("completed" in state) state.completed = false;
          if ("completedAt" in state) state.completedAt = null;
          if (week === 6) { state.status = "draft"; state.stage = 5; state.furthestStage = Math.max(Number(state.furthestStage) || 0, 5); }
        }
        storage.setItem(key, JSON.stringify(state));
      } catch {}
    }
    const audit = readAudit(accountId, week);
    writeAudit(accountId, { ...audit, completed: false, completedAt: "" });
    setRevisionReady(true);
  }, [accountId, isRevision, submittedAudit, week]);

  const submitCompletedAudit = useCallback(async (): Promise<boolean> => {
    const current = readAudit(accountId, week);
    const audit: WeekGameAudit = {
      ...current,
      completed: true,
      completedAt: current.completedAt || new Date().toISOString(),
      gameState: readGameState(week)
    };
    writeAudit(accountId, audit);
    try {
      const work = await api<{ status: string; version: number; generation: number }>(`/api/classroom/weeks/${week}`);
      if (work.status !== "in_progress") return work.status === "pending" || work.status === "completed";
      await api(`/api/classroom/weeks/${week}/game-audit`, { version: work.version, generation: work.generation, audit });
      window.dispatchEvent(new Event("classroom-progress"));
      return true;
    } catch {
      // 保留於本機，下次載入本週時自動重試，不中斷完成畫面。
      return false;
    }
  }, [accountId, week]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !revisionReady) return;
    registerUnanswered(accountId, week, root);
    const observer = new MutationObserver(() => registerUnanswered(accountId, week, root));
    observer.observe(root, { childList: true, subtree: true });
    const onComplete = (event: Event) => {
      const detail = (event as CustomEvent<{ week?: number; resolve?: (saved: boolean) => void }>).detail;
      if (detail?.week === week) window.setTimeout(() => void submitCompletedAudit().then((saved) => detail.resolve?.(saved)), 150);
    };
    window.addEventListener("shelterlab-week-complete", onComplete);
    if (isRevision) {
      window.setTimeout(() => {
        const requested = review?.items[0]?.entryId;
        const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-revision-answer='true']"));
        const target = targets.find((element) => element.dataset.auditEntryId === requested) ?? targets[0];
        if (target) {
          target.id = "revision-answer";
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.focus({ preventScroll: true });
        }
      }, 250);
    } else if (readAudit(accountId, week).completed) void submitCompletedAudit();
    return () => {
      observer.disconnect();
      window.removeEventListener("shelterlab-week-complete", onComplete);
    };
  }, [accountId, isRevision, revisionReady, review?.items, submitCompletedAudit, week]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    if (status === "pending") content.setAttribute("inert", "");
    else content.removeAttribute("inert");
    return () => content.removeAttribute("inert");
  }, [status]);

  const record = (event: SyntheticEvent) => capture(accountId, week, event.target);
  return <div ref={rootRef} className="student-week-audit" onClickCapture={record} onInputCapture={record} onChangeCapture={record}>
    {review && <aside className={`sticky top-0 z-[110] border-b px-5 py-4 shadow-sm ${review.decision === "reject" ? "border-red-200 bg-red-50 text-red-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
      <div className="mx-auto max-w-5xl">
        <p className="font-black">教師審查：{review.decision === "approve" ? "通過" : "不通過，請依評語修正"}</p>
        {review.items.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{review.items.map((item) => <li key={item.entryId}><strong>{item.prompt}：</strong>{item.comment}</li>)}</ul>}
        {review.decision === "reject" && <p className="mt-3 text-sm font-bold">已保留其他選擇題與互動結果，並自動定位到需要修改的填答題。</p>}
      </div>
    </aside>}
    {status === "pending" && <aside className="sticky top-0 z-[105] border-b border-amber-200 bg-amber-50 px-5 py-4 text-center font-bold text-amber-950 shadow-sm">作業稽核中；送出內容已鎖定，待教師審核後才可繼續。 <a className="ml-3 underline" href="/student">返回六週地圖</a></aside>}
    <div ref={contentRef} aria-disabled={status === "pending"} className={status === "pending" ? "pointer-events-none select-none opacity-75" : ""}>
      {revisionReady ? children : <main className="p-10 text-center font-bold">正在還原已送出的作答狀態並前往填答題…</main>}
    </div>
  </div>;
}
