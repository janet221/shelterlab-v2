import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceCard } from "../../_components/evidence-card";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";

export const metadata: Metadata = { title: "認養資訊證據", description: "檢視認養資訊檔案所引用的已發布觀察證據。" };

export default async function AdoptionEvidencePage({ params }: { params: Promise<{ dogId: string }> }) {
  const dogId = (await params).dogId;
  const cards = sprint10ADemoService.getEvidenceCards(dogId);
  return (
    <main className="mx-auto max-w-5xl p-5 lg:p-8">
      <nav className="flex flex-wrap gap-3 text-sm"><Link className="text-cyan-800 underline" href={`/adoption-profile/${dogId}`}>認養資訊檔案</Link><Link className="text-cyan-800 underline" href={`/adoption-profile/${dogId}/story`}>證據脈絡</Link><Link className="text-cyan-800 underline" href={`/adoption-profile/${dogId}/timeline`}>證據時間軸</Link></nav>
      <header className="mt-5 border-b pb-5"><p className="text-xs font-semibold text-cyan-700">合成示範資料（SYNTHETIC_DEMO）· 唯讀</p><h1 className="mt-1 text-2xl font-semibold">已發布證據卡片</h1><p className="mt-2 text-sm text-slate-600">互相衝突的觀察分開保留，卡片不會把多筆證據合併成個性標籤。</p></header>
      <div className="mt-6 grid gap-4 md:grid-cols-2">{cards.map((card) => <EvidenceCard card={card} dogId={dogId} key={card.id}/>)}</div>
    </main>
  );
}
