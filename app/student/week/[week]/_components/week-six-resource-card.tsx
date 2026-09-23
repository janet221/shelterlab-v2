import { ACTION_TAG_LABELS, DATA_SOURCE_LAYER_LABELS, ORGANIZATION_TYPE_LABELS, UNKNOWN_OFFICIAL_TEXT, type OrganizationMatch } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

export default function WeekSixResourceCard({ match, selected, onSelect }:{ match:OrganizationMatch; selected:boolean; onSelect:()=>void }) {
  const organization=match.organization;
  const tel=organization.phone.replace(/[^\d+]/g,"");
  const navigation=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${organization.latitude},${organization.longitude}`)}`;
  const firstStep=organization.actionTypes[0]||"先使用官方窗口詢問目前需求";
  return <article data-selected={selected}>
    <div><span>{ORGANIZATION_TYPE_LABELS[organization.organizationType]}</span><span>{DATA_SOURCE_LAYER_LABELS[organization.sourceLayer]}</span><span>{organization.managementMode==="partner_managed"?"已進駐平台":organization.managementMode==="external_redirect"?"使用官方管道":"平台整理公開資料"}</span>{!match.eligible&&<b>資格需先確認</b>}</div>
    <h3>{organization.name}</h3>
    <dl><div><dt>縣市</dt><dd>{organization.county}</dd></div><div><dt>地址</dt><dd>{organization.address}</dd></div><div><dt>電話</dt><dd>{organization.phone}</dd></div><div><dt>資料來源</dt><dd>{organization.officialSource}</dd></div><div><dt>驗證狀態</dt><dd>{organization.verificationLevel==="government_official"?"政府官方資料":organization.verificationLevel==="official_partnership"?"平台正式合作":organization.verificationLevel==="verified_nonprofit"?"已查核立案／正式來源":organization.verificationLevel==="pending_verification"?"待查核；申請前請向單位確認":"僅整理公開資訊"} · {organization.verifiedAt}</dd></div><div><dt>開放時間</dt><dd>{organization.openingHours||UNKNOWN_OFFICIAL_TEXT}</dd></div><div><dt>適合第一步</dt><dd>{firstStep}</dd></div></dl>
    <div className={styles.actionTags}>{organization.actionTags.map(tag=><span key={tag}>{ACTION_TAG_LABELS[tag]}</span>)}{organization.requiresAdult&&<span>需教師或家長協助確認</span>}</div>
    <details className={styles.cardDetails}><summary>查看我可以怎麼幫</summary><ul>{organization.actionTypes.map(action=><li key={action}>{action}</li>)}</ul></details>
    <details className={styles.cardDetails}><summary>查看注意事項</summary><p>{organization.ageLimitNote}</p><ul>{organization.studentNotes.map(note=><li key={note}>{note}</li>)}</ul></details>
    <details className={styles.cardDetails}><summary>這筆資料如何影響推薦結果</summary><p>縣市、單位類型與公開的行動標籤會用來篩選；年齡資訊只用來提醒需確認資格，不代表單位已同意學生參與。</p></details>
    <div><a href={organization.sourceUrl} target="_blank" rel="noreferrer">查看官方資料</a><a href={`tel:${tel}`}>撥打電話</a><a href={navigation} target="_blank" rel="noreferrer">開啟導航</a><button type="button" onClick={onSelect}>{selected?"已加入我的行動計畫":"加入我的行動計畫"}</button></div>
  </article>;
}
