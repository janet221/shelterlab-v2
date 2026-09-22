"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ACTION_DATA_EVENT, opportunityRepository } from "@/lib/action-opportunities/browser-repository";
import { OPPORTUNITY_SOURCE_LABELS, OPPORTUNITY_STATUS_LABELS, type ActionOpportunity, type OpportunityStatus } from "@/lib/action-opportunities/types";
import styles from "../../action-opportunity-console.module.css";

export default function OpportunityAdminPage(){
 const [items,setItems]=useState<ActionOpportunity[]>([]),[filter,setFilter]=useState<OpportunityStatus|"all">("pending_review"),[message,setMessage]=useState("");
 const reload=()=>setItems(opportunityRepository.list());
 useEffect(()=>{reload();window.addEventListener(ACTION_DATA_EVENT,reload);return()=>window.removeEventListener(ACTION_DATA_EVENT,reload)},[]);
 const visible=useMemo(()=>items.filter(item=>filter==="all"||item.status===filter),[items,filter]);
 const duplicateKeys=useMemo(()=>{const counts=new Map<string,number>();items.forEach(item=>{const key=`${item.organizationName}|${item.title}|${item.eventStartAt?.slice(0,10)||""}`.toLowerCase();counts.set(key,(counts.get(key)||0)+1)});return counts},[items]);
 const decide=(item:ActionOpportunity,status:OpportunityStatus,label:string)=>{opportunityRepository.setStatus(item.id,status);setMessage(`「${item.title}」已${label}。`);reload()};
 return <main className={styles.page}><header className={styles.header}><p>平台管理員</p><h1>行動機會審核</h1><p>審核來源、活動資訊、年齡與安全條件。民間來源必須能連回公開招募證據；通過後才會出現在學生端。</p><Link href="/student/opportunities">查看學生端</Link></header><p className={styles.notice}>PROTOTYPE：這裡只有本機狀態切換，沒有真正的帳號、角色權限、稽核軌跡或後端排程。不得視為正式審核系統。</p>
 <section className={styles.panel}><div className={styles.actions}><label>審核狀態<select value={filter} onChange={event=>setFilter(event.target.value as OpportunityStatus|"all")}><option value="all">全部</option>{Object.entries(OPPORTUNITY_STATUS_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>{message&&<p className={styles.success}>{message}</p>}</section>
 <section className={styles.panel}><h2>{filter==="pending_review"?"等待審核":"機會清單"}</h2><div className={styles.cards}>{visible.map(item=>{const key=`${item.organizationName}|${item.title}|${item.eventStartAt?.slice(0,10)||""}`.toLowerCase(),duplicate=(duplicateKeys.get(key)||0)>1;return <article className={styles.card} key={item.id}>
   <span className={styles.badge}>{OPPORTUNITY_STATUS_LABELS[item.status]}</span><span className={styles.badge}>{OPPORTUNITY_SOURCE_LABELS[item.sourceType]}</span>{duplicate&&<span className={styles.badge}>疑似重複</span>}
   <h3>{item.title}</h3><p><strong>{item.organizationName}</strong> · {item.city}</p><p>{item.description}</p><p className={styles.meta}>發現日期 {item.firstSeenAt.slice(0,10)} · 招募截止 {item.applicationDeadline?.slice(0,10)||"無固定截止"} · 年齡 {item.minimumAge}+ · {item.acceptsMinors?"可接受未成年人":"未標示接受未成年人"} · {item.teacherRequired?"需教師帶隊":"未要求教師帶隊"}</p>
   <p><strong>單位網站：</strong><a href={item.organizationUrl} target="_blank" rel="noreferrer">開啟網站 ↗</a></p><p><strong>原始招募頁：</strong><a href={item.sourceUrl} target="_blank" rel="noreferrer">開啟公開來源 ↗</a></p><p><strong>可驗證來源／立案資訊：</strong>{item.sourceName}；目前 prototype 僅記錄公開來源，正式審核仍須查核單位身分。</p><p><strong>最後檢查：</strong>{item.lastVerifiedAt.slice(0,10)}</p><p><strong>查核註記：</strong>{item.verificationNote}</p><p><strong>安全條件：</strong>{item.safetyNotes.join("、")}</p>
   <div className={styles.actions}><button className={styles.primary} onClick={()=>decide(item,"published","核准公開")}>核准公開</button><button onClick={()=>decide(item,"draft","退回補正")}>要求補正</button><button onClick={()=>decide(item,"closed","拒絕刊登")}>拒絕刊登</button><button onClick={()=>decide(item,"suspended","暫停顯示")}>暫停顯示</button></div>
  </article>})}</div>{visible.length===0&&<p>目前沒有符合此狀態的機會。</p>}</section>
 </main>;
}
