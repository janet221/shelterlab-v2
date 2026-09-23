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
    {toast && <div className={`fixed right-5 top-20 z-[100] max-w-sm rounded-2xl border px-5 py-4 shadow-xl ${toast.kind === "error" ? "border-red-300 bg-red-50 text-red-900" : "border-teal-300 bg-teal-50 text-teal-950"}`} role={toast.kind === "error" ? "alert" : "status"}>
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
            schoolId,
            county: school?.county,
            grade: form.get("grade"),
            studentCount: Number(form.get("studentCount")),
            plannedWeeks: 6,
          });
          setDashboard(await api<Dashboard>("/api/classroom/dashboard"));
          setToast({ kind: "success", message: "設定已儲存。工作台會自動載入在地資料。" });
        } catch (error) {
          setToast({ kind: "error", message: (error as Error).message });
        } finally {
          setBusy(false);
        }
      }}>
        <label className="block">學校<select value={schoolId} onChange={(event) => setSchoolId(event.target.value)} required className={fieldClass}><option value="">請選擇學校</option>{schools.schools.map((item) => <option key={item.id} value={item.id}>{item.county} · {item.name}</option>)}</select></label>
        <p className="text-xs text-stone-500">{schools.source.message}。{schools.source.updatedAt}</p>
        <label className="block">縣市<input readOnly value={school?.county || ""} className={fieldClass} aria-describedby="county-note" /></label>
        <p id="county-note" className="text-xs">由學校名錄鎖定，後端會再次核對。</p>
        <label className="block">年級<select name="grade" defaultValue={dashboard.classroom?.grade || "高一"} className={fieldClass}>{["高一", "高二", "高三"].map((grade) => <option key={grade}>{grade}</option>)}</select></label>
        <label className="block">班級人數<input type="number" name="studentCount" min={1} max={200} defaultValue={dashboard.classroom?.studentCount || 30} required className={fieldClass} /></label>
        <label className="block">課程週數<input value="6 週" readOnly className={fieldClass} /></label>
        <p className="text-xs">ShelterLab 採固定六週闖關；學生完成前一週並經教師通過後，才會解鎖下一週。</p>
        <button disabled={busy || !school} className={buttonClass}>{busy ? "儲存中…" : "儲存並載入在地設定"}</button>
      </form>

      {dashboard.classroom && <section className="mt-8 rounded-2xl border-2 border-red-300 bg-red-50 p-6" aria-labelledby="danger-zone-title">
        <p className="text-sm font-bold uppercase tracking-widest text-red-700">Danger Zone</p>
        <h2 id="danger-zone-title" className="mt-2 text-xl font-bold text-red-950">重製學生地圖解鎖進度</h2>
        <p className="my-3 text-red-900">第一週恢復為進行中，第二至第六週重新鎖定，並取消全課程結案。作答內容會留在稽核紀錄中。</p>
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
