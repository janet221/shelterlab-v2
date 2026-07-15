import Link from "next/link";
import type { EvidenceStatementStory, UnknownExplanation } from "@/lib/adoption-profile/story-types";
import { formatTaiwanDateTime, publicCodeLabel, publicLabel } from "@/lib/public-site/locale";

const label = publicCodeLabel;

export function EvidenceStoryDisclosure({
  dogId,
  story,
  unknowns = []
}: {
  dogId: string;
  story: EvidenceStatementStory;
  unknowns?: UnknownExplanation[];
}) {
  return (
    <details className="border-l-4 border-cyan-700 bg-slate-50 text-sm" id={story.statementId}>
      <summary className="cursor-pointer p-4 font-medium">{story.statement}</summary>
      <div className="border-t bg-white p-4">
        {story.traces.map((trace) => (
          <section className="border-b py-4 last:border-b-0" key={trace.id}>
            <p className="text-xs font-semibold text-cyan-700">追溯代碼 {trace.evidence.reference} · {publicLabel(trace.evidence.verification)}</p>
            <ol className="mt-3 grid gap-px bg-slate-200 lg:grid-cols-5">
              <li className="bg-white p-3"><strong className="text-xs">1. 證據</strong><p className="mt-2">{label(trace.evidence.evidenceType)}</p><p className="mt-1 break-all font-mono text-xs text-slate-500">{trace.evidence.sourceType}<br/>{trace.evidence.sourceVersion}</p><p className="mt-2 text-xs text-slate-600">{trace.evidence.context}</p></li>
              <li className="bg-white p-3"><strong className="text-xs">2. 觀察紀錄</strong><p className="mt-2">{publicLabel(trace.observation.value)}</p>{trace.observation.behaviorCode && <p className="mt-1 font-mono text-xs text-slate-500">行為代碼 {trace.observation.behaviorCode} · {trace.observation.durationSec ?? 0} 秒</p>}{trace.observation.explanation && <p className="mt-2 text-xs text-slate-600">{trace.observation.explanation}</p>}</li>
              <li className="bg-white p-3"><strong className="text-xs">3. 證據時間軸</strong><p className="mt-2">{label(trace.timeline.eventType)}</p><Link className="mt-2 inline-block text-xs text-cyan-800 underline" href={`/adoption-profile/${dogId}/timeline#${trace.timeline.id}`}>查看連結事件</Link></li>
              <li className="bg-white p-3"><strong className="text-xs">4. 審核者</strong><p className="mt-2">{label(trace.reviewer.role)}</p><p className="mt-1 font-mono text-xs text-slate-500">公開審核代碼 {trace.reviewer.publicReference}</p></li>
              <li className="bg-white p-3"><strong className="text-xs">5. 發布</strong><p className="mt-2">已發布 · 收容所已核准</p><p className="mt-1 text-xs text-slate-500">檔案 v{trace.publication.profileVersion}<br/>{formatTaiwanDateTime(trace.publication.profilePublishedAt)}</p></li>
            </ol>
          </section>
        ))}
        {unknowns.map((unknown) => (
          <section className="border-l-4 border-amber-500 bg-amber-50 p-3" key={unknown.id}>
            <strong>{publicCodeLabel(unknown.field)}：尚無資料（UNKNOWN）</strong>
            <p className="mt-1">原因：{unknown.whyUnknown}</p>
            <p className="mt-1">缺少的證據：{unknown.missingEvidence.map((item) => item.description).join(" ")}</p>
          </section>
        ))}
      </div>
    </details>
  );
}
