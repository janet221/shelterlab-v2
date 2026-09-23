"use client";

import { useEffect,useState } from "react";
import StudentActionProfileForm from "@/app/student/_components/student-action-profile-form";
import { studentActionProfileRepository } from "@/lib/action-opportunities/repository";
import type { StudentActionProfile } from "@/lib/action-opportunities/types";
import { roleSummary, type ActionProfile, type ParticipationMode, type PreferredRole, type SkillTag } from "@/lib/week-six-action";
import styles from "./week-six-experience.module.css";

const modes:Array<[ParticipationMode,string]>=[["online","在家或線上"],["school","校園內"],["onsite","動保單位現場"]];
const skills:Array<[SkillTag,string]>=[["photo_video","攝影／影片"],["graphic_design","平面設計"],["writing_social","寫作／社群"],["data_analysis","資料整理"],["event_planning","活動企劃"],["sorting","物資整理"],["animal_care","動物照護"],["recommend","希望推薦"]];
const roles:Array<[PreferredRole,string]>=[["information","資料整理者"],["school_project","宣導設計者"],["remote_support","認養曝光協助者"],["onsite_learning","參訪紀錄者"],["material_coordinator","物資募集者"],["contact_proposer","聯絡提案者"],["not_sure","先詢問再決定"]];

export default function Role({profile,onChange,onToggle}:{profile:ActionProfile;onChange:(profile:ActionProfile)=>void;onToggle:(key:"participationModes"|"skills",value:string)=>void}) {
  const ages=Array.from({length:11},(_,index)=>index+12);
  const [studentProfile,setStudentProfile]=useState<StudentActionProfile>(()=>studentActionProfileRepository.get());
  useEffect(()=>setStudentProfile(current=>({...current,age:profile.age,county:profile.county||current.county,skills:profile.skills,adultSupportAvailable:profile.adultSupport==="confirmed"})),[profile.age,profile.county,profile.skills,profile.adultSupport]);
  return <section className={`${styles.stageCard} ${styles.formGrid}`}><h2>盤點我的年齡、時間、交通與專長</h2><p>年齡規定會隨參與方式改變。請把正式志工、學生服務學習、參訪或校園合作分開確認，並一併檢查成人協助、訓練、保險與時間承諾。</p>
    <label>年齡<select aria-label="選擇年齡" value={profile.age} onChange={event=>onChange({...profile,age:Number(event.target.value)})}>{ages.map(age=><option key={age} value={age}>{age} 歲</option>)}</select></label>
    <label>每週時間<select value={profile.weeklyTime} onChange={event=>onChange({...profile,weeklyTime:event.target.value as ActionProfile["weeklyTime"]})}><option value="under_1">少於 1 小時</option><option value="1_2">1～2 小時</option><option value="3_5">3～5 小時</option><option value="over_5">5 小時以上</option></select></label>
    <label>交通能力<select value={profile.travelAbility} onChange={event=>onChange({...profile,travelAbility:event.target.value as ActionProfile["travelAbility"]})}><option value="online_only">只能線上</option><option value="within_county">縣市內移動</option><option value="guardian_accompanied">由成人陪同</option><option value="cross_county">可跨縣市</option></select></label>
    <label>成人協助<select aria-label="成人協助" value={profile.adultSupport} onChange={event=>onChange({...profile,adultSupport:event.target.value as ActionProfile["adultSupport"]})}><option value="confirmed">已確認可協助</option><option value="need_to_ask">還需要詢問</option><option value="not_available">目前沒有</option></select></label>
    <fieldset><legend>可參與方式</legend>{modes.map(([value,label])=><label key={value}><input type="checkbox" checked={profile.participationModes.includes(value)} onChange={()=>onToggle("participationModes",value)}/>{label}</label>)}</fieldset>
    <fieldset><legend>專長</legend>{skills.map(([value,label])=><label key={value}><input type="checkbox" checked={profile.skills.includes(value)} onChange={()=>onToggle("skills",value)}/>{label}</label>)}</fieldset>
    <fieldset><legend>想先嘗試的角色</legend>{roles.map(([value,label])=><label key={value}><input type="radio" name="role" checked={profile.preferredRole===value} onChange={()=>onChange({...profile,preferredRole:value})}/>{label}</label>)}</fieldset>
    <div className={styles.summary}><strong>我的角色建議</strong><p>{roleSummary(profile)}</p></div>
    <div className={styles.summary}><StudentActionProfileForm profile={studentProfile} onChange={next=>{setStudentProfile(next);onChange({...profile,age:next.age??profile.age,county:next.county||profile.county,skills:next.skills,adultSupport:next.adultSupportAvailable?"confirmed":profile.adultSupport})}} compact/></div>
  </section>;
}
