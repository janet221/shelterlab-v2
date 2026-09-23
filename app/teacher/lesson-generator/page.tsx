"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DataLens from "@/app/_components/data-lens";
import { api, buttonClass, fieldClass } from "@/app/_components/classroom-ui";
import { TAIWAN_COUNTIES } from "@/lib/action-opportunities/types";
import type { LocalLessonPlan, EmptyLocalLessonPlan, LessonChartPoint } from "@/lib/classroom/lesson-generator";
import type { teacherDashboard } from "@/lib/classroom/service";

type Dashboard = Awaited<ReturnType<typeof teacherDashboard>>;
type LessonResult = LocalLessonPlan | EmptyLocalLessonPlan;

function Bars({ points, suffix = "筆" }: { points: LessonChartPoint[]; suffix?: string }) {
  const max = Math.max(...points.map((point) => point.count), 1);
  return <div className="space-y-3">{points.map((point) => <div key={point.label} className="grid grid-cols-[7rem_1fr_5rem] items-center gap-3 text-sm">
    <span className="truncate" title={point.label}>{point.label}</span>
    <div className="h-5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-teal-700" style={{ width: `${point.count / max * 100}%` }} /></div>
    <span className="text-right">{point.count} {suffix}<small className="block text-stone-500">{point.percentage}%</small></span>
  </div>)}</div>;
}

