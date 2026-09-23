import type { ActionRecord, ActionStatus, ActionOrganization } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

export default function Commitment({organization,record,completed,onChange,onComplete,onEdit,onRestart}:{organization:ActionOrganization;record:ActionRecord;completed:boolean;onChange:(record:ActionRecord)=>void;onComplete:()=>void;onEdit:()=>void;onRestart:()=>void}) {
  const field=(key:keyof ActionRecord,value:string)=>onChange({...record,[key]:value});
  if(completed)return <section className={`${styles.stageCard} ${styles.completion}`}><p>WEEK 06 · 已完成</p><h2>我的行動摘要</h2><dl><div><dt>我想聯絡的單位</dt><dd>{organization.name}</dd></div><div><dt>我想做的行動</dt><dd>{record.actionType}</dd></div><div><dt>我需要誰協助</dt><dd>{record.adultSupportNote}</dd></div><div><dt>日期與狀態</dt><dd>{record.plannedDate} · {record.status}</dd></div><div><dt>我要確認的安全與資格</dt><dd>{record.conditionsToConfirm}</dd></div><div><dt>我的下一步</dt><dd>{record.nextStep}</dd></div><div><dt>替代方案</dt><dd>{record.alternativePlan}</dd></div><div><dt>行前預期成果</dt><dd>{record.reflection}</dd></div></dl><div className={styles.completionActions}><button type="button" className={styles.primary} onClick={onEdit}>編輯這份行動計畫</button><button type="button" className={styles.secondary} onClick={onRestart}>重新尋找動保資源</button></div></section>;
  return <section className={`${styles.stageCard} ${styles.formGrid}`}><h2>建立一份可以執行的行動計畫</h2><p>選一項符合目前條件的行動，寫清楚誰協助、何時開始、先確認什麼，以及條件不符時如何調整。</p>
    <label>預計行動<select aria-label="預計行動" value={record.actionType} onChange={event=>field("actionType",event.target.value)}><option value="">請選擇一項行動</option>{organization.actionTypes.map(action=><option key={action} value={action}>{action}</option>)}</select></label>
    <label>預計日期<input aria-label="預計日期" type="date" value={record.plannedDate} onChange={event=>field("plannedDate",event.target.value)}/></label>
    <label>目前狀態<select value={record.status} onChange={event=>field("status",event.target.value as ActionStatus)}><option value="not_started">尚未開始</option><option value="prepared">已準備</option><option value="contacted">已聯絡</option><option value="waiting">等待回覆</option><option value="scheduled">已排定</option><option value="completed">已完成行動</option></select></label>
    <label>成人協助安排<input aria-label="成人協助安排" value={record.adultSupportNote} onChange={event=>field("adultSupportNote",event.target.value)} placeholder="例如：由導師協助聯絡與確認"/></label>
    <label>需要確認的安全與資格條件<textarea rows={3} value={record.conditionsToConfirm} onChange={event=>field("conditionsToConfirm",event.target.value)}/></label>
    <label>下一步<textarea rows={3} value={record.nextStep} onChange={event=>field("nextStep",event.target.value)}/></label>
    <label>替代方案<textarea rows={3} value={record.alternativePlan} onChange={event=>field("alternativePlan",event.target.value)}/></label>
    <label>行前預期成果（至少 20 字）<textarea aria-label="行前預期成果" rows={4} value={record.reflection} onChange={event=>field("reflection",event.target.value)} placeholder="寫下你希望這次行動能帶來的成果，以及你想觀察或學習的事情。"/></label>
    <button type="button" className={styles.primary} onClick={onComplete}>完成第六週行動承諾</button>
  </section>;
}
