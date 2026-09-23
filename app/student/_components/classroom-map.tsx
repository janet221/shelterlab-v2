"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ClassroomNav } from "@/app/_components/classroom-ui";
import StudentMapDynamic from "./student-map-dynamic";
import type { StudentMapProgress } from "@/lib/student-map";
type Progress = { enrolled: boolean; generation?: number; schoolName?: string; classCode?: string; plannedWeeks?: number; weeks: StudentMapProgress["weeks"] };
export default function ClassroomMap() {
  const [progress, setProgress] = useState<Progress | null>(null), [error, setError] = useState("");
  useEffect(() => { const refresh = () => api<Progress>("/api/classroom/progress").then(p => { setProgress(p); setError(""); }).catch(e => setError(e.message)); void refresh(); const timer = setInterval(refresh, 5000); window.addEventListener("focus", refresh); return () => { clearInterval(timer); window.removeEventListener("focus", refresh); }; }, []);
  return <><ClassroomNav /><p role="alert" className="relative z-[90] bg-white px-5 text-red-800">{error}</p>{!progress && !error && <p className="p-10">正在讀取地圖進度…</p>}{progress?.enrolled ? <><div className="relative z-[80] flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#d8cfc3] bg-[#f3eee7] px-5 py-3 text-sm text-[#5d5145]"><span>{progress.schoolName} · 已安排 {progress.plannedWeeks} 週。完成作答後送審，教師核准才解鎖下一週。</span><strong className="rounded-full bg-[#7f918d] px-4 py-1.5 text-white">班級代碼：{progress.classCode}</strong><Link href="/student/week/1" className="font-bold underline underline-offset-4">查看第一週</Link></div><StudentMapDynamic progress={{ weeks: ([1, 2, 3, 4, 5, 6] as const).map(week => progress.weeks.find(w => w.week === week) || { week, status: "locked" }) }} /></> : progress && <main className="mx-auto max-w-lg px-5 py-16"><h1 className="text-3xl font-bold">尚未綁定班級</h1><p className="my-5">學生帳號會在註冊時綁定班級。請登出後以教師提供的班級代碼重新註冊，或聯絡教師協助。</p></main>}</>;
}
