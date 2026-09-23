"use client";

import { useEffect, useState } from "react";
import { api, buttonClass, fieldClass } from "@/app/_components/classroom-ui";
import CaseComparison from "@/app/_components/case-comparison";
import DataLens from "@/app/_components/data-lens";
import type { QuestionSet, SubmittedAnswer } from "@/lib/classroom/data-types";

type Work = {
  status: string;
  version: number;
  generation: number;
  questionSet: QuestionSet;
  answers: SubmittedAnswer[] | null;
  feedback: string;
};

export default function WeekSubmission({ week }: { week: number }) {
  const [work, setWork] = useState<Work | null>(null);
  const [answers, setAnswers] = useState<SubmittedAnswer[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    api<Work>(`/api/classroom/weeks/${week}`)
      .then((result) => {
        if (!active) return;
        setWork(result);
        setAnswers(result.answers ?? result.questionSet.questions.map((question) => ({
          questionId: question.id,
          text: "",
          selectedAnimalIds: []
        })));
      })
      .catch((reason) => {
        if (active) setError(reason.message);
      });
    return () => {
      active = false;
    };
  }, [week]);

  const readOnly = work?.status !== "in_progress";

  return (
    <section id="classroom-submission" className="relative z-10 mx-auto my-10 max-w-6xl space-y-6 rounded-3xl border border-[#d8c394] bg-[#faf8f3] p-5 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#806c4d]">完整闖關後的學習成果送審</p>
      <h2 className="text-3xl font-bold">第 {week} 週 · 資料證據整理</h2>
      <p>完成上方完整教案與互動關卡後，請整理你使用的資料證據。送出後由教師審核，通過後才會解鎖下一週。</p>
      <p role="alert" className="text-red-800">{error}</p>
      {work ? (
        <>
          <p role="status" className="rounded-xl bg-[#f1e5c8] p-4 font-bold">
            {work.status === "pending"
              ? "等待審核中：成果已送出，下一週仍鎖定。"
              : work.status === "completed"
                ? "已完成：教師已通過本週成果，返回地圖查看下一週。"
                : "進行中：請逐題整理完整闖關使用的資料與判斷。"}
          </p>
          {work.feedback && <p className="rounded-xl bg-amber-50 p-4">教師回饋：{work.feedback}</p>}
          <CaseComparison set={work.questionSet} />
          <form
            className="space-y-6"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              try {
                await api(`/api/classroom/weeks/${week}`, {
                  version: work.version,
                  generation: work.generation,
                  answers
                });
                setWork(await api<Work>(`/api/classroom/weeks/${week}`));
                window.dispatchEvent(new Event("classroom-progress"));
              } catch (reason) {
                setError((reason as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {work.questionSet.questions.map((question, index) => (
              <fieldset key={question.id} disabled={readOnly || busy} className="rounded-2xl border bg-white p-5">
                <legend className="px-2 text-lg font-bold">第 {index + 1} 題</legend>
                <p className="text-sm text-stone-600">{question.fact}</p>
                <label className="mt-3 block font-bold" htmlFor={question.id}>{question.prompt}</label>
                <textarea
                  id={question.id}
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={5}
                  className={fieldClass}
                  value={answers[index]?.text ?? ""}
                  onChange={(event) => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? { ...answer, text: event.target.value } : answer))}
                />
                <p className="my-3 text-sm">引用哪些個案？{question.id === "compare" ? "比較題至少選兩個" : "至少選一個"}。</p>
                <div className="flex flex-wrap gap-4">
                  {work.questionSet.cases.map((animal) => (
                    <label key={animal.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={answers[index]?.selectedAnimalIds.includes(animal.id) ?? false}
                        onChange={(event) => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? {
                          ...answer,
                          selectedAnimalIds: event.target.checked
                            ? [...answer.selectedAnimalIds, animal.id]
                            : answer.selectedAnimalIds.filter((id) => id !== animal.id)
                        } : answer))}
                      />
                      {animal.id} · {animal.colour}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <DataLens metadata={work.questionSet.metadata} />
            <p className="text-sm">題目資料由後端計算；{work.questionSet.wordingSource === "constrained_ai" ? "AI 僅選用受限制的高中問句，未產生任何數字。" : "目前使用高中引導問句範本，未啟用 AI。"}</p>
            <button disabled={readOnly || busy || work.questionSet.cases.length < 2} className={buttonClass}>
              {busy ? "送出中…" : "送出完整闖關成果，等待教師審核"}
            </button>
          </form>
        </>
      ) : !error && <p>正在載入本週資料證據…</p>}
    </section>
  );
}
