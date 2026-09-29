"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, buttonClass, fieldClass } from "@/app/_components/classroom-ui";
import CaseComparison from "@/app/_components/case-comparison";
import DataLens from "@/app/_components/data-lens";
import { courseWeekLabel } from "@/lib/classroom/course";
import { gradingGuidelines, isGradableAuditEntry, parseQuestionReviewComments, parseStudentReviewFeedback, serializeQuestionReviewComments, type QuestionReviewComments, type ReviewDecision } from "@/lib/classroom/review-guidelines";
import type { QuestionSet, ReviewHistoryEntry, SubmittedAnswer, WeekAuditEntry, WeekGameAudit } from "@/lib/classroom/data-types";
import type { teacherSubmission } from "@/lib/classroom/service";

type SubmissionRecord = Awaited<ReturnType<typeof teacherSubmission>>;

const kindLabel: Record<WeekAuditEntry["kind"], string> = {
  choice: "選擇題",
  text: "文字回答",
  checkbox: "勾選題",
  select: "下拉選擇",
  action: "互動操作"
};
const CANONICAL_FINAL_PROMPTS:Record<number,string>={
  1:"如果有人只看見灰黑色犬隻的留所天數中位數較高，就說深色犬一定比較不受歡迎，這個結論漏看了哪些資料？你會再查證什麼？",
  2:"綜合本週資料與照護責任，你會如何評估自己目前是否適合承擔長期飼養責任？",
  3:"面對品種與性格標籤時，你會如何使用資料並保留個體差異與資料限制？",
  4:"你如何追查遊蕩犬問題的來源，並區分資料支持的現象、推論與仍待查證之處？",
  5:"面對零撲殺、動物福利、居民安全與生態衝突，你會如何提出有證據且可行的公共選擇？",
  6:"請說明你的行前預期成果、時間規劃，以及所選參與方式如何符合安全與年齡資格條件。"
};
function displayPrompt(week:number,entry:WeekAuditEntry){return /統計截止日|資料只能描述|樣本數差距/.test(entry.prompt)?CANONICAL_FINAL_PROMPTS[week]??entry.prompt:entry.prompt}

