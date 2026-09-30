import { ACTION_TAG_LABELS, ORGANIZATION_TYPE_LABELS, type OrganizationMatch } from "@/lib/week-six-action";
import type { AdoptionSnapshot, ShelterNeedsSnapshot, ShelterStatsSnapshot } from "@/lib/government-open-data";
import styles from "./week-six-experience.module.css";

export default function Needs({matches,ids,selectedId,county,adoptions,stats,needs,onToggle,onSelect}:{matches:OrganizationMatch[];ids:string[];selectedId:string;county:string;adoptions:AdoptionSnapshot|null;stats:ShelterStatsSnapshot|null;needs:ShelterNeedsSnapshot|null;onToggle:(id:string)=>void;onSelect:(id:string)=>void}) {
  void ids;void county;void adoptions;void stats;void needs;void onToggle;void onSelect;
  const organization=matches.find(match=>match.organization.id===selectedId)?.organization??matches[0]?.organization;
  if(!organization)return <section className={styles.stageCard}><h2>確認選擇</h2><p>找不到上一環節選擇的資源，請返回環節一重新選擇。</p></section>;
  const isFormal=organization.sourceLayer==="platform_partner"&&!organization.isDemo;
  return <section className={styles.stageCard}><h2>{isFormal?"確認這則正式活動公告":"確認這個模擬資源"}</h2>
    <div className={styles.simulationDisclosure}><strong>{isFormal?"收容所正式刊登資訊":"本環節內容皆為模擬練習"}</strong><p>{isFormal?"請核對活動內容與參與條件；ShelterLab 僅提供公告，實際洽詢與報名請依主辦單位提供的方式辦理。":"單位名稱與基本資訊來自公開資料，但這不是實際招募公告，也不代表單位已同意學生參與。"}</p></div>
    <article className={styles.focusResource}><span>{ORGANIZATION_TYPE_LABELS[organization.organizationType]}</span><h3>{organization.name}</h3><p>{organization.county} · {organization.address}</p><dl><div><dt>可了解的方向</dt><dd>{organization.actionTags.map(tag=>ACTION_TAG_LABELS[tag]).join("、")}</dd></div><div><dt>參與前要確認</dt><dd>{organization.ageLimitNote}</dd></div></dl></article>
  </section>;
}
