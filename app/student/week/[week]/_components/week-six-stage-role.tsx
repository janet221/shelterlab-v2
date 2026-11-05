"use client";

import { type ActionProfile, type PreferredRole } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

const roles:Array<[PreferredRole,string]>=[["information","資料整理者"],["school_project","宣導設計者"],["remote_support","認養曝光協助者"],["onsite_learning","參訪紀錄者"],["material_coordinator","物資募集者"],["contact_proposer","聯絡提案者"],["not_sure","先詢問再決定"]];

export default function Role({profile,onChange,onToggle}:{profile:ActionProfile;onChange:(profile:ActionProfile)=>void;onToggle:(key:"participationModes"|"skills",value:string)=>void}) {
  const ages=Array.from({length:11},(_,index)=>index+12);
  void onToggle;
  return <section className={`${styles.stageCard} ${styles.formGrid}`}><h2>評估個人參與條件</h2><p>請釐清個人年齡、可投入時間、交通工具及成人支援等條件，並選擇合適之參與角色。</p>
    <label>年齡<select aria-label="選擇年齡" value={profile.age} onChange={event=>onChange({...profile,age:Number(event.target.value)})}>{ages.map(age=><option key={age} value={age}>{age} 歲</option>)}</select></label>
    <label>每週時間<select value={profile.weeklyTime} onChange={event=>onChange({...profile,weeklyTime:event.target.value as ActionProfile["weeklyTime"]})}><option value="under_1">未滿 1 小時</option><option value="1_2">1～2 小時</option><option value="3_5">3～5 小時</option><option value="over_5">5 小時以上</option></select></label>
    <label>交通能力<select value={profile.travelAbility} onChange={event=>onChange({...profile,travelAbility:event.target.value as ActionProfile["travelAbility"]})}><option value="online_only">僅能線上參與</option><option value="within_county">同行政區內移動</option><option value="guardian_accompanied">須由成人陪同</option><option value="cross_county">可跨行政區移動</option></select></label>
    <label>成人支援<select aria-label="成人支援" value={profile.adultSupport} onChange={event=>onChange({...profile,adultSupport:event.target.value as ActionProfile["adultSupport"]})}><option value="confirmed">已獲成人同意與協助</option><option value="need_to_ask">待諮詢成人意願</option><option value="not_available">目前無成人支援</option></select></label>
    <fieldset><legend>擬優先嘗試之公民角色</legend>{roles.map(([value,label])=><label key={value}><input type="radio" name="role" checked={profile.preferredRole===value} onChange={()=>onChange({...profile,preferredRole:value})}/>{label}</label>)}</fieldset>
  </section>;
}
