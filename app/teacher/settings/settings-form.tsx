"use client";

import { useEffect, useState } from "react";
import { api, buttonClass, fieldClass } from "@/app/_components/classroom-ui";
import type { schoolChoices, teacherDashboard } from "@/lib/classroom/service";
import { TAIWAN_COUNTIES } from "@/lib/week-six-action";

type Schools = Awaited<ReturnType<typeof schoolChoices>>;
type Dashboard = Awaited<ReturnType<typeof teacherDashboard>>;
type Toast = { kind: "success" | "error"; message: string } | null;

export default function SettingsForm() {
  const [schools, setSchools] = useState<Schools | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [schoolId, setSchoolId] = useState("");
  const [county, setCounty] = useState("");
  const [studentId, setStudentId] = useState("");
  const [resetWeek, setResetWeek] = useState(1);
  const [confirmationName, setConfirmationName] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState(false);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [editingNumber, setEditingNumber] = useState("");

  useEffect(() => {
    api<Dashboard>("/api/classroom/dashboard").then((dashboardResult) => {
      setDashboard(dashboardResult);
      setSchoolId(dashboardResult.classroom?.schoolId || "");
      setCounty(dashboardResult.classroom?.county || "");
      setStudentId(dashboardResult.classroom?.enrollments[0]?.student.id || "");
    }).catch((error: Error) => setToast({ kind: "error", message: error.message }));
  }, []);

  useEffect(()=>{
    if(!county){setSchools(null);return}
    let active=true;
    setSchoolLoading(true);
    api<Schools>(`/api/classroom/schools?county=${encodeURIComponent(county)}`).then((result)=>{if(active)setSchools(result)}).catch((error:Error)=>{if(active)setToast({kind:"error",message:error.message})}).finally(()=>{if(active)setSchoolLoading(false)});
    return()=>{active=false};
  },[county]);

  const school = schools?.schools.find((item) => item.id === schoolId);
  const countySchools = schools?.schools ?? [];
  const classCodeLocked = Boolean(dashboard?.classroom?.enrollments.length);
  const selectedEnrollment = dashboard?.classroom?.enrollments.find((item) => item.student.id === studentId);
  const selectedStudent = selectedEnrollment?.student;
  const resetTarget = selectedStudent ? `${selectedStudent.displayName}（帳號 ${selectedStudent.accountName}）` : "尚未選擇學生";
  const canResetToWeek = (week: number) => {
    const predecessors = selectedEnrollment?.weeks.filter((item) => item.week < week) ?? [];
    return predecessors.length === week - 1 && predecessors.every((item) => item.status === "completed");
  };
  const confirmationMatches = Boolean(selectedStudent && confirmationName.trim() === selectedStudent.displayName);
  const preservedRange = resetWeek === 1 ? "不保留先前週次" : `保留第 1–${resetWeek - 1} 週`;
  const lockedRange = resetWeek === 6 ? "沒有後續週次需要鎖定" : `第 ${resetWeek + 1}–6 週重新鎖定`;

  async function resetProgress() {
    setBusy(true);
    setToast(null);
    try {
      if (!dashboard?.classroom) throw new Error("找不到可重製的班級。");
      if (!selectedEnrollment) throw new Error("請先選擇一位學生。");
      if (!canResetToWeek(resetWeek)) throw new Error(`第 ${resetWeek} 週以前尚有未完成的關卡，請選擇較早的週次。`);
      const result = await api<{ resetCount: number; startWeek: number; studentName: string }>("/api/classroom/reset", {
        classId: dashboard.classroom.id,
        confirmationName: confirmationName.trim(),
        targets: [{ studentId: selectedEnrollment.student.id, generation: selectedEnrollment.generation, startWeek: resetWeek }],
      });
      setDashboard(await api<Dashboard>("/api/classroom/dashboard"));
      setShowResetModal(false);
      setConfirmationName("");
      setToast({ kind: "success", message: `已將 ${result.studentName} 重置回第 ${result.startWeek} 週；第 ${result.startWeek} 週起可重新挑戰。` });
    } catch (error) {
      setToast({ kind: "error", message: (error as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function saveStudentIdentity(){
    if(!editingStudentId)return;
    setBusy(true);setToast(null);
    try{
      await api(`/api/classroom/students/${editingStudentId}`,{realName:editingName,studentNumber:editingNumber});
      setDashboard(await api<Dashboard>("/api/classroom/dashboard"));
      setEditingStudentId("");
      setToast({kind:"success",message:"學生姓名與學號已更新。"});
    }catch(error){setToast({kind:"error",message:(error as Error).message})}finally{setBusy(false)}
  }

  return <>
    {toast && <div className={`fixed right-5 top-20 z-[100] max-w-sm rounded-2xl border px-5 py-4 shadow-xl ${toast.kind === "error" ? "border-red-300 bg-red-50 text-red-900" : "border-[#d8c8ab] bg-[#fff8ea] text-[#5d5145]"}`} role={toast.kind === "error" ? "alert" : "status"}>
      <div className="flex items-start gap-4"><p>{toast.message}</p><button className="font-bold" aria-label="關閉通知" onClick={() => setToast(null)}>×</button></div>
    </div>}

    {!dashboard ? <p role="status">正在載入班級設定…</p> : <>
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
            county,
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
        <label className="block">縣市<select value={county} onChange={(event)=>{setCounty(event.target.value);setSchoolId("");setSchools(null)}} required className={fieldClass}><option value="">請先選擇縣市</option>{TAIWAN_COUNTIES.map((item)=><option key={item} value={item}>{item}</option>)}</select></label>
        <label className="block">學校<select value={schoolId} onChange={(event) => setSchoolId(event.target.value)} required disabled={!county||schoolLoading} className={fieldClass}><option value="">{!county?"請先選擇縣市":schoolLoading?`正在載入${county}學校…`:`請選擇${county}的高級中等學校`}</option>{countySchools.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><span className="mt-2 block text-xs text-stone-500">{schoolLoading?"正在從伺服器快取篩選學校…":`資料來源：教育部 115 學年度全國高級中等學校名錄；${county||"目前縣市"}共 ${countySchools.length} 所。`}</span></label>
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
          {dashboard.classroom.enrollments.map((item, index) => <li key={item.student.id}><button type="button" onClick={()=>{setEditingStudentId(item.student.id);setEditingName(item.student.realName||item.student.displayName);setEditingNumber(item.student.studentNumber)}} className="flex w-full items-center gap-4 rounded-2xl border border-[#e3dbd0] bg-white px-4 py-3 text-left transition hover:border-[#9e8d78] hover:bg-[#fffaf2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d8bd79]/40"><span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#87958e] font-bold text-white">{index + 1}</span><span className="min-w-0"><strong className="block text-[#3f352c]">{item.student.displayName}</strong><small className="block truncate text-[#83776b]">帳號 {item.student.accountName}</small><small className="block text-[#83776b]">學號 {item.student.studentNumber||"未填寫"} · 點擊編輯</small></span></button></li>)}
        </ul> : <p className="mt-5 rounded-2xl border border-dashed border-[#d8cfc3] px-5 py-6 text-center text-sm text-[#776b61]">目前尚無學生加入。請將上方班級代碼提供給學生註冊。</p>}
      </section>}

      {dashboard.classroom && <section className="mt-8 rounded-2xl border-2 border-red-300 bg-red-50 p-6" aria-labelledby="danger-zone-title">
        <p className="text-sm font-bold uppercase tracking-widest text-red-700">Danger Zone</p>
        <h2 id="danger-zone-title" className="mt-2 text-xl font-bold text-red-950">重置學生地圖進度</h2>
        <p className="my-3 text-red-900">保留所選週次以前已完成的學習成果；所選週次會恢復為可挑戰，之後週次重新鎖定，並清除其作答、退件與審查狀態。</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block font-bold text-red-950">選擇學生<select value={studentId} onChange={(event) => { setStudentId(event.target.value); setResetWeek(1); setConfirmationName(""); }} className={fieldClass}><option value="" disabled>請選擇學生</option>{dashboard.classroom.enrollments.map((item) => <option key={item.student.id} value={item.student.id}>{item.student.displayName} · {item.student.accountName}</option>)}</select></label>
          <label className="block font-bold text-red-950">重置回指定週次<select value={resetWeek} onChange={(event) => setResetWeek(Number(event.target.value))} className={fieldClass}>{[1, 2, 3, 4, 5, 6].map((week) => <option key={week} value={week} disabled={!canResetToWeek(week)}>第 {week} 週{!canResetToWeek(week) ? "（前置週尚未完成）" : ""}</option>)}</select></label>
        </div>
        <p className="mt-3 text-sm font-bold text-red-800">目前設定：{preservedRange}，清除並重置第 {resetWeek}–6 週。</p>
        <button type="button" disabled={busy || !selectedStudent} className="mt-4 rounded-xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800 disabled:opacity-40" onClick={() => { setConfirmationName(""); setShowResetModal(true); }}>開啟重置確認</button>
      </section>}
    </>}

    {showResetModal && <div className="fixed inset-0 z-[110] grid place-items-center bg-stone-950/60 p-5" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target && !busy) setShowResetModal(false); }}>
      <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="reset-dialog-title">
        <p className="font-bold text-red-700">不可復原的高權限操作</p>
        <h2 id="reset-dialog-title" className="mt-2 text-2xl font-bold">確定要重置學生 {resetTarget} 的地圖進度嗎？</h2>
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-900">這將清除其第 {resetWeek} 週至第 6 週的通關狀態與填答紀錄，此操作無法復原。</p>
        <p className="mt-4 text-stone-600">第 {resetWeek} 週會恢復為可挑戰，{lockedRange}；{preservedRange}。</p>
        <label className="mt-5 block font-bold text-stone-800">請輸入學生姓名「{selectedStudent?.displayName}」以確認<input autoFocus value={confirmationName} onChange={(event) => setConfirmationName(event.target.value)} className={fieldClass} autoComplete="off" spellCheck={false} /></label>
        {confirmationName && !confirmationMatches && <p className="mt-2 text-sm font-bold text-red-700" role="alert">姓名不相符，重置按鈕尚未啟用。</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" disabled={busy} className="rounded-xl border border-stone-300 px-5 py-3 font-bold" onClick={() => { setShowResetModal(false); setConfirmationName(""); }}>取消</button>
          <button type="button" disabled={busy || !confirmationMatches} className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40" onClick={resetProgress}>{busy ? "重置中…" : `確認重置回第 ${resetWeek} 週`}</button>
        </div>
      </section>
    </div>}
    {editingStudentId && <div className="fixed inset-0 z-[110] grid place-items-center bg-stone-950/60 p-5" role="presentation" onMouseDown={(event)=>{if(event.currentTarget===event.target&&!busy)setEditingStudentId("")}}>
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="edit-student-title">
        <p className="text-xs font-black uppercase tracking-[.18em] text-[#8f7c5e]">Student Management</p>
        <h2 id="edit-student-title" className="mt-2 text-2xl font-bold text-[#3f352c]">編輯學生資料</h2>
        <p className="mt-2 text-sm text-stone-600">登入帳號由認證系統管理，此處更新教師名冊中的姓名與學號。</p>
        <label className="mt-5 block font-bold">學生姓名<input autoFocus value={editingName} onChange={(event)=>setEditingName(event.target.value)} minLength={2} maxLength={100} className={fieldClass}/></label>
        <label className="mt-4 block font-bold">學號<input value={editingNumber} onChange={(event)=>setEditingNumber(event.target.value)} minLength={1} maxLength={40} pattern="[A-Za-z0-9_-]+" className={fieldClass}/></label>
        <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={busy} onClick={()=>setEditingStudentId("")} className="rounded-xl border border-stone-300 px-5 py-3 font-bold">取消</button><button type="button" disabled={busy||editingName.trim().length<2||!editingNumber.trim()} onClick={saveStudentIdentity} className={buttonClass}>{busy?"儲存中…":"儲存學生資料"}</button></div>
      </section>
    </div>}
  </>;
}
