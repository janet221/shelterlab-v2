import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicPageShell } from "./_components/public-shell";

export const metadata: Metadata = {
  title: "ShelterLab｜青少年公共議題探究實驗室",
  description: "從觀察一隻流浪犬的處境開始，進而透視其背後的社會結構與制度。本專案結合校園探究實作、政府開放資料與收容所前線實務，引導學生透過六週的思辨歷程，培養公共參與素養，並化關懷為負責任的社會行動。"
};

const weeks = [
  ["第一週", "角色與處境", "犬隻在不同身分（家庭、工作、校園、遊蕩）下的法規定位、照護責任與資源分配有何差異？"],
  ["第二週", "承諾與責任", "評估飼養寵物需要哪些經濟、時間與環境條件？現行法律與社會制度如何規範飼主責任？"],
  ["第三週", "品種與標籤", "品種標籤是如何被建構出來的？個體的性格與照護需求能否單靠品種來判定？"],
  ["第四週", "數量與源頭", "繁殖、棄養、未絕育與收容數據之間有何關聯？流浪動物源頭管制的瓶頸在哪裡？"],
  ["第五週", "政策與兩難", "動物福利、生態保育與公共安全之間存在哪些利益衝突？如何運用數據評估政策成效？"],
  ["第六週", "現場與行動", "第一線動保團體有哪些實際需求與限制？如何評估資源並擬定具備可行性的行動方案？"]
];
const goals = [
  ["撕除標籤與需求解讀", "照片和品種很容易讓人產生預設立場。我們帶學生在實例中釐清表象背後的真相，學會客觀評估個體需求與飼主應負的責任。"],
  ["公開數據與事實判讀", "看懂數據反映了什麼，也找出哪些狀況沒被記錄下來。我們教學生從政府開放資料中區分事實與推斷，不讓數據盲點影響判斷。"],
  ["多元立場與配套評估", "議題背後牽涉居民、野生動物與政府多方衝突。我們引導學生用客觀證據比較方案，試著提出考慮到現實限制的配套做法。"],
  ["可行性評估與規劃能力", "學生會在了解真實需求後，審視自身能力與時間，有計畫地完成參訪行動。"]
];
const connections = [
  ["校園實作｜平臺遊戲與課堂討論", "我們把議題探究做成網頁遊戲。學生在課堂上玩遊戲、過關卡，對浪犬議題進行一系列思辨，進而破除刻板印象及觀點，培養具邏輯性的論述能力及同理心。"],
  ["政府開放資料｜真實數據應用", "提取開放資料集的資訊放進遊戲裡。學生邊操作邊看懂欄位代表什麼，也親自體會數據有哪些反映不出來的盲點。"],
  ["收容現場｜事前評估與走訪收容所", "去收容所之前，學生要在平臺裡先查好該收容所的規範及需求，完成評估後才出發前往收容所。"]
];
const curriculum = [
  ["系統思考與解決問題", "在遊戲情境中辨識犬隻處境與照護責任，提出問題、比較案例，並分辨資料能支持什麼推論。", "探究問題、案例比較紀錄、附有證據與限制說明的判讀。"],
  ["科技資訊與媒體素養", "查核開放資料來源與欄位，判讀數據、日期和涵蓋範圍，並用清楚的方式說明發現。", "資料來源紀錄、數據判讀說明、圖表或證據論述。"],
  ["道德實踐與公民意識", "比較動物、居民、收容現場與政府等不同立場，思考動物福利、公共安全和資源限制。", "利害關係人分析、政策取捨說明、具理由與配套的行動提案。"],
  ["生命教育議題融入", "從個體需求與照護情境反思同理心、飼主責任及人與動物的相處。", "情境反思紀錄、責任評估或照護需求分析。"]
];
const heading = "text-2xl font-bold leading-relaxed tracking-tight sm:text-3xl";

