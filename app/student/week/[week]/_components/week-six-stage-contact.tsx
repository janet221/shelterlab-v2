import type { ActionOrganization, ContactMethod } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

const labels:Record<ContactMethod,string>={phone:"電話諮詢稿",email:"電子郵件草稿",visit_proposal:"參訪申請計畫書",school_proposal:"校園合作提案書"};

export default function Contact({organization,method,drafts,onMethod,onDraft,onCopied}:{organization:ActionOrganization;method:ContactMethod;drafts:Record<ContactMethod,string>;onMethod:(method:ContactMethod)=>void;onDraft:(value:string)=>void;onCopied:(message:string)=>void}) {
  const copy=async()=>{try{await navigator.clipboard.writeText(drafts[method]);onCopied("內容已複製至剪貼簿，可前往電子郵件系統發送。");}catch{onCopied("無法自動複製，請手動選取文字。");}};
  const methods:ContactMethod[]=["phone","email"];
  if(!methods.includes(method)) methods.unshift(method);
  return <section className={styles.stageCard}><h2>撰擬聯繫文稿</h2><p>選擇合適方式向 <strong>{organization.name}</strong> 進行諮詢。文稿可隨時編輯，系統不會自動發送。</p>
    <div className={styles.methodTabs}>{methods.map(value=><button type="button" key={value} className={method===value?styles.activeTab:""} onClick={()=>onMethod(value)}>{labels[value]}</button>)}</div>
    <textarea aria-label={labels[method]} rows={9} value={drafts[method]} onChange={event=>onDraft(event.target.value)}/>
    <button type="button" className={styles.primary} onClick={copy}>複製當前文稿</button>
    <p className={styles.notice}>發送前請核對機構名稱、個人身分與諮詢事項之準確性。</p>
  </section>;
}
