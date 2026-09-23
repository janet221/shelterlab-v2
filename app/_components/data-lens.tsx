"use client";

import { useEffect, useState } from "react";
import { api, fieldClass } from "./classroom-ui";
import type { DataLensMetadata } from "@/lib/classroom/data-types";

type AnnotationTarget = { classId: string; lensKey: string; county: string };
type AnnotationResult = { annotation: string; updatedAt: string | null };

export default function DataLens({ metadata: m, annotation }: { metadata: DataLensMetadata; annotation?: AnnotationTarget }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [note, setNote] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const targetKey = annotation ? `${annotation.classId}:${annotation.lensKey}` : "";

  useEffect(() => {
    setLoaded(false);
    setNote("");
    setUpdatedAt(null);
    setError("");
  }, [targetKey]);

  useEffect(() => {
    if (!open || !annotation || loaded) return;
    let active = true;
    api<AnnotationResult>(`/api/teacher/lesson-annotations?classId=${encodeURIComponent(annotation.classId)}&lensKey=${encodeURIComponent(annotation.lensKey)}`)
      .then((result) => {
        if (!active) return;
        setNote(result.annotation);
        setUpdatedAt(result.updatedAt);
        setLoaded(true);
      })
      .catch((caught: Error) => {
        if (!active) return;
        setError(caught.message);
        setLoaded(true);
      });
    return () => { active = false; };
  }, [annotation, loaded, open]);

  return <details className="mt-4 rounded-xl border border-[#d8cfc3] bg-[#f3eee7]/60 p-4 text-sm" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary className="cursor-pointer font-bold text-[#685b50]">🔍 資料透鏡</summary>
    <dl className="mt-4 grid gap-3 sm:grid-cols-2">
      <div><dt className="font-bold">資料來源（Source）</dt><dd>{m.name}／{m.agency}<br /><a className="break-all underline" href={m.url} target="_blank" rel="noreferrer">查看官方來源</a></dd></div>
      <div><dt className="font-bold">更新日期／分析快照</dt><dd>{m.updatedAt}／{m.snapshotDate}</dd></div>
      <div className="sm:col-span-2"><dt className="font-bold">資料範圍</dt><dd>{m.scope}；{m.rowCount} 筆{m.excludedCount !== undefined ? `；排除 ${m.excludedCount} 筆非公開、無識別碼或重複紀錄` : ""}</dd></div>
      <div className="sm:col-span-2"><dt className="font-bold">使用欄位</dt><dd className="break-words">{m.fields.join("、")}</dd></div>
      <div className="sm:col-span-2"><dt className="font-bold">缺漏值（Missing Values）</dt><dd>{Object.entries(m.missingValues).map(([key, value]) => `${key}: ${value}`).join("；") || "本次使用欄位未偵測到缺漏值"}</dd></div>
      <div className="sm:col-span-2"><dt className="font-bold">計算公式（Formula）</dt><dd><ul className="list-disc pl-5">{m.formulas.map((formula) => <li key={formula}>{formula}</li>)}</ul></dd></div>
      <div><dt className="font-bold text-[#685b50]">可以說明</dt><dd>{m.canExplain}</dd></div>
      <div><dt className="font-bold text-amber-900">不可推論</dt><dd>{m.cannotInfer}</dd></div>
      {m.checksum && <div className="sm:col-span-2"><dt className="font-bold">來源檔案 SHA-256</dt><dd className="break-all font-mono text-xs">{m.checksum}</dd></div>}
    </dl>
    {annotation && <section className="mt-5 border-t border-[#d8cfc3] pt-5" aria-label="教育標註">
      <label className="block font-bold text-[#51463d]">教育標註（儲存後可供未來學生教材同步）<textarea className={fieldClass} rows={4} maxLength={2000} value={note} disabled={!loaded || busy} placeholder={loaded ? "例如：提醒學生這是資料建立日趨勢，不是真實入所趨勢。" : "正在讀取既有標註…"} onChange={(event) => setNote(event.target.value)} /></label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" className="rounded-xl bg-[#7f7165] px-4 py-2 font-bold text-white transition hover:bg-[#6e6156] disabled:opacity-50" disabled={!loaded || busy} onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const result = await api<AnnotationResult>("/api/teacher/lesson-annotations", { ...annotation, annotation: note });
            setUpdatedAt(result.updatedAt);
          } catch (caught) {
            setError((caught as Error).message);
          } finally {
            setBusy(false);
          }
        }}>{busy ? "儲存中…" : "儲存教育標註"}</button>
        {updatedAt && <p role="status" className="text-xs text-[#685b50]">已儲存：{new Intl.DateTimeFormat("zh-TW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(updatedAt))}</p>}
        {error && <p role="alert" className="text-red-800">{error}</p>}
      </div>
    </section>}
  </details>;
}