function LearningTable({ label, headers, rows }: { label: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="home-table mt-8 overflow-x-auto rounded-2xl border border-[#e5d3ae] bg-[#fffdf8] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9c8761]" role="region" aria-label={label} tabIndex={0}>
      <table className="w-full min-w-[680px] text-left text-sm leading-7 sm:text-base">
        <caption className="sr-only">{label}</caption>
        <thead className="bg-[#f7f1e5] text-[#4a3824]"><tr>{headers.map((header) => <th key={header} scope="col" className="px-6 py-5 font-bold">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#eee6d7]">{rows.map(([title, practice, question]) => <tr key={title} className="group align-top transition-colors duration-300 even:bg-[#fbf9f4] hover:bg-[#fff7e5]"><th scope="row" className="w-1/4 px-6 py-5 font-semibold text-stone-800 transition-transform duration-300 group-hover:translate-x-1">{title}</th><td className="w-2/5 px-6 py-5 text-stone-600">{practice}</td><td className="px-6 py-5 text-stone-700">{question}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export default function HomePage() {
  return (
    <PublicPageShell>
      <div data-homepage className="bg-[linear-gradient(180deg,#fffaf0_0%,#f7f0e4_48%,#fffaf2_100%)] text-[#403b33]">
        <section id="top" data-testid="version2-hero" className="relative h-[90vh] w-full overflow-hidden">
          <Image src="/Shelter-Dog.png" alt="Shelter Dog running" fill priority sizes="100vw" className="object-cover object-center" />
          <div className="absolute bottom-0 left-0 z-10 w-full bg-gradient-to-t from-[#332a22]/95 via-[#332a22]/45 to-transparent px-5 pb-10 pt-28 sm:px-10 sm:pb-14 md:px-20 lg:pb-16">
            <div className="mx-auto flex h-full max-w-7xl flex-col items-start justify-end">
              <span className="mb-4 inline-block rounded-full border border-[#ebd197]/50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.3em] text-[#ebd197]">
                六週動物生命教育 × 公共議題探究實作
              </span>
              <h1 className="max-w-[850px] text-4xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl">
                ShelterLab｜青少年公共議題探究實驗室
              </h1>
              <p className="mt-5 max-w-3xl text-xs leading-6 text-white/80 drop-shadow-sm sm:text-sm sm:leading-7">
                結合遊戲化課程、政府開放資料與第一線收容所，帶青少年在了解社會真實需求後，審視自身能力與時間，有計畫地完成參訪行動。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="inline-block rounded-full bg-[#ebd197] px-8 py-3 text-sm font-bold tracking-wider text-[#332a22] shadow-xl transition hover:bg-white md:text-base" href="/start">
                  開啟探究歷程
                </Link>
                <Link className="inline-block rounded-full border border-white/70 bg-white/10 px-8 py-3 text-sm font-bold tracking-wider text-white shadow-xl transition hover:bg-white/20 md:text-base" href="/#vision">
                  了解專案架構
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-20 px-5 py-16 sm:space-y-24 sm:px-8 sm:py-24">
          <section id="vision" data-home-section aria-labelledby="vision-title" className="home-panel scroll-mt-32 rounded-[2rem] border border-[#ead9b8] bg-[#fffdf8] p-7 shadow-[0_24px_70px_rgba(95,73,42,0.08)] backdrop-blur sm:p-10">
            <h2 id="vision-title" className={heading}>專案願景</h2>
            <div className="mt-8 max-w-4xl space-y-5 text-base leading-8 text-stone-600 sm:text-lg sm:leading-9">
              <p>我們對流浪動物的印象，常來自網路上的照片或品種標籤。但想真正改善牠們的處境，只靠心疼是不夠的——問題的根源，往往牽涉到飼主責任、社區衝突與政府政策。</p>
              <p>ShelterLab 想帶學生走進真實世界。我們把政府開放資料帶進課堂，陪學生從身邊的故事出發，學會看懂數據、抓出真正的問題，並坦然面對政策與現實的兩難。</p>
              <p>我們希望串聯學校、開放數據與收容現場，讓學生的同理心不只是一時的情緒，而是能提出有憑有據的企劃，真正解決浪浪與第一線人員的難題。</p>
            </div>
          </section>
          <section data-home-section aria-labelledby="map-title" className="home-panel"><h2 id="map-title" className={heading}>六週學習地圖｜6 週遊戲式探究與實作流程</h2><LearningTable label="六週學習地圖" headers={["週次", "探究主題", "核心探究問題"]} rows={weeks} /></section>
          <section data-home-section aria-labelledby="goals-title" className="home-panel">
            <h2 id="goals-title" className={heading}>我們期望培養的核心素養</h2>
            <ol className="mt-8 grid gap-5 md:grid-cols-2">{goals.map(([title, description], index) => <li key={title} className="home-card group rounded-3xl border border-[#e5d3ae] bg-[#fffdf8] p-6 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-[#cfb77e] hover:shadow-xl sm:p-8"><span aria-hidden="true" className="inline-grid h-10 w-10 place-items-center rounded-full bg-[#f2e5c8] text-sm font-bold tracking-widest text-[#765f3d] transition duration-300 group-hover:rotate-6 group-hover:bg-[#e9dfca] group-hover:text-[#5f5142]">0{index + 1}</span><h3 className="mt-4 text-xl font-bold leading-8">{title}</h3><p className="mt-3 leading-8 text-stone-600">{description}</p></li>)}</ol>
          </section>
          <section data-home-section aria-labelledby="connections-title" className="home-panel">
            <h2 id="connections-title" className={heading}>從課堂出發，連結真實社會</h2>
            <ul className="mt-8 grid gap-6 lg:grid-cols-3">{connections.map(([title, description]) => <li key={title} className="home-card rounded-3xl border border-[#e6d8bd] border-t-4 border-t-[#dec692] bg-[#fffdf8] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"><h3 className="text-lg font-bold leading-8">{title}</h3><p className="mt-3 leading-8 text-stone-600">{description}</p></li>)}</ul>
          </section>
          <section data-home-section aria-labelledby="curriculum-title" className="home-panel"><h2 id="curriculum-title" className={heading}>連結 108 課綱核心素養與探究實作</h2><LearningTable label="108 課綱核心素養與探究實作連結" headers={["課綱連結面向", "專案中的學習歷程", "可觀察的學習表現"]} rows={curriculum} /></section>
          <section data-home-section aria-labelledby="start-inquiry-title" className="home-panel home-cta relative isolate overflow-hidden rounded-[2rem] border border-[#e7dbc2] bg-[linear-gradient(135deg,#fffdf8_0%,#f9f6ee_52%,#fffaf0_100%)] p-8 text-center shadow-[0_24px_70px_rgba(95,73,42,0.08)] sm:p-12 lg:p-16">
            <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border border-[#e6dbc5]/60 bg-[radial-gradient(circle,#f7f1e5_0%,rgba(247,241,229,0)_70%)]" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-64 w-64 rounded-full border border-[#e6dbc5]/45 bg-[radial-gradient(circle,#fffdf8_0%,rgba(255,253,248,0)_70%)]" />
            <div className="relative z-10">
              <p className="inline-flex items-center gap-3 rounded-full border border-[#d9c397]/70 bg-[#fffdf8]/75 px-4 py-2 text-sm font-bold tracking-[0.12em] text-[#846a3d]"><span aria-hidden="true" className="h-px w-5 bg-[#c6a968]" />用資料看見動物，用行動帶來改變<span aria-hidden="true" className="h-px w-5 bg-[#c6a968]" /></p>
              <h2 id="start-inquiry-title" className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-relaxed tracking-tight text-[#40372b] sm:text-4xl">準備好接下這場探究任務了嗎？</h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#716451] sm:text-lg">用 6 週時間釐清現狀、找出關鍵問題，一步步規劃出你能親手實踐的動物關懷行動。</p>
              <Link className="group mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#d1b878] bg-[#ebd197] px-8 py-3 text-base font-bold text-[#332a22] shadow-[0_8px_22px_rgba(139,104,43,0.16)] transition duration-200 hover:-translate-y-1 hover:border-[#bd9c58] hover:bg-[#f4e4bd] hover:shadow-[0_14px_30px_rgba(139,104,43,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a8874e] active:translate-y-0 active:scale-[0.98]" href="/start">
                開始探究
                <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-[#fffaf0] text-[#735b30] transition duration-200 group-hover:translate-x-1 group-hover:bg-white">→</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PublicPageShell>
  );
}
