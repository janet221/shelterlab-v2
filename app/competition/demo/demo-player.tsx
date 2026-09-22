"use client";

import { useEffect, useState } from "react";
import { competitionDemoManifest } from "@/lib/impact/demo-mode";

export function DemoPlayer() {
  const [current, setCurrent] = useState(-1);
  const running = current >= 0 && current < competitionDemoManifest.steps.length - 1;
  const complete = current === competitionDemoManifest.steps.length - 1;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setCurrent((value) => value + 1), 250);
    return () => window.clearTimeout(timer);
  }, [current, running]);

  return (
    <>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button className="rounded-md border border-cyan-700 bg-cyan-700 px-4 py-2 text-sm font-medium text-white" onClick={() => setCurrent(0)} type="button">
          播放完整旅程
        </button>
        <button className="rounded-md border px-4 py-2 text-sm" onClick={() => setCurrent(-1)} type="button">
          重設畫面
        </button>
        <span className="text-xs font-semibold text-emerald-700">唯讀｜生產資料修改 0 次</span>
      </div>
      <ol className="mt-6 divide-y rounded-lg border">
        {competitionDemoManifest.steps.map((step, index) => {
          const reached = current >= index;
          return (
            <li className={`grid gap-2 px-4 py-3 text-sm md:grid-cols-[42px_150px_220px_1fr_130px] ${reached ? "bg-cyan-50" : "bg-white"}`} key={step.id}>
              <span className="font-mono text-slate-400">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-medium">{step.actor}</span>
              <a className="font-semibold text-cyan-800 underline" href={step.href}>{step.title}</a>
              <span className="text-slate-600">{step.evidence}</span>
              <span className="font-mono text-xs font-semibold">{reached ? "證據已播放" : "等待播放"}</span>
            </li>
          );
        })}
      </ol>
      {complete && (
        <div className="mt-5 rounded-md border-l-4 border-emerald-600 bg-emerald-50 p-4 text-sm">
          <strong>完整證據旅程已播放。</strong>
          這是瀏覽器本機的唯讀合成資料重播，沒有呼叫任何生產 mutation。
          <a className="ml-1 font-semibold text-cyan-800 underline" href="/competition/impact">查看影響力儀表板</a>
        </div>
      )}
    </>
  );
}
