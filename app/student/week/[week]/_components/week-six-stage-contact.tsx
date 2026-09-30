import type { ActionOrganization, ContactMethod } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

const labels:Record<ContactMethod,string>={phone:"電話詢問稿",email:"Email 草稿",visit_proposal:"參訪申請草稿",school_proposal:"校園合作提案草稿"};

export default function Contact({organization,method,drafts,onMethod,onDraft,onCopied}:{organization:ActionOrganization;method:ContactMethod;drafts:Record<ContactMethod,string>;onMethod:(method:ContactMethod)=>void;onDraft:(value:string)=>void;onCopied:(message:string)=>void}) {
  const copy=async()=>{try{await navigator.clipboard.writeText(drafts[method]);onCopied("訊息已複製，可前往 Email 寄信囉。");}catch{onCopied("無法自動複製，請手動選取文字。");}};
  const methods:ContactMethod[]=["phone","email"];
  if(!methods.includes(method)) methods.unshift(method);
  return <section className={styles.stageCard}><h2>準備一份聯絡稿</h2><p>選擇一種方式聯絡 <strong>{organization.name}</strong>。草稿可以修改，系統不會自動送出。</p>
    <div className={styles.methodTabs}>{methods.map(value=><button type="button" key={value} className={method===value?styles.activeTab:""} onClick={()=>onMethod(value)}>{labels[value]}</button>)}</div>
    <textarea aria-label={labels[method]} rows={9} value={drafts[method]} onChange={event=>onDraft(event.target.value)}/>
    <button type="button" className={styles.primary} onClick={copy}>複製目前草稿</button>
    <p className={styles.notice}>送出前，請再次確認單位名稱、自己的身分與想詢問的事項。</p>
  </section>;
}
