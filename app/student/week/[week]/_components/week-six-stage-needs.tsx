import { ACTION_TAG_LABELS, ORGANIZATION_TYPE_LABELS, UNKNOWN_OFFICIAL_TEXT, type OrganizationMatch } from "@/lib/action-opportunities/types";
import { requiredComparisonCount } from "@/lib/action-opportunities/repository";
import type { AdoptionSnapshot, ShelterNeedsSnapshot, ShelterStatsSnapshot } from "@/lib/government-open-data";
import WeekSixDataSnapshot from "./week-six-data-snapshot";
import styles from "./week-six-experience.module.css";

export default function Needs({matches,ids,selectedId,county,adoptions,stats,needs,onToggle,onSelect}:{matches:OrganizationMatch[];ids:string[];selectedId:string;county:string;adoptions:AdoptionSnapshot|null;stats:ShelterStatsSnapshot|null;needs:ShelterNeedsSnapshot|null;onToggle:(id:string)=>void;onSelect:(id:string)=>void}) {
  const pool=matches.slice(0,8);
  const chosen=pool.filter(match=>ids.includes(match.organization.id));
  const required=requiredComparisonCount(pool.length);
  const canCompare=pool.length>=2;
  return <section className={styles.stageCard}><h2>{canCompare?"比較不同單位的真實需求":"讀懂這個單位的需求與限制"}</h2>
    <p>{canCompare?"查看 2～3 個單位公開的服務、可行動項目與未成年規定，再選一個想進一步了解的單位。資料未說明的項目，請列為聯絡時要詢問的問題。":"目前有 1 個符合條件的官方資源。請閱讀它公開的服務、可行動項目與未成年規定，找出聯絡前仍需確認的事項。"}</p>
    <WeekSixDataSnapshot county={county} adoptions={adoptions} stats={stats} needs={needs} className={styles.snapshot}/>
    <aside className={styles.evidenceNote}><strong>年齡規定要連同參與方式一起確認</strong><p>正式志工、學生服務學習、參訪與校園合作可能有不同規定。官方曾公告招募，也不代表目前正在招募或每位學生都符合資格。</p><ul><li>先分清楚：你要參加哪一種行動。</li><li>再確認：最低年齡、同意與陪同、訓練、保險、預約及服務時數。</li></ul><div className={styles.sources}><a href="https://www.tcapo.gov.taipei/cp.aspx?n=64E92A82C8BB7529" target="_blank" rel="noreferrer">臺北市：學生服務學習 ↗</a><a href="https://www.agriculture.ntpc.gov.tw/information.php?p_id=58" target="_blank" rel="noreferrer">新北市：動物之家志工 ↗</a><a href="https://www.animal.taichung.gov.tw/1521448/1521512/1521541/1533995" target="_blank" rel="noreferrer">臺中市：動保志工服務 ↗</a></div></aside>
    <div className={styles.choiceGrid}>{pool.map(({organization})=><label key={organization.id} className={ids.includes(organization.id)?styles.chosen:""}><input type="checkbox" checked={ids.includes(organization.id)} disabled={!ids.includes(organization.id)&&ids.length>=3} onChange={()=>onToggle(organization.id)}/><strong>{organization.name}</strong><small>{organization.county} · {ORGANIZATION_TYPE_LABELS[organization.organizationType]}</small></label>)}</div>
    <p className={styles.counter}>已選 {chosen.length}/{required}{canCompare?"～3":""} 個</p>
    {chosen.length>0&&<div className={styles.compareGrid}>{chosen.map(({organization})=><article key={organization.id}><h3>{organization.name}</h3><dl><div><dt>官方已公開</dt><dd>{organization.officialServices?.join("、")||UNKNOWN_OFFICIAL_TEXT}</dd></div><div><dt>可行動項目</dt><dd>{organization.actionTags.map(tag=>ACTION_TAG_LABELS[tag]).join("、")}</dd></div><div><dt>年齡與陪同</dt><dd>{organization.ageLimitNote}</dd></div><div><dt>可先詢問</dt><dd>{organization.actionTypes.join("、")}</dd></div></dl><button type="button" className={selectedId===organization.id?styles.selectedButton:""} onClick={()=>onSelect(organization.id)}>{selectedId===organization.id?"已設為聯絡對象":"設為聯絡對象"}</button></article>)}</div>}
  </section>;
}
