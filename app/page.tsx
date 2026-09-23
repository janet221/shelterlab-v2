import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicPageShell } from "./_components/public-shell";

export const metadata: Metadata = {
  title: "ShelterLab｜青少年動物科學探究實驗室",
  description: "從看見一隻犬，到理解牠身後的世界。連結校園學習、政府開放資料與收容所實務，透過六週數位課程，提出負責任的動保行動。"
};

const weeks = [
  ["第一週｜角色與處境", "比較家庭犬、工作犬、校犬與街頭犬的生活及照護責任。", "同樣是犬隻，為什麼過著不同的生活？"],
  ["第二週｜承諾與責任", "盤點時間、經濟、家庭支持與突發照護安排。", "決定帶牠回家前，我真正要承擔什麼？"],
  ["第三週｜品種與標籤", "理解品種形成、個體差異、健康迷思與來源查核。", "一個品種名稱，究竟告訴了我們多少？"],
  ["第四週｜數量與源頭", "認識繁殖、走失、放養、棄養與收容之間的關係。", "為什麼持續有人認養，街頭與收容所仍有新犬出現？"],
  ["第五週｜政策與兩難", "討論動物福利、生態保育、公共安全與資源分配。", "當不同生命的需要發生衝突，我們如何負責地選擇？"],
  ["第六週｜現場與行動", "尋找動保資源、確認需求與安全條件，完成聯絡及行動計畫。", "從「我想幫忙」到「真正幫上忙」，還需要做哪些準備？"]
];
const goals = [
  ["看見處境，不急著貼標籤", "毛色、體型、品種與年齡可以提供線索，卻不能代替對個體的理解。透過情境選擇與案例討論，學生練習看見表象背後的需求與責任。"],
  ["閱讀資料，也讀懂資料的限制", "數字回答了什麼？哪些資訊沒有被記錄？學生從公開資料出發，區分事實、推論與未知，避免把相關誤認為因果。"],
  ["理解不同立場，說明選擇的代價", "犬隻、野生動物、居民與照護人員，都可能承受不同的風險。課程引導學生比較方案、提出理由，並思考配套與後續追蹤。"],
  ["把善意寫成可執行的計畫", "有效的參與，從確認需求開始。學生依自己的能力、時間與成人支持，規劃資料整理、教育宣導、物資協調或參訪提案，並準備替代方案。"]
];
const connections = [
  ["校園｜讓提問與討論有空間", "教師引導學生檢查證據、表達理由與修正判斷，將探究歷程累積為學習成果。"],
  ["政府開放資料｜讓討論有共同依據", "運用公開的動物認領養、收容與學校等資料，認識來源、欄位、更新時間及使用限制。"],
  ["收容與動保實務｜讓行動回應真實需求", "透過官方資訊與聯絡管道，了解單位需求、參與資格及安全規範，再由教師或家長協助評估行動。"]
];
const outcomes = [
  ["責任盤點", "我能承擔什麼？還需要哪些支持？"],
  ["資料判讀", "我的說法根據什麼？哪些部分仍待查證？"],
  ["議題分析", "不同方案保護了誰，又可能讓誰承受代價？"],
  ["行動計畫", "我要聯絡誰、確認什麼，以及如何完成下一步？"]
];
const curriculum = [
  ["科學探究", "提出問題、比較案例、辨識變項與證據限制", "探究問題、資料比較與查證計畫"],
  ["資訊與媒體素養", "查核來源、判讀圖表、區分影像與推論", "資料判讀紀錄、影音分析"],
  ["生命教育", "理解個體需求、長期照護與福利", "責任盤點、情境反思"],
  ["公民參與", "比較政策、理解利害關係與資源限制", "方案分析、動保行動提案"]
];
const button = "inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9c8761]";
const heading = "text-2xl font-bold leading-relaxed tracking-tight sm:text-3xl";

