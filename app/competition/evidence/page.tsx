import type { Metadata } from "next";
import Link from "next/link";
import { getCompetitionEvidenceDashboard } from "@/lib/competition/dashboard";
import { activatedDatasetProductUses, shelterCountyComparison, shelterInquiryPrompt } from "@/lib/government-data/product-uses";
import { sprint6DatasetRegistry } from "@/lib/government-data/sprint6-fixtures";
import { formatTaiwanDateTime, publicLabel } from "@/lib/public-site/locale";

const traceTypeLabels: Record<string, string> = {
  GovernmentDataset: "政府資料集",
  CurriculumResource: "課程資源",
  LearningStandard: "學習標準",
  LearningModule: "學習單元",
  CourseWeek: "課程週次",
  QuestionGenerationBlueprint: "出題藍圖",
  "AI Draft": "AI 題目草稿",
  "Teacher Review": "教師審核",
  "Published Question": "已發布題目",
  "Quiz Attempt": "測驗作答",
  "Research License Result": "研究觀察資格結果",
  "Targeted Remediation": "指定學習補強"
};

const traceLabels: Record<string, string> = {
  "SYNTHETIC_EDUOD_001": "教育開放資料素養合成資料集",
  "res_synthetic_eduod_literacy": "教育開放資料閱讀示範資源",
  "std_demo_data_interpretation": "示範資料判讀能力",
  "module_URBAN_ECOLOGY": "都市生態、族群與棲地",
  "course_week_urban_ecology": "都市生態課程週次",
  "qgb_urban_ecology_v1": "都市生態出題藍圖",
  "license_synthetic_sprint6_001": "第一級有效研究觀察資格",
  "remediation_synthetic_sprint6_001": "都市生態能力補強"
};

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="border-r border-slate-200 px-4 py-3 last:border-r-0"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 text-2xl font-semibold">{value}</dd></div>;
}

