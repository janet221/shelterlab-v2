"use client";

import { useRef } from "react";
import type { OpenDataCourseCase } from "@/lib/student-open-data-cases";
import styles from "./data-method-info.module.css";

const lessons = {
  1: { title: "毛色與推估在所天數", field: "animal_colour（毛色）", cleaning: "以資料登載的毛色文字分組，空白標為未註明；不把不同顏色自行合併。", formulas: ["黑色筆數＝毛色為黑色的有效紀錄數＝2,720 筆", "黑色中位數＝（第 1,360 筆 771 天＋第 1,361 筆 774 天）÷ 2＝772.5 天", "棕黑色 31 筆，排序後第 16 筆＝1,186 天"], note: "毛色分類是資料登載的文字；兩組筆數差距大，不能因此判定毛色造成留所差異。" },
  2: { title: "體型與照護需求", field: "animal_bodytype（體型）", cleaning: "將 MEDIUM、BIG／LARGE、SMALL 分別對應中型、大型、小型；依體型分組後計算筆數與中位數。", formulas: ["中型占比＝3,521 ÷ 5,702 × 100% ≈ 61.8%", "中型 3,521 筆，排序後第 1,761 筆＝906 天", "大型中位數＝（第 704 筆 367 天＋第 705 筆 368 天）÷ 2＝367.5 天"], note: "分母是分析明細中的三組體型筆數，不是認養成功數；占比不能解讀為體型別認養率。" },
  3: { title: "品種標籤與資料分類", field: "animal_Variety（品種標示）", cleaning: "先整理明確的同義名稱，再按標示分組；其他、空白或未明確的品種不納入品種比較。保留迷你、玩具等有意義的亞型。", formulas: ["混種犬筆數＝5,362 筆；中位數＝（第 2,681 筆 724 天＋第 2,682 筆 724 天）÷ 2＝724 天", "混種犬 180 天以上比例＝4,028 ÷ 5,362 × 100% ≈ 75.1%", "180 天以上包括剛好 180 天的紀錄。"], note: "品種標示不等於個體性格，也不能證明造成在所天數差異。" },
  4: { title: "性別欄位與資料界線", field: "animal_sex（性別）；個案另參考 animal_sterilization（絕育狀態）", cleaning: "將 M／F／N 對應公／母／未註明，依性別分組；未註明的 14 筆獨立保留。性別統計沒有依絕育狀態分組。", formulas: ["公犬筆數＝2,999 筆；排序後第 1,500 筆＝696 天", "母犬筆數＝2,689 筆；排序後第 1,345 筆＝603 天", "性別未註明＝14 筆；中位數＝194 天"], note: "個案另存的絕育欄位沒有保存在這份分析明細中；未絕育也不能直接推論懷孕或繁殖史。" },
  5: { title: "年齡分類與生命階段", field: "animal_age（年齡分類）", cleaning: "將 ADULT／CHILD 對應成年／幼年；未註明的 240 筆另列，不放入成年與幼年比較。", formulas: ["成年犬筆數＝4,577 筆；排序後第 2,289 筆＝663 天", "幼年犬筆數＝885 筆；排序後第 443 筆＝276 天", "未註明年齡＝240 筆；不納入兩組比較"], note: "成年是寬泛分類，不代表實際年齡；備註中的估齡也需連同記錄日期閱讀。" }
} as const;

function FormulaLine({ text }: { text: string }) {
  const separator = text.indexOf("＝");
  if (separator < 0) return <p className={styles.formulaNote}>{text}</p>;
  const label = text.slice(0, separator);
  const calculation = text.slice(separator + 1);
  const resultIndex = Math.max(calculation.lastIndexOf("＝"), calculation.lastIndexOf("≈"));
  const operation = resultIndex >= 0 ? calculation.slice(0, resultIndex) : "";
  const result = resultIndex >= 0 ? calculation.slice(resultIndex + 1) : calculation;
  const sign = resultIndex >= 0 ? calculation[resultIndex] : "＝";
  return <div className={styles.formulaRow}><span className={styles.formulaLabel}>{label}</span><div className={styles.equation}>{operation && <span className={styles.operation}>{operation}</span>}<span className={styles.result}><span aria-hidden="true">{sign} </span>{result}</span></div></div>;
}

