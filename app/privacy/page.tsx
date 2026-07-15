import type { Metadata } from "next";
import { PublicPageShell } from "@/app/_components/public-shell";

export const metadata: Metadata = { title: "隱私權說明", description: "ShelterLab 公開示範的隱私權界線與正式使用限制。" };

export default function PrivacyPage() {
  return <PublicPageShell><main className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16"><p className="text-xs font-bold text-teal-700">隱私權</p><h1 className="mt-3 text-4xl font-semibold sm:text-5xl">公開示範隱私權說明</h1><p className="mt-5 text-sm text-slate-500">原型聲明 · 更新日期：2026 年 7 月 14 日</p><div className="mt-10 space-y-8 text-base leading-8 text-slate-700"><section><h2 className="text-xl font-semibold text-slate-950">合成示範資料</h2><p className="mt-2">公開體驗使用固定的合成帳號與示範資料。系統不會刻意蒐集或顯示真實學生姓名、學生臉部、認養者資訊、非公開區域、審核意見、事件細節或尚未確認的證據。</p></section><section><h2 className="text-xl font-semibold text-slate-950">公開證據界線</h2><p className="mt-2">公開犬隻與探究頁面都是經隱私權篩選的投影。內部觀察紀錄、任務、學生與審核者識別碼會被排除，或改以穩定的公開代碼呈現。</p></section><section><h2 className="text-xl font-semibold text-slate-950">尚未宣稱具備正式同意流程</h2><p className="mt-2">ShelterLab 尚未完成正式環境所需的同意、保存期限、刪除、資安事件回應與未成年人資料生命週期。相關控制與合作協議核准前，不得使用真實參與者資料。</p></section><section><h2 className="text-xl font-semibold text-slate-950">外部服務</h2><p className="mt-2">目前公開示範不會載入外部 AI 供應商、分析追蹤器、影片播放器或即時政府資料 API。未來部署必須記錄每一項資料處理者與憑證界線。</p></section></div></main></PublicPageShell>;
}