function GameAuditReview({ audit, week, comments, editable, onCommentChange }: { audit: WeekGameAudit; week: number; comments: QuestionReviewComments; editable: boolean; onCommentChange: (entryId: string, comment: string) => void }) {
  const groups = useMemo(() => {
    const result = new Map<string, WeekAuditEntry[]>();
    const gradableEntries = audit.entries.filter(isGradableAuditEntry);
    for (const entry of gradableEntries) result.set(entry.section, [...(result.get(entry.section) ?? []), entry]);
    return [...result.entries()];
  }, [audit.entries]);
  return <section className="space-y-5" aria-label="每周關卡填答題審查">
    <p className="text-sm text-stone-600">完成時間：{new Date(audit.completedAt).toLocaleString("zh-TW")}</p>
    {groups.map(([section, entries]) => <section key={section} className="space-y-3 rounded-2xl border border-stone-200 bg-[#fffaf0] p-5">
      <h2 className="text-xl font-bold">{section}</h2>
      {entries.map((entry, index) => <article key={entry.id} className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-bold">{index + 1}. {displayPrompt(week,entry)}</h3>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            {kindLabel[entry.kind]}
          </span>
        </div>
        <div className="mt-3 whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-stone-800">
          {entry.answers.join("\n")}
        </div>
        <label className="mt-4 block font-bold">
          教師評語
          <textarea
            value={comments[entry.id] ?? ""}
            onChange={(event) => onCommentChange(entry.id, event.target.value)}
            maxLength={500}
            rows={3}
            disabled={!editable}
            placeholder="針對這一題給學生具體回饋…"
            className={`${fieldClass} mt-2 disabled:bg-stone-100 disabled:text-stone-600`}
          />
        </label>
        <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-stone-700">
          <h4 className="font-bold text-sky-900">教師批改建議</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {gradingGuidelines(week, entry).map((guideline) => <li key={guideline}>{guideline}</li>)}
          </ul>
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

function RejectionHistory({ entries, week }: { entries: ReviewHistoryEntry[]; week: number }) {
  const rejected = entries.filter((entry) => entry.decision === "reject");
  if (rejected.length === 0) return null;
  return <section className="rounded-2xl border border-red-200 bg-red-50/60 p-5" aria-label="歷次退件紀錄">
    <h2 className="text-xl font-bold text-red-950">歷次退件紀錄 · {rejected.length} 次</h2>
    <div className="mt-4 space-y-3">
      {rejected.map((entry, index) => {
        const parsed = parseStudentReviewFeedback(entry.feedback);
        return <details className="rounded-xl border border-red-200 bg-white p-4" key={`${entry.reviewedAt}-${entry.submittedVersion}`}>
          <summary className="cursor-pointer font-bold text-red-900">第 {entry.rejectionNumber ?? index + 1} 次退件 · {new Date(entry.reviewedAt).toLocaleString("zh-TW")}</summary>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-red-50 p-4 text-sm"><strong>當時教師評語</strong>{parsed?.items.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{parsed.items.map((item) => <li key={item.entryId}>{item.comment}</li>)}</ul> : <p className="mt-2 whitespace-pre-wrap">{entry.feedback}</p>}</div>
            {entry.gameAudit ? <GameAuditReview audit={entry.gameAudit} week={week} comments={parseQuestionReviewComments(entry.feedback)} editable={false} onCommentChange={() => undefined} /> : entry.questionSet ? <LegacyReview questionSet={entry.questionSet} answers={entry.answers ?? null} /> : <p className="text-sm text-stone-600">此舊紀錄沒有可顯示的提交快照。</p>}
          </div>
        </details>;
      })}
    </div>
  </section>;
}

export default function Review({ id }: { id: string }) {
  const [record, setRecord] = useState<SubmissionRecord | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [questionComments, setQuestionComments] = useState<QuestionReviewComments>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<SubmissionRecord>(`/api/classroom/reviews/${id}`)
      .then((result) => { setRecord(result); setFeedback(result.feedback); setQuestionComments(parseQuestionReviewComments(result.feedback)); })
      .catch((cause) => setError(cause.message));
  }, [id]);

  const questionSet = record?.questionSet as unknown as QuestionSet | null;
  const answers = record?.answers as unknown as SubmittedAnswer[] | null;
  const gameAudit = record?.gameAudit as unknown as WeekGameAudit | null;

  async function decide(decision: ReviewDecision) {
    if (!record) return;
    if (decision === "reject" && !Object.values(questionComments).some((comment) => comment.trim())) {
      setError("退回修正前，請至少填寫一則教師評語。");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api(`/api/classroom/reviews/${id}`, { version: record.version, generation: record.generation, decision, feedback: gameAudit ? serializeQuestionReviewComments(questionComments, gameAudit.entries, decision) : feedback });
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
    <h1 className="text-3xl font-bold">每周關卡填答題審查</h1>
    {error && <div role="alert" className="fixed right-5 top-20 z-[100] max-w-sm rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-red-900 shadow-xl">審查失敗：{error}</div>}
    {ready ? <>
      <p>{record.enrollment.student.displayName} · 學號 {record.enrollment.student.studentNumber || "未填寫"} · {courseWeekLabel(record.week)} · {record.status === "pending" ? "等待審查中" : record.status === "returned" ? `已退件，等待學生修正（累計 ${record.rejectionCount} 次）` : record.status === "completed" ? "已完成" : "目前不可批改"}</p>
      <RejectionHistory entries={record.feedbackHistory ?? []} week={record.week} />
      {gameAudit ? <GameAuditReview audit={gameAudit} week={record.week} comments={questionComments} editable={record.status === "pending" || (record.week === 6 && record.status === "completed")} onCommentChange={(entryId, comment) => setQuestionComments((current) => ({ ...current, [entryId]: comment }))} /> : <LegacyReview questionSet={questionSet!} answers={answers} />}
      {!gameAudit && <label className="block font-bold">教師回饋<textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} maxLength={3000} rows={4} className={fieldClass} /></label>}
      <div className="flex flex-wrap gap-4">
        <button className="rounded-xl border border-red-300 bg-white px-5 py-3 font-bold text-red-800 disabled:opacity-50" disabled={busy || (record.status !== "pending" && !(record.week === 6 && record.status === "completed"))} onClick={() => decide("reject")}>{record.week === 6 && record.status === "completed" ? "要求重新填寫 / 退件" : "不通過，退回修正"}</button>
        {record.status === "pending" && <button className={buttonClass} disabled={busy} onClick={() => decide("approve")}>{busy ? "審查中…" : record.week === 6 ? "通過並完成課程" : "通過並解鎖下一週"}</button>}
      </div>
    </> : !error && <p>載入作業中…</p>}
  </main>;
}
