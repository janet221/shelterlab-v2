import type { Metadata } from "next";
import { PublicPageShell } from "@/app/_components/public-shell";

export const metadata: Metadata = {
  title: "政府開放資料與引用資源",
  description: "ShelterLab 課程使用的政府開放資料、官方資訊與民間教育資源清冊。",
};

type Resource = {
  title: string;
  provider: string;
  url: string;
  note: string;
  usedIn?: string;
};

const openDatasets: Resource[] = [
  { title: "動物認領養", provider: "農業部動物保護司", url: "https://data.gov.tw/dataset/85903", note: "提供公開待認養動物個案欄位，作為資料判讀與個案比較素材。", usedIn: "學生第 2、3、4 週：認養資料判讀、品種標籤與資料界線練習。" },
  { title: "全國公立動物收容所收容處理情形統計表", provider: "農業部", url: "https://data.gov.tw/dataset/41236", note: "提供縣市與月份層級的入所、認領養及處理統計。", usedIn: "學生第 6 週：收容所資料快照與行前判讀。" },
  { title: "全國公立動物收容所收容處理情形統計表二", provider: "農業部", url: "https://data.nat.gov.tw/dataset/73396", note: "提供容量、月底在養與入所來源等欄位。", usedIn: "學生第 6 週：收容所資料快照與行前判讀。" },
  { title: "一般高級中等學校名錄", provider: "教育部統計處", url: "https://data.gov.tw/dataset/6089", note: "用於確認教師設定的學校與縣市；同步失敗時使用有日期的備援快照。", usedIn: "教師設定頁與學生第 6 週：學校／縣市選擇。" },
  { title: "國家教育研究院愛學網", provider: "國家教育研究院", url: "https://data.gov.tw/dataset/6318", note: "僅使用教材中繼資料與官方外部連結，不下載、鏡像或重新散布影片。", usedIn: "學生第 1、2、3 週：官方影音教材連結。" },
];

