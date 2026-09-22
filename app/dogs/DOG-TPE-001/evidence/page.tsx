import type { Metadata } from "next";
import { sprint7DemoProfile, sprint7PublicTimeline } from "@/lib/living-lab/demo-data";
import { formatTaiwanDate, formatTaiwanDateTime, publicCodeLabel, publicLabel } from "@/lib/public-site/locale";

export const metadata: Metadata = { title: "Biscuit 犬隻證據檔案", description: "以已發布觀察證據建立的隱私安全犬隻證據檔案。" };

const dimensionLabels: Record<string, string> = {
  human_presence: "人員出現情境",
  distance_maintaining: "距離維持",
  vocalization: "發聲行為",
  movement: "移動行為",
  activity: "活動紀錄",
  unknowns: "尚無資料"
};

export default function DogEvidencePage() {
  return (
    <main className="mx-auto max-w-6xl p-5 lg:p-8">
      <header className="border-b pb-4">
        <p className="text-xs font-semibold text-cyan-700">合成示範資料（SYNTHETIC_DEMO）· 公開隱私篩選證據</p>
        <h1 className="mt-1 text-2xl font-semibold">Biscuit 犬隻證據檔案</h1>
        <p className="mt-2 text-sm text-slate-600">呈現已記錄情境中經收容所確認的觀察，不作犬隻性格或氣質診斷。</p>
      </header>
      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">犬隻證據檔案</h2>
          <span className="border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">收容所已核准 · 第 {sprint7DemoProfile.version} 版</span>
        </div>
        <dl className="mt-3 grid gap-4 border-y py-4 sm:grid-cols-4">
          <div><dt className="text-xs text-slate-500">已發布證據</dt><dd className="text-xl font-semibold">{sprint7DemoProfile.evidenceCount}</dd></div>
          <div><dt className="text-xs text-slate-500">情境多樣性</dt><dd className="text-xl font-semibold">{sprint7DemoProfile.contextDiversity}</dd></div>
          <div><dt className="text-xs text-slate-500">證據完整度</dt><dd className="text-xl font-semibold">{sprint7DemoProfile.completenessScore}%</dd></div>
          <div><dt className="text-xs text-slate-500">最近確認日期</dt><dd className="font-medium">{sprint7DemoProfile.latestConfirmedAt ? formatTaiwanDate(sprint7DemoProfile.latestConfirmedAt) : publicLabel("UNKNOWN")}</dd></div>
        </dl>
        <div className="mt-4 divide-y border-y">
          {sprint7DemoProfile.statements.map((statement) => (
            <article className="grid gap-2 py-3 text-sm md:grid-cols-[180px_1fr_160px]" key={statement.id}>
              <h3 className="font-medium">{dimensionLabels[statement.dimension] ?? publicCodeLabel(statement.dimension)}</h3>
              <p>{statement.statement}</p>
              <span className="text-xs text-slate-500">{statement.evidenceSourceIds.length} 筆已發布來源</span>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="font-semibold">公開證據時間軸</h2>
        <ol className="mt-3 border-l-2 border-cyan-700 pl-5">
          {sprint7PublicTimeline.map((entry) => (
            <li className="relative border-b py-4 text-sm" key={entry.id}>
              <span className="absolute -left-[27px] top-5 h-3 w-3 rounded-full bg-cyan-700" />
              <div className="text-xs font-mono text-slate-500">{formatTaiwanDateTime(entry.eventDate)} · {entry.sourceVersion}</div>
              <h3 className="mt-1 font-semibold">{publicCodeLabel(entry.eventType)}</h3>
              <p className="mt-1 text-slate-600">{entry.summary}</p>
            </li>
          ))}
        </ol>
      </section>
      <p className="mt-6 border-l-4 border-slate-400 bg-slate-50 p-3 text-sm">未知資訊一律標示為尚無資料（UNKNOWN）。本頁不公開學生身分、內部審核意見、非公開位置、事件敏感資訊或未確認證據。</p>
    </main>
  );
}
