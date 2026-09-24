"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, buttonClass, fieldClass } from "@/app/_components/classroom-ui";
import CaseComparison from "@/app/_components/case-comparison";
import DataLens from "@/app/_components/data-lens";
import { courseWeekLabel } from "@/lib/classroom/course";
import type { QuestionSet, SubmittedAnswer, WeekAuditEntry, WeekGameAudit } from "@/lib/classroom/data-types";
import type { teacherSubmission } from "@/lib/classroom/service";

type SubmissionRecord = Awaited<ReturnType<typeof teacherSubmission>>;

const kindLabel: Record<WeekAuditEntry["kind"], string> = {
  choice: "選擇題",
  text: "文字回答",
  checkbox: "勾選題",
  select: "下拉選擇",
  action: "互動操作"
};

function GameAuditReview({ audit }: { audit: WeekGameAudit }) {
  const groups = useMemo(() => {
    const result = new Map<string, WeekAuditEntry[]>();
    const gradableEntries = audit.entries.filter((entry) =>
      entry.answered &&
      entry.answers.length > 0 &&
      entry.kind !== "action" &&
      !entry.section.includes("互動題目") &&
      !entry.prompt.includes("互動題目")
    );
    for (const entry of gradableEntries) result.set(entry.section, [...(result.get(entry.section) ?? []), entry]);
    return [...result.entries()];
  }, [audit.entries]);

  return <section className="space-y-5" aria-label="完整關卡填答稽核">
    <p className="text-sm text-stone-600">完成時間：{new Date(audit.completedAt).toLocaleString("zh-TW")}</p>
    {groups.map(([section, entries]) => <section key={section} className="space-y-3 rounded-2xl border border-stone-200 bg-[#fffaf0] p-5">
      <h2 className="text-xl font-bold">{section}</h2>
      {entries.map((entry, index) => <article key={entry.id} className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-bold">{index + 1}. {entry.prompt}</h3>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            {kindLabel[entry.kind]}
          </span>
        </div>
        <div className="mt-3 whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-stone-800">
          {entry.answers.join("\n")}
        </div>
      </article>)}
    </section>)}
    {groups.length === 0 && <p className="rounded-2xl border border-stone-200 bg-white p-5 text-stone-600">此關卡沒有需要批改的填答題。</p>}
  </section>;
}

function LegacyReview({ questionSet, answers }: { questionSet: QuestionSet; answers: SubmittedAnswer[] | null }) {
  return <>
    <CaseComparison set={questionSet} />
    {questionSet.questions.map((question, index) => {
      const answer = answers?.find((item) => item.questionId === question.id);
      return <article key={question.id} className="rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">{index + 1}. {question.prompt}</h2>
        <p className="my-3 text-sm">後端計算依據：{question.fact}</p>
        <p className="font-bold">學生選用紀錄：{answer?.selectedAnimalIds.join("、") || "未選擇"}</p>
        <p className="mt-4 whitespace-pre-wrap rounded-xl bg-stone-50 p-4">{answer?.text || "尚未作答"}</p>
      </article>;
    })}
    <DataLens metadata={questionSet.metadata} />
  </>;
}

export default function Review({ id }: { id: string }) {
  const [record, setRecord] = useState<SubmissionRecord | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<SubmissionRecord>(`/api/classroom/reviews/${id}`)
      .then((result) => { setRecord(result); setFeedback(result.feedback); })
      .catch((cause) => setError(cause.message));
  }, [id]);

  const questionSet = record?.questionSet as unknown as QuestionSet | null;
  const answers = record?.answers as unknown as SubmittedAnswer[] | null;
  const gameAudit = record?.gameAudit as unknown as WeekGameAudit | null;

  async function decide() {
    if (!record) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/classroom/reviews/${id}`, { version: record.version, generation: record.generation, decision: "approve", feedback });
      window.location.href = "/teacher/reviews";
    } catch (cause) {
      setError((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const ready = record && (gameAudit || questionSet);
  return <main className="mx-auto max-w-5xl space-y-6 px-5 py-10">
    <Link className="underline" href="/teacher/reviews">← 返回待審清單</Link>
    <h1 className="text-3xl font-bold">完整關卡填答稽核</h1>
    {error && <div role="alert" className="fixed right-5 top-20 z-[100] max-w-sm rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-red-900 shadow-xl">審核失敗：{error}</div>}
    {ready ? <>
      <p>{record.enrollment.student.displayName} · 學號 {record.enrollment.student.studentNumber || "未填寫"} · {courseWeekLabel(record.week)} · {record.status === "pending" ? "等待審核中" : "目前不可批改"}</p>
      {gameAudit ? <GameAuditReview audit={gameAudit} /> : <LegacyReview questionSet={questionSet!} answers={answers} />}
      <label className="block font-bold">教師回饋<textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} maxLength={3000} rows={4} className={fieldClass} /></label>
      <div className="flex gap-4"><button className={buttonClass} disabled={busy || record.status !== "pending"} onClick={decide}>{busy ? "審核中…" : record.week === 6 ? "審核通過並完成課程" : "審核通過並解鎖下一週"}</button></div>
    </> : !error && <p>載入作業中…</p>}
  </main>;
}
