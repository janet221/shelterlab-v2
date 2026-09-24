"use client";

import { useCallback, useEffect, useRef, type ReactNode, type SyntheticEvent } from "react";
import { api } from "@/app/_components/classroom-ui";
import type { WeekAuditEntry, WeekGameAudit } from "@/lib/classroom/data-types";
import { learningStorage } from "@/lib/classroom/browser-storage";

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
    upsert(accountId, week, { id: entryId(kind, section, prompt), section, prompt, kind, answers: answer ? [answer.slice(0, 3000)] : [], answered: Boolean(answer), updatedAt });
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

export default function WeekAuditTracker({ accountId, week, children }: { accountId: string; week: number; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  const submitCompletedAudit = useCallback(async () => {
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
      if (work.status !== "in_progress") return;
      await api(`/api/classroom/weeks/${week}/game-audit`, { version: work.version, generation: work.generation, audit });
      window.dispatchEvent(new Event("classroom-progress"));
    } catch {
      // 保留於本機，下次載入本週時自動重試，不中斷完成畫面。
    }
  }, [accountId, week]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    registerUnanswered(accountId, week, root);
    const observer = new MutationObserver(() => registerUnanswered(accountId, week, root));
    observer.observe(root, { childList: true, subtree: true });
    const onComplete = (event: Event) => {
      if ((event as CustomEvent<{ week?: number }>).detail?.week === week) window.setTimeout(() => void submitCompletedAudit(), 150);
    };
    window.addEventListener("shelterlab-week-complete", onComplete);
    if (readAudit(accountId, week).completed) void submitCompletedAudit();
    return () => {
      observer.disconnect();
      window.removeEventListener("shelterlab-week-complete", onComplete);
    };
  }, [accountId, submitCompletedAudit, week]);

  const record = (event: SyntheticEvent) => capture(accountId, week, event.target);
  return <div ref={rootRef} className="student-week-audit" onClickCapture={record} onInputCapture={record} onChangeCapture={record}>{children}</div>;
}
