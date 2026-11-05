import { ACTION_TAG_LABELS, ORGANIZATION_TYPE_LABELS, type OrganizationMatch } from "@/lib/week-six-action";
import type { AdoptionSnapshot, ShelterNeedsSnapshot, ShelterStatsSnapshot } from "@/lib/government-open-data";
import styles from "./week-six-experience.module.css";

export default function Needs({matches,ids,selectedId,county,adoptions,stats,needs,onToggle,onSelect}:{matches:OrganizationMatch[];ids:string[];selectedId:string;county:string;adoptions:AdoptionSnapshot|null;stats:ShelterStatsSnapshot|null;needs:ShelterNeedsSnapshot|null;onToggle:(id:string)=>void;onSelect:(id:string)=>void}) {
  void ids;void county;void adoptions;void stats;void needs;void onToggle;void onSelect;
  const organization=matches.find(match=>match.organization.id===selectedId)?.organization??matches[0]?.organization;
  if(!organization)return <section className={styles.stageCard}><h2>確認選擇</h2><p>找不到上一環節選擇的資源，請返回環節一重新選擇。</p></section>;
  const isFormal=organization.sourceLayer==="platform_partner"&&!organization.isDemo;
  return <section className={styles.stageCard}><h2>{isFormal?"核對正式活動公告內容":"核對模擬學習資源"}</h2>
    <div className={styles.simulationDisclosure}><strong>{isFormal?"收容機構官方刊登資訊":"本環節內容為教學模擬練習"}</strong><p>{isFormal?"請核對活動細節與參與資格；本平台僅提供資訊公告，實際報名請逕洽主辦單位。":"機構資訊取自政府公開資料，本項目為教學模擬示範，非實際招募公告。"}</p></div>
    <article className={styles.focusResource}><span>{ORGANIZATION_TYPE_LABELS[organization.organizationType]}</span><h3>{organization.name}</h3><p>{organization.county} · {organization.address}</p><dl><div><dt>可探究方向</dt><dd>{organization.actionTags.map(tag=>ACTION_TAG_LABELS[tag]).join("、")}</dd></div><div><dt>參與規範提示</dt><dd>{organization.ageLimitNote}</dd></div></dl></article>
  </section>;
}
