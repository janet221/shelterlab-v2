"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { evidenceStoryDemoSteps } from "@/lib/adoption-profile/story-demo";

export function StoryModePlayer() {
  const [current, setCurrent] = useState(-1);
  const running = current >= 0 && current < evidenceStoryDemoSteps.length - 1;
  const complete = current === evidenceStoryDemoSteps.length - 1;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setCurrent((value) => value + 1), 250);
    return () => window.clearTimeout(timer);
  }, [current, running]);

  return <>
    <div className="mt-5 flex flex-wrap items-center gap-3"><button className="border border-cyan-700 bg-cyan-700 px-4 py-2 text-sm font-medium text-white" onClick={() => setCurrent(0)} type="button">播放證據脈絡</button><button className="border px-4 py-2 text-sm" onClick={() => setCurrent(-1)} type="button">重設</button><span className="text-xs font-semibold text-emerald-700">唯讀 · 正式資料異動 0 筆</span></div>
    <ol className="mt-6 divide-y border-y">{evidenceStoryDemoSteps.map((step, index) => { const reached = current >= index; return <li className={`grid gap-2 px-4 py-4 text-sm md:grid-cols-[42px_190px_1fr_130px] ${reached ? "bg-cyan-50" : "bg-white"}`} key={step.id}><span className="font-mono text-slate-400">{String(index + 1).padStart(2, "0")}</span><Link className="font-semibold text-cyan-800 underline" href={step.href}>{step.label}</Link><span className="text-slate-600">{step.evidence}</span><span className="font-mono text-xs font-semibold">{reached ? "脈絡已就緒" : "等待中"}</span></li>;})}</ol>
    {complete && <div className="mt-5 border-l-4 border-emerald-600 bg-emerald-50 p-4 text-sm"><strong>證據脈絡已完成。</strong>每一步都使用既有已發布證據或固定計算的合成影響力。<Link className="ml-1 font-semibold text-cyan-800 underline" href="/adoption-profile/DOG-TPE-001/story">開啟證據脈絡</Link></div>}
  </>;
}
