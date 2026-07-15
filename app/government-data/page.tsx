import type { Metadata } from "next";
import Link from "next/link";
import { sprint6DatasetRegistry } from "@/lib/government-data/sprint6-fixtures";
import { publicLabel } from "@/lib/public-site/locale";

export const metadata: Metadata = { title: "政府開放資料來源", description: "ShelterLab 政府開放資料驗證狀態與用途清冊。" };

const stateStyle: Record<string, string> = {
  VERIFIED: "border-emerald-300 bg-emerald-50 text-emerald-800",
  METADATA_VERIFIED: "border-cyan-300 bg-cyan-50 text-cyan-800",
  SYNTHETIC_DEMO: "border-blue-300 bg-blue-50 text-blue-800",
  UNVERIFIED: "border-amber-300 bg-amber-50 text-amber-900",
  UNAVAILABLE: "border-rose-300 bg-rose-50 text-rose-800"
};

const retrievalLabel: Record<string, string> = { SUCCESS: "同步成功", READY: "可供使用", FAILED: "同步失敗" };
const moduleLabel: Record<string, string> = {
  QUESTION_GENERATION: "題目產生",
  REMEDIATION: "學習補強",
  COMPETITION_EVIDENCE: "競賽證據",
  CURRICULUM_DISCOVERY: "課程探索",
  LEARNING_RESOURCE_MAPPING: "學習資源對應",
  INQUIRY_CONTEXT: "探究資料脈絡",
  COMPETENCY_CONTEXT: "素養資料脈絡"
};

export default function GovernmentDataPage() {
  return (
    <main className="mx-auto max-w-7xl p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-sm font-semibold text-cyan-700">EDUOD · 教育開放資料</p>
          <h1 className="mt-1 text-2xl font-semibold">政府開放資料來源清冊</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">競賽示範使用已驗證的官方資料離線快照，並清楚區分即時資料、快取、驗證快照與合成示範資料。</p>
        </div>
        <Link className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium" href="/competition/evidence">查看競賽證據</Link>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">新資料來源的預設狀態：</span>
        <span className={`border px-2 py-1 font-semibold ${stateStyle.UNVERIFIED}`}>{publicLabel("UNVERIFIED")}</span>
        <span className="text-slate-500">中繼資料與實際資源通過驗證前，不得用於學習評量。</span>
      </div>

      <div className="mt-6 overflow-x-auto border border-slate-200 bg-white">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr><th className="p-3">資料集</th><th className="p-3">提供機關</th><th className="p-3">驗證狀態</th><th className="p-3">轉接器</th><th className="p-3">取得狀態</th><th className="p-3">核准用途</th></tr>
          </thead>
          <tbody>
            {sprint6DatasetRegistry.map((dataset) => (
              <tr className="border-t border-slate-200 align-top" key={dataset.datasetId}>
                <td className="p-3"><div className="font-mono text-xs text-slate-500">{dataset.datasetId}</div><div className="mt-1 font-medium">{dataset.name}</div><div className="mt-1 text-xs text-slate-500">更新頻率：{dataset.updateFrequency}</div></td>
                <td className="p-3">{dataset.agency}</td>
                <td className="p-3"><span className={`inline-block border px-2 py-1 text-xs font-semibold ${stateStyle[dataset.verificationState] ?? "border-slate-300"}`}>{publicLabel(dataset.verificationState)}</span></td>
                <td className="p-3 font-mono text-xs">{dataset.adapterKey}</td>
                <td className="p-3"><div>{retrievalLabel[dataset.retrievalStatus] ?? dataset.retrievalStatus}</div><div className="mt-1 text-xs text-slate-500">{dataset.active ? "已啟用" : "未啟用"}</div></td>
                <td className="p-3 text-xs text-slate-600">{dataset.allowedUsageModules.length > 0 ? dataset.allowedUsageModules.map((item) => moduleLabel[item] ?? item).join(" · ") : dataset.verificationState === "VERIFIED" ? "已驗證，但需先核准明確產品用途" : "不得用於學習評量"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 border-l-4 border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">愛學網資源僅保存中繼資料與官方外部連結，不下載、鏡像、嵌入、轉錄或重新散布影片內容。</p>
    </main>
  );
}
