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
  status?: "使用中" | "中繼資料" | "背景引用";
};

const openDatasets: Resource[] = [
  { title: "動物認領養", provider: "農業部動物保護司", url: "https://data.gov.tw/dataset/85903", note: "提供公開待認養動物個案欄位，作為六週課程的資料判讀與個案比較素材。", status: "使用中" },
  { title: "全國公立動物收容所收容處理情形統計表", provider: "農業部", url: "https://data.gov.tw/dataset/41236", note: "提供縣市與月份層級的入所、認領養及處理統計，用於政策與資料限制討論。", status: "使用中" },
  { title: "全國公立動物收容所收容處理情形統計表二", provider: "農業部", url: "https://data.nat.gov.tw/dataset/73396", note: "提供容量、月底在養與入所來源等欄位，用於理解收容現場需求。", status: "使用中" },
  { title: "全國公立動物收容所資料", provider: "農業部", url: "https://data.gov.tw/dataset/134284", note: "提供公立收容所與動物之家基本資料，支援資源地圖及官方單位連結。", status: "使用中" },
  { title: "一般高級中等學校名錄", provider: "教育部統計處", url: "https://data.gov.tw/dataset/6089", note: "用於確認學校與縣市，協助篩選同縣市動保資源；不推算未提供的距離。", status: "使用中" },
  { title: "國家教育研究院愛學網", provider: "國家教育研究院", url: "https://data.gov.tw/dataset/6318", note: "僅使用教材中繼資料與官方外部連結，不下載、鏡像或重新散布影片。", status: "中繼資料" },
  { title: "各級學校縣市別學生人數", provider: "教育部統計處", url: "https://data.gov.tw/dataset/40121", note: "提供縣市層級教育背景資料，用於探究情境與素養脈絡。", status: "背景引用" },
  { title: "國家教育研究院全國中小學題庫網", provider: "國家教育研究院", url: "https://data.gov.tw/dataset/29027", note: "保留歷史索引與中繼資料；原網站已停止更新，不提供題目內容或答案。", status: "中繼資料" },
  { title: "國中教育會考各科試題通過率", provider: "教育部國民及學前教育署", url: "https://data.gov.tw/dataset/15391", note: "作為資料治理與教育統計背景清冊，目前不直接參與學生評量。", status: "背景引用" },
];

const officialReferences: Resource[] = [
  { title: "動物保護法", provider: "全國法規資料庫", url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=M0060027", note: "飼主責任、動物福利與公共政策討論的法規依據。" },
  { title: "政府部門執勤犬照護管理規則", provider: "農業部", url: "https://law.moa.gov.tw/LawContent.aspx?id=GL000669&media=print", note: "工作犬照護與角色差異課程的官方規範。" },
  { title: "合法寵物業者名單", provider: "農業部寵物登記管理資訊網", url: "https://www.pet.gov.tw/Web/BusinessList.aspx", note: "供學生練習查核犬隻來源與業者合法性。" },
  { title: "犬貓寵物登記新制", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000867?parentID=Tab0000003", note: "寵物登記、飼主責任與制度變動的官方說明。" },
  { title: "113 年全國遊蕩犬數量推估結果", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001599", note: "遊蕩犬數量、估計方法與資料限制的官方背景。" },
  { title: "遊蕩犬族群控制與收容管理政策回應", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000001995", note: "源頭管理、收容與政策選擇的官方說明。" },
  { title: "115 年遊蕩犬社區管理計畫", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/News/Detail/N0000000002234", note: "社區管理與跨單位行動規劃的政策資料。" },
  { title: "動物保護影音與教材專區", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E", note: "動物保護與責任飼養的官方教育素材入口。" },
  { title: "1959 動物保護專線服務範圍", provider: "農業部", url: "https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000758?parentID=Tab0000023", note: "救援、通報與一般協助情境的判斷依據。" },
  { title: "110 報案服務", provider: "內政部警政署", url: "https://www.npa.gov.tw/ch/app/artwebsite/view?module=artwebsite&id=1048&serno=e3ad2889-4dee-41cf-aef8-9b9d26dc6950", note: "正在發生的治安或交通危險情境之官方資訊。" },
  { title: "119 緊急救援服務", provider: "內政部消防署", url: "https://www.nfa.gov.tw/cht/index.php?code=list&ids=66", note: "緊急救援情境與安全優先原則的官方資訊。" },
  { title: "學生服務學習", provider: "臺北市動物保護處", url: "https://www.tcapo.gov.taipei/cp.aspx?n=64E92A82C8BB7529", note: "學生參與條件、服務方式與安全規範的地方官方來源。" },
  { title: "動物之家志工", provider: "新北市政府農業局", url: "https://www.agriculture.ntpc.gov.tw/information.php?p_id=58", note: "志工服務條件與聯絡方式的地方官方來源。" },
  { title: "動保志工服務", provider: "臺中市動物保護防疫處", url: "https://www.animal.taichung.gov.tw/1521448/1521512/1521541/1533995", note: "志工服務與參與規範的地方官方來源。" },
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

function ResourceSection({ id, eyebrow, title, resources }: { id: string; eyebrow: string; title: string; resources: Resource[] }) {
  return (
    <section id={id} className="scroll-mt-28" aria-labelledby={`${id}-title`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8f7c5e]">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-3 text-2xl font-bold text-[#3f352c] sm:text-3xl">{title}</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {resources.map((resource) => (
          <article key={resource.url} className="rounded-2xl border border-[#dfd3c1] bg-[#fffdf8] p-5 shadow-[0_16px_45px_-38px_rgba(74,56,40,0.65)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-[#8a7562]">{resource.provider}</p>
              {resource.status && <span className="rounded-full bg-[#eee8df] px-3 py-1 text-[11px] font-bold text-[#6f6257]">{resource.status}</span>}
            </div>
            <h3 className="mt-3 text-lg font-bold leading-7 text-[#3f352c]">{resource.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#6f6257]">{resource.note}</p>
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
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#65594d] sm:text-lg">以下為 Shelter Lab 課程進行中使用到的開放資料彙整，包含政府開放資料、官方資訊及教育民間資源三大分類。</p>
            <nav className="mt-8 flex flex-wrap gap-3 text-sm font-bold" aria-label="資源分類">
              {[['政府開放資料', '#datasets'], ['官方資訊', '#official'], ['教育與民間資源', '#education']].map(([label, href]) => <a key={href} href={href} className="rounded-full border border-[#d7c49f] bg-[#fffdf8] px-4 py-2 text-[#5f5142] hover:bg-[#f4e4bd]">{label}</a>)}
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-20 px-5 py-14 sm:px-8 sm:py-20">
          <ResourceSection id="datasets" eyebrow="政府資料" title="政府開放資料來源清冊" resources={openDatasets} />
          <ResourceSection id="official" eyebrow="官方來源" title="官方法規、政策與服務資訊" resources={officialReferences} />
          <ResourceSection id="education" eyebrow="教育資源" title="教育與民間引用資源" resources={educationResources} />
        </div>
      </div>
    </PublicPageShell>
  );
}