const officialReferences: Resource[] = [
  { title: "動物保護法", provider: "全國法規資料庫", url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=M0060027", note: "飼主責任、動物福利與公共政策討論的法規依據。" },
  { title: "合法寵物業者名單", provider: "農業部寵物登記管理資訊網", url: "https://www.pet.gov.tw/Web/BusinessList.aspx", note: "供學生練習查核犬隻來源與業者合法性。" },
  { title: "犬貓寵物登記新制", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000867?parentID=Tab0000003", note: "寵物登記、飼主責任與制度變動的官方說明。" },
  { title: "113 年全國遊蕩犬數量推估結果", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001599", note: "遊蕩犬數量、估計方法與資料限制的官方背景。" },
  { title: "遊蕩犬族群控制與收容管理政策回應", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001995", note: "源頭管理、收容與政策選擇的官方說明。" },
  { title: "115 年遊蕩犬社區管理計畫", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000002234", note: "社區管理與跨單位行動規劃的政策資料。" },
  { title: "動物保護影音與教材專區", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E", note: "動物保護與責任飼養的官方教育素材入口。" },
  { title: "動物保護通報與資源", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/Know/AnimalResource", note: "遇到動物傷害或公共安全疑慮時，提供通報前準備與資源說明。" },
  { title: "公共政策網路參與提案", provider: "國家發展委員會", url: "https://join.gov.tw/idea/detail/4690bfc9-7b75-4f50-9039-ab46ccf09e1e", note: "用於辨識公共提案、政府回應與正式法規之間的差異。" },
];

const educationResources: Resource[] = [
  { title: "校犬是我們的家人", provider: "國家教育研究院愛學網", url: "https://stv.naer.edu.tw/watch/344572", note: "第一週角色、生活處境與照護責任的影音素材。" },
  { title: "兒少論壇：愛護飼養的動物", provider: "國家教育研究院愛學網", url: "https://stv.naer.edu.tw/watch/257479", note: "第二週認養承諾與家庭責任盤點的影音素材。" },
  { title: "牠想要一個家", provider: "國家教育研究院愛學網", url: "https://stv.naer.edu.tw/watch/257495", note: "第三週認養流程、品種標籤與個體差異的影音素材。" },
  { title: "生物多樣性", provider: "國家教育研究院愛學網", url: "https://stv.naer.edu.tw/watch/1735", note: "棲地、個體差異與未記錄環境變項的延伸教材。" },
  { title: "家庭中的寵物與青少年", provider: "關懷生命協會", url: "https://www.lca.org.tw/education/29/21187", note: "人、家庭與動物之間雙向照護關係的民間教育閱讀。" },
  { title: "飼主法律義務", provider: "法律百科", url: "https://www.legis-pedia.com/article/environment-hygiene/996", note: "搭配正式法規閱讀的公民法律教育資源。" },
  { title: "流浪犬政策爭議解析", provider: "獨立評論＠天下", url: "https://opinion.cw.com.tw/blog/profile/52/article/15711", note: "政策立場、論證與證據比較的延伸閱讀。" },
  { title: "零撲殺上路六年專題", provider: "報導者", url: "https://www.twreporter.org/topics/6-years-after-no-kill-policy-adopted", note: "收容政策、現場壓力與制度脈絡的深度報導。" },
  { title: "遊蕩犬與野生動物衝突", provider: "報導者", url: "https://www.twreporter.org/a/6-years-after-no-kill-policy-adopted-conflict-with-wildlife", note: "動物福利、生態保育與公共選擇的多方觀點。" },
  { title: "被遺忘的源頭管理", provider: "報導者", url: "https://www.twreporter.org/a/6-years-after-no-kill-policy-adopted-solutions", note: "遊蕩犬源頭、責任照護與政策工具的延伸報導。" },
  { title: "遊蕩犬貓怎麼管《上》", provider: "公共電視", url: "https://www.youtube.com/watch?v=eHWNR-rstjc", note: "遊蕩犬貓與野生動物衝突的公共議題影音。" },
];

const externalLinkUsage: Record<string,string> = {
  "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=M0060027": "學生第 2、5 週：法規責任與政策討論。",
  "https://www.pet.gov.tw/Web/BusinessList.aspx": "學生第 3 週：犬隻來源與合法業者查核。",
  "https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000867?parentID=Tab0000003": "學生第 2 週：飼主責任與寵物登記。",
  "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001599": "學生第 4 週：遊蕩犬數量與估計限制。",
  "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001995": "學生第 5 週：收容與族群控制政策討論。",
  "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000002234": "學生第 4 週：社區管理行動規劃。",
  "https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E": "學生第 4 週：動物保護影音與教材延伸。",
  "https://animal.moa.gov.tw/Frontend/Know/AnimalResource": "學生第 6 週：行前安全提示與 1959 通報準備。",
  "https://join.gov.tw/idea/detail/4690bfc9-7b75-4f50-9039-ab46ccf09e1e": "學生第 5 週：公共提案與政策回應比較。",
  "https://stv.naer.edu.tw/watch/344572": "學生第 1 週：角色與照護責任影音。",
  "https://stv.naer.edu.tw/watch/257479": "學生第 2 週：認養承諾與家庭責任影音。",
  "https://stv.naer.edu.tw/watch/257495": "學生第 3 週：認養流程與個體差異影音。",
  "https://stv.naer.edu.tw/watch/1735": "教師課程資源：生物多樣性延伸教材。",
  "https://www.lca.org.tw/education/29/21187": "學生第 2 週：家庭與青少年照護關係閱讀。",
  "https://www.legis-pedia.com/article/environment-hygiene/996": "學生第 2 週：飼主法律義務延伸閱讀。",
  "https://opinion.cw.com.tw/blog/profile/52/article/15711": "學生第 4 週：政策爭議與論證比較。",
  "https://www.twreporter.org/topics/6-years-after-no-kill-policy-adopted": "學生第 5 週：零撲殺政策脈絡。",
  "https://www.twreporter.org/a/6-years-after-no-kill-policy-adopted-conflict-with-wildlife": "學生第 5 週：遊蕩犬與野生動物衝突。",
  "https://www.twreporter.org/a/6-years-after-no-kill-policy-adopted-solutions": "學生第 4 週：源頭管理延伸閱讀。",
  "https://www.youtube.com/watch?v=eHWNR-rstjc": "學生第 5 週：公共議題影音判讀。",
};

const externalLinks: Resource[] = [...officialReferences, ...educationResources]
  .filter((resource) => Boolean(externalLinkUsage[resource.url]))
  .map((resource) => ({ ...resource, usedIn: externalLinkUsage[resource.url] }));

function ResourceSection({ id, eyebrow, title, resources }: { id: string; eyebrow: string; title: string; resources: Resource[] }) {
  return (
    <section id={id} className="scroll-mt-28" aria-labelledby={`${id}-title`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8f7c5e]">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-3 text-2xl font-bold text-[#3f352c] sm:text-3xl">{title}</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {resources.map((resource) => (
          <article key={resource.url} className="rounded-2xl border border-[#dfd3c1] bg-[#fffdf8] p-5 shadow-[0_16px_45px_-38px_rgba(74,56,40,0.65)]">
            <p className="text-xs font-bold text-[#8a7562]">{resource.provider}</p>
            <h3 className="mt-3 text-lg font-bold leading-7 text-[#3f352c]">{resource.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#6f6257]">{resource.note}</p>
            {resource.usedIn && <p className="mt-3 border-l-2 border-[#b69a69] pl-3 text-sm font-semibold leading-6 text-[#5e5142]">出現位置：{resource.usedIn}</p>}
            <a className="mt-5 inline-flex items-center text-sm font-bold text-[#766248] underline decoration-[#c9b58f] underline-offset-4 hover:text-[#4e4032]" href={resource.url} target="_blank" rel="noreferrer">前往來源 ↗</a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function GovernmentDataPage() {
  return (
    <PublicPageShell>
      <div className="bg-[linear-gradient(180deg,#fffaf0_0%,#f7f0e4_55%,#fffaf2_100%)] text-[#403b33]">
        <header className="border-b border-[#dfd3c1] bg-[#f1e8da]/75">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8f7c5e]">資料透明與引用責任</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-[#332a22] sm:text-5xl">政府開放資料與引用資源</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#65594d] sm:text-lg">只列出目前已實際接入 ShelterLab 功能或課程的資料來源；每筆資料都標示其出現位置。未使用的清冊項目不在此頁展示。</p>
            <nav className="mt-8 flex flex-wrap gap-3 text-sm font-bold" aria-label="資源分類">
              {[['開放資料集', '#datasets'], ['外部連結', '#external']].map(([label, href]) => <a key={href} href={href} className="rounded-full border border-[#d7c49f] bg-[#fffdf8] px-4 py-2 text-[#5f5142] hover:bg-[#f4e4bd]">{label}</a>)}
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-20 px-5 py-14 sm:px-8 sm:py-20">
          <ResourceSection id="datasets" eyebrow="已接入功能" title="開放資料集" resources={openDatasets} />
          <ResourceSection id="external" eyebrow="課程與功能引用" title="外部連結" resources={externalLinks} />
        </div>
      </div>
    </PublicPageShell>
  );
}
