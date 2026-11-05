"use client";

import { useEffect, useRef, useState } from "react";

export const EVALUATOR_STAGE_NAVIGATION_EVENT = "shelterlab-evaluator-stage-navigation";
export const EVALUATOR_INTRO_PAGE_NAVIGATION_EVENT = "shelterlab-evaluator-intro-page-navigation";
export const EVALUATOR_ROLE_PATH_NAVIGATION_EVENT = "shelterlab-evaluator-role-path-navigation";

type EvaluatorStageNavigationDetail = {
  week: number;
  stage: number;
};

export function useEvaluatorStageNavigation(week: number, enabled: boolean, onNavigate: (stage: number) => void) {
  const callbackRef = useRef(onNavigate);

  useEffect(() => {
    callbackRef.current = onNavigate;
  }, [onNavigate]);

  useEffect(() => {
    if (!enabled) return;
    const navigate = (event: Event) => {
      const detail = (event as CustomEvent<EvaluatorStageNavigationDetail>).detail;
      if (detail?.week === week) callbackRef.current(detail.stage);
    };
    window.addEventListener(EVALUATOR_STAGE_NAVIGATION_EVENT, navigate);
    return () => window.removeEventListener(EVALUATOR_STAGE_NAVIGATION_EVENT, navigate);
  }, [enabled, week]);
}

type EvaluatorStageNavigatorProps = {
  visible: boolean;
  week: number;
  stages: readonly string[];
  introPages?: readonly string[];
  currentStage?: number;
  stageValues?: readonly number[];
  onSelect: (stage: number) => void;
  onSelectIntroPage?: (page: number) => void;
  onSelectWeek?: (week: number) => void;
  rolePaths?: readonly { id: string; label: string }[];
  onSelectRolePath?: (path: string | null) => void;
};

