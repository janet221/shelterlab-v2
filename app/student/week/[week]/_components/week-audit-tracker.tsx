"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { api } from "@/app/_components/classroom-ui";
import type { WeekAuditEntry, WeekGameAudit } from "@/lib/classroom/data-types";
import { clearEvaluatorDemoStates, clearEvaluatorLearningDrafts, evaluatorDemoState, setEvaluatorDemoState, setEvaluatorPreviewReward, learningStorage, restoreEvaluatorLearningDrafts, snapshotEvaluatorLearningDrafts, type EvaluatorDemoState } from "@/lib/classroom/browser-storage";
import { parseStudentReviewFeedback } from "@/lib/classroom/review-guidelines";
import { getLearningTool, type WeekNumber } from "@/lib/student-map";

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

function completedReviewState(week:number,value:unknown){
  if(!value||typeof value!=="object")return value;
  const copy=JSON.parse(JSON.stringify(value)) as Record<string,unknown>;
  if(week===1&&copy.weekOne&&typeof copy.weekOne==="object"){
    copy.weekOne={...(copy.weekOne as Record<string,unknown>),stage:0};
  }else{
    copy.stage=0;
    if("completed" in copy)copy.completed=false;
    if(week===6)copy.status="draft";
  }
  return copy;
}

function nearestHeading(element: Element | null) {
  if (element instanceof HTMLElement && element.id) {
    const label = element.ownerDocument.querySelector(`label[for="${CSS.escape(element.id)}"]`);
    if (label?.textContent) return compact(label.textContent, "互動題目");
  }
  const wrappingLabel = element?.closest("label");
  if (wrappingLabel?.textContent) {
    const clone = wrappingLabel.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("input, textarea, select, button, small").forEach((node) => node.remove());
    if (clone.textContent?.trim()) return compact(clone.textContent, "互動題目");
  }
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

export default function WeekAuditTracker({ accountId, week, status, reviewFeedback, submittedAudit, evaluatorMode = false, evaluatorPreview = false, auditDemo = false, children }: { accountId: string; week: number; status: string; reviewFeedback?: string; submittedAudit?: WeekGameAudit | null; evaluatorMode?: boolean; evaluatorPreview?: boolean; auditDemo?: boolean; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [demoState, setDemoState] = useState<EvaluatorDemoState | undefined>();
  const [showPendingNotice, setShowPendingNotice] = useState(status === "pending");
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const effectiveStatus = auditDemo ? (demoState?.status ?? status) : evaluatorPreview ? "in_progress" : status;
  const effectiveFeedback = auditDemo ? (demoState?.feedback ?? reviewFeedback) : evaluatorPreview ? undefined : reviewFeedback;
  const review = parseStudentReviewFeedback(effectiveFeedback);
  const isRevision = (effectiveStatus === "returned" || effectiveStatus === "in_progress") && review?.decision === "reject";
  const [revisionReady, setRevisionReady] = useState(!isRevision);

  useLayoutEffect(() => {
    if (!evaluatorPreview) return;
    snapshotEvaluatorLearningDrafts(accountId, week);
    if (!auditDemo) clearEvaluatorLearningDrafts(accountId, week);
  }, [accountId, auditDemo, evaluatorPreview, week]);

  useLayoutEffect(() => {
    if (evaluatorPreview || status !== "completed" || !submittedAudit?.gameState) return;
    for (const key of WEEK_STATE_KEYS[week] ?? []) {
      const saved = submittedAudit.gameState[key];
      if (saved === undefined) continue;
      try {
        const storage = week === 1 ? learningStorage : window.localStorage;
        storage.setItem(key, JSON.stringify(completedReviewState(week,saved)));
      } catch {}
    }
  }, [evaluatorPreview, status, submittedAudit, week]);

  useEffect(() => {
    if (!evaluatorMode || !auditDemo) { setDemoState(undefined); return; }
    const refresh = () => setDemoState(evaluatorDemoState(week));
    refresh();
    window.addEventListener("shelterlab-evaluator-demo", refresh);
    return () => window.removeEventListener("shelterlab-evaluator-demo", refresh);
  }, [auditDemo, evaluatorMode, week]);

  function simulateResubmission() {
    setEvaluatorDemoState(week, { status: "pending", feedback: effectiveFeedback, updatedAt: new Date().toISOString() });
    setShowPendingNotice(true);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function simulateApproval() {
    restoreEvaluatorLearningDrafts(accountId, week);
    clearEvaluatorDemoStates();
    window.location.assign("/student");
  }

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
          state.weekOne = { ...weekOne, completed: false, completedAt: null, stage: 5 };
        } else {
          if ("completed" in state) state.completed = false;
          if ("completedAt" in state) state.completedAt = null;
          state.stage = 5;
          state.furthest = Math.max(Number(state.furthest) || 0, 5);
          state.furthestStage = Math.max(Number(state.furthestStage) || 0, 5);
          if (week === 6) state.status = "draft";
        }
        storage.setItem(key, JSON.stringify(state));
      } catch {}
    }
    const audit = readAudit(accountId, week);
    writeAudit(accountId, { ...audit, completed: false, completedAt: "" });
    setRevisionReady(true);
  }, [accountId, isRevision, submittedAudit, week]);

  const submitCompletedAudit = useCallback(async (): Promise<boolean> => {
    if (evaluatorPreview) {
      if (!auditDemo) setEvaluatorPreviewReward(week);
      return true;
    }
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
      if (work.status !== "in_progress" && work.status !== "returned") return work.status === "pending" || work.status === "completed";
      await api(`/api/classroom/weeks/${week}/game-audit`, { version: work.version, generation: work.generation, audit });
      window.dispatchEvent(new Event("classroom-progress"));
      return true;
    } catch {
      // 保留於本機，下次載入本週時自動重試，不中斷完成畫面。
      return false;
    }
  }, [accountId, auditDemo, evaluatorPreview, week]);

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
      let attempt = 0;
      const locateRevisionAnswer = () => {
        const requested = review?.items[0]?.entryId;
        const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-revision-answer='true']"));
        const target = targets.find((element) => element.dataset.auditEntryId === requested) ?? targets.at(-1);
        if (target) {
          target.id = "revision-answer";
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.focus({ preventScroll: true });
          return;
        }
        attempt += 1;
        if (attempt < 20) window.setTimeout(locateRevisionAnswer, 100);
      };
      window.setTimeout(locateRevisionAnswer, 100);
    } else if (!evaluatorPreview && readAudit(accountId, week).completed) void submitCompletedAudit();
    return () => {
      observer.disconnect();
      window.removeEventListener("shelterlab-week-complete", onComplete);
    };
  }, [accountId, evaluatorPreview, isRevision, revisionReady, review?.items, submitCompletedAudit, week]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const locked=new Set<HTMLElement>();
    const applyLocks=()=>{
      const answerFields = Array.from(content.querySelectorAll<HTMLElement>("[data-revision-answer='true']"));
      const lockTargets = effectiveStatus === "pending"
        ? Array.from(new Set(answerFields.map((field) => field.closest<HTMLElement>("[class*='stagePaper'], [class*='stageCard'], [class*='stageShell']") ?? field)))
        : effectiveStatus === "completed" && reviewCompleted
          ? Array.from(content.querySelectorAll<HTMLElement>("input, textarea, select, button")).filter((field)=>!field.closest("nav, [class*='stageRail'], [class*='stageActions'], [class*='buttonRow']")) : [];
      for (const field of lockTargets) {
        field.setAttribute("inert", "");
        field.setAttribute("aria-disabled", "true");
        field.classList.add("pointer-events-none", "cursor-not-allowed", "opacity-60");
        locked.add(field);
      }
    };
    applyLocks();
    const observer=new MutationObserver(applyLocks);
    observer.observe(content,{childList:true,subtree:true});
    return () => {observer.disconnect();locked.forEach((field) => { field.removeAttribute("inert"); field.removeAttribute("aria-disabled"); field.classList.remove("pointer-events-none", "cursor-not-allowed", "opacity-60"); });};
  }, [effectiveStatus, reviewCompleted]);

  useEffect(() => {
    if (effectiveStatus !== "pending" || auditDemo || evaluatorPreview) return;
    const poll = window.setInterval(() => {
      void api<{status:string}>(`/api/classroom/weeks/${week}`).then((work) => {
        if (work.status === "completed") window.location.assign("/student");
      }).catch(() => undefined);
    }, 5000);
    return () => window.clearInterval(poll);
  }, [auditDemo, effectiveStatus, evaluatorPreview, week]);

  useEffect(() => {
    if (effectiveStatus === "pending") setShowPendingNotice(true);
  }, [effectiveStatus]);

  const record = (event: SyntheticEvent) => capture(accountId, week, event.target);
  const completedTool = getLearningTool(week as WeekNumber);
  return <div ref={rootRef} className="student-week-audit" onClickCapture={record} onInputCapture={record} onChangeCapture={record}>
    {!evaluatorPreview && effectiveStatus === "completed" && !reviewCompleted && <div className="fixed inset-0 z-[160] grid place-items-center overflow-y-auto bg-[radial-gradient(circle_at_top,#fffefa_0%,#f7eedc_55%,#ded0b6_100%)] p-5">
      <section className="w-full max-w-lg rounded-[2rem] border-2 border-[#d8bd79] bg-[#fffdf8] p-7 text-center shadow-[0_28px_80px_rgba(66,49,25,.28)]" role="dialog" aria-modal="true" aria-labelledby="completed-week-title">
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#98762e]">Week {week} Completed</p>
        <h1 id="completed-week-title" className="mt-3 text-3xl font-black text-[#3f554d]">第 {week} 週關卡已通過</h1>
        <div className="mx-auto mt-5 h-40 w-40 rounded-3xl border border-[#dfc885] bg-[#fff3cf] p-3 shadow-inner"><img src={completedTool.image} alt={completedTool.name} className="h-full w-full rounded-2xl object-contain"/></div>
        <p className="mt-5 text-sm font-bold text-[#7a6338]">已獲得探索工具</p><h2 className="mt-1 text-2xl font-black text-[#443a31]">{completedTool.name}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-[#6d6258]">{completedTool.description}</p>
        <p className="mt-5 rounded-2xl bg-[#f4eee3] px-4 py-3 text-sm font-bold text-[#66594d]">是否重新檢視第 {week} 週關卡與自己提交的答案？檢視模式不會修改正式作答紀錄。</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><a href="/student" className="rounded-xl border border-[#bca989] bg-white px-5 py-3 font-black text-[#5d5145]">返回遊戲地圖</a><button type="button" onClick={()=>setReviewCompleted(true)} className="rounded-xl bg-[#6C9270] px-5 py-3 font-black text-white shadow-md hover:bg-[#587c5c]">重新檢視本週作答</button></div>
      </section>
    </div>}
    {review && <aside className={`sticky top-0 z-[110] border-b px-5 py-4 shadow-sm ${review.decision === "reject" ? "border-red-200 bg-red-50 text-red-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
      <div className="mx-auto max-w-5xl">
        {review.decision === "reject"
          ? <p className="font-black">教師即時評語：{review.items.map((item) => item.comment).join("；")}</p>
          : <p className="font-black">教師審查：通過</p>}
      </div>
    </aside>}
    {effectiveStatus === "pending" && <aside className="sticky top-0 z-[105] border-b-2 border-amber-300 bg-amber-100 px-5 py-5 text-center text-lg font-black text-amber-950 shadow-md">作業稽核中；送出內容已鎖定，待教師審核後才可繼續。 <a className="ml-3 text-sm underline" href="/student">返回六週地圖</a></aside>}
    {showPendingNotice && effectiveStatus === "pending" && <div className="fixed inset-0 z-[150] grid place-items-center bg-stone-950/55 p-5" role="presentation">
      <section className="w-full max-w-md rounded-3xl border-2 border-amber-300 bg-white p-7 text-center shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="audit-pending-title">
        <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-2xl">⌛</span>
        <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-amber-700">Audit in progress</p>
        <h2 id="audit-pending-title" className="mt-2 text-2xl font-black text-amber-950">作業稽核中</h2>
        <p className="mt-3 text-base font-bold leading-7 text-stone-700">送出內容已鎖定，正在等待教師審查。</p>
        <button type="button" onClick={()=>setShowPendingNotice(false)} className="mt-6 w-full rounded-xl bg-[#c58f3d] px-5 py-3 font-black text-white shadow-md transition hover:bg-[#aa772f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300">我知道了</button>
      </section>
    </div>}
    {auditDemo && demoState && <aside className="fixed bottom-4 right-4 z-[120] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border-2 border-[#d8bd79] bg-[#fffdf8]/95 p-4 text-[#4d3d25] shadow-2xl backdrop-blur-md">
      <p className="font-black">⚡ 評審稽核閉環演示</p>
      <p className="mt-1 text-xs">目前狀態：{effectiveStatus === "returned" ? "教師已退件，等待學生修正" : effectiveStatus === "pending" ? "學生已重送，等待教師審查" : "教師已通過，下一關已解鎖"}</p>
      {effectiveStatus === "returned" && <button type="button" onClick={simulateResubmission} className="mt-3 w-full rounded-xl bg-[#c58f3d] px-4 py-3 text-sm font-black text-white">模擬學生修改後再次送出</button>}
      {effectiveStatus === "pending" && <button type="button" onClick={simulateApproval} className="mt-3 w-full rounded-xl bg-[#5e9163] px-4 py-3 text-sm font-black text-white">模擬教師審查通過</button>}
      {effectiveStatus === "completed" && <a href="/student" className="mt-3 block rounded-xl bg-[#5e9163] px-4 py-3 text-center text-sm font-black text-white">回到地圖查看解鎖結果</a>}
      <p className="mt-2 text-[11px] text-[#75613d]">展示狀態不寫入正式稽核與退件紀錄。</p>
    </aside>}
    <div ref={contentRef}>
      {revisionReady ? children : <main className="p-10 text-center font-bold">正在還原已送出的作答狀態並前往填答題…</main>}
    </div>
  </div>;
}
