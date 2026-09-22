import type { Metadata } from "next";
import Link from "next/link";
import { metricByCode } from "@/lib/impact/engine";
import { sprint8ImpactSnapshot } from "@/lib/impact/demo-data";
import { sprint8CompetitionScorecard } from "@/lib/impact/scorecard";
import type { ImpactEvidenceStatus, ImpactMetric } from "@/lib/impact/types";
import {
  formatTaiwanNumber,
  impactCriterionLabel,
  impactDimensionLabel,
  impactLimitation,
  impactMetricLabel,
  publicLabel,
  sdgPublicCopy
} from "@/lib/public-site/locale";

export const metadata: Metadata = {
  title: "影響力儀表板",
  description: "從公式、分子、分母、來源與限制檢視 ShelterLab 的競賽展示指標。"
};

const statusClass: Record<ImpactEvidenceStatus, string> = {
  VERIFIED: "border-emerald-300 bg-emerald-50 text-emerald-800",
  DEMO: "border-blue-300 bg-blue-50 text-blue-800",
  SYNTHETIC: "border-amber-300 bg-amber-50 text-amber-900",
  UNVERIFIED: "border-slate-300 bg-slate-100 text-slate-700"
};

const unitLabel = (metric: ImpactMetric) => {
  if (metric.unit === "percent") return "%";
  if (metric.unit === "percentage_points") return " 個百分點";
  if (metric.unit === "score") return " 分";
  return "";
};

