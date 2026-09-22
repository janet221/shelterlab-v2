import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageShell } from "@/app/_components/public-shell";

export const metadata: Metadata = { title: "觀看示範", description: "ShelterLab 七分鐘示範影片占位、逐字稿與章節。" };

const chapters = [["00:00", "為什麼需要 ShelterLab"], ["00:45", "研究觀察資格"], ["01:45", "收容所實境探究"], ["03:00", "證據時間軸與犬隻檔案"], ["04:15", "One Health 探究"], ["05:20", "影響力證據"], ["06:20", "未來願景"]];

export default function WatchDemoPage() {
  return <PublicPageShell><main className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16"><p className="text-xs font-bold text-rose-700">觀看示範</p><h1 className="mt-3 text-4xl font-semibold sm:text-5xl">七分鐘產品故事</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">最終錄影與公開網址尚未核准，因此目前不載入託管影片。</p><section className="mt-8 grid min-h-80 place-items-center border border-slate-700 bg-slate-950 p-8 text-center text-white" aria-label="影片占位區"><div><p className="text-xs font-bold text-amber-300">影片占位區</p><h2 className="mt-3 text-2xl font-semibold">最終示範錄影尚待完成</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">未來若支援 YouTube，將採用核准的加強隱私權嵌入方式或外部連結；目前不會載入外部播放器。</p><Link className="mt-5 inline-flex border border-white px-4 py-2 text-sm font-bold" href="/start">選擇角色並開始體驗</Link></div></section><div className="mt-10 grid gap-10 lg:grid-cols-[0.7fr_1.3fr]"><section><h2 className="text-2xl font-semibold">章節時間</h2><ol className="mt-4 divide-y border-y border-slate-300">{chapters.map(([time,title])=><li className="flex gap-4 py-3 text-sm" key={time}><span className="font-mono text-teal-700">{time}</span><span>{title}</span></li>)}</ol></section><section><h2 className="text-2xl font-semibold">示範講稿</h2><div className="mt-4 space-y-4 text-sm leading-7 text-slate-700"><p><strong>為什麼需要 ShelterLab：</strong>自然科學教育需要真實的在地探究；收容所也需要兼顧福利、隱私權與營運權限的證據。</p><p><strong>學習與資格：</strong>學生先完成受治理的課程，取得研究觀察資格後，才能進行非接觸式觀察。</p><p><strong>證據旅程：</strong>結構化觀察依序經過教師審核、收容所確認與獨立的人工發布，才進入公開時間軸。</p><p><strong>誠實的公開價值：</strong>犬隻檔案保留未知資訊，所有有依據的敘述都可追溯；One Health 探究則連結人、動物與環境證據。</p><p><strong>影響力：</strong>每項指標都公開公式與來源。所有成果資料在外部驗證前，持續清楚標示為合成示範資料。</p></div></section></div></main></PublicPageShell>;
}
