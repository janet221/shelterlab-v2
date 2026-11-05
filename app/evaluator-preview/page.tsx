import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageShell } from "@/app/_components/public-shell";
import { PublicGridBackground, publicGridOverlay } from "@/app/_components/public-grid-background";

export const metadata: Metadata = {
  title: "評審公開觀摩｜ShelterLab",
  description: "免登入瀏覽 ShelterLab 的公開課程、資料來源與合作流程。",
  robots: { index: false, follow: false },
};

const previews = [
  {
    id: "student",
    role: "學生端",
    title: "六週探究與公開資料",
    description: "查看六週課程地圖、探究主題，以及專案採用的政府開放資料來源。",
    links: [
      { href: "/#map-title", label: "查看六週學習地圖" },
      { href: "/government-data", label: "查看開放資料來源" },
    ],
  },
  {
    id: "teacher",
    role: "教師端",
    title: "課程架構與教學流程",
    description: "了解遊戲化課程如何連結探究實作、資料判讀與 108 課綱素養。",
    links: [
      { href: "/tour/welcome", label: "查看系統運作導覽" },
      { href: "/#curriculum-title", label: "查看課綱連結" },
    ],
  },
  {
    id: "shelter",
    role: "收容所端",
    title: "收容現場與合作脈絡",
    description: "查看課程如何連結第一線收容需求，以及活動公告在學生行動規劃中的位置。",
    links: [
      { href: "/#connections-title", label: "查看校園與收容現場連結" },
      { href: "/tour/welcome", label: "查看平台流程導覽" },
    ],
  },
];

export default async function EvaluatorPreviewPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const selected = role === "teacher" || role === "shelter" ? role : "student";

  return <PublicPageShell>
    <PublicGridBackground />
    <main className={`relative min-h-screen ${publicGridOverlay}`}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <Link href={`/auth?role=${selected}`} className="inline-flex rounded-full border border-[#d7c4a1] bg-[#fffdf8]/85 px-4 py-2 text-sm font-bold text-[#65543d] shadow-sm transition hover:-translate-y-0.5 hover:bg-white">← 返回{previews.find((item) => item.id === selected)?.role}登入</Link>
        <header className="mx-auto mt-8 max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-[#e9ead7] px-4 py-1.5 text-xs font-bold tracking-[0.16em] text-[#6b775d]">JUDGE VIEW · PUBLIC CONTENT</span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#397c79] sm:text-5xl">免登入公開觀摩</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#706252]">作為登入憑證暫時無法使用時的競賽備援，你仍可直接展示 ShelterLab 的公開課程、開放資料與合作流程。</p>
        </header>

        <section aria-label="公開觀摩範圍" className="mx-auto mt-8 max-w-3xl rounded-2xl border border-[#dbc9aa] bg-[#fffaf0]/90 p-5 text-sm leading-7 text-[#6c5942] shadow-[0_12px_35px_-24px_rgba(92,67,35,0.38)]">
          <strong className="text-[#55442f]">公開只讀導覽</strong>
          <p className="mt-1">這不是學生、教師或收容所帳號，也不會建立登入狀態、讀取個人資料、提交作業或操作公告。下方連結只開啟網站原有的公開內容。</p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3" aria-label="依角色瀏覽公開內容">
          {previews.map((item) => <article key={item.id} id={item.id} className={`rounded-[1.75rem] border bg-[#fffdf8]/90 p-6 shadow-[0_18px_45px_-30px_rgba(92,67,35,0.42)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(92,67,35,0.4)] ${selected === item.id ? "border-[#b99557] ring-2 ring-[#ead9b5]" : "border-[#e4d7c2]"}`}>
            <p className="text-xs font-bold tracking-[0.18em] text-[#a37e43]">{item.role} · 公開內容</p>
            <h2 className="mt-3 text-2xl font-bold text-[#397c79]">{item.title}</h2>
            <p className="mt-3 min-h-20 text-sm leading-7 text-[#756958]">{item.description}</p>
            <div className="mt-5 grid gap-2">{item.links.map((link) => <Link key={link.href + link.label} href={link.href} className="inline-flex min-h-11 items-center justify-between rounded-xl border border-[#ddcdaF] bg-[#fbf4e8] px-4 py-2 text-sm font-bold text-[#64533c] transition hover:-translate-y-0.5 hover:border-[#c9ae7d] hover:bg-[#f7e9ca]">{link.label}<span aria-hidden="true">↗</span></Link>)}</div>
            <Link href={`/auth?role=${item.id}`} className="mt-4 inline-flex min-h-10 items-center text-sm font-semibold text-[#85745c] underline decoration-[#c9b999] underline-offset-4 hover:text-[#55442f]">回到正式{item.role}登入</Link>
          </article>)}
        </section>
        <p className="mt-8 text-center text-xs leading-6 text-[#8b7c68]">若要進入可操作的角色工作台，請使用已設定的正式評審帳號登入；不要使用免驗證方式冒用帳號。</p>
      </div>
    </main>
  </PublicPageShell>;
}
