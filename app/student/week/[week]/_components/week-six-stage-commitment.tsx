import { WEEK_SIX_MIN_RESPONSE_LENGTH, type ActionRecord, type ActionOrganization } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

export default function Commitment({organization,record,completed,onChange,onComplete,onEdit,onRestart}:{organization:ActionOrganization;record:ActionRecord;completed:boolean;onChange:(record:ActionRecord)=>void;onComplete:()=>void;onEdit:()=>void;onRestart:()=>void}) {
  const field=(key:keyof ActionRecord,value:string)=>onChange({...record,[key]:value});
  if(completed)return <section className={`${styles.stageCard} ${styles.completion}`}><p>WEEK 06 · 已完成研習｜我的參與準備摘要</p><h2>我的參與準備摘要</h2><dl><div><dt>擬了解之機構</dt><dd>{organization.name}</dd></div><div><dt>擬參與之途徑</dt><dd>{record.actionType}</dd></div><div><dt>預計聯繫日期</dt><dd>{record.plannedDate}</dd></div><div><dt>成人支援規劃</dt><dd>{record.adultSupportNote}</dd></div><div><dt>聯繫前待確認事項</dt><dd>{record.conditionsToConfirm}</dd></div><div><dt>後續行動規劃</dt><dd>{record.nextStep}</dd></div></dl><div className={styles.completionActions}><button type="button" className={styles.primary} onClick={onEdit}>修改參與準備</button><button type="button" className={styles.secondary} onClick={onRestart}>重新選擇資源</button></div></section>;
  return <section className={`${styles.stageCard} ${styles.formGrid} ${styles.stackedForm}`}><h2>評估與規劃參與途徑</h2><p>請依主辦單位公告資訊，梳理並填寫參與路徑、前置確認事項與後續規劃。</p>
    <label>擬參與之途徑<select aria-label="擬參與之途徑" value={record.actionType} onChange={event=>field("actionType",event.target.value)}><option value="">請選擇參與方式</option>{organization.actionTypes.map(action=><option key={action} value={action}>{action}</option>)}</select></label>
    <label>預計聯絡日期<input aria-label="預計聯絡日期" type="date" value={record.plannedDate} onChange={event=>field("plannedDate",event.target.value)}/></label>
    <label>成人支援規劃<input aria-label="成人支援規劃" value={record.adultSupportNote} onChange={event=>field("adultSupportNote",event.target.value)} placeholder="例如：由指導教師協助聯繫與確認"/></label>
    <label>聯繫前待確認事項（至少 {WEEK_SIX_MIN_RESPONSE_LENGTH} 字）<textarea required minLength={WEEK_SIX_MIN_RESPONSE_LENGTH} rows={4} value={record.conditionsToConfirm} onChange={event=>field("conditionsToConfirm",event.target.value)} placeholder="例如：年齡限制、活動時段與安全規範。"/><small>{record.conditionsToConfirm.trim().length}/{WEEK_SIX_MIN_RESPONSE_LENGTH} 字</small></label>
    <label>後續行動規劃（至少 {WEEK_SIX_MIN_RESPONSE_LENGTH} 字）<textarea required minLength={WEEK_SIX_MIN_RESPONSE_LENGTH} rows={4} value={record.nextStep} onChange={event=>field("nextStep",event.target.value)} placeholder="例如：取得機構回覆後，由教師評估是否符合學校服務學習規範。"/><small>{record.nextStep.trim().length}/{WEEK_SIX_MIN_RESPONSE_LENGTH} 字</small></label>
    <button type="button" className={styles.primary} onClick={onComplete}>完成參與準備</button>
  </section>;
}
