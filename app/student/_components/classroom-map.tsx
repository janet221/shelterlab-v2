"use client";
import { useEffect, useState } from "react";
import { api, buttonClass, fieldClass, ClassroomNav } from "@/app/_components/classroom-ui";
import StudentMapDynamic from "./student-map-dynamic";
import type { StudentMapProgress } from "@/lib/student-map";
type Progress = { enrolled: boolean; generation?: number; schoolName?: string; plannedWeeks?: number; weeks: StudentMapProgress["weeks"] };
export default function ClassroomMap() {
  const [progress, setProgress] = useState<Progress | null>(null), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { const refresh = () => api<Progress>("/api/classroom/progress").then(p => { setProgress(p); setError(""); }).catch(e => setError(e.message)); void refresh(); const timer = setInterval(refresh, 5000); window.addEventListener("focus", refresh); return () => { clearInterval(timer); window.removeEventListener("focus", refresh); }; }, []);
  return <><ClassroomNav /><p role="alert" className="relative z-[90] bg-white px-5 text-red-800">{error}</p>{!progress && !error && <p className="p-10">正在讀取地圖進度…</p>}{progress?.enrolled ? <><div className="relative z-[80] bg-teal-50 px-5 py-3 text-sm">{progress.schoolName} · 已安排 {progress.plannedWeeks} 週。完成作答後送審，教師核准才解鎖下一週。<a href="/student/week/1" className="ml-2 underline">查看第一週</a></div><StudentMapDynamic progress={{ weeks: ([1, 2, 3, 4, 5, 6] as const).map(week => progress.weeks.find(w => w.week === week) || { week, status: "locked" }) }} /></> : progress && <main className="mx-auto max-w-lg px-5 py-16"><h1 className="text-3xl font-bold">加入我的班級</h1><p className="my-5">向教師取得班級代碼後，第一週地圖就會解鎖。</p><form onSubmit={async e => { e.preventDefault(); setBusy(true); try { await api("/api/classroom/join", { joinCode: new FormData(e.currentTarget).get("joinCode") }); window.location.reload(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }}><label>班級代碼<input name="joinCode" required pattern="[a-fA-F0-9]{12}" maxLength={12} className={fieldClass} /></label><button disabled={busy} className={`${buttonClass} mt-5`}>加入班級</button></form></main>}</>;
}
