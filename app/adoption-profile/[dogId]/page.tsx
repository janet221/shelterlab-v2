import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceStoryDisclosure } from "../_components/evidence-story-disclosure";
import { sprint10ADemoService } from "@/lib/adoption-profile/demo-store";
import { buildEvidenceStory } from "@/lib/adoption-profile/story-engine";
import { profileSections } from "@/lib/adoption-profile/types";
import { formatTaiwanDateTime, publicCodeLabel, publicLabel } from "@/lib/public-site/locale";

export const metadata: Metadata = { title: "認養資訊檔案", description: "以收容所核准的已發布證據整理犬隻已知與未知資訊。" };

const label = publicCodeLabel;

export default async function AdoptionProfilePage({ params }: { params: Promise<{ dogId: string }> }) {
  const dogId = (await params).dogId;
  const profile = sprint10ADemoService.getPublicProfile(dogId);
  const score = sprint10ADemoService.getCompleteness(dogId);
  const gaps = sprint10ADemoService.getGaps(dogId);
  const facts = sprint10ADemoService.state.facts.get(dogId);
  if (!profile || !score || !gaps || !facts) return <main className="p-8"><h1 className="text-xl font-semibold">目前無法顯示認養資訊檔案</h1></main>;
  const story = buildEvidenceStory(sprint10ADemoService.state, dogId);
  return (
    <main className="mx-auto max-w-6xl p-5 lg:p-8">
      <nav className="flex flex-wrap gap-3 border-b pb-4 text-sm">
        <Link className="border px-3 py-2" href={`/adoption-profile/${dogId}`}>認養資訊檔案</Link>
        <Link className="border px-3 py-2" href={`/adoption-profile/${dogId}/story`}>證據脈絡</Link>
        <Link className="border px-3 py-2" href={`/adoption-profile/${dogId}/evidence`}>證據卡片</Link>
        <Link className="border px-3 py-2" href={`/adoption-profile/${dogId}/timeline`}>證據時間軸</Link>
        <Link className="border px-3 py-2" href={`/adoption-profile/${dogId}/gaps`}>證據缺口</Link>
        <Link className="border px-3 py-2" href="/competition/story">評審證據脈絡模式</Link>
      </nav>
      <header className="border-b py-6">
        <p className="text-xs font-semibold text-cyan-700">合成示範資料（SYNTHETIC_DEMO）· 收容所已核准 · 檔案 v{profile.version}</p>
        <h1 className="mt-1 text-3xl font-semibold">{facts.publicName} 的認養資訊檔案</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">ShelterLab 整理已發布證據，不預測認養機率、不診斷個性、不推薦是否認養，也不以推論填補未知資訊。</p>
      </header>
      <section className="mt-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">證據完整度</h2><p className="text-sm text-slate-500">透明衡量證據涵蓋範圍，不代表是否適合認養。</p></div><strong className="text-3xl">{score.total}%</strong></div><div className="mt-4 grid gap-px bg-slate-200 sm:grid-cols-3">{score.dimensions.map((item) => <div className="bg-white p-4" key={item.dimension}><div className="flex justify-between gap-2"><h3 className="text-sm font-medium">{label(item.dimension)}</h3><strong>{item.score}%</strong></div><p className="mt-2 text-xs text-slate-500">{item.numerator} / {item.denominator}</p><details className="mt-2 text-xs"><summary className="cursor-pointer text-cyan-800">檢視公式</summary><p className="mt-2">{item.formula}</p><p className="mt-1 text-slate-500">{item.limitation}</p></details></div>)}</div><p className="mt-2 text-xs text-slate-500">公式：九個面向的算術平均 · {score.version}</p></section>
      <section className="mt-8"><h2 className="text-lg font-semibold">檔案中的證據脈絡</h2><p className="mt-1 text-sm text-slate-600">每項公開敘述都可展開查看完整五階段追溯。</p>{profileSections.map((section) => <section className="border-b py-5" key={section}><h3 className="font-semibold">{label(section)}</h3><div className="mt-3 space-y-3">{story.statements.filter((item) => item.section === section).map((statement) => <EvidenceStoryDisclosure dogId={dogId} key={statement.statementId} story={statement} unknowns={story.unknowns.filter((item) => item.statementIds.includes(statement.statementId))}/>)}</div></section>)}</section>
      <section className="mt-8"><h2 className="text-lg font-semibold">證據缺口</h2><p className="mt-1 text-sm text-slate-600">系統唯一允許的行動是：補充更多證據。</p><div className="mt-3 divide-y border-y">{gaps.gaps.map((gap) => <div className="grid gap-2 py-3 text-sm md:grid-cols-[190px_130px_1fr_190px]" key={gap.code}><strong>{gap.label}</strong><span>{gap.missing ? "缺少證據" : "已有證據"}</span><span className="text-slate-600">{gap.reason}</span><code>{publicLabel(gap.action)}</code></div>)}</div></section>
      <footer className="mt-8 border-t pt-4 text-xs text-slate-500">最新證據：{formatTaiwanDateTime(profile.latestEvidenceAt)} · 固定規則證據投影 · AI 生成：否</footer>
    </main>
  );
}
