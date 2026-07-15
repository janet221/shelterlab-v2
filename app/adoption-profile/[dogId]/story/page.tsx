import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceStoryDisclosure } from "../../_components/evidence-story-disclosure";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import { buildEvidenceStory } from "@/lib/adoption-profile/story-engine";
import { profileSections } from "@/lib/adoption-profile/types";
import { publicCodeLabel } from "@/lib/public-site/locale";

export const metadata: Metadata = { title: "證據脈絡", description: "從認養資訊敘述追溯至觀察、時間軸、審核與發布紀錄。" };

const label = publicCodeLabel;

export default async function EvidenceStoryPage({ params }: { params: Promise<{ dogId: string }> }) {
  const dogId = (await params).dogId;
  let story;
  try {
    story = buildEvidenceStory(sprint10ADemoService.state, dogId);
  } catch {
    return <main className="p-8"><h1 className="text-xl font-semibold">目前無法顯示證據脈絡</h1></main>;
  }
  return (
    <main className="mx-auto max-w-7xl p-5 lg:p-8">
      <nav className="flex flex-wrap gap-3 border-b pb-4 text-sm"><Link className="border px-3 py-2" href={`/adoption-profile/${dogId}`}>認養資訊檔案</Link><Link className="border px-3 py-2" href={`/adoption-profile/${dogId}/timeline`}>證據時間軸</Link><Link className="border px-3 py-2" href={`/adoption-profile/${dogId}/evidence`}>已發布證據</Link><Link className="border px-3 py-2" href={`/adoption-profile/${dogId}/gaps`}>證據缺口</Link></nav>
      <header className="border-b py-6"><p className="text-xs font-semibold text-cyan-700">合成示範資料（SYNTHETIC_DEMO）· {story.version} · 唯讀</p><h1 className="mt-1 text-3xl font-semibold">{story.publicName} 的證據脈絡</h1><p className="mt-3 max-w-3xl text-sm text-slate-600">展開任一敘述，即可依序檢視證據、觀察紀錄、時間軸、審核者與發布紀錄；缺少的資訊維持為尚無資料（UNKNOWN）。</p></header>
      {profileSections.map((section) => {
        const statements = story.statements.filter((item) => item.section === section);
        return <section className="border-b py-5" key={section}><h2 className="font-semibold">{label(section)}</h2><div className="mt-3 space-y-3">{statements.map((statement) => <EvidenceStoryDisclosure dogId={dogId} key={statement.statementId} story={statement} unknowns={story.unknowns.filter((item) => item.statementIds.includes(statement.statementId))}/>)}</div></section>;
      })}
      <footer className="mt-7 border-t pt-4 text-xs text-slate-500">固定規則投影 · AI 生成：否 · 正式資料異動：0 筆</footer>
    </main>
  );
}
