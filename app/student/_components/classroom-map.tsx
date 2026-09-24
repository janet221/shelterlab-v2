"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/_components/classroom-ui";
import StudentMapDynamic from "./student-map-dynamic";
import type { StudentMapProgress } from "@/lib/student-map";
type Progress = { enrolled: boolean; generation?: number; realName?: string; studentNumber?: string; requiresIdentity?: boolean; schoolName?: string; classCode?: string; county?: string; grade?: string; plannedWeeks?: number; weeks: StudentMapProgress["weeks"] };
export default function ClassroomMap() {
  const [progress, setProgress] = useState<Progress | null>(null), [error, setError] = useState("");
  useEffect(() => { const refresh = () => api<Progress>("/api/classroom/progress").then(p => { setProgress(p); setError(""); }).catch(e => setError(e.message)); void refresh(); const timer = setInterval(refresh, 5000); window.addEventListener("focus", refresh); return () => { clearInterval(timer); window.removeEventListener("focus", refresh); }; }, []);
  const weeks = ([1, 2, 3, 4, 5, 6] as const).map(week => progress?.weeks.find(w => w.week === week) || { week, status: "locked" as const });
  return <><p role="alert" className="relative z-[90] bg-white px-5 text-red-800">{error}</p>{!progress && !error && <p className="p-10">正在讀取地圖進度…</p>}{progress?.enrolled ? <StudentMapDynamic
    profile={{ realName: progress.realName || "", studentNumber: progress.studentNumber || "", requiresIdentity: Boolean(progress.requiresIdentity), classCode: progress.classCode || "", schoolName: progress.schoolName || "", county: progress.county || "", grade: progress.grade || "" }}
    progress={{ weeks }}
    onIdentitySaved={(identity) => setProgress((current) => current ? { ...current, ...identity, requiresIdentity: false } : current)}
  /> : progress && <main className="mx-auto max-w-lg px-5 py-16"><h1 className="text-3xl font-bold">尚未綁定班級</h1><p className="my-5">學生帳號會在註冊時綁定班級。請登出後以教師提供的班級代碼重新註冊，或聯絡教師協助。</p></main>}</>;
}
