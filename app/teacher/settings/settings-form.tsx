"use client";

import { useEffect, useState } from "react";
import { api, buttonClass, fieldClass } from "@/app/_components/classroom-ui";
import type { schoolChoices, teacherDashboard } from "@/lib/classroom/service";

type Schools = Awaited<ReturnType<typeof schoolChoices>>;
type Dashboard = Awaited<ReturnType<typeof teacherDashboard>>;
type Toast = { kind: "success" | "error"; message: string } | null;

export default function SettingsForm() {
  const [schools, setSchools] = useState<Schools | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [schoolId, setSchoolId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    Promise.all([
      api<Schools>("/api/classroom/schools"),
      api<Dashboard>("/api/classroom/dashboard"),
    ]).then(([schoolResult, dashboardResult]) => {
      setSchools(schoolResult);
      setDashboard(dashboardResult);
      setSchoolId(dashboardResult.classroom?.schoolId || "");
    }).catch((error: Error) => setToast({ kind: "error", message: error.message }));
  }, []);

  const school = schools?.schools.find((item) => item.id === schoolId);
  const classCodeLocked = Boolean(dashboard?.classroom?.enrollments.length);
  const selectedStudent = dashboard?.classroom?.enrollments.find((item) => item.student.id === studentId)?.student;
  const resetTarget = selectedStudent ? `${selectedStudent.displayName}（帳號 ${selectedStudent.id.slice(0, 8)}）` : "全班學生";

  async function resetProgress() {
    setBusy(true);
    setToast(null);
    try {
      if (!dashboard?.classroom) throw new Error("找不到可重製的班級。");
      const targets = dashboard.classroom.enrollments
        .filter((item) => !studentId || item.student.id === studentId)
        .map((item) => ({ studentId: item.student.id, generation: item.generation }));
      if (!targets.length) throw new Error("找不到可重製的學生。");
      const result = await api<{ resetCount: number }>("/api/classroom/reset", {
        classId: dashboard.classroom.id,
        confirmation: "RESET",
        targets,
      });
      setDashboard(await api<Dashboard>("/api/classroom/dashboard"));
      setShowResetModal(false);
      setToast({ kind: "success", message: `已重製 ${result.resetCount} 位學生的進度與結案狀態。` });
    } catch (error) {
      setToast({ kind: "error", message: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return <>
    {toast && <div className={`fixed right-5 top-20 z-[100] max-w-sm rounded-2xl border px-5 py-4 shadow-xl ${toast.kind === "error" ? "border-red-300 bg-red-50 text-red-900" : "border-[#d8c8ab] bg-[#fff8ea] text-[#5d5145]"}`} role={toast.kind === "error" ? "alert" : "status"}>
      <div className="flex items-start gap-4"><p>{toast.message}</p><button className="font-bold" aria-label="關閉通知" onClick={() => setToast(null)}>×</button></div>
    </div>}

    {!schools || !dashboard ? <p role="status">正在載入學校與設定…</p> : <>
      <form className="space-y-5 rounded-2xl border bg-white p-6" onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setToast(null);
        const form = new FormData(event.currentTarget);
        try {
          await api("/api/classroom/settings", {
            ...(dashboard.classroom ? { classId: dashboard.classroom.id } : {}),
            teacherName: String(form.get("teacherName") || "").trim(),
            classCode: String(form.get("classCode") || "").trim().toUpperCase(),
            schoolId,
            county: school?.county,
            grade: form.get("grade"),
            studentCount: Number(form.get("studentCount")),
            plannedWeeks: 6,
          });
          setDashboard(await api<Dashboard>("/api/classroom/dashboard"));
          setToast({ kind: "success", message: "設定已儲存。" });
        } catch (error) {
          setToast({ kind: "error", message: (error as Error).message });
        } finally {
          setBusy(false);
        }
      }}>
        <label className="block">教師姓名 / 稱謂<input name="teacherName" minLength={1} maxLength={100} defaultValue={dashboard.teacherName} required className={fieldClass} placeholder="例如：王老師" autoComplete="name" /></label>
        <label className="block">學校<select value={schoolId} onChange={(event) => setSchoolId(event.target.value)} required className={fieldClass}><option value="">請選擇學校</option>{schools.schools.map((item) => <option key={item.id} value={item.id}>{item.county} · {item.name}</option>)}</select></label>
        <label className="block">縣市<input readOnly value={school?.county || ""} className={fieldClass} /></label>
        <label className="block">年級<select name="grade" defaultValue={dashboard.classroom?.grade || "高一"} className={fieldClass}>{["高一", "高二", "高三"].map((grade) => <option key={grade}>{grade}</option>)}</select></label>
        <label className="block">班級人數<input type="number" name="studentCount" min={1} max={200} defaultValue={dashboard.classroom?.studentCount || 30} required className={fieldClass} /></label>
        <label className="block">班級代碼<input name="classCode" minLength={8} maxLength={64} pattern="[A-Za-z0-9][A-Za-z0-9-]{7,63}" defaultValue={dashboard.classroom?.joinCode || ""} required readOnly={classCodeLocked} aria-readonly={classCodeLocked} autoComplete="off" spellCheck={false} className={`${fieldClass} uppercase ${classCodeLocked ? "cursor-not-allowed bg-stone-100 text-stone-500" : ""}`} placeholder="例如 SHELTER-2026" />{classCodeLocked && <span className="mt-2 block text-xs font-bold text-amber-800">已有學生加入，班級代碼已鎖定。</span>}</label>
        <p className="text-xs text-stone-500">學生首次註冊時會使用此碼，且不可與其他班級重複。</p>
        <button disabled={busy || !school} className={buttonClass}>{busy ? "儲存中…" : "儲存並載入在地設定"}</button>
      </form>

      {dashboard.classroom && <section className="mt-8 rounded-3xl border border-[#d8cfc3] bg-[#fffdf8] p-6 shadow-sm" aria-labelledby="class-members-title">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e6ddd2] pb-5">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f7c5e]">班級管理</p><h2 id="class-members-title" className="mt-2 text-2xl font-bold text-[#3f352c]">目前已加入的學生</h2></div>
          <div className="rounded-2xl bg-[#eee8df] px-5 py-3 text-center"><strong className="block text-2xl text-[#5d5145]">{dashboard.classroom.enrollments.length}</strong><span className="text-xs text-[#776b61]">學生總人數</span></div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#ded2c2] bg-[#f7f1e8] px-4 py-3 text-sm"><span className="font-bold text-[#65594d]">班級代碼</span><code className="rounded-lg bg-white px-3 py-1.5 font-bold tracking-wider text-[#4e4032]">{dashboard.classroom.joinCode}</code></div>
        {dashboard.classroom.enrollments.length ? <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {dashboard.classroom.enrollments.map((item, index) => <li key={item.student.id} className="flex items-center gap-4 rounded-2xl border border-[#e3dbd0] bg-white px-4 py-3"><span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#87958e] font-bold text-white">{index + 1}</span><span><strong className="block text-[#3f352c]">{item.student.displayName}</strong><small className="text-[#83776b]">帳號 {item.student.id.slice(0, 8)}</small></span></li>)}
        </ul> : <p className="mt-5 rounded-2xl border border-dashed border-[#d8cfc3] px-5 py-6 text-center text-sm text-[#776b61]">目前尚無學生加入。請將上方班級代碼提供給學生註冊。</p>}
      </section>}

      {dashboard.classroom && <section className="mt-8 rounded-2xl border-2 border-red-300 bg-red-50 p-6" aria-labelledby="danger-zone-title">
        <p className="text-sm font-bold uppercase tracking-widest text-red-700">Danger Zone</p>
        <h2 id="danger-zone-title" className="mt-2 text-xl font-bold text-red-950">重製學生地圖解鎖進度</h2>
        <p className="my-3 text-red-900">第一週恢復為進行中，第二至第六週重新鎖定，並取消全課程結案。作答內容會留在審查紀錄中。</p>
        <label className="block font-bold text-red-950">重製範圍<select value={studentId} onChange={(event) => setStudentId(event.target.value)} className={fieldClass}><option value="">全班學生</option>{dashboard.classroom.enrollments.map((item) => <option key={item.student.id} value={item.student.id}>{item.student.displayName} · 帳號 {item.student.id.slice(0, 8)}</option>)}</select></label>
        <button type="button" disabled={busy || dashboard.classroom.enrollments.length === 0} className="mt-4 rounded-xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800 disabled:opacity-40" onClick={() => setShowResetModal(true)}>重製學生地圖解鎖進度</button>
      </section>}
    </>}

    {showResetModal && <div className="fixed inset-0 z-[110] grid place-items-center bg-stone-950/60 p-5" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !busy) setShowResetModal(false); }}>
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="reset-dialog-title">
        <p className="font-bold text-red-700">不可復原的進度操作</p>
        <h2 id="reset-dialog-title" className="mt-2 text-2xl font-bold">確定要重製{resetTarget}的進度嗎？</h2>
        <p className="mt-4 text-stone-600">確認後會立即重設六週狀態與結案標記。學生需要從第一週重新開始。</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" disabled={busy} className="rounded-xl border border-stone-300 px-5 py-3 font-bold" onClick={() => setShowResetModal(false)}>取消</button>
          <button type="button" disabled={busy} className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white disabled:opacity-50" onClick={resetProgress}>{busy ? "重製中…" : "確認重製"}</button>
        </div>
      </section>
    </div>}
  </>;
}
