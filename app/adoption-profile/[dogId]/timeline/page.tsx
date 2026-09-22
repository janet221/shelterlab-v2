import type { Metadata } from "next";
import Link from "next/link";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import { formatTaiwanDateTime, publicCodeLabel, publicLabel } from "@/lib/public-site/locale";

export const metadata: Metadata = { title: "認養證據時間軸", description: "按時間檢視犬隻已發布證據與未來規劃項目。" };

export default async function AdoptionTimelinePage({ params }: { params: Promise<{ dogId: string }> }) {
  const dogId = (await params).dogId;
  const timeline = sprint10ADemoService.getTimeline(dogId);
  return (
    <main className="mx-auto max-w-5xl p-5 lg:p-8">
      <nav className="flex flex-wrap gap-3 text-sm"><Link className="text-cyan-800 underline" href={`/adoption-profile/${dogId}`}>認養資訊檔案</Link><Link className="text-cyan-800 underline" href={`/adoption-profile/${dogId}/story`}>證據脈絡</Link><Link className="text-cyan-800 underline" href={`/adoption-profile/${dogId}/evidence`}>已發布證據</Link></nav>
      <header className="mt-5 border-b pb-5"><p className="text-xs font-semibold text-cyan-700">合成示範資料（SYNTHETIC_DEMO）· 以新增事件為原則</p><h1 className="mt-1 text-2xl font-semibold">認養資訊證據時間軸</h1><p className="mt-2 text-sm text-slate-600">目前事件會顯示已有證據或尚無紀錄；中途照護、一日外出、試養、正式認養與退回目前只是未來規劃。</p></header>
      <ol className="mt-6 border-l-2 border-cyan-700 pl-5">{timeline.map((event) => <li className="relative border-b py-4" id={event.id} key={event.id}><span className={`absolute -left-[27px] top-5 h-3 w-3 rounded-full ${event.state === "evidence" ? "bg-cyan-700" : "border border-slate-400 bg-white"}`}/><div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">{event.eventType === "profile_update" ? event.label : `${publicCodeLabel(event.eventType)}${event.state === "not_recorded" ? "：尚無紀錄" : event.state === "future_placeholder" ? "：未來規劃" : ""}`}</h2><span className="font-mono text-xs text-slate-500">{event.eventDate ? formatTaiwanDateTime(event.eventDate) : publicLabel(event.state)}</span></div><div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500"><span>{event.evidenceIds.length} 筆證據紀錄</span><span>{event.sourceVersions.join(", ") || "尚無來源版本"}</span><span>{event.verificationStates.map(publicLabel).join("、")}</span></div></li>)}</ol>
    </main>
  );
}
