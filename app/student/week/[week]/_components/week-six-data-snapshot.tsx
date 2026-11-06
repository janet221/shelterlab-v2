/* eslint-disable @next/next/no-img-element -- government image hosts vary by record */
import { useEffect, useRef, useState } from "react";
import type { AdoptionSnapshot, ShelterNeedsSnapshot, ShelterStatsSnapshot } from "@/lib/government-open-data";

export default function WeekSixDataSnapshot({ county, adoptions, stats, needs, className = "" }: { county: string; adoptions: AdoptionSnapshot | null; stats: ShelterStatsSnapshot | null; needs: ShelterNeedsSnapshot | null; className?: string }) {
  const [detectiveAnswer, setDetectiveAnswer] = useState<"yes" | "not-enough" | null>(null);
  const [showAdoptionMethod, setShowAdoptionMethod] = useState(false);
  const infoButton = useRef<HTMLButtonElement>(null);
  const closeMethod = () => { setShowAdoptionMethod(false); infoButton.current?.focus(); };
  useEffect(() => {
    if (!showAdoptionMethod) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setShowAdoptionMethod(false); infoButton.current?.focus(); } };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showAdoptionMethod]);
  if (!county) return <section className={className}><h2>在地動保資料快照</h2><p>選定行政區後，本區將呈現政府開放資料之即時現況。</p></section>;
  if (!adoptions || !stats || !needs) return <section className={className}><h2>在地動保資料快照</h2><p>正在載入農業部開放資料平台數據…</p></section>;
  const row = stats.latestByCounty.find((item) => item.county === county);
  const need = needs.latestByCounty.find((item) => item.county === county);
  const dogs = adoptions.sampleDogs.filter((dog) => dog.county === county);
  const value = (input: number | null | undefined, suffix = "") => input === null || input === undefined ? "未提供數據" : `${input.toLocaleString("zh-TW")}${suffix}`;
  const processing = stats.processing;
  return <section className={className} aria-live="polite">
    <div><span>政府 Open Data</span><h2>{county}在地動物保護開放資料概況</h2></div>
    {(adoptions.source.mode === "fallback" || stats.source.mode === "fallback" || needs.source.mode === "fallback") && <p role="status">目前啟用備援數據庫；各卡片仍載明資料統計週期。</p>}
    <div className="snapshot-grid">
      <article><small>月底在養數</small><strong>{value(need?.currentTotal)}</strong><p>{need ? `民國 ${need.year} 年 ${need.month} 月；含收容所與委託代養` : "本行政區目前無可用數據週期"}</p></article>
      <article><small>可留容動物最大值</small><strong>{value(need?.maxCapacity)}</strong><p>犬貓官方統計容留上限合計；不作服務品質評比。</p></article>
      <article><small>當月合計入所數</small><strong>{value(need?.totalIntake)}</strong><p>{need ? `拾獲送交 ${value(need.foundDelivered)}、不擬續養 ${value(need.ownerSurrender)}、依法沒入 ${value(need.legalSeizure)}` : "未提供入所來源數據"}</p></article>
      <article><small>最近一期認領養數</small><strong>{value(row?.adoptedCount)}</strong><p>{row ? `民國 ${row.year} 年 ${row.month} 月；同期收容 ${value(row.acceptedCount)}` : "本行政區目前無可用數據週期"}</p></article>
      <article><small>{adoptions.source.mode === "live" ? "目前開放認養犬隻" : "快照時開放認養犬隻"}</small><strong>{value(adoptions.countyCounts[county])}</strong><p>{adoptions.source.mode === "live" ? "每日異動資料中標示為待認養者，非指收容總數。" : "這是有日期的既有快照，不代表目前名單或收容總數。"}</p></article>
    </div>
    <div className="snapshot-dogs">
      <div className="snapshot-dogs-heading"><h3>部分待認養犬隻</h3><button ref={infoButton} type="button" className="snapshot-info-button" aria-label="查看動物認領養資料處理方式" onClick={() => setShowAdoptionMethod(true)}>i</button></div>
      {dogs.length === 0 ? <p>本行政區目前尚無可顯示之犬隻影像；請以官方平台最新內容為準。</p> : <div>
        {dogs.map((dog) => <article key={dog.subId}>
          {dog.imageUrl ? <img src={dog.imageUrl} alt={`${dog.shelterName}待認養犬隻 ${dog.subId}`} loading="lazy" referrerPolicy="no-referrer" /> : <div aria-label="官方資料未提供照片">無影像資料</div>}
          <dl>
            <div><dt>編號</dt><dd>{dog.subId}</dd></div>
            <div><dt>性別／體型</dt><dd>{dog.sex || "未提供數據"}／{dog.bodyType || "未提供數據"}</dd></div>
            <div><dt>年齡／毛色</dt><dd>{dog.age || "未提供數據"}／{dog.colour || "未提供數據"}</dd></div>
            <div><dt>收容機構</dt><dd>{dog.shelterName || "未提供數據"}</dd></div>
          </dl>
        </article>)}
      </div>}
    </div>
    {showAdoptionMethod && <div className="snapshot-info-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeMethod(); }}><section className="snapshot-info-dialog" role="dialog" aria-modal="true" aria-labelledby="adoption-method-title"><button type="button" className="snapshot-info-close" aria-label="關閉資料處理說明" autoFocus onClick={closeMethod}>×</button><span>資料偵探｜認領養個案</span><h2 id="adoption-method-title">從原始欄位到畫面上的個案</h2><p>本區使用農業部「動物認領養」資料。下列步驟描述即時回應的處理方式；若使用內建快照，畫面使用先前整理的結果，不假稱重新取得原始列。</p>{adoptions.processing ? <p><strong>本次可追溯的處理紀錄：</strong>原始 {value(adoptions.processing.rawRecordCount)} 列；符合犬隻且狀態為 OPEN 的 {value(adoptions.processing.eligibleRecordCount)} 列，排除 {value(adoptions.processing.excludedRecordCount)} 列。保留的資料中，{value(adoptions.processing.unclassifiedCountyCount)} 列無法辨識縣市、{value(adoptions.processing.missingSubIdCount)} 列缺少公開編號。{adoptions.source.mode === "fallback" ? "這是上次成功快取時的處理紀錄。" : "筆數由本次 API 回應計算。"}</p> : <p>目前快照未保存完整的原始列數及缺漏紀錄，因此不推估清理筆數。</p>}<ol><li><strong>保留對象：</strong>只納入 <code>animal_kind</code> 為「狗」且 <code>animal_status</code> 為 <code>OPEN</code> 的列；其他種類與非開放狀態不進入這個學生視圖。</li><li><strong>整理縣市：</strong>先用收容所名稱對照農業部公立動物收容所資料（資料集 134284）；找不到時，從 <code>shelter_address</code> 擷取縣市，仍無法辨認則列為「未分類」。</li><li><strong>計算摘要：</strong>縣市紀錄數＝Σ（這列是狗且狀態為 OPEN，並歸入所選縣市時記 1，否則記 0）；收容所紀錄數＝Σ（符合條件且歸入該收容所時記 1）。每列各計一次，不去重；這不是收容量或認養率。</li><li><strong>選取個案：</strong>每縣市依來源回應順序最多取 3 筆，且必須有 <code>animal_subid</code> 才顯示個案卡。這是展示樣本，不是隨機抽樣。</li><li><strong>欄位呈現：</strong>卡片使用編號、性別、體型、年齡、毛色、收容所與照片欄位。文字清除 HTML 標籤、合併多餘空白；缺值顯示「未提供數據」。照片連結來自 <code>album_file</code>。政府原始資料不會被修改；整理後的個案輸出只保留部分欄位，卡片亦未顯示全部輸出欄位。例如電話未納入個案輸出，更新日和開放日期雖被保留，但沒有顯示在卡片。</li></ol><p><strong>目前程式沒有做的事：</strong>沒有剔除重複識別碼、沒有以資料更新日排序或補算統計，也沒有將「資料建立日」當作真實入所日。畫面中的每日開放名單不能推論認養難易、原因或個別動物需求。</p><div className="snapshot-info-fields"><h3>原始欄位 → 畫面欄位</h3><p><code>animal_subid</code> → 編號　·　<code>animal_sex</code> → 性別　·　<code>animal_bodytype</code> → 體型　·　<code>animal_age</code> → 年齡　·　<code>animal_colour</code> → 毛色　·　<code>shelter_name</code> → 收容機構　·　<code>album_file</code> → 照片</p></div><a href={adoptions.source.datasetUrl} target="_blank" rel="noreferrer">查看農業部原始資料集 ↗</a><small>目前來源狀態：{adoptions.source.mode === "live" ? "即時回應" : `備援快照（${adoptions.source.fallbackDate || adoptions.source.updatedAt}）`} · 資料標示日期：{adoptions.source.updatedAt || "官方未提供"}</small></section></div>}
    <p>資料來源：農業部。資料週期：認領養資料 {adoptions.source.updatedAt || "官方未提供"}；收容統計 {stats.source.updatedAt}；容量與入出所細項 {needs.source.updatedAt}。</p>
    <details className="snapshot-details">
      <summary>資料從哪裡來？查看來源與處理方式</summary>
      <div className="snapshot-details-grid">
        <article><h3>動物認領養</h3><p>依縣市彙整開放中的犬隻紀錄，並展示每縣市最多三筆個案作為樣本；目前名單不是收容總數，也不是認養率。</p><a href={adoptions.source.datasetUrl} target="_blank" rel="noreferrer">查看來源 ↗</a><small>資料日期：{adoptions.source.updatedAt || "官方未提供"} · 狀態：{adoptions.source.mode === "live" ? "即時" : "備援快照"}</small></article>
        <article><h3>收容處理情形統計表</h3><p>使用縣市、民國年、月份及入所、認領養等彙總欄位；縣市名稱正規化後，每個縣市保留最新一期。</p><a href={stats.source.datasetUrl} target="_blank" rel="noreferrer">查看來源 ↗</a><small>資料期間：{stats.source.updatedAt} · 狀態：{stats.source.mode === "live" ? "即時" : "備援快照"}</small></article>
        <article><h3>收容處理情形統計表（細項）</h3><p>呈現容量、月底在養與入所來源等欄位。容量與在養的統計範圍可能不同，因此本頁不把兩者直接換算成收容率。</p><a href={needs.source.datasetUrl} target="_blank" rel="noreferrer">查看來源 ↗</a><small>資料期間：{needs.source.updatedAt} · 狀態：{needs.source.mode === "live" ? "即時" : "備援快照"}</small></article>
      </div>
    </details>
    <details className="snapshot-details">
      <summary>收容統計資料怎麼整理？查看實際處理紀錄</summary>
      {processing ? <div className="snapshot-processing">
        <p>本次取得 {value(processing.rawRecordCount)} 筆原始列；其中 {value(processing.eligibleCountyMonthCount)} 筆具可辨識縣市及有效月份，{value(processing.excludedInvalidCountyOrPeriodCount)} 筆因縣市或年月無效而未納入。整理後保留 {value(processing.retainedLatestCountyCount)} 個縣市的最新月份摘要。</p>
        <ol><li>讀取縣市、民國年與月份欄位。</li><li>統一縣市名稱，排除非臺灣縣市或無效年月。</li><li>依「民國年 × 100 + 月份」排序，每縣市保留最新一筆。</li></ol>
        <small>目前畫面採用的流程；原始列數與納入數由本次 API 回應計算。</small>
      </div> : <p>目前使用備援／快取資料；該快照沒有附原始列數，因此不顯示推估的清理筆數。現有摘要仍按縣市呈現最新可用月份。</p>}
    </details>
    <aside className="snapshot-comparability"><strong>比較前先確認資料口徑</strong><p>收容統計與容量細項是縣市／月份彙總；認領養清單是每日變動的個案名單。即使縣市相同，也不代表期間、統計單位或涵蓋對象相同，因此本頁並未把待認養筆數與月認養數相除，也不據此推論原因。</p></aside>
    <div className="snapshot-detective">
      <div><small>資料偵探</small><h3>收容數增加，是否代表當地街頭遊蕩動物一定增加？</h3><p>請依目前看到的縣市／月份彙總資料判斷。</p></div>
      <div className="snapshot-detective-actions"><button type="button" aria-pressed={detectiveAnswer === "yes"} onClick={() => setDetectiveAnswer("yes")}>是，收容數增加就代表增加</button><button type="button" aria-pressed={detectiveAnswer === "not-enough"} onClick={() => setDetectiveAnswer("not-enough")}>資料不足，還需要其他證據</button></div>
      {detectiveAnswer && <p role="status"><strong>{detectiveAnswer === "not-enough" ? "判斷合理。" : "這個結論超出資料能支持的範圍。"}</strong> 收容統計記錄的是進入收容體系的數量，可能受通報、捕捉、政策或收容作業影響；單靠這項資料無法估計街頭族群變化。還需要一致期間的遊蕩動物調查等證據。</p>}
    </div>
    <p>上述數據係呈現政府開放資料之現況紀錄，非用以衡量個別生命價值，亦不得作為評估縣市或收容機構優劣之唯一標準。</p>
    <p><strong>數據之應用定位：</strong>相關數據僅作為探究與引導提問之參考，不進行縣市排名，亦不直接等同於志工招募名額。</p>
    <div><a href={adoptions.source.datasetUrl} target="_blank" rel="noreferrer">農業部動物認領養 ↗</a><a href={stats.source.datasetUrl} target="_blank" rel="noreferrer">農業部收容處理統計 ↗</a><a href={needs.source.datasetUrl} target="_blank" rel="noreferrer">農業部收容處理統計表（細項） ↗</a></div>
  </section>;
}
