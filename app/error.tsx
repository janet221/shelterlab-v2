"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-white p-6 text-slate-950"><section className="w-full max-w-2xl border-y border-slate-300 py-10"><p className="font-mono text-sm text-rose-700">應用程式錯誤</p><h1 className="mt-4 text-3xl font-semibold">公開體驗暫時無法繼續。</h1><p className="mt-4 text-base leading-7 text-slate-600">示範或正式資料都沒有被變更。請重試此頁，或返回公開首頁。</p><div className="mt-7 flex flex-wrap gap-3"><button className="border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-bold text-white" onClick={reset} type="button">重試</button><Link className="border border-slate-400 px-4 py-2 text-sm font-bold" href="/">返回首頁</Link></div></section></main>;
}