export default function EvaluatorStageNavigator({
  visible,
  week,
  stages,
  introPages = [],
  currentStage,
  stageValues,
  onSelect,
  onSelectIntroPage,
  onSelectWeek,
  rolePaths = [],
  onSelectRolePath
}: EvaluatorStageNavigatorProps) {
  const [open, setOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number | undefined>(currentStage);
  const [selectedRolePath, setSelectedRolePath] = useState<string | null | undefined>();
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!visible) return;

    const locate = () => {
      const root = document.querySelector(".student-week-audit");
      const stamp = Array.from(root?.querySelectorAll<HTMLElement>("span") ?? []).find((element) => /^WEEK\s+0?[1-6]\b/.test(element.textContent?.trim() ?? ""));
      if (!stamp) return;

      const rect = stamp.getBoundingClientRect();
      const compactWidth = 152;
      const gap = 10;
      const placeBelow = rect.left < compactWidth + gap + 16;
      setAnchor(placeBelow
        ? { top: window.scrollY + rect.bottom + 8, right: 16 }
        : { top: window.scrollY + rect.top + Math.max(0, (rect.height - 38) / 2), right: window.innerWidth - rect.left + gap });
    };

    const frame = window.requestAnimationFrame(locate);
    window.addEventListener("resize", locate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", locate);
    };
  }, [visible]);

  if (!visible) return null;

  const values = stageValues ?? stages.map((_, index) => index);

  function selectStage(stage: number) {
    setSelectedStage(stage);
    onSelect(stage);
  }

  return (
    <aside
      data-evaluator-control="stage-navigation"
      className={`absolute right-[max(15rem,calc((100vw_-_70rem)/2_+_15rem))] top-6 z-[70] max-h-[calc(100dvh-6rem)] overflow-y-auto text-[#4d3d25] transition-[width] ${open ? "w-[min(21rem,calc(100vw_-_2rem))] rounded-2xl border-2 border-[#d8bd79] bg-[#fffdf8]/97 p-2.5 shadow-[0_16px_42px_rgba(61,45,20,0.22)] backdrop-blur-md" : "w-auto"}`}
      style={anchor ?? undefined}
      aria-label={`第 ${week} 週評審環節快速導航`}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center justify-between gap-2 rounded-full border-2 border-[#d8bd79] bg-[#fff3c9] text-left font-black shadow-[2px_3px_0_rgba(91,85,76,.1)] transition hover:bg-[#ffedb0] ${open ? "w-full px-3 py-2.5" : "w-[9.5rem] px-3 py-2"}`}
        aria-expanded={open}
      >
        <span className="whitespace-nowrap text-sm"><span aria-hidden="true">⚡</span> 評審導航</span>
        <span className="shrink-0 text-[11px]">{open ? "收合" : "展開"}</span>
      </button>

      {open && (
        <div className="mt-3">
          {onSelectWeek && <section className="mb-3 border-b border-[#e4d19e] pb-3">
            <p className="mb-2 text-xs font-black text-[#6f604c]">切換週次</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((targetWeek) => <button key={targetWeek} type="button" onClick={() => onSelectWeek(targetWeek)} aria-current={targetWeek === week ? "page" : undefined} className={`min-h-10 rounded-xl border px-2 py-2 text-sm font-bold transition ${targetWeek === week ? "border-[#b58c42] bg-[#ebd197] text-[#40331f] shadow-sm" : "border-[#d8bd79] bg-white hover:bg-[#fff3c9]"}`}>第 {targetWeek} 週</button>)}
            </div>
          </section>}
          {introPages.length > 0 && onSelectIntroPage && <section className="mb-3 border-b border-[#e4d19e] pb-3">
            <p className="mb-2 text-xs font-black text-[#6f604c]">第一週翻書導讀</p>
            <div className="grid grid-cols-2 gap-2">
              {introPages.map((label, index) => <button key={`${index}-${label}`} type="button" onClick={() => onSelectIntroPage(index)} aria-label={`翻書第 ${index + 1} 頁：${label}`} className="min-h-11 rounded-xl border border-[#d8bd79] bg-white px-2 py-2 text-left text-xs font-bold leading-4 transition hover:bg-[#fff3c9]"><span className="mr-1.5 opacity-65">{index + 1}</span>{label}</button>)}
            </div>
          </section>}
          {rolePaths.length > 0 && onSelectRolePath && <section className="mb-3 border-b border-[#e4d19e] pb-3">
            <p className="mb-2 text-xs font-black text-[#6f604c]">第一週生活路徑</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setSelectedRolePath(null); onSelectRolePath(null); }} aria-current={selectedRolePath === null ? "step" : undefined} className={`col-span-2 min-h-10 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${selectedRolePath === null ? "border-[#4e817c] bg-[#4e817c] text-white" : "border-[#d8bd79] bg-white hover:bg-[#fff3c9]"}`}>生活路徑選擇區</button>
              {rolePaths.map((path) => <button key={path.id} type="button" onClick={() => { setSelectedRolePath(path.id); onSelectRolePath(path.id); }} aria-current={selectedRolePath === path.id ? "step" : undefined} className={`min-h-10 rounded-xl border px-3 py-2 text-left text-xs font-bold leading-4 transition ${selectedRolePath === path.id ? "border-[#4e817c] bg-[#4e817c] text-white" : "border-[#d8bd79] bg-white hover:bg-[#fff3c9]"}`}>{path.label}</button>)}
            </div>
          </section>}
          <p className="mb-2 text-xs font-black leading-5 text-[#6f604c]">本週環節</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stages.map((label, index) => {
              const value = values[index] ?? index;
              const active = value === (currentStage ?? selectedStage);
              return (
                <button
                  key={`${value}-${label}`}
                  type="button"
                  onClick={() => selectStage(value)}
                  aria-current={active ? "step" : undefined}
                  className={`min-h-14 rounded-xl border px-3 py-2 text-left text-sm font-bold transition ${active ? "border-[#4e817c] bg-[#4e817c] text-white shadow-sm" : "border-[#d8bd79] bg-white hover:bg-[#fff3c9]"}`}
                >
                  <span className="mr-1.5 text-xs opacity-75">{index + 1}</span>{label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