function Status({ state }: { state: ImpactEvidenceStatus }) {
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusClass[state]}`}>{publicLabel(state)}</span>;
}

function Metric({ metric }: { metric: ImpactMetric }) {
  return (
    <article className="min-w-0 border-b border-r border-slate-200 p-4 last:border-r-0">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold">{impactMetricLabel(metric.code)}</h3>
        <Status state={metric.evidenceStatus} />
      </div>
      <div className="mt-3 text-3xl font-semibold tabular-nums">
        {formatTaiwanNumber(metric.value)}
        {unitLabel(metric)}
      </div>
      <p className="mt-2 text-xs text-slate-500">信心水準：{publicLabel(metric.confidenceLevel)}</p>
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer font-medium text-cyan-800">查看公式與來源</summary>
        <dl className="mt-2 grid gap-2 border-l-2 border-cyan-700 pl-3">
          <div>
            <dt className="text-slate-500">公式</dt>
            <dd>{metric.formula}</dd>
          </div>
          <div>
            <dt className="text-slate-500">分子 / 分母</dt>
            <dd>{formatTaiwanNumber(metric.numerator)} / {formatTaiwanNumber(metric.denominator)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">來源</dt>
            <dd>{metric.provenance.map((item) => `${item.sourceType}:${item.sourceId}@${item.sourceVersion}`).join("; ")}</dd>
          </div>
          <div>
            <dt className="text-slate-500">限制</dt>
            <dd>{impactLimitation(metric.evidenceStatus)}</dd>
          </div>
        </dl>
      </details>
    </article>
  );
}

function MetricBand({ title, codes }: { title: string; codes: string[] }) {
  return (
    <section className="mt-7 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-xs text-slate-500">固定公式計算</span>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-5">
        {codes.map((code) => <Metric key={code} metric={metricByCode(sprint8ImpactSnapshot, code)} />)}
      </div>
    </section>
  );
}

export default function CompetitionImpactPage() {
  return (
    <main className="mx-auto max-w-[1500px] p-5 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-300 pb-5">
        <div>
          <p className="text-xs font-semibold text-cyan-700">影響力證據｜SL-IMPACT-1</p>
          <h1 className="mt-1 text-2xl font-semibold">競賽影響力儀表板</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            從公式層級檢視教育、Living Lab、收容所、政府開放資料與 One Health 指標；沒有任何指標由 AI 生成。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Status state="VERIFIED" />
          <Status state="DEMO" />
          <Status state="SYNTHETIC" />
          <Status state="UNVERIFIED" />
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link className="rounded-md border bg-cyan-700 px-4 py-2 font-medium text-white" href="/competition/demo">一鍵播放完整旅程</Link>
        <Link className="rounded-md border px-4 py-2" href="/competition/story">證據故事模式</Link>
        <Link className="rounded-md border px-4 py-2" href="/competition/evidence">開放資料證據</Link>
        <Link className="rounded-md border px-4 py-2" href="/living-lab">Living Lab 證據</Link>
      </div>
      <div className="mt-5 rounded-md border-l-4 border-amber-500 bg-amber-50 p-3 text-sm">
        <strong>合成示範資料（SYNTHETIC_DEMO）：</strong>
        學習、收容所、社會、認養資訊支援與 One Health 結果只用於展示計算方式。「已驗證（VERIFIED）」只適用於核准的官方來源或資料快照。
      </div>

      <MetricBand title="教育" codes={["STUDENTS_ENROLLED", "LEARNING_COMPLETION_RATE", "AVERAGE_PRETEST", "AVERAGE_POSTTEST", "LEARNING_GAIN", "RESEARCH_LICENSE_COMPLETION"]} />
      <MetricBand title="Living Lab" codes={["OBSERVATION_MISSIONS", "COMPLETED_MISSIONS", "OBSERVATION_EVENTS", "APPROVED_EVIDENCE", "OBSERVATION_QUALITY", "DATA_QUALITY_IMPROVEMENT"]} />
      <MetricBand title="收容所與認養資訊支援" codes={["DOGS_UPDATED", "EVIDENCE_COMPLETENESS", "PROFILE_COMPLETENESS", "SHELTER_PARTICIPATION", "ADOPTION_SUPPORT_READINESS"]} />
      <MetricBand title="政府開放資料" codes={["VERIFIED_DATASETS", "DATASET_USAGE", "EVIDENCE_TRACEABILITY", "DATASET_ATTRIBUTION"]} />
      <MetricBand title="One Health" codes={["ONE_HEALTH_HUMAN", "ONE_HEALTH_ANIMAL", "ONE_HEALTH_ENVIRONMENT"]} />
      <MetricBand title="影響摘要" codes={["EVIDENCE_GENERATED", "STUDENTS_ENGAGED", "TEACHERS_ENGAGED", "SHELTERS_ENGAGED", "COMMUNITY_PARTICIPATION"]} />

      <section className="mt-7 rounded-lg border border-slate-200 bg-white">
        <div className="border-b bg-slate-50 px-4 py-3">
          <h2 className="font-semibold">One Health 與 SDG 對應</h2>
          <p className="mt-1 text-xs text-slate-500">此處只對應可能的貢獻方向，不代表 ShelterLab 已造成 SDG 成效。</p>
        </div>
        <div className="divide-y">
          {sprint8ImpactSnapshot.sdgMappings.map((item) => {
            const copy = sdgPublicCopy(item.goal, [item.title, item.contribution, item.limitation]);
            return (
              <article className="grid gap-3 p-4 text-sm lg:grid-cols-[180px_1fr_220px_120px]" key={item.goal}>
                <h3 className="font-semibold">{item.goal}<span className="block text-xs font-normal text-slate-500">{copy.title}</span></h3>
                <div>
                  <p>{copy.contribution}</p>
                  <p className="mt-1 text-xs text-slate-500">{copy.limitation}</p>
                </div>
                <code className="text-xs text-slate-600">{item.metricCodes.join(" · ")}</code>
                <Status state={item.evidenceStatus} />
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-7 rounded-lg border border-slate-200 bg-white" id="scorecard">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b bg-slate-50 px-4 py-3">
          <div>
            <h2 className="font-semibold">InnoServe 評分面向證據涵蓋度</h2>
            <p className="mt-1 text-xs text-slate-500">ShelterLab 內部證據涵蓋自評，不是官方分數、權重、預測或評審結果。</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-semibold">{sprint8CompetitionScorecard.overall}/100</span>
            <div><Status state="DEMO" /></div>
          </div>
        </div>
        <div className="divide-y">
          {sprint8CompetitionScorecard.dimensions.map((dimension) => (
            <article className="p-4" key={dimension.dimension}>
              <div className="grid items-center gap-3 md:grid-cols-[210px_1fr_90px]">
                <h3 className="font-semibold">{impactDimensionLabel(dimension.dimension)}</h3>
                <div className="h-3 bg-slate-100"><div className="h-full bg-cyan-700" style={{ width: `${dimension.score}%` }} /></div>
                <span className="text-right font-mono font-semibold">{dimension.score}</span>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {dimension.criteria.map((criterion) => {
                  const copy = impactCriterionLabel(criterion.id, criterion.feature, criterion.evidence);
                  return (
                    <Link className="rounded-md border p-3 text-xs hover:border-cyan-700" href={criterion.evidenceHref} key={criterion.id}>
                      <div className="flex justify-between gap-2"><strong>{copy.feature}</strong><Status state={criterion.evidenceStatus} /></div>
                      <p className="mt-2 text-slate-600">{copy.evidence}</p>
                      <code className="mt-2 block break-all text-slate-500">{criterion.modulePath}</code>
                      <span className="mt-2 block font-mono">{criterion.points}/{criterion.maxPoints}</span>
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