export default function DataMethodInfo({ record }: { record: OpenDataCourseCase }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lesson = lessons[record.week];
  const fields = [
    ["animal_subid", record.subId, "公開編號"],
    ["animal_age", record.rawFields.age, record.displayFields.find(([name]) => name === "年齡標示")?.[1]],
    ["animal_sex", record.rawFields.sex, record.displayFields.find(([name]) => name === "性別")?.[1]],
    ["animal_bodytype", record.rawFields.bodyType, record.displayFields.find(([name]) => name === "體型")?.[1]],
    ["animal_colour", record.rawFields.colour, record.displayFields.find(([name]) => name === "毛色")?.[1]],
    ["animal_Variety", record.rawFields.variety, record.displayFields.find(([name]) => name === "品種標示")?.[1]],
    ["絕育（課程保存欄位）", record.rawFields.sterilization, record.displayFields.find(([name]) => name === "絕育狀態")?.[1]],
  ];
  return <div className={styles.anchor}>
    <button type="button" className={styles.info} aria-label={`查看第${record.week}週個案資料處理說明`} onClick={() => dialog.current?.showModal()}>i</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={`data-method-${record.week}`} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className={styles.content}>
        <button type="button" className={styles.close} aria-label="關閉資料處理說明" onClick={() => dialog.current?.close()}>×</button>
        <span className={styles.label}>資料偵探 · 第 {record.week} 週</span>
        <h2 id={`data-method-${record.week}`}>{lesson.title}</h2>
        <p className={styles.lead}>本個案出自農業部「動物認領養」公開資料，收錄於截至 {record.snapshotDate} 的分析明細。從欄位出發，觀察資料能回答哪些問題。</p>
        <h3>一、認識資料欄位</h3>
        <div className={styles.tableWrap}><table><thead><tr><th>欄位</th><th>保存的原始值</th><th>畫面顯示</th></tr></thead><tbody>{fields.map(([name, raw, display]) => <tr key={name}><td><code>{name}</code></td><td>{raw || "未提供"}</td><td>{display || "未列入個案卡"}</td></tr>)}</tbody></table></div>
        <p>資料中的代碼可以轉成容易閱讀的文字：例如 M／F 表示公／母，MEDIUM 表示中型，ADULT 表示成年。課程挑選與本週討論有關的欄位來呈現。絕育欄位取自課程另存的個案資料，並未保存在 9 月 5 日的分析明細中。</p>
        <h3>二、本週如何整理資料？</h3>
        <p><strong>主要分析欄位：</strong>{lesson.field}；另外使用 animal_kind、animal_createtime 與 animal_opendate 進行對象及日期判斷。個案識別使用 animal_id、animal_subid。</p>
        <p>{lesson.cleaning} 既有分析明細保留 5,702 筆；程式依日期及開放情況分流。完整原始下載快照尚未確認，不能由明細重建所有排除筆數。</p>
        <h3>三、計算方式與本週例子</h3>
        <div className={styles.formulas}><FormulaLine text="推估在所天數＝2026 年 9 月 5 日－animal_createtime（資料建立日期）" />{lesson.formulas.map(formula=><FormulaLine key={formula} text={formula}/>)}</div>
        <p>先將每組有效天數由小到大排序；奇數筆取中間值，偶數筆取中間兩個值的平均。上述例子可由保存的分析明細重算；建立日期是入所日期的代理值，不等於已確認的實際入所日。</p>
        <p>{lesson.note}</p>
        <div className={styles.boundary}><strong>思考與判讀</strong><p>{record.evidenceBoundary}</p></div>
        <a href="https://data.gov.tw/dataset/85903" target="_blank" rel="noreferrer">查看政府原始資料集 ↗</a>
      </div>
    </dialog>
  </div>;
}
