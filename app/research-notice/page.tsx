import type { Metadata } from "next";
import { PublicPageShell } from "@/app/_components/public-shell";

export const metadata: Metadata = { title: "研究聲明", description: "說明 ShelterLab 原型證據與指標的解讀限制。" };

export default function ResearchNoticePage() {
  return <PublicPageShell><main className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16"><p className="text-xs font-bold text-rose-700">研究聲明</p><h1 className="mt-3 text-4xl font-semibold sm:text-5xl">請審慎解讀本原型</h1><div className="mt-10 border-l-4 border-amber-500 bg-amber-50 p-5 text-sm leading-7 text-amber-950"><strong>尚未提出實測成效主張。</strong>公開示範中的學生學習、收容所參與、動物福利、認養資訊支援、One Health 與社會影響力，都是合成示範計算。</div><div className="mt-10 space-y-8 text-base leading-8 text-slate-700"><section><h2 className="text-xl font-semibold text-slate-950">用途</h2><p className="mt-2">本原型用於展示工作流程、治理、可追溯性、固定計算方法與競賽可行性，不是已完成的研究或經場域驗證的介入方案。</p></section><section><h2 className="text-xl font-semibold text-slate-950">官方來源</h2><p className="mt-2">政府來源或資料快照經驗證，只代表其來源可追溯；不代表合成的學生、收容所、犬隻、社區或認養結果已獲證實。</p></section><section><h2 className="text-xl font-semibold text-slate-950">動物行為解讀</h2><p className="mt-2">結構化觀察是特定情境下的證據，不是診斷、性格標籤、危險性判斷、相容性預測或未來行為保證。</p></section><section><h2 className="text-xl font-semibold text-slate-950">AI 界線</h2><p className="mt-2">目前未啟用外部 AI 供應商。固定規則的草稿與驗證服務，不能核准、發布、改寫正式證據或決定資格。</p></section><section><h2 className="text-xl font-semibold text-slate-950">未來驗證</h2><p className="mt-2">任何外部試辦都需要先核准研究問題、合作角色、同意流程、隱私權審查、基準定義、量測方法、不良事件處理與主張治理。</p></section></div></main></PublicPageShell>;
}
