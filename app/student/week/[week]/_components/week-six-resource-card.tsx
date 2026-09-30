import { ACTION_TAG_LABELS, ORGANIZATION_TYPE_LABELS, UNKNOWN_OFFICIAL_TEXT, type OrganizationMatch } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

export default function WeekSixResourceCard({ match, selected, onSelect }:{ match:OrganizationMatch; selected:boolean; onSelect:()=>void }) {
  const organization=match.organization;
  return <article data-selected={selected}>
    <div><span className={styles.simulationBadge}>模擬資料</span><span>{ORGANIZATION_TYPE_LABELS[organization.organizationType]}</span>{organization.actionTags.slice(0,2).map(tag=><span key={tag}>{ACTION_TAG_LABELS[tag]}</span>)}{!match.eligible&&<b>資格需先確認</b>}</div>
    <h3>{organization.name}</h3>
    <p className={styles.resourceAddress}>📍 {organization.county} · {organization.address}</p>
    <div className={styles.resourceDetails}><dl><div><dt>電話</dt><dd>{organization.phone}</dd></div><div><dt>開放時間</dt><dd>{organization.openingHours||UNKNOWN_OFFICIAL_TEXT}</dd></div></dl><strong>可以怎麼幫</strong><ul>{organization.actionTypes.slice(0,3).map(action=><li key={action}>{action}</li>)}</ul><strong>參與前注意</strong><p>{organization.ageLimitNote}</p></div>
    <div className={styles.resourceActions}><button type="button" className={styles.selectResourceButton} onClick={onSelect}>{selected?"✓ 已選擇這個資源":"選擇這個資源"}</button><span className={styles.iconActions}><a href={organization.sourceUrl} target="_blank" rel="noreferrer" aria-label="查看資料" title="查看資料">↗</a></span></div>
  </article>;
}
