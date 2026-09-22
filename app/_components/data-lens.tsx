import type { DataLensMetadata } from "@/lib/classroom/data-types";

export default function DataLens({ metadata: m }: { metadata: DataLensMetadata }) {
  return <details className="mt-4 rounded-xl border border-teal-200 bg-teal-50/60 p-4 text-sm"><summary className="cursor-pointer font-bold text-teal-900">資料透鏡 · 來源、公式與推論界線</summary><dl className="mt-4 grid gap-3 sm:grid-cols-2">
    <div><dt className="font-bold">資料集／提供機關</dt><dd>{m.name}／{m.agency}</dd></div><div><dt className="font-bold">原始資料</dt><dd><a className="break-all underline" href={m.url} target="_blank" rel="noreferrer">查看官方來源</a></dd></div>
    <div><dt className="font-bold">更新日期／分析快照</dt><dd>{m.updatedAt}／{m.snapshotDate}</dd></div><div><dt className="font-bold">範圍與筆數</dt><dd>{m.scope}；{m.rowCount} 筆{m.excludedCount !== undefined ? `；排除 ${m.excludedCount} 筆非公開、無識別碼或重複紀錄` : ""}</dd></div>
    <div className="sm:col-span-2"><dt className="font-bold">使用欄位</dt><dd className="break-words">{m.fields.join("、")}</dd></div><div className="sm:col-span-2"><dt className="font-bold">缺漏／無效值（各欄位計數，可能重疊）</dt><dd>{Object.entries(m.missingValues).map(([key, value]) => `${key}: ${value}`).join("；")}</dd></div>
    <div className="sm:col-span-2"><dt className="font-bold">系統計算公式</dt><dd><ul className="list-disc pl-5">{m.formulas.map(f => <li key={f}>{f}</li>)}</ul></dd></div>
    <div><dt className="font-bold text-teal-900">可以說明</dt><dd>{m.canExplain}</dd></div><div><dt className="font-bold text-amber-900">絕對不可以推論</dt><dd>{m.cannotInfer}</dd></div>
    {m.checksum && <div className="sm:col-span-2"><dt className="font-bold">來源檔案 SHA-256</dt><dd className="break-all font-mono text-xs">{m.checksum}</dd></div>}
  </dl></details>;
}
