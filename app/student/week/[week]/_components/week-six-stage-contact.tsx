import type { ActionOrganization, ContactMethod } from "@/lib/action-opportunities/types";
import styles from "./week-six-experience.module.css";

const labels:Record<ContactMethod,string>={phone:"電話詢問稿",email:"Email 草稿",visit_proposal:"參訪申請草稿",school_proposal:"校園合作提案草稿"};

export default function Contact({organization,method,drafts,onMethod,onDraft,onCopied}:{organization:ActionOrganization;method:ContactMethod;drafts:Record<ContactMethod,string>;onMethod:(method:ContactMethod)=>void;onDraft:(value:string)=>void;onCopied:(message:string)=>void}) {
  const copy=async()=>{try{await navigator.clipboard.writeText(drafts[method]);onCopied("訊息已複製，可前往 Email 寄信囉。");}catch{onCopied("無法自動複製，請手動選取文字。");}};
  return <section className={styles.stageCard}><h2>準備電話、Email、參訪或校園合作稿</h2><p>聯絡對象：<strong>{organization.name}</strong>。草稿可以修改；系統不會自動聯絡任何人。</p>
    <div className={styles.methodTabs}>{(Object.keys(labels) as ContactMethod[]).map(value=><button type="button" key={value} className={method===value?styles.activeTab:""} onClick={()=>onMethod(value)}>{labels[value]}</button>)}</div>
    <h3 className={styles.draftHeading}>產生聯絡草稿</h3>
    <textarea aria-label={labels[method]} rows={13} value={drafts[method]} onChange={event=>onDraft(event.target.value)}/>
    <button type="button" className={styles.primary} onClick={copy}>複製目前草稿</button>
    <p className={styles.notice}>送出前請確認：單位名稱、你的身分、想詢問的事項、年齡與成人協助、聯絡方式，以及不承諾未確認的工作。</p>
  </section>;
}
