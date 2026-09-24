"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, buttonClass, fieldClass } from "@/app/_components/classroom-ui";
import { parseStudentReviewFeedback } from "@/lib/classroom/review-guidelines";
import type { StudentMapProgress, WeekStatus } from "@/lib/student-map";

export type StudentProfileView = {
  realName: string;
  studentNumber: string;
  classCode: string;
  schoolName: string;
  county: string;
  grade: string;
  requiresIdentity: boolean;
};

const WEEK_NAMES = ["第一週", "第二週", "第三週", "第四週", "第五週", "第六週"];
const STATUS_NAMES: Record<WeekStatus, string> = {
  locked: "尚未解鎖",
  in_progress: "進行中",
  pending: "審查中",
  completed: "已完成"
};

export function currentProgressLabel(weeks: StudentMapProgress["weeks"]) {
  const active = weeks.find((week) => week.status === "pending") ?? weeks.find((week) => week.status === "in_progress") ?? weeks.find((week) => week.status !== "completed");
  if (!active) return "六週全部完成";
  return `${WEEK_NAMES[active.week - 1]}${STATUS_NAMES[active.status]}`;
}

export default function StudentProfileModal({ open, profile, weeks, onClose, onSaved }: {
  open: boolean;
  profile: StudentProfileView;
  weeks: StudentMapProgress["weeks"];
  onClose: () => void;
  onSaved: (identity: { realName: string; studentNumber: string }) => void;
}) {
  const [realName, setRealName] = useState(profile.realName);
  const [studentNumber, setStudentNumber] = useState(profile.studentNumber);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setRealName(profile.realName);
    setStudentNumber(profile.studentNumber);
    setError("");
  }, [open, profile.realName, profile.studentNumber]);

  if (!open) return null;
  const forced = profile.requiresIdentity;
  const reviews = weeks.flatMap((week) => {
    const review = parseStudentReviewFeedback(week.feedback);
    return review ? [{ week: week.week, reviewedAt: week.reviewedAt, ...review }] : [];
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api<{ realName: string; studentNumber: string }>("/api/classroom/profile", { realName, studentNumber });
      onSaved(result);
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-stone-950/65 p-4" role="presentation">
    <section className="my-6 w-full max-w-xl rounded-3xl border border-[#decfae] bg-[#fffdf8] p-6 text-stone-800 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="student-profile-title" aria-describedby={forced ? "identity-required-note" : undefined}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a7557]">Student Profile</p>
          <h2 id="student-profile-title" className="mt-2 text-2xl font-bold">{forced ? "首次登入身分確認" : "個人中心"}</h2>
        </div>
        {!forced && <button type="button" className="rounded-full border border-stone-300 px-3 py-1 font-bold" aria-label="關閉個人中心" onClick={onClose}>×</button>}
      </div>
      {forced && <p id="identity-required-note" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">請填寫真實姓名與學號。</p>}

      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block font-bold">學生真實姓名<input className={fieldClass} value={realName} onChange={(event) => setRealName(event.target.value)} required minLength={2} maxLength={100} autoComplete="name" /></label>
        <label className="block font-bold">學號<input className={fieldClass} value={studentNumber} onChange={(event) => setStudentNumber(event.target.value)} required minLength={1} maxLength={40} pattern="[A-Za-z0-9_-]+" autoComplete="off" /></label>

        <dl className="grid gap-3 rounded-2xl border border-[#e3d9c8] bg-[#f7f1e8] p-4 text-sm sm:grid-cols-2">
          <div><dt className="font-bold text-stone-500">所屬班級代碼</dt><dd className="mt-1 font-mono font-bold tracking-wider">{profile.classCode}</dd></div>
          <div><dt className="font-bold text-stone-500">目前通關進度</dt><dd className="mt-1 font-bold">{currentProgressLabel(weeks)}</dd></div>
          <div><dt className="font-bold text-stone-500">學校</dt><dd className="mt-1 font-bold">{profile.schoolName || "尚未設定"}</dd></div>
          <div><dt className="font-bold text-stone-500">縣市</dt><dd className="mt-1 font-bold">{profile.county || "尚未設定"}</dd></div>
          <div><dt className="font-bold text-stone-500">年級</dt><dd className="mt-1 font-bold">{profile.grade || "尚未設定"}</dd></div>
        </dl>

        {!forced && <section className="rounded-2xl border border-[#e3d9c8] bg-white p-4">
          <h3 className="font-bold">各關教師評語</h3>
          {reviews.length === 0 ? <p className="mt-2 text-sm text-stone-500">目前尚無教師評語。</p> : <div className="mt-3 space-y-3">
            {reviews.map((review) => <details key={`${review.week}-${review.reviewedAt ?? "review"}`} className="rounded-xl border border-stone-200 bg-[#fffaf0] p-3" open={review.decision === "reject"}>
              <summary className="cursor-pointer font-bold">
                {WEEK_NAMES[review.week - 1]} · <span className={review.decision === "approve" ? "text-emerald-700" : "text-red-700"}>{review.decision === "approve" ? "通過" : "不通過，請修正"}</span>
              </summary>
              {review.items.length ? <ul className="mt-3 space-y-3">
                {review.items.map((item) => <li key={item.entryId} className="rounded-lg bg-white p-3 text-sm">
                  <p className="font-bold">{item.prompt}</p>
                  <p className="mt-1 whitespace-pre-wrap text-stone-700">{item.comment}</p>
                </li>)}
              </ul> : <p className="mt-2 text-sm text-stone-600">教師已通過本週審查，未另留評語。</p>}
            </details>)}
          </div>}
        </section>}

        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">{error}</p>}
        <div className="flex justify-end gap-3">
          {!forced && <button type="button" className="rounded-xl border border-stone-300 px-5 py-3 font-bold" disabled={busy} onClick={onClose}>取消</button>}
          <button className={buttonClass} disabled={busy}>{busy ? "儲存中…" : forced ? "儲存並進入地圖" : "儲存個人資料"}</button>
        </div>
      </form>
    </section>
  </div>;
}
