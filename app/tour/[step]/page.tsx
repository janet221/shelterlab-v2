import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/app/_components/public-shell";
import { PublicGridBackground, publicGridOverlay } from "@/app/_components/public-grid-background";
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

  const index = current.sequence - 1;
  const previous = publicTourSteps[index - 1];
  const next = publicTourSteps[index + 1];

  return (
    <div className="relative min-h-screen text-[#4a3f35]">
      <PublicGridBackground />
      <div className={`flex min-h-screen flex-col ${publicGridOverlay}`}>
        <PublicHeader />
        <main className="mx-auto w-full max-w-6xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-6 self-start lg:sticky lg:top-24">
              <div className="rounded-2xl border border-[#e4c98f] bg-[#fffaf0] p-6 shadow-sm">
                <h1 className="text-xl font-extrabold tracking-tight text-[#3d3023]">如何運作</h1>
                <p className="mt-3 text-sm leading-7 text-[#6f604f]">ShelterLab 透過 6 週實證思辨課程與每週審核循環，將校園探究與平台數據串接。</p>
              </div>

              <nav aria-label="實作步驟清單" className="rounded-2xl border border-[#ead9b7] bg-white/95 p-4 shadow-sm">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a7639]">實作步驟清單</p>
                <ol className="space-y-1">
                  {publicTourSteps.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/tour/${item.slug}`}
                        aria-current={item.slug === current.slug ? "step" : undefined}
                        className={`block rounded-xl px-3 py-3 text-sm leading-6 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9c8761] ${item.slug === current.slug ? "border border-[#d8c59e] bg-[#f8f0df] font-bold text-[#4b3926]" : "text-[#6f604f] hover:bg-[#fff7e5]"}`}
                      >
                        <span className="mr-2 font-mono font-bold text-[#8f7c5e]">{String(item.sequence).padStart(2, "0")}</span>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <article className="rounded-3xl border border-[#e3cfaa] bg-[#fffdf8] p-7 shadow-[0_28px_80px_-55px_rgba(93,65,28,0.55)] sm:p-12">
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#8f7c5e]">{current.eyebrow}</span>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-[#332a22] sm:text-4xl">{current.title}</h2>
              <p className="mt-7 text-lg leading-8 text-[#5e5041]">{current.summary}</p>
              <p className="mt-4 leading-8 text-[#6f604f]">{current.detail}</p>

              {current.sequence === 1 && (
                <div className="mt-8 flex flex-wrap gap-3" aria-label="選擇登入身分">
                  <Link className="inline-flex min-h-12 items-center rounded-full bg-[#7f918d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#697c77] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7f918d]" href="/auth?role=student">我是學生 →</Link>
                  <Link className="inline-flex min-h-12 items-center rounded-full bg-[#aa9175] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#92785f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#aa9175]" href="/auth?role=teacher&mode=signup">我是老師 →</Link>
                </div>
              )}

              <section className="mb-8 mt-16" aria-label="導覽進度">
                <div className="mb-3 flex items-center justify-between text-xs font-mono text-[#95784d]"><span>實作步驟</span><span>{current.sequence} / {publicTourSteps.length}</span></div>
                <div className="flex gap-1.5">{publicTourSteps.map((item) => <span key={item.slug} className={`h-1.5 flex-1 rounded-full ${item.sequence <= current.sequence ? "bg-[#b49a68]" : "bg-[#eadfc9]"}`} />)}</div>
              </section>

              <nav aria-label="步驟切換" className="flex items-center justify-between gap-4 border-t border-[#ead9b7] pt-8">
                {previous ? <Link className="rounded-full border border-[#d8bd88] px-5 py-2.5 text-sm font-bold text-[#66503a] transition hover:bg-[#fbf1dd]" href={`/tour/${previous.slug}`}>← 上一步</Link> : <span />}
                {next ? <Link className="rounded-full bg-[#6f6257] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#594e45]" href={`/tour/${next.slug}`}>下一步 →</Link> : <Link className="rounded-full border border-[#dec692] bg-[#ebd197] px-5 py-2.5 text-sm font-bold text-[#30251b] transition hover:bg-[#f4e4bd]" href="/start">開始體驗 →</Link>}
              </nav>
            </article>
          </div>
        </main>
        <PublicFooter />
      </div>
    </div>
  );
}