export default function CompetitionEvidencePage() {
  const dashboard = getCompetitionEvidenceDashboard();
  const verified = sprint6DatasetRegistry.filter((dataset) => dataset.verificationState === "VERIFIED");
  return (
    <main className="mx-auto max-w-[1440px] p-5 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-300 pb-5"><div><p className="text-sm font-semibold text-cyan-700">教育開放資料 × One Health × 科學探究</p><h1 className="mt-1 text-2xl font-semibold">競賽證據儀表板</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">讓評審檢視：已驗證政府開放資料如何進入課程資源、受治理的出題流程與探究情境。學生影響力仍是合成示範指標。</p></div><div className="flex flex-wrap gap-2"><span className="border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">開放資料：已驗證快照（VERIFIED_FIXTURE）</span><span className="border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">所有指標：合成示範資料（SYNTHETIC_DEMO）</span></div></header>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm"><Link className="border bg-white px-3 py-2" href="/government-data">資料來源清冊</Link><Link className="border bg-white px-3 py-2" href="/teacher/curriculum/studio">教師課程工作室</Link><Link className="border bg-white px-3 py-2" href="/research-license/quiz/result">學生測驗結果</Link></nav>

      <section className="mt-6 border border-slate-200 bg-white"><h2 className="border-b bg-slate-50 px-4 py-3 font-semibold">政府開放資料證據</h2><dl className="grid grid-cols-2 divide-y sm:grid-cols-4 lg:grid-cols-8 lg:divide-y-0"><Metric label="已登錄" value={dashboard.openData.registered}/><Metric label="官方來源已驗證" value={dashboard.openData.officialVerified}/><Metric label="合成資料" value={dashboard.openData.syntheticDemo}/><Metric label="資料機關" value={dashboard.openData.agencies}/><Metric label="資料快照" value={dashboard.openData.snapshots}/><Metric label="同步失敗" value={dashboard.openData.failedSyncs}/><Metric label="出題使用" value={dashboard.openData.usage.QUESTION_GENERATION}/><Metric label="補強使用" value={dashboard.openData.usage.REMEDIATION}/></dl></section>

      <section className="mt-6 border border-slate-200 bg-white"><h2 className="border-b bg-slate-50 px-4 py-3 font-semibold">已驗證官方來源</h2><div className="divide-y">{verified.map((dataset) => <article className="grid gap-3 p-4 text-sm lg:grid-cols-[90px_1.4fr_1fr_1fr]" key={dataset.datasetId}><div><span className="font-mono font-semibold">{dataset.datasetId}</span><div className="mt-1 text-xs text-emerald-700">{dataset.active ? "已啟用" : "未啟用"}</div></div><div><h3 className="font-semibold">{dataset.name}</h3><p className="mt-1 text-xs text-slate-600">{dataset.agency} · {dataset.displayMode}</p><a className="mt-2 inline-block text-xs text-blue-700 underline" href={dataset.sourceUrl} rel="noreferrer" target="_blank">官方 data.gov.tw 來源</a></div><dl className="text-xs"><dt className="text-slate-500">驗證／快照時間</dt><dd>{dataset.verificationTimestamp ? formatTaiwanDateTime(dataset.verificationTimestamp) : "尚無資料"}</dd><dt className="mt-2 text-slate-500">最近成功同步</dt><dd>{dataset.lastSuccessfulSyncAt ? formatTaiwanDateTime(dataset.lastSuccessfulSyncAt) : "尚未啟用"}</dd></dl><dl className="text-xs"><dt className="text-slate-500">資料署名</dt><dd>{dataset.attribution}</dd><dt className="mt-2 text-slate-500">授權註記</dt><dd>{dataset.licenseNote}</dd></dl></article>)}</div></section>

      <section className="mt-6 border border-slate-200 bg-white"><div className="border-b bg-slate-50 px-4 py-3"><h2 className="font-semibold">政府開放資料如何改變 ShelterLab 功能</h2><p className="mt-1 text-xs text-slate-500">資料集 → 欄位 → 轉換 → 產品功能 → 教育成果 → 證據</p></div><div className="divide-y">{activatedDatasetProductUses.map((use) => { const dataset = sprint6DatasetRegistry.find((item) => item.datasetId === use.datasetId)!; return <article className="grid gap-4 p-4 text-sm lg:grid-cols-[180px_1fr_1fr]" key={use.datasetId}><div><div className="font-mono text-xs text-slate-500">{use.datasetId}</div><h3 className="mt-1 font-semibold">{dataset.name}</h3><p className="mt-2 text-xs text-slate-500">使用欄位：{use.fieldsUsed.join("、")}</p></div><div><div className="text-xs font-semibold text-slate-500">資料轉換</div><p className="mt-1">{use.transformation}</p><div className="mt-3 text-xs font-semibold text-slate-500">產品功能</div><p className="mt-1">{use.productFeature}</p></div><div><div className="text-xs font-semibold text-slate-500">教育成果</div><p className="mt-1">{use.educationalOutcome}</p><div className="mt-3 text-xs font-semibold text-slate-500">產生的證據</div><p className="mt-1">{use.evidenceGenerated}</p></div></article>; })}</div></section>

      <section className="mt-6 border border-slate-200 bg-white"><div className="border-b bg-slate-50 px-4 py-3"><h2 className="font-semibold">41236 區域收容所探究</h2><p className="mt-1 text-xs text-slate-500">民國 115 年 5 月 · 縣市彙總驗證快照 · 非個別犬隻資料</p></div><div className="grid gap-5 p-4 lg:grid-cols-[1.4fr_1fr]"><div className="space-y-3">{shelterCountyComparison.map((row) => <div className="grid grid-cols-[70px_1fr_70px] items-center gap-3 text-sm" key={row.county}><span>{row.county}</span><div className="h-5 bg-slate-100"><div className="h-full bg-cyan-600" style={{ width: row.adoptionRate }} /></div><span className="text-right font-mono">{row.adoptionRate}</span></div>)}</div><div><div className="text-sm font-semibold">學生探究提問</div><p className="mt-2 text-sm text-slate-700">{shelterInquiryPrompt}</p><p className="mt-3 text-xs text-slate-500">這些數量是每月彙總，不能用來診斷收容所或描述任何個別犬隻。</p></div></div></section>

      <div className="mt-5 grid gap-5 lg:grid-cols-3"><section className="border border-slate-200 bg-white p-4"><h2 className="font-semibold">課程證據</h2><p className="mt-3 text-2xl font-semibold">{dashboard.curriculum.standardsCovered}</p><p className="text-sm text-slate-500">已涵蓋示範參考標準，不將其說成官方代碼</p></section><section className="border border-slate-200 bg-white p-4"><h2 className="font-semibold">AI 治理</h2><p className="mt-3 text-2xl font-semibold">{dashboard.aiGovernance.publishedQuestions}</p><p className="text-sm text-slate-500">通過獨立人工審核後發布的題目</p></section><section className="border border-slate-200 bg-white p-4"><h2 className="font-semibold">研究觀察資格</h2><p className="mt-3 text-2xl font-semibold">{dashboard.researchLicense.passRate}%</p><p className="text-sm text-slate-500">合成示範通過率</p></section></div>

      <section className="mt-6 border border-slate-200 bg-white" id="traceability"><div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-4 py-3"><div><h2 className="font-semibold">完整證據鏈</h2><p className="mt-1 text-xs text-slate-500">保留 Sprint 6 合成評量路徑，作為回歸驗證證據</p></div><span className={`border px-2 py-1 text-xs font-semibold ${dashboard.traceability.complete ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-rose-300 bg-rose-50 text-rose-800"}`}>{dashboard.traceability.complete ? "完整" : "不完整"}</span></div><ol className="divide-y">{dashboard.traceability.nodes.map((node, index) => <li className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[40px_190px_1fr_170px]" key={node.id}><span className="font-mono text-slate-400">{String(index + 1).padStart(2, "0")}</span><span className="font-medium">{traceTypeLabels[node.type] ?? node.type}</span><span>{traceLabels[node.id] ?? node.label}<span className="ml-2 font-mono text-xs text-slate-400">v{node.version}</span></span><span className="font-mono text-xs font-semibold text-blue-700">{publicLabel(node.state)}</span></li>)}</ol></section>
      <p className="mt-4 text-xs text-slate-500">本頁未宣稱具有真實的學習、學校、收容所、學生、犬隻或認養成效。</p>
    </main>
  );
}
export const metadata: Metadata = { title: "競賽證據鏈", description: "追溯 ShelterLab 政府開放資料、學習、觀察、審核、發布與影響力證據。" };
