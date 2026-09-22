import Link from "next/link";
import { PublicFooter, PublicHeader } from "./_components/public-shell";

export default function NotFound() {
  return <div className="min-h-screen bg-white"><PublicHeader /><main className="mx-auto max-w-5xl px-5 py-20 lg:px-8"><p className="font-mono text-sm text-rose-700">404 · 找不到頁面</p><h1 className="mt-4 text-4xl font-semibold sm:text-5xl">這條證據路徑不存在。</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">連結可能已失效，或指定的公開證據目前無法顯示。ShelterLab 不會因此補造替代資料。</p><div className="mt-8 flex flex-wrap gap-3"><Link className="border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-bold text-white" href="/">返回首頁</Link><Link className="border border-slate-400 px-4 py-3 text-sm font-bold" href="/tour/welcome">開始互動導覽</Link></div></main><PublicFooter /></div>;
}
