import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/app/_components/public-shell";
import { getPublicTourStep, publicTourSteps } from "@/lib/public-demo/engine";

export function generateStaticParams() {
  return publicTourSteps.map((step) => ({ step: step.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ step: string }> }): Promise<Metadata> {
  const { step } = await params;
  const current = getPublicTourStep(step);
  return current ? { title: `${current.title}｜ShelterLab 實作導覽` } : {};
}

export default async function TourStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  const current = getPublicTourStep(step);
  if (!current) notFound();

  const index = current.sequence - 1;
  const previous = publicTourSteps[index - 1];
  const next = publicTourSteps[index + 1];

  return (
    <div className="relative min-h-screen">
      {/* 核心背景容器：使用 fixed 固定在最底層 (-z-10) */}
      <div 
        className="fixed inset-0 -z-10 h-full w-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/b.jpg')",
          backgroundColor: '#F7F4F0' 
        }}
      />

      {/* 內容層：使用 flex-col 確保 Footer 在內容不足時也能貼底 */}
      <div className="flex min-h-screen flex-col bg-[#F7F4F0]/50">
        <PublicHeader />
        
        <main className="flex-grow mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            
            {/* 側邊欄 */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-[#E8E2DD] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-extrabold uppercase tracking-tight text-[#332D28] mb-3">
                  【如何運作專案】
                </h2>
                <p className="text-sm leading-relaxed text-[#5D5753]">
                  ShelterLab 透過 16 週教育循環，將校園課程與平台串接
                </p>
              </div>

              <nav className="rounded-2xl bg-white p-4 border border-[#E8E2DD] shadow-sm">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase text-[#A39E9B] tracking-wider">實作步驟清單</p>
                <ol className="space-y-1">
                  {publicTourSteps.map((s) => (
                    <li key={s.slug}>
                      <Link 
                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          s.slug === current.slug 
                            ? "bg-[#E8E2DD] text-[#332D28] font-semibold border border-[#D7D0CC]" 
                            : "text-[#5D5753] hover:bg-[#F7F4F0]"
                        }`} 
                        href={`/tour/${s.slug}`}
                      >
                        {String(s.sequence).padStart(2, "0")}. {s.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            {/* 主內容區 */}
            <article className="rounded-2xl bg-white p-8 border border-[#E8E2DD] shadow-sm sm:p-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A39E9B]">{current.eyebrow}</span>
              <h1 className="mt-4 text-3xl font-bold text-[#332D28] sm:text-4xl">{current.title}</h1>
              <p className="mt-6 text-lg text-[#5D5753]">{current.summary}</p>
              <p className="mt-4 text-[#5D5753] leading-relaxed">{current.detail}</p>
              
              <Link 
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#332D28] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4A4440] transition" 
                href={current.evidenceHref}
              >
                {current.evidenceLabel} →
              </Link>

              {/* 進度條 */}
              <section className="mt-16 mb-8">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#A39E9B]">
                  <span>實作步驟</span>
                  <span>{current.sequence} / {publicTourSteps.length}</span>
                </div>
                <div className="flex gap-1.5" aria-label="導覽進度">
                  {publicTourSteps.map((s) => (
                    <div 
                      key={s.slug} 
                      className={`h-1.5 flex-1 rounded-full ${s.sequence <= current.sequence ? "bg-[#BCAAA4]" : "bg-[#E8E2DD]"}`} 
                    />
                  ))}
                </div>
              </section>

              {/* 切換按鈕 */}
              <nav className="flex items-center justify-between border-t border-[#E8E2DD] pt-8">
                <div className="flex gap-3">
                  {previous ? (
                    <Link className="rounded-lg border border-[#D7D0CC] px-4 py-2 text-sm font-medium text-[#5D5753] hover:bg-[#F7F4F0]" href={`/tour/${previous.slug}`}>
                      上一步
                    </Link>
                  ) : <div className="w-20" />}
                  
                  {next ? (
                    <Link className="rounded-lg bg-[#332D28] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4A4440]" href={`/tour/${next.slug}`}>
                      下一步
                    </Link>
                  ) : (
                    <Link className="rounded-lg bg-[#332D28] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4A4440]" href="/start">
                      開始體驗
                    </Link>
                  )}
                </div>
              </nav>
            </article>
          </div>
        </main>
        <PublicFooter />
      </div>
    </div>
  );
}