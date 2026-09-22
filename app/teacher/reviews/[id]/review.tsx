"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, buttonClass, fieldClass } from "@/app/_components/classroom-ui";
import CaseComparison from "@/app/_components/case-comparison";
import DataLens from "@/app/_components/data-lens";
import type { teacherSubmission } from "@/lib/classroom/service";
import type { QuestionSet, SubmittedAnswer } from "@/lib/classroom/data-types";
type Record = Awaited<ReturnType<typeof teacherSubmission>>;
export default function Review({ id }: { id: string }) {
  const [record, setRecord] = useState<Record | null>(null), [error, setError] = useState(""), [feedback, setFeedback] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { api<Record>(`/api/classroom/reviews/${id}`).then(r => { setRecord(r); setFeedback(r.feedback); }).catch(e => setError(e.message)); }, [id]);
  const set = record?.questionSet as unknown as QuestionSet | null, answers = record?.answers as unknown as SubmittedAnswer[] | null;
  async function decide(decision: "approve" | "return") { if (!record) return; setBusy(true); try { await api(`/api/classroom/reviews/${id}`, { version: record.version, decision, feedback }); window.location.href = "/teacher/reviews"; } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }
  return <main className="mx-auto max-w-5xl space-y-6 px-5 py-10"><Link className="underline" href="/teacher/reviews">← 返回待審清單</Link><h1 className="text-3xl font-bold">逐題檢視與批改</h1><p role="alert" className="text-red-800">{error}</p>{record && set ? <><p>{record.enrollment.student.displayName} · 第 {record.week} 週 · {record.status === "pending" ? "等待審核中" : "目前不可批改"}</p><CaseComparison set={set} />{set.questions.map((q, i) => { const answer = answers?.find(a => a.questionId === q.id); return <article key={q.id} className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">{i + 1}. {q.prompt}</h2><p className="my-3 text-sm">後端計算依據：{q.fact}</p><p className="font-bold">學生選用紀錄：{answer?.selectedAnimalIds.join("、") || "未選擇"}</p><p className="mt-4 whitespace-pre-wrap rounded-xl bg-stone-50 p-4">{answer?.text || "尚未作答"}</p></article>; })}<DataLens metadata={set.metadata} /><label className="block font-bold">教師回饋<textarea value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={3000} rows={4} className={fieldClass} /></label><div className="flex gap-4"><button className={buttonClass} disabled={busy || record.status !== "pending"} onClick={() => decide("approve")}>通過並解鎖下一週</button><button className="rounded-xl border px-5 py-3" disabled={busy || record.status !== "pending" || feedback.trim().length < 2} onClick={() => decide("return")}>退回修改</button></div></> : !error && <p>載入作業中…</p>}</main>;
}
