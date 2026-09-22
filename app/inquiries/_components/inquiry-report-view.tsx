import { sprint9ADemoService } from "@/lib/inquiry/demo-data";
import { publicCodeLabel, publicLabel } from "@/lib/public-site/locale";

export function InquiryReportView({ projectId }: { projectId: string }) {
  const project = sprint9ADemoService.getProject(projectId);
  const report = sprint9ADemoService.getReport(projectId, true);
  const evidence = sprint9ADemoService.state.evidenceLinks.filter(
    (item) => item.projectId === projectId && item.privacyClassification === "public"
  );
  const dataset = sprint9ADemoService.state.datasets.find((item) => item.projectId === projectId);
  const rows = dataset?.versions.at(-1)?.rows ?? [];
  const analysis = sprint9ADemoService.state.analyses.find((item) => item.projectId === projectId);
  const cer = sprint9ADemoService.state.cerStatements.find((item) => item.projectId === projectId);
  const map = sprint9ADemoService.state.systemMaps.find((item) => item.projectId === projectId);
  const recommendation = sprint9ADemoService.state.recommendations.find((item) => item.projectId === projectId);

  return (
    <article className="mx-auto max-w-6xl bg-white p-5 print:max-w-none print:p-0 lg:p-8">
      <header className="border-b pb-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-cyan-700">
              合成示範資料（SYNTHETIC_DEMO） · 教師已審核 · 收容所已確認
            </p>
            <h1 className="mt-1 text-2xl font-semibold">{project.title}</h1>
          </div>
          <span className="h-fit border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            已完成 · 第 {project.revisionNumber} 版
          </span>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          本公開報告不含學生姓名、犬隻精確位置、收容所內部註記、事件敏感資訊或認養人資料。
        </p>
      </header>

      <section className="mt-6">
        <h2 className="font-semibold">One Health 問題</h2>
        <div className="mt-3 grid gap-3 border-y py-4 md:grid-cols-[220px_1fr]">
          <div className="flex flex-wrap gap-2">
            {project.oneHealthDimensions.map((item) => (
              <span className="border bg-cyan-50 px-2 py-1 text-xs" key={item}>{publicCodeLabel(item)}</span>
            ))}
          </div>
          <p className="text-sm">{project.oneHealthConnection}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <div><h2 className="font-semibold">研究問題</h2><p className="mt-2 text-sm">{project.researchQuestion}</p></div>
        <div><h2 className="font-semibold">假設</h2><p className="mt-2 text-sm">{project.hypothesis}</p></div>
      </section>

      <section className="mt-7">
        <h2 className="font-semibold">已驗證來源與資料來源紀錄</h2>
        <div className="mt-3 divide-y border-y">
          {evidence.map((item) => (
            <div className="grid gap-2 py-3 text-sm md:grid-cols-[180px_1fr_190px]" key={item.id}>
              <code>{item.sourceEntityId}</code>
              <p>{item.citationText}</p>
              <span className="text-xs font-semibold text-emerald-700">{publicLabel(item.verificationState)} · {item.sourceVersion}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-semibold">分析圖表</h2>
            <p className="text-xs text-slate-500">
              {analysis?.chartSpecification.title} · 樣本數 {analysis?.chartSpecification.sampleSize} · 來源 {analysis?.chartSpecification.source}
            </p>
          </div>
          <span className="border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs font-semibold">
            {publicLabel("VERIFIED_FIXTURE")}
          </span>
        </div>
        <div className="mt-4 space-y-3 border-y py-4">
          {rows.map((row) => (
            <div className="grid grid-cols-[70px_1fr_60px] items-center gap-3 text-sm" key={String(row.county)}>
              <span>{String(row.county)}</span>
              <div className="h-5 bg-slate-100"><div className="h-full bg-cyan-700" style={{ width: `${Number(row.adoption_rate)}%` }} /></div>
              <span className="text-right font-mono">{String(row.adoption_rate)}%</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-amber-800">{analysis?.chartSpecification.interpretationWarning}</p>
      </section>

      <section className="mt-7 border-y py-5">
        <h2 className="font-semibold">主張－證據－推理</h2>
        <dl className="mt-3 grid gap-4 text-sm md:grid-cols-2">
          <div><dt className="text-xs text-slate-500">主張</dt><dd>{cer?.claim}</dd></div>
          <div><dt className="text-xs text-slate-500">證據</dt><dd>{cer?.evidenceLinkIds.join("、")}</dd></div>
          <div><dt className="text-xs text-slate-500">推理</dt><dd>{cer?.reasoning}</dd></div>
          <div><dt className="text-xs text-slate-500">替代解釋</dt><dd>{cer?.alternativeExplanation}</dd></div>
          <div className="md:col-span-2"><dt className="text-xs text-slate-500">研究限制</dt><dd>{cer?.limitation}</dd></div>
        </dl>
      </section>

      <section className="mt-7">
        <h2 className="font-semibold">One Health 系統圖</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {map?.nodes.map((node) => (
            <div className="border border-cyan-300 bg-cyan-50 p-3 text-center text-sm" key={node.id}>
              <strong>{node.label}</strong><p className="mt-1 text-xs text-slate-500">{publicCodeLabel(node.type)}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 divide-y border-y">
          {map?.edges.map((edge) => (
            <div className="grid gap-2 py-2 text-xs md:grid-cols-[180px_160px_1fr]" key={edge.id}>
              <code>{edge.fromNodeId} → {edge.toNodeId}</code>
              <strong>{edge.relationshipType}</strong>
              <span>{edge.studentExplanation} · 不確定性：{publicLabel(edge.uncertainty)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-7 border-l-4 border-cyan-700 bg-slate-50 p-4">
        <h2 className="font-semibold">建議</h2>
        <p className="mt-2 text-sm">{recommendation?.recommendation}</p>
        <dl className="mt-3 grid gap-3 text-xs md:grid-cols-3">
          <div><dt className="text-slate-500">建議對象</dt><dd>{recommendation ? publicCodeLabel(recommendation.targetActor) : "尚無資料"}</dd></div>
          <div><dt className="text-slate-500">證據強度</dt><dd>{recommendation ? publicLabel(recommendation.evidenceStrength) : "尚無資料"}</dd></div>
          <div><dt className="text-slate-500">學生可執行範圍</dt><dd>{recommendation?.studentScope}</dd></div>
        </dl>
      </section>

      <section className="mt-7">
        <h2 className="font-semibold">標準探究報告</h2>
        <ol className="mt-3 divide-y border-y">
          {report.sections.map((section) => (
            <li className="grid gap-2 py-3 text-sm md:grid-cols-[36px_230px_1fr]" key={section.number}>
              <span className="font-mono text-slate-400">{section.number}</span>
              <strong>{section.title}</strong>
              <p className="whitespace-pre-line text-slate-600">{section.content}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-7">
        <h2 className="font-semibold">證據鏈附錄</h2>
        <div className="mt-3 divide-y border-y">
          {report.evidenceAppendix.map((item) => (
            <div className="grid gap-2 py-3 text-xs md:grid-cols-[220px_1fr_210px]" key={item.id}>
              <code>{item.id}</code><span>{item.citation}</span><span>{publicLabel(item.verificationState)} · {item.sourceVersion}</span>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