export default function LessonGeneratorPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [county, setCounty] = useState("");
  const [lesson, setLesson] = useState<LessonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Dashboard>("/api/classroom/dashboard").then((result) => {
      setDashboard(result);
      setCounty(result.classroom?.county || TAIWAN_COUNTIES[0]);
    }).catch((caught: Error) => setError(caught.message)).finally(() => setLoading(false));
  }, []);

  async function generate(selectedCounty = county) {
    if (!selectedCounty) return;
    setLoading(true);
    setError("");
    setLesson(null);
    try {
      setLesson(await api<LessonResult>(`/api/teacher/lesson-generator?county=${encodeURIComponent(selectedCounty)}`));
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const classroom = dashboard?.classroom;
  const lensTarget = (section: string) => classroom && lesson?.available ? {
    classId: classroom.id,
    county: lesson.county,
    lensKey: `lesson:${TAIWAN_COUNTIES.indexOf(lesson.county)}:${section}`,
  } : undefined;

  return <main className="mx-auto max-w-7xl space-y-8 px-5 py-10">
    <header className="rounded-3xl bg-gradient-to-br from-teal-950 to-teal-800 p-8 text-white">
      <p className="font-bold text-teal-200">教師專屬 · 在地動保工作台</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">在地教案產生器</h1>
      <p className="mt-4 max-w-3xl leading-7 text-teal-50">所有數字均由伺服器解析專案內的農業部開放資料快照後計算。個案依固定規則選取，不使用隨機亂數，也不以 AI 生成統計數字。</p>
    </header>

    {error && <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900">{error}</div>}
    {!classroom && dashboard && <section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">請先完成班級設定</h2><p className="my-4">教案與教育標註需要綁定教師班級，才能透過 RLS 安全保存。</p><Link className={buttonClass} href="/teacher/settings">前往設定</Link></section>}

    {classroom && <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">選擇教案縣市</h2>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="flex-1 font-bold">縣市<select className={fieldClass} value={county} onChange={(event) => setCounty(event.target.value)}>{TAIWAN_COUNTIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <button className={buttonClass} disabled={loading || !county} onClick={() => generate()}>{loading ? "讀取與計算中…" : "產生真實資料教案"}</button>
      </div>
      <p className="mt-3 text-sm text-stone-500">大型 CSV 只在伺服器首次載入時解析；各縣市計算結果以來源檔案校驗碼與縣市為鍵保存在記憶體快取。</p>
    </section>}

    {loading && <p role="status" className="rounded-2xl bg-teal-50 p-5 text-teal-950">正在解析開放資料並執行確定性計算…</p>}
    {lesson && !lesson.available && <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-lg font-bold text-amber-950">{lesson.message}</div>}

    {lesson?.available && classroom && <>
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-bold text-teal-800">{lesson.county} · 快照概覽</p><h2 className="mt-1 text-2xl font-bold">由真實資料計算的教案摘要</h2></div><span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-bold text-teal-900">零幻覺公式計算</span></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
          ["縣市 OPEN 快照", `${lesson.localOpenCount} 筆`],
          ["全國 OPEN 快照", `${lesson.nationalOpenCount} 筆`],
          ["縣市快照占比", `${lesson.localShare}%`],
          ["代理天數中位數", lesson.medianDays === null ? "無法計算" : `${lesson.medianDays} 天`],
        ].map(([label, value]) => <div key={label} className="rounded-2xl bg-stone-50 p-5"><p className="text-sm text-stone-600">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>
        <DataLens metadata={lesson.lenses.overview} annotation={lensTarget("overview")} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">收容所 OPEN 快照紀錄分布</h2><p className="mt-2 text-sm text-stone-600">這不是核定容量，也不是即時在所量。</p><div className="mt-5 space-y-3">{lesson.shelterCounts.map((item) => <div className="flex items-center justify-between gap-4 border-b pb-3" key={item.shelter}><span>{item.shelter}</span><strong>{item.count} 筆 · {item.share}%</strong></div>)}</div><DataLens metadata={lesson.lenses.shelters} annotation={lensTarget("shelters")} /></article>
        <article className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">體型分布</h2><p className="mt-2 text-sm text-stone-600">缺漏值保留為「未提供」，不以推測值補齊。</p><div className="mt-5"><Bars points={lesson.bodyDistribution} /></div><DataLens metadata={lesson.lenses.body} annotation={lensTarget("body")} /></article>
      </section>

      <section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">資料建立月份趨勢</h2><p className="my-3 text-sm text-amber-900">注意：`animal_createtime` 是資料建立日代理值，不可宣稱為真實入所日期。</p>{lesson.entryTrend.length ? <Bars points={lesson.entryTrend} /> : <p className="rounded-xl bg-amber-50 p-4 font-bold">該區間無可用資料，請重新設定條件</p>}<DataLens metadata={lesson.lenses.trend} annotation={lensTarget("trend")} /></section>

      <section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">確定性個案對照 · {lesson.selectedCases.length} 例</h2><p className="mt-2 text-stone-600">{lesson.selectionBasis}</p><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{lesson.selectedCases.map((item) => <article key={item.id} className="rounded-2xl border border-stone-200 p-5"><p className="text-xs font-bold text-teal-800">真實識別碼 {item.id}</p><h3 className="mt-2 font-bold">{item.shelter}</h3><dl className="mt-3 space-y-2 text-sm"><div><dt className="text-stone-500">毛色／體型</dt><dd>{item.colour}／{item.body}</dd></div><div><dt className="text-stone-500">品種／年齡</dt><dd>{item.variety}／{item.age}</dd></div><div><dt className="text-stone-500">資料建立日</dt><dd>{item.createdDate || "缺漏"}</dd></div><div><dt className="text-stone-500">推定留所天數</dt><dd className="text-2xl font-bold">{item.days === null ? "無法計算" : `${item.days} 天`}</dd></div></dl></article>)}</div><DataLens metadata={lesson.lenses.cases} annotation={lensTarget("cases")} /></section>

      <section className="rounded-2xl bg-stone-900 p-6 text-white"><h2 className="text-2xl font-bold">探究問題卡</h2><ol className="mt-5 space-y-5">{lesson.inquiryQuestions.map((item, index) => <li className="rounded-2xl bg-white/10 p-5" key={item.prompt}><p className="text-sm text-teal-200">資料事實 {index + 1}：{item.fact}</p><p className="mt-2 text-lg font-bold">{item.prompt}</p></li>)}</ol></section>
    </>}
  </main>;
}
