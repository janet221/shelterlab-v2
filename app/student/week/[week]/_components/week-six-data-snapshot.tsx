/* eslint-disable @next/next/no-img-element -- government image hosts vary by record */
import type { AdoptionSnapshot, ShelterNeedsSnapshot, ShelterStatsSnapshot } from "@/lib/government-open-data";

export default function WeekSixDataSnapshot({ county, adoptions, stats, needs, className = "" }: { county: string; adoptions: AdoptionSnapshot | null; stats: ShelterStatsSnapshot | null; needs: ShelterNeedsSnapshot | null; className?: string }) {
  if (!county) return <section className={className}><h2>在地動保資料快照</h2><p>選擇所在縣市後，這裡會顯示政府資料中的部分現況。</p></section>;
  if (!adoptions || !stats || !needs) return <section className={className}><h2>在地動保資料快照</h2><p>正在讀取農業部開放資料…</p></section>;
  const row = stats.latestByCounty.find((item) => item.county === county);
  const need = needs.latestByCounty.find((item) => item.county === county);
  const dogs = adoptions.sampleDogs.filter((dog) => dog.county === county);
  const value = (input: number | null | undefined, suffix = "") => input === null || input === undefined ? "資料未提供" : `${input.toLocaleString("zh-TW")}${suffix}`;
  return <section className={className} aria-live="polite">
    <div><span>政府 Open Data</span><h2>{county}在地動保資料快照</h2></div>
    {(adoptions.source.mode === "fallback" || stats.source.mode === "fallback" || needs.source.mode === "fallback") && <p role="status">目前使用備援資料；各卡片仍標示所屬資料期間。</p>}
    <div className="snapshot-grid">
      <article><small>月底在養數</small><strong>{value(need?.currentTotal)}</strong><p>{need ? `民國 ${need.year} 年 ${need.month} 月；含收容所與委託代養` : "此縣市目前無可用期間"}</p></article>
      <article><small>可留容動物最大值</small><strong>{value(need?.maxCapacity)}</strong><p>犬、貓官方欄位合計；不是服務品質排名。</p></article>
      <article><small>當月合計入所數</small><strong>{value(need?.totalIntake)}</strong><p>{need ? `拾獲送交 ${value(need.foundDelivered)}、不擬續養 ${value(need.ownerSurrender)}、依法沒入 ${value(need.legalSeizure)}` : "入所來源資料未提供"}</p></article>
      <article><small>最近一期認領養數</small><strong>{value(row?.adoptedCount)}</strong><p>{row ? `民國 ${row.year} 年 ${row.month} 月；同期間收容 ${value(row.acceptedCount)}` : "此縣市目前無可用期間"}</p></article>
      <article><small>目前開放認養犬隻</small><strong>{value(adoptions.countyCounts[county])}</strong><p>每日異動資料中目前仍為 OPEN 的犬隻，不等於收容總數。</p></article>
    </div>
    <div className="snapshot-dogs">
      <h3>部分待認養犬隻</h3>
      {dogs.length === 0 ? <p>此縣市目前沒有可顯示的犬隻縮圖；請以官方資料頁最新內容為準。</p> : <div>
        {dogs.map((dog) => <article key={dog.subId}>
          {dog.imageUrl ? <img src={dog.imageUrl} alt={`${dog.shelterName}待認養犬隻 ${dog.subId}`} loading="lazy" referrerPolicy="no-referrer" /> : <div aria-label="官方資料未提供照片">無照片</div>}
          <dl>
            <div><dt>編號</dt><dd>{dog.subId}</dd></div>
            <div><dt>性別／體型</dt><dd>{dog.sex || "未提供"}／{dog.bodyType || "未提供"}</dd></div>
            <div><dt>年齡／毛色</dt><dd>{dog.age || "未提供"}／{dog.colour || "未提供"}</dd></div>
            <div><dt>收容所</dt><dd>{dog.shelterName || "未提供"}</dd></div>
          </dl>
        </article>)}
      </div>}
    </div>
    <p>提供機關：農業部。資料期間：認領養資料 {adoptions.source.updatedAt || "官方未提供"}；收容統計 {stats.source.updatedAt}；容量與入出所細項 {needs.source.updatedAt}。</p>
    <p>這些數字呈現政府資料中的部分現況，不代表一隻犬的價值，也不能單獨判斷一個縣市或收容所做得好不好。</p>
    <p><strong>這些資料如何影響推薦：</strong>數字只形成「需要進一步詢問什麼」的提示，不會替縣市排名，也不會把統計直接推論成志工名額。</p>
    <div><a href={adoptions.source.datasetUrl} target="_blank" rel="noreferrer">農業部動物認領養 ↗</a><a href={stats.source.datasetUrl} target="_blank" rel="noreferrer">農業部收容處理統計 ↗</a><a href={needs.source.datasetUrl} target="_blank" rel="noreferrer">農業部收容處理統計表二 ↗</a></div>
  </section>;
}
