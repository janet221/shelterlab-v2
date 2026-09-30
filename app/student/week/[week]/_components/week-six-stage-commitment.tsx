import { WEEK_SIX_MIN_RESPONSE_LENGTH, type ActionRecord, type ActionOrganization } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

export default function Commitment({organization,record,completed,onChange,onComplete,onEdit,onRestart}:{organization:ActionOrganization;record:ActionRecord;completed:boolean;onChange:(record:ActionRecord)=>void;onComplete:()=>void;onEdit:()=>void;onRestart:()=>void}) {
  const field=(key:keyof ActionRecord,value:string)=>onChange({...record,[key]:value});
  if(completed)return <section className={`${styles.stageCard} ${styles.completion}`}><p>WEEK 06 · 已完成</p><h2>我的參與準備摘要</h2><dl><div><dt>想了解的單位</dt><dd>{organization.name}</dd></div><div><dt>想參與的方式</dt><dd>{record.actionType}</dd></div><div><dt>預計聯絡日期</dt><dd>{record.plannedDate}</dd></div><div><dt>成人協助</dt><dd>{record.adultSupportNote}</dd></div><div><dt>聯絡前要確認</dt><dd>{record.conditionsToConfirm}</dd></div><div><dt>我的下一步</dt><dd>{record.nextStep}</dd></div></dl><div className={styles.completionActions}><button type="button" className={styles.primary} onClick={onEdit}>編輯參與準備</button><button type="button" className={styles.secondary} onClick={onRestart}>重新選擇資源</button></div></section>;
  return <section className={`${styles.stageCard} ${styles.formGrid} ${styles.stackedForm}`}><h2>確認如何參與這項活動</h2><p>請參考主辦單位的現有活動資訊，梳理並填寫您的實際參與路徑、前置確認事項與後續步驟。</p>
    <label>想參與的方式<select aria-label="想參與的方式" value={record.actionType} onChange={event=>field("actionType",event.target.value)}><option value="">請選擇一種參與方式</option>{organization.actionTypes.map(action=><option key={action} value={action}>{action}</option>)}</select></label>
    <label>預計聯絡日期<input aria-label="預計聯絡日期" type="date" value={record.plannedDate} onChange={event=>field("plannedDate",event.target.value)}/></label>
    <label>成人協助安排<input aria-label="成人協助安排" value={record.adultSupportNote} onChange={event=>field("adultSupportNote",event.target.value)} placeholder="例如：由導師協助聯絡與確認"/></label>
    <label>參與前需要確認的事項（至少 {WEEK_SIX_MIN_RESPONSE_LENGTH} 字）<textarea required minLength={WEEK_SIX_MIN_RESPONSE_LENGTH} rows={4} value={record.conditionsToConfirm} onChange={event=>field("conditionsToConfirm",event.target.value)} placeholder="例如：年齡限制、活動時間與安全提醒。"/><small>{record.conditionsToConfirm.trim().length}/{WEEK_SIX_MIN_RESPONSE_LENGTH} 字</small></label>
    <label>聯絡後的下一步（至少 {WEEK_SIX_MIN_RESPONSE_LENGTH} 字）<textarea required minLength={WEEK_SIX_MIN_RESPONSE_LENGTH} rows={4} value={record.nextStep} onChange={event=>field("nextStep",event.target.value)} placeholder="例如：等待回覆後，再由教師協助確認是否適合參與。"/><small>{record.nextStep.trim().length}/{WEEK_SIX_MIN_RESPONSE_LENGTH} 字</small></label>
    <button type="button" className={styles.primary} onClick={onComplete}>完成參與準備</button>
  </section>;
}
