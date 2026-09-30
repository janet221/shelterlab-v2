"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, buttonClass } from "@/app/_components/classroom-ui";
import type { teacherDashboard } from "@/lib/classroom/service";
import { courseWeekLabel } from "@/lib/classroom/course";

type Dashboard = Awaited<ReturnType<typeof teacherDashboard>>;
const STATUS_LABEL = { locked: "未解鎖", in_progress: "進行中", returned: "已退件", pending: "審查中", completed: "已完成" } as const;
function progressActionLabel(week:number,status:keyof typeof STATUS_LABEL){return week===6&&status==="completed"?"已完成 · 可抽查退件":STATUS_LABEL[status]}
function statusBadgeClass(status:keyof typeof STATUS_LABEL){
  if(status==="completed")return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if(status==="in_progress")return "border-amber-200 bg-amber-50 text-amber-800";
  if(status==="pending")return "border-orange-200 bg-orange-50 text-orange-800";
  if(status==="returned")return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-stone-200 bg-stone-100 text-stone-600";
}

export default function TeacherDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const refresh = useCallback(async () => {
    try { setDashboard(await api<Dashboard>("/api/classroom/dashboard")); setError(""); }
    catch (cause) { setError((cause as Error).message); }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [refresh]);

  async function copyClassCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("無法自動複製，請手動選取班級代碼。");
    }
  }

  return <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 lg:px-8 lg:py-12">
    <header className="border-l-4 border-[#6f8b7d] pl-5 sm:pl-6">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7f7165]">教師工作區</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-[#302820] sm:text-4xl">學習進度追蹤</h1>
      <p className="mt-3 max-w-3xl leading-7 text-stone-600">{dashboard?.classroom ? `${dashboard.classroom.schoolName} · ${dashboard.classroom.county} · ${dashboard.classroom.grade}` : "先完成班級設定，即可追蹤學生進度。"}</p>
    </header>
    {dashboard?.classroom && <section className="relative overflow-hidden rounded-[2rem] border border-[#d8c7a7] bg-[linear-gradient(135deg,#fffaf0_0%,#f1eadf_58%,#dfe9e2_100%)] p-6 shadow-[0_24px_70px_-45px_rgba(70,57,44,0.65)] sm:p-8" aria-labelledby="teacher-zone-title">
      <div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/60 blur-2xl" />
      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#806e58]">授課資訊</p>
          <h2 id="teacher-zone-title" className="mt-2 text-2xl font-black text-[#382f28]">授課教師專區</h2>
          <p className="mt-3 text-lg font-bold text-[#574b40]">{dashboard.teacherName}</p>
        </div>
        <dl className="grid flex-1 gap-3 sm:grid-cols-2 xl:max-w-4xl xl:grid-cols-4">
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4"><dt className="text-xs font-bold text-[#887966]">學校與縣市</dt><dd className="mt-2 font-bold text-[#3f352c]">{dashboard.classroom.schoolName}<span className="mt-1 block text-sm font-medium text-[#6f6257]">{dashboard.classroom.county}</span></dd></div>
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4"><dt className="text-xs font-bold text-[#887966]">任教年級</dt><dd className="mt-2 text-lg font-bold text-[#3f352c]">{dashboard.classroom.grade}</dd></div>
          <div className="rounded-2xl border border-white/80 bg-white/70 p-4 sm:col-span-2"><dt className="text-xs font-bold text-[#887966]">班級代碼</dt><dd className="mt-2 flex flex-wrap items-center gap-3"><code className="rounded-lg bg-[#3f554d] px-3 py-2 font-bold tracking-wider text-white">{dashboard.classroom.joinCode}</code><button type="button" onClick={() => void copyClassCode(dashboard.classroom!.joinCode)} className="rounded-xl border border-[#8f806b] bg-white px-4 py-2 text-sm font-bold text-[#4e4339] transition hover:bg-[#fffaf0]">{copied ? "已複製 ✓" : "一鍵複製班級代碼"}</button></dd></div>
        </dl>
      </div>
    </section>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    {!dashboard && !error && <p role="status">載入中…</p>}
    {dashboard && !dashboard.classroom && <Link className={buttonClass} href="/teacher/settings">設定我的班級</Link>}

    {dashboard?.classroom && <>
      {dashboard.pending.length===0?<section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ddd6cb] bg-[#faf7f2] px-5 py-3.5 text-sm shadow-sm" aria-label="待審查狀態"><p className="font-bold text-[#65594d]"><span aria-hidden="true" className="mr-2 text-emerald-700">✓</span>目前無待審查關卡 <span className="ml-1 rounded-full bg-white px-2 py-1 text-xs">0</span></p><button className="rounded-xl border border-[#d7c8b5] bg-white px-3 py-2 text-xs font-bold text-[#665644] transition hover:bg-[#f3eadc]" onClick={refresh}>↻ 立即更新</button></section>:<section className="rounded-[1.75rem] border border-[#e1d7ca] bg-white p-6 shadow-[0_18px_50px_-36px_rgba(66,51,36,0.55)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Review Queue</p><h2 className="mt-2 text-2xl font-black text-[#382f28]">等待審查 · {dashboard.pending.length} 份</h2><p className="mt-2 text-sm leading-6 text-stone-600">每十秒同步一次；通過後會自動解鎖下一週。</p></div><button className="rounded-xl border border-[#d7c8b5] bg-[#fffaf2] px-4 py-2 text-sm font-bold text-[#665644] transition hover:bg-[#f3eadc]" onClick={refresh}>↻ 立即更新</button></div>
        <ul className="mt-4 divide-y">{dashboard.pending.map((work) => <li className="grid gap-3 py-4 md:grid-cols-[1fr_1fr_auto] md:items-center" key={work.id}><span><strong>{work.student.displayName}</strong><small className="mt-1 block text-stone-500">學號 {work.student.studentNumber || "未填寫"}</small></span><span><strong>{courseWeekLabel(work.week)}</strong><small className="mt-1 block text-stone-500">{work.submittedAt ? new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(work.submittedAt)) : "尚無送出時間"}</small></span><Link className="font-bold text-[#7f7165] underline" href={`/teacher/reviews/${work.id}`}>檢視全部填答</Link></li>)}</ul>
      </section>}

      <section className="rounded-[1.75rem] border border-[#d9dfda] bg-white p-6 shadow-[0_18px_50px_-36px_rgba(55,80,68,0.5)] sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#608071]">Class Overview</p><h2 className="mt-2 text-2xl font-black text-[#382f28]">全班學習進度</h2><p className="mt-2 text-sm text-stone-600">{dashboard.classroom.enrollments.length}／{dashboard.classroom.studentCount} 位學生已加入</p></div><code className="rounded-xl border border-[#d8e2dc] bg-[#edf3ef] px-4 py-2.5 font-bold tracking-wider text-[#3f554d]">{dashboard.classroom.joinCode}</code></div>
        {dashboard.classroom.enrollments.length ? <div className="mt-6 overflow-x-auto rounded-2xl border border-[#ece5dc]"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#faf7f2] text-[#65594d]"><tr><th className="p-4">學生</th>{[1, 2, 3, 4, 5, 6].map((week) => <th className="p-4" key={week}>第 {week} 週</th>)}</tr></thead><tbody>{dashboard.classroom.enrollments.map((enrollment) => <tr className="border-t border-[#eee7de] transition hover:bg-[#fffdf9]" key={enrollment.student.id}><td className="p-4"><strong>{enrollment.student.displayName}</strong><small className="mt-1 block text-stone-500">{enrollment.student.studentNumber || "未填學號"}</small></td>{[1, 2, 3, 4, 5, 6].map((week) => { const work = enrollment.weeks.find((item) => item.week === week); const status:keyof typeof STATUS_LABEL = work?.status || "locked"; const reviewable = work && ["pending", "returned", "completed"].includes(work.status); const badge=`inline-flex max-w-[9rem] items-center rounded-full border px-2.5 py-1.5 text-xs font-bold leading-4 ${statusBadgeClass(status)}`; return <td className="p-4" key={week}>{reviewable ? <Link className={`${badge} transition hover:brightness-95`} href={`/teacher/reviews/${work.id}`}>{progressActionLabel(week,status)}{work.rejectionCount ? ` · 退件 ${work.rejectionCount}` : ""}</Link> : <span className={badge}>{progressActionLabel(week,status)}</span>}</td>; })}</tr>)}</tbody></table></div> : <p className="mt-5">目前尚無學生加入。</p>}
      </section>
    </>}
  </main>;
}
