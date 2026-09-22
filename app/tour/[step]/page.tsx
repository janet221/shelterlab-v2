import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPageShell } from "@/app/_components/public-shell";
import { getPublicTourStep, publicTourSteps } from "@/lib/public-demo/engine";

export function generateStaticParams() {
  return publicTourSteps.map((step) => ({ step: step.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ step: string }> }): Promise<Metadata> {
  const { step } = await params;
  const current = getPublicTourStep(step);
  return current ? { title: `${current.title}｜ShelterLab 如何運作` } : {};
}

export default async function TourStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const current = getPublicTourStep(step);
  if (!current) notFound();

  return (
    <PublicPageShell>
      <div className="bg-[#f7f4ef]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:py-16">
          <aside className="self-start lg:sticky lg:top-28">
            <div className="rounded-3xl bg-[#344b40] p-6 text-white">
              <h1 className="text-2xl font-bold">如何運作</h1>
              <p className="mt-4 text-sm leading-7 text-stone-100">ShelterLab 透過 6 週實證思辨課程與每週審核循環，將校園探究與平台數據串接。</p>
            </div>
            <nav aria-label="實作步驟清單" className="mt-5 rounded-3xl border border-stone-200 bg-white p-4">
              <ol className="space-y-1">{publicTourSteps.map((item) => <li key={item.slug}><Link href={`/tour/${item.slug}#step-${item.sequence}`} aria-current={item.slug === current.slug ? "step" : undefined} className={`block rounded-xl px-3 py-3 text-sm leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700 ${item.slug === current.slug ? "bg-[#e9eee7] font-bold text-[#314b40]" : "text-stone-600 hover:bg-stone-50"}`}><span className="mr-2 font-mono text-teal-700">{String(item.sequence).padStart(2, "0")}</span>{item.title}</Link></li>)}</ol>
            </nav>
          </aside>
          <section aria-label="八步驟學習流程" className="grid min-w-0 gap-5 md:grid-cols-2">
            {publicTourSteps.map((item) => (
              <article key={item.slug} id={`step-${item.sequence}`} className="scroll-mt-32 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9eee7] font-mono font-bold text-[#314b40]">{String(item.sequence).padStart(2, "0")}</span><span className="text-sm font-medium text-stone-500">{item.eyebrow}</span></div>
                <h2 className="mt-5 text-xl font-bold leading-8 text-stone-800">{item.title}</h2>
                <p className="mt-4 leading-8 text-stone-600">{item.summary}{item.detail}</p>
                {item.sequence === 1 && item.evidenceHref && <Link href={item.evidenceHref} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#344b40] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#263c31] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">{item.evidenceLabel} →</Link>}
              </article>
            ))}
          </section>
        </div>
      </div>
    </PublicPageShell>
  );
}
