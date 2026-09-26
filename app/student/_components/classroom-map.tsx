"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/app/_components/classroom-ui";
import StudentMapDynamic from "./student-map-dynamic";
import StudentRouteLoading from "./student-route-loading";
import type { PendingReward, ReviewMilestone, StudentMapProgress } from "@/lib/student-map";
type Progress = { enrolled: boolean; generation?: number; realName?: string; studentNumber?: string; requiresIdentity?: boolean; schoolName?: string; classCode?: string; county?: string; grade?: string; plannedWeeks?: number; weeks: StudentMapProgress["weeks"]; reviewHistory?: ReviewMilestone[]; pendingRewards?: PendingReward[] };
export default function ClassroomMap() {
  const [progress, setProgress] = useState<Progress | null>(null), [error, setError] = useState("");
  const refresh = useCallback(() => api<Progress>("/api/classroom/progress").then(p => { setProgress(p); setError(""); }).catch(e => setError(e.message)), []);
  useEffect(() => { void refresh(); const timer = setInterval(refresh, 5000); window.addEventListener("focus", refresh); return () => { clearInterval(timer); window.removeEventListener("focus", refresh); }; }, [refresh]);
  const weeks = ([1, 2, 3, 4, 5, 6] as const).map(week => progress?.weeks.find(w => w.week === week) || { week, status: "locked" as const });
  return <><p role="alert" className="relative z-[90] bg-white px-5 text-red-800">{error}</p>{!progress && !error && <StudentRouteLoading title="正在讀取地圖進度" description="正在同步你的六週旅程、解鎖狀態與探究工具…" />}{progress?.enrolled ? <StudentMapDynamic
    profile={{ realName: progress.realName || "", studentNumber: progress.studentNumber || "", requiresIdentity: Boolean(progress.requiresIdentity), classCode: progress.classCode || "", schoolName: progress.schoolName || "", county: progress.county || "", grade: progress.grade || "" }}
    progress={{ weeks, reviewHistory: progress.reviewHistory ?? [], pendingRewards: progress.pendingRewards ?? [] }}
    onIdentitySaved={(identity) => setProgress((current) => current ? { ...current, ...identity, requiresIdentity: false } : current)}
    onRewardClaimed={async (week) => { await api(`/api/classroom/rewards/${week}/claim`, {}); await refresh(); }}
  /> : progress && <main className="mx-auto max-w-lg px-5 py-16"><h1 className="text-3xl font-bold">尚未綁定班級</h1><p className="my-5">學生帳號會在註冊時綁定班級。請登出後以教師提供的班級代碼重新註冊，或聯絡教師協助。</p></main>}</>;
}
