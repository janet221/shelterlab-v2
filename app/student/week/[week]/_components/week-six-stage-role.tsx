"use client";

import { type ActionProfile, type PreferredRole } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

const roles:Array<[PreferredRole,string]>=[["information","資料整理者"],["school_project","宣導設計者"],["remote_support","認養曝光協助者"],["onsite_learning","參訪紀錄者"],["material_coordinator","物資募集者"],["contact_proposer","聯絡提案者"],["not_sure","先詢問再決定"]];

export default function Role({profile,onChange,onToggle}:{profile:ActionProfile;onChange:(profile:ActionProfile)=>void;onToggle:(key:"participationModes"|"skills",value:string)=>void}) {
  const ages=Array.from({length:11},(_,index)=>index+12);
  void onToggle;
  return <section className={`${styles.stageCard} ${styles.formGrid}`}><h2>確認我的參與條件</h2><p>確認年齡、可投入時間、交通與成人協助，再選一個想嘗試的角色。</p>
    <label>年齡<select aria-label="選擇年齡" value={profile.age} onChange={event=>onChange({...profile,age:Number(event.target.value)})}>{ages.map(age=><option key={age} value={age}>{age} 歲</option>)}</select></label>
    <label>每週時間<select value={profile.weeklyTime} onChange={event=>onChange({...profile,weeklyTime:event.target.value as ActionProfile["weeklyTime"]})}><option value="under_1">少於 1 小時</option><option value="1_2">1～2 小時</option><option value="3_5">3～5 小時</option><option value="over_5">5 小時以上</option></select></label>
    <label>交通能力<select value={profile.travelAbility} onChange={event=>onChange({...profile,travelAbility:event.target.value as ActionProfile["travelAbility"]})}><option value="online_only">只能線上</option><option value="within_county">縣市內移動</option><option value="guardian_accompanied">由成人陪同</option><option value="cross_county">可跨縣市</option></select></label>
    <label>成人協助<select aria-label="成人協助" value={profile.adultSupport} onChange={event=>onChange({...profile,adultSupport:event.target.value as ActionProfile["adultSupport"]})}><option value="confirmed">已確認可協助</option><option value="need_to_ask">還需要詢問</option><option value="not_available">目前沒有</option></select></label>
    <fieldset><legend>想先嘗試的角色</legend>{roles.map(([value,label])=><label key={value}><input type="radio" name="role" checked={profile.preferredRole===value} onChange={()=>onChange({...profile,preferredRole:value})}/>{label}</label>)}</fieldset>
  </section>;
}
