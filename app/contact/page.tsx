import type { Metadata } from "next";
import { PublicPageShell, githubUrl } from "@/app/_components/public-shell";

export const metadata: Metadata = { title: "聯絡 ShelterLab", description: "聯絡 ShelterLab 討論未來合作或回報原型問題。" };

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@shelterlab.example";

export default function ContactPage() {
  return <PublicPageShell><main className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16"><p className="text-xs font-bold text-rose-700">聯絡我們</p><h1 className="mt-3 text-4xl font-semibold sm:text-5xl">從謹慎而具體的對話開始</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">收容所、學校、非營利組織、研究者與公民夥伴，可透過以下方式討論未來驗證。請勿在公開議題中提供任何真實參與者資料。</p><div className="mt-10 grid border-y border-slate-300 md:grid-cols-3"><section className="border-b p-6 md:border-b-0 md:border-r"><h2 className="font-semibold">電子郵件占位地址</h2><a className="mt-3 block break-all text-sm text-teal-800 underline" href={`mailto:${contactEmail}`}>{contactEmail}</a><p className="mt-3 text-xs leading-5 text-slate-500">公開發布前，須以 `NEXT_PUBLIC_CONTACT_EMAIL` 設定核准的聯絡地址。</p></section><section className="border-b p-6 md:border-b-0 md:border-r"><h2 className="font-semibold">未來合作</h2><a className="mt-3 block text-sm text-teal-800 underline" href={`mailto:${contactEmail}?subject=ShelterLab%20Partnership`}>討論驗證合作</a><p className="mt-3 text-xs leading-5 text-slate-500">試辦條件、安全、隱私權與證據主張，都需要產品負責人核准。</p></section><section className="p-6"><h2 className="font-semibold">回報問題</h2><a className="mt-3 block text-sm text-teal-800 underline" href={`${githubUrl}/issues`} rel="noreferrer" target="_blank">前往 GitHub Issues 回報</a><p className="mt-3 text-xs leading-5 text-slate-500">請勿提供學生、認養者、事件或收容所敏感資訊。</p></section></div></main></PublicPageShell>;
}
