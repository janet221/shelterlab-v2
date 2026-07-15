"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  advanceCompetitionExperience,
  beginGuidedCompetitionExperience,
  competitionExperienceSteps,
  createCompetitionExperienceState,
  getCompetitionStep,
  resetCompetitionExperienceState,
  selectCompetitionStep,
  setCompetitionTimerStatus,
  tickCompetitionTimer
} from "@/lib/competition-experience/engine";
import { COMPETITION_DEMO_DURATION_SEC, type CompetitionExperienceStepId } from "@/lib/competition-experience/types";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function JudgeExperience({ initialStepId }: { initialStepId: CompetitionExperienceStepId }) {
  const [state, setState] = useState(() => createCompetitionExperienceState(initialStepId));
  const [guidedRunning, setGuidedRunning] = useState(false);
  const [resetReceipt, setResetReceipt] = useState(false);
  const activeStep = getCompetitionStep(state.currentStepId);
  const activeIndex = competitionExperienceSteps.findIndex((step) => step.id === state.currentStepId);
  const journeyComplete = state.completedStepIds.length === competitionExperienceSteps.length;

  useEffect(() => {
    window.history.replaceState(null, "", activeStep.deepLink);
  }, [activeStep.deepLink]);

  useEffect(() => {
    if (!guidedRunning) return;
    if (state.currentStepId === "impact-dashboard" && state.completedStepIds.includes("impact-dashboard")) {
      setGuidedRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setState((current) => advanceCompetitionExperience(current)), 500);
    return () => window.clearTimeout(timer);
  }, [guidedRunning, state.completedStepIds, state.currentStepId]);

  useEffect(() => {
    if (state.timerStatus !== "running") return;
    const timer = window.setInterval(() => setState((current) => tickCompetitionTimer(current)), 1000);
    return () => window.clearInterval(timer);
  }, [state.timerStatus]);

  const timeProgress = useMemo(
    () => Math.round((state.elapsedSec / COMPETITION_DEMO_DURATION_SEC) * 100),
    [state.elapsedSec]
  );

  function runGuidedDemo() {
    setResetReceipt(false);
    setState((current) => beginGuidedCompetitionExperience(current));
    setGuidedRunning(true);
  }

  function resetDemo() {
    setGuidedRunning(false);
    setState(resetCompetitionExperienceState());
    setResetReceipt(true);
    window.history.replaceState(null, "", "/competition/judge/overview");
  }

  function chooseStep(stepId: CompetitionExperienceStepId) {
    setGuidedRunning(false);
    setResetReceipt(false);
    setState((current) => selectCompetitionStep(current, stepId));
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold text-teal-700">評審導覽｜SL-COMPETITION-EXPERIENCE-1</p>
              <h1 className="mt-2 text-3xl font-semibold">ShelterLab 七分鐘評審導覽</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                這是 read-only 展示控制台，用來依序說明 Research License、觀察任務、證據時間軸、犬隻檔案、One Health 探究與影響力。
              </p>
            </div>
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold leading-5 text-emerald-900">
              合成示範資料（SYNTHETIC_DEMO）｜唯讀｜生產資料修改 0 次
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              className="rounded-md border border-teal-700 bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
              onClick={runGuidedDemo}
              type="button"
            >
              開始一鍵導覽
            </button>
            <button className="rounded-md border border-slate-400 bg-white px-4 py-2 text-sm font-semibold" onClick={resetDemo} type="button">
              重設示範狀態
            </button>
            <Link className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700" href="/demo">
              切換身分
            </Link>
            <span className="text-sm text-slate-600">七分鐘簡報 helper，不是業務流程計時器。</span>
          </div>
          {resetReceipt && (
            <p className="mt-3 rounded-md border-l-4 border-emerald-600 bg-emerald-50 px-3 py-2 text-sm font-medium" role="status">
              合成示範狀態已還原，未呼叫 Prisma、seed、migration 或生產 mutation API。
            </p>
          )}
        </div>
      </header>

      <section aria-label="導覽章節進度" className="border-b border-slate-300 bg-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {competitionExperienceSteps.map((step, index) => {
            const reached = state.completedStepIds.includes(step.id);
            const active = step.id === state.currentStepId;
            return (
              <button
                aria-current={active ? "step" : undefined}
                className={`min-h-20 border-b border-r border-slate-700 px-3 py-3 text-left text-xs ${
                  active ? "bg-teal-700" : reached ? "bg-slate-700" : "bg-slate-900"
                }`}
                key={step.id}
                onClick={() => chooseStep(step.id)}
                type="button"
              >
                <span className="block font-mono text-slate-300">{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-1 block font-semibold text-white">{step.shortTitle}</span>
                <span className="mt-1 block text-slate-300">{active ? "目前章節" : reached ? "已播放" : "待播放"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-0 border-x border-slate-300 bg-white lg:grid-cols-[1fr_320px]">
        <section className="min-h-[430px] border-b border-slate-300 p-5 lg:border-b-0 lg:border-r lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-sm text-slate-500">步驟 {activeIndex + 1} / {competitionExperienceSteps.length}</p>
            <span className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
              {activeStep.evidenceMode === "SYNTHETIC_DEMO" ? "合成示範（SYNTHETIC_DEMO）" : "示範（DEMO）"}
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold">{activeStep.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">{activeStep.narration}</p>

          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold text-slate-500">評審可檢查的證據</p>
            <p className="mt-2 text-sm leading-6 text-slate-800">{activeStep.evidence}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-md border border-teal-700 bg-teal-700 px-4 py-2 text-sm font-semibold text-white" href={activeStep.targetHref}>
              開啟證據頁
            </Link>
            {activeIndex < competitionExperienceSteps.length - 1 && (
              <button
                className="rounded-md border border-slate-400 bg-white px-4 py-2 text-sm font-semibold"
                onClick={() => setState((current) => advanceCompetitionExperience(current))}
                type="button"
              >
                下一章節
              </button>
            )}
          </div>

          {journeyComplete && (
            <p className="mt-6 rounded-md border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm font-semibold" role="status">
              一鍵導覽已完成。所有展示資料仍為唯讀合成狀態。
            </p>
          )}
        </section>

        <aside className="bg-slate-50 p-5 lg:p-6" aria-label="簡報計時器">
          <p className="text-xs font-bold text-slate-500">簡報計時</p>
          <p className="mt-3 font-mono text-4xl font-semibold" data-testid="remaining-time">
            {formatClock(COMPETITION_DEMO_DURATION_SEC - state.elapsedSec)}
          </p>
          <p className="mt-1 text-xs text-slate-500" data-testid="elapsed-time">
            已經過 {formatClock(state.elapsedSec)}｜總長 07:00
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-200" aria-label={`已經過 ${timeProgress}%`}>
            <div className="h-2 rounded-full bg-teal-600" style={{ width: `${timeProgress}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-md border border-slate-400 bg-white px-3 py-2 text-xs font-semibold" onClick={() => setState((current) => setCompetitionTimerStatus(current, "running"))} type="button">
              開始計時
            </button>
            <button className="rounded-md border border-slate-400 bg-white px-3 py-2 text-xs font-semibold" onClick={() => setState((current) => setCompetitionTimerStatus(current, "paused"))} type="button">
              暫停計時
            </button>
            <button className="rounded-md border border-slate-400 bg-white px-3 py-2 text-xs font-semibold" onClick={() => setState((current) => ({ ...current, elapsedSec: 0, timerStatus: "idle" }))} type="button">
              重設計時
            </button>
          </div>

          <div className="mt-8 border-t border-slate-300 pt-5">
            <p className="text-xs font-bold text-slate-500">深層連結</p>
            <nav className="mt-3 divide-y rounded-lg border border-slate-300 bg-white text-sm" aria-label="簡報章節連結">
              {competitionExperienceSteps.map((step) => (
                <Link className="flex items-center justify-between gap-3 px-3 py-2 text-teal-800 underline" href={step.deepLink} key={step.id}>
                  <span>{step.sequence}. {step.shortTitle}</span>
                  <span className="font-mono text-xs text-slate-500">{step.allocatedSec} 秒</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </main>
  );
}
