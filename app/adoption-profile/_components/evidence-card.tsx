import Link from "next/link";
import type { AdoptionEvidenceCard } from "@/lib/adoption-profile/types";
import { formatTaiwanDate, publicCodeLabel, publicLabel } from "@/lib/public-site/locale";

export function EvidenceCard({ card, dogId }: { card: AdoptionEvidenceCard; dogId: string }) {
  return (
    <article className="border p-4" id={card.id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs font-semibold text-cyan-700">{publicLabel(card.verification)}</p><h2 className="mt-1 font-semibold">{card.observation}</h2></div>
        <time className="font-mono text-xs text-slate-500">{formatTaiwanDate(card.date)}</time>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-xs text-slate-500">證據來源</dt><dd className="break-all font-mono text-xs">{card.evidenceSource}@{card.sourceVersion}</dd></div>
        <div><dt className="text-xs text-slate-500">審核者</dt><dd>{publicCodeLabel(card.reviewerRole)} · {card.reviewer}</dd></div>
        <div><dt className="text-xs text-slate-500">信心程度</dt><dd>{publicLabel(card.confidence)}</dd></div>
        <div><dt className="text-xs text-slate-500">情境</dt><dd>{card.context}</dd></div>
      </dl>
      <Link className="mt-4 inline-block text-sm font-medium text-cyan-800 underline" href={`/adoption-profile/${dogId}/timeline#${card.timelineEntryId}`}>查看時間軸中的證據</Link>
    </article>
  );
}
