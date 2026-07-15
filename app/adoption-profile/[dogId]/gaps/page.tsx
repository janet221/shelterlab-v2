import type { Metadata } from "next";
import Link from "next/link";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import { buildEvidenceStory } from "@/lib/adoption-profile/story-engine";
import { publicCodeLabel, publicLabel } from "@/lib/public-site/locale";

export const metadata: Metadata = { title: "證據缺口", description: "清楚說明犬隻資訊為何未知，以及仍需要哪些證據。" };

export default async function EvidenceGapPage({ params }: { params: Promise<{ dogId: string }> }) {
  const dogId = (await params).dogId;
  let story;
  try {
    story = buildEvidenceStory(sprint10ADemoService.state, dogId);
  } catch {
    return <main className="p-8"><h1 className="text-xl font-semibold">目前無法顯示證據缺口</h1></main>;
  }
  return (
    <main className="mx-auto max-w-5xl p-5 lg:p-8">
      <nav className="flex flex-wrap gap-3 border-b pb-4 text-sm"><Link className="border px-3 py-2" href={`/adoption-profile/${dogId}/story`}>證據脈絡</Link><Link className="border px-3 py-2" href={`/adoption-profile/${dogId}`}>認養資訊檔案</Link></nav>
      <header className="border-b py-6"><p className="text-xs font-semibold text-cyan-700">合成示範資料（SYNTHETIC_DEMO）· 不進行推論</p><h1 className="mt-1 text-3xl font-semibold">缺少的證據類別</h1><p className="mt-3 text-sm text-slate-600">證據缺口代表需要繼續蒐集，不是對犬隻的負面標籤。ShelterLab 絕不以虛構資訊填補缺口。</p></header>
      <section className="mt-6 divide-y border-y">{story.gaps.map((gap) => <article className="grid gap-3 py-4 text-sm md:grid-cols-[190px_1fr_1fr_190px]" key={gap.code}><div><strong>{gap.category}</strong><p className="font-mono text-xs text-slate-500">{gap.code}</p></div><div><p className="text-xs text-slate-500">缺少原因</p><p>{gap.whyMissing}</p></div><div><p className="text-xs text-slate-500">需要的證據</p><p>{gap.requiredEvidence}</p></div><code>{publicLabel(gap.action)}</code></article>)}</section>
      <section className="mt-8"><h2 className="font-semibold">尚無資料（UNKNOWN）說明</h2><div className="mt-3 divide-y border-y">{story.unknowns.map((unknown) => <article className="grid gap-3 py-4 text-sm md:grid-cols-[180px_1fr_1fr]" key={unknown.id}><strong>{publicCodeLabel(unknown.field)}：尚無資料</strong><div><p className="text-xs text-slate-500">為何尚無資料</p><p>{unknown.whyUnknown}</p></div><div><p className="text-xs text-slate-500">缺少的證據</p><p>{unknown.missingEvidence.map((item) => item.description).join(" ")}</p></div></article>)}</div></section>
    </main>
  );
}