function LearningTable({ label, headers, rows }: { label: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-2xl border border-[#e5d3ae] bg-[#fffdf8] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9c8761]" role="region" aria-label={label} tabIndex={0}>
      <table className="w-full min-w-[680px] text-left text-sm leading-7 sm:text-base">
        <caption className="sr-only">{label}</caption>
        <thead className="bg-[#f3e3bf] text-[#4a3824]"><tr>{headers.map((header) => <th key={header} scope="col" className="px-6 py-5 font-bold">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-stone-200">{rows.map(([title, practice, question]) => <tr key={title} className="align-top even:bg-stone-50/70"><th scope="row" className="w-1/4 px-6 py-5 font-semibold text-stone-800">{title}</th><td className="w-2/5 px-6 py-5 text-stone-600">{practice}</td><td className="px-6 py-5 text-stone-700">{question}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export default function HomePage() {
  return (
    <PublicPageShell>
      <div className="bg-[linear-gradient(180deg,#fffaf0_0%,#f7f0e4_48%,#fffaf2_100%)] text-[#403b33]">
        <section id="top" className="relative isolate overflow-hidden bg-[#332a22] text-white">
          <Image src="/Shelter-Dog.png" alt="在戶外奔跑的犬隻" fill priority sizes="100vw" className="-z-20 object-cover object-center" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#211f19]/88 via-[#211f19]/68 to-[#211f19]/26" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#211f19]/52 via-[#211f19]/10 to-[#211f19]/22" />
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
            <div data-testid="hero-panel" className="max-w-4xl rounded-[2rem] border border-white/20 bg-[#191713]/80 p-6 shadow-[0_28px_90px_-34px_rgba(0,0,0,0.82)] backdrop-blur-lg sm:p-9 lg:p-12">
              <header>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f0d99f] sm:text-sm">六週數位探究課程 · Evidence-led learning</p>
                <h1 className="mt-5 max-w-4xl text-balance text-4xl font-bold leading-[1.18] tracking-[-0.035em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl">ShelterLab｜青少年動物科學探究實驗室</h1>
              </header>

              <div className="mt-8 max-w-3xl border-l-4 border-[#e7c77f] pl-5 sm:mt-10 sm:pl-7">
                <p className="text-xl font-bold leading-relaxed text-[#f5dda7] sm:text-2xl lg:text-3xl">從看見一隻犬，到理解牠身後的世界。</p>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#fffaf0] sm:text-base sm:leading-8">連結校園學習、政府開放資料與收容所實務，讓青少年透過六週數位課程，練習閱讀證據、辨識偏見、理解不同立場，並提出負責任的動保行動。</p>
                <blockquote className="mt-6 rounded-2xl border border-white/15 bg-black/20 px-5 py-4 text-sm leading-7 text-white/90 sm:text-base sm:leading-8">從「我想幫助牠」開始，進一步思考：<strong className="mt-1 block text-[#f5dda7]">我知道什麼？還需要查證什麼？怎麼做才真正有幫助？</strong></blockquote>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/20 pt-7 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link href="/start" className={`${button} w-full bg-[#f6d98c] px-8 py-4 text-base text-[#30251b] shadow-[0_12px_30px_-12px_rgba(246,217,140,0.65)] hover:-translate-y-1 hover:bg-[#fff0bd] hover:shadow-[0_16px_36px_-12px_rgba(246,217,140,0.8)] sm:w-auto`}>開始六週探索</Link>
                <Link href="#vision" className={`${button} w-full border border-white/70 bg-white/10 px-8 py-4 text-base text-white shadow-lg shadow-black/15 hover:-translate-y-1 hover:border-white hover:bg-white/20 sm:w-auto`}>了解專案細節</Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-20 px-5 py-16 sm:space-y-24 sm:px-8 sm:py-24">
          <section id="vision" aria-labelledby="vision-title" className="scroll-mt-32">
            <h2 id="vision-title" className={heading}>專案願景｜讓關心有依據，讓行動有方向</h2>
            <div className="mt-8 max-w-4xl space-y-5 text-base leading-8 text-stone-600 sm:text-lg sm:leading-9">
              <p>一張照片、一個品種名稱，或一段令人心疼的故事，往往影響我們對犬隻的第一印象。但要理解牠的處境，我們還需要看見照護關係、生活環境，以及人與制度如何共同形塑牠的一生。</p>
              <p>ShelterLab 以動物議題為起點，將生命教育、科學探究與公共議題討論帶進學習現場。學生從熟悉的生活情境出發，逐步接觸政府開放資料、動物福利與政策兩難，學習提出問題、比較證據，也保留對未知的誠實。</p>
              <p>我們期待串起校園、公開資訊與收容實務，讓學生的關心轉化為有根據的判斷，讓每一次參與都更貼近動物與照護者的真實需求。</p>
            </div>
          </section>
          <section aria-labelledby="map-title"><h2 id="map-title" className={heading}>六週學習地圖｜從理解處境，到規劃行動</h2><LearningTable label="六週學習地圖" headers={["週次", "探究主題", "帶著一個問題出發"]} rows={weeks} /></section>
          <section aria-labelledby="goals-title">
            <h2 id="goals-title" className={heading}>我們希望學生學會的四件事</h2>
            <ol className="mt-8 grid gap-5 md:grid-cols-2">{goals.map(([title, description], index) => <li key={title} className="rounded-3xl border border-[#e5d3ae] bg-[#fffdf8] p-6 shadow-sm sm:p-8"><span aria-hidden="true" className="text-sm font-bold tracking-widest text-[#8f7c5e]">0{index + 1}</span><h3 className="mt-4 text-xl font-bold leading-8">{title}</h3><p className="mt-3 leading-8 text-stone-600">{description}</p></li>)}</ol>
          </section>
          <section aria-labelledby="connections-title">
            <h2 id="connections-title" className={heading}>從課堂出發，連結真實世界</h2>
            <ul className="mt-8 grid gap-6 lg:grid-cols-3">{connections.map(([title, description]) => <li key={title} className="border-t-4 border-[#dec692] pt-6"><h3 className="text-lg font-bold leading-8">{title}</h3><p className="mt-3 leading-8 text-stone-600">{description}</p></li>)}</ul>
          </section>
          <section aria-labelledby="outcomes-title" className="rounded-3xl border border-[#e3cfaa] bg-[#f6ead0] p-6 sm:p-10">
            <h2 id="outcomes-title" className={heading}>讓學習成果看得見</h2><p className="mt-5 leading-8 text-stone-600">學生帶走的不只是測驗答案，而是一段可以回顧的思考歷程：</p>
            <ul className="mt-7 grid gap-5 md:grid-cols-2">{outcomes.map(([title, question]) => <li key={title} className="rounded-2xl bg-white/85 p-5 leading-8"><strong className="text-[#6f4f20]">{title}：</strong>{question}</li>)}</ul>
          </section>
          <section aria-labelledby="curriculum-title"><h2 id="curriculum-title" className={heading}>連結高中探究與實作</h2><LearningTable label="連結高中探究與實作" headers={["學習面向", "課程中的練習", "可整理的學習成果"]} rows={curriculum} /></section>
          <section aria-labelledby="cta-title" className="rounded-3xl bg-[#4a3828] px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
            <h2 id="cta-title" className={heading}>讓下一份關心，多一點理解與準備</h2><p className="mt-6 text-lg text-[#ebd197]">改變可以從一個更好的問題開始。</p><p className="mx-auto mt-4 max-w-2xl leading-8 text-stone-100">走進 ShelterLab，練習用證據理解動物議題，用同理看見不同處境，再找到自己能負責完成的一步。</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/tour/welcome" className={`${button} border border-white/60 hover:bg-white/10`}>如何運作</Link><Link href="/start" className={`${button} bg-[#ebd197] text-[#332a22] hover:bg-white`}>開始體驗</Link></div>
          </section>
        </div>
      </div>
    </PublicPageShell>
  );
}
