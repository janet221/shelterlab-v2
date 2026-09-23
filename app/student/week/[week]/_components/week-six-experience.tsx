"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useStudentLearningProgress } from "@/app/student/_components/student-learning-progress";
import { FALLBACK_ACTION_ORGANIZATIONS } from "@/data/action-organizations";
import { WEEK_SIX_FALLBACK } from "@/data/week-six-open-data-fallback";
import { WEEK_SIX_SCHOOL_SNAPSHOT, WEEK_SIX_SCHOOL_SNAPSHOT_DATE } from "@/data/week-six-school-snapshot";
import { WEEK_SIX_SHELTER_NEEDS_SNAPSHOT, WEEK_SIX_SHELTER_NEEDS_SNAPSHOT_DATE } from "@/data/week-six-shelter-needs-snapshot";
import type { AdoptionSnapshot, SchoolDirectorySnapshot, ShelterNeedsSnapshot, ShelterStatsSnapshot } from "@/lib/government-open-data";
import { organizationRepository } from "@/lib/action-opportunities/repository";
import { areSafetyAnswersCorrect, buildContactDrafts, createWeekSixDraft, dedupeActionOrganizations, filterActionMatches, matchActionOrganizations, parseWeekSixDraft, requiredComparisonCount, WEEK_SIX_DRAFT_KEY, WEEK_SIX_LEGACY_DRAFT_KEY, type ActionFilter, type ActionProfile, type ContactMethod, type Coordinates, type ResourceCategoryFilter, type WeekSixJourneyDraft } from "@/lib/week-six-action";
import Nearby from "./week-six-stage-nearby";
import Needs from "./week-six-stage-needs";
import Role from "./week-six-stage-role";
import Safety from "./week-six-stage-safety";
import Contact from "./week-six-stage-contact";
import Commitment from "./week-six-stage-commitment";
import styles from "./week-six-experience.module.css";

const STAGES=["看見附近資源","認識真實需求","找到我的角色","學會安全求助","跨出聯絡一步","建立行動承諾"];
function fallbackAdoptions():AdoptionSnapshot{return{source:{mode:"fallback",updatedAt:WEEK_SIX_FALLBACK.snapshotDate,fallbackDate:WEEK_SIX_FALLBACK.snapshotDate,datasetUrl:"https://data.moa.gov.tw/open_detail.aspx?id=QcbUEzN6E6DL",apiUrl:"https://data.moa.gov.tw/",message:"目前顯示內建政府資料快照。"},countyCounts:{...WEEK_SIX_FALLBACK.countyCounts},shelterCounts:{...WEEK_SIX_FALLBACK.shelterCounts},sampleDogs:WEEK_SIX_FALLBACK.sampleDogs.map(d=>({...d})),organizations:FALLBACK_ACTION_ORGANIZATIONS};}
function fallbackStats():ShelterStatsSnapshot{return{source:{mode:"fallback",updatedAt:WEEK_SIX_FALLBACK.snapshotDate,fallbackDate:WEEK_SIX_FALLBACK.snapshotDate,datasetUrl:"https://data.gov.tw/dataset/41236",apiUrl:"https://data.moa.gov.tw/",message:"目前顯示內建政府資料快照。"},latestByCounty:[]};}
function fallbackNeeds():ShelterNeedsSnapshot{return{source:{mode:"fallback",updatedAt:WEEK_SIX_SHELTER_NEEDS_SNAPSHOT_DATE,fallbackDate:WEEK_SIX_SHELTER_NEEDS_SNAPSHOT_DATE,datasetUrl:"https://data.nat.gov.tw/dataset/73396",apiUrl:"https://data.moa.gov.tw/",message:"目前顯示有日期的政府資料快照。"},latestByCounty:WEEK_SIX_SHELTER_NEEDS_SNAPSHOT.map(row=>({...row}))};}
function fallbackSchools():SchoolDirectorySnapshot{return{source:{mode:"fallback",updatedAt:`115 學年度（快照 ${WEEK_SIX_SCHOOL_SNAPSHOT_DATE}）`,fallbackDate:WEEK_SIX_SCHOOL_SNAPSHOT_DATE,datasetUrl:"https://data.gov.tw/dataset/6089",apiUrl:"https://stats.moe.gov.tw/",message:"目前顯示有日期的教育部名錄快照。"},schools:WEEK_SIX_SCHOOL_SNAPSHOT.map(school=>({...school}))};}

export default function WeekSixExperience(){
 const {completeWeek}=useStudentLearningProgress();
 const [draft,setDraft]=useState<WeekSixJourneyDraft>(()=>createWeekSixDraft());
 const [hydrated,setHydrated]=useState(false),[adoptions,setAdoptions]=useState<AdoptionSnapshot|null>(null),[stats,setStats]=useState<ShelterStatsSnapshot|null>(null),[needs,setNeeds]=useState<ShelterNeedsSnapshot|null>(null),[schools,setSchools]=useState<SchoolDirectorySnapshot|null>(null),[dataError,setDataError]=useState(""),[location,setLocation]=useState<Coordinates|null>(null),[locationMessage,setLocationMessage]=useState(""),[notice,setNotice]=useState("");
 useEffect(()=>{const controller=new AbortController();const read=<T,>(url:string)=>fetch(url,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json() as Promise<T>});Promise.allSettled([read<AdoptionSnapshot>("/api/open-data/adoptions"),read<ShelterStatsSnapshot>("/api/open-data/shelter-stats"),read<ShelterNeedsSnapshot>("/api/open-data/shelter-needs"),read<SchoolDirectorySnapshot>("/api/open-data/schools")]).then(results=>{if(controller.signal.aborted)return;const a=results[0].status==="fulfilled"?results[0].value:fallbackAdoptions(),s=results[1].status==="fulfilled"?results[1].value:fallbackStats(),n=results[2].status==="fulfilled"?results[2].value:fallbackNeeds(),sc=results[3].status==="fulfilled"?results[3].value:fallbackSchools();organizationRepository.upsertMany(a.organizations);setAdoptions(a);setStats(s);setNeeds(n);setSchools(sc);setDraft(d=>({...d,openDataDate:a.source.updatedAt}));if(results.some(result=>result.status==="rejected"))setDataError("部分即時資料暫時無法使用，已切換到有日期且標示來源的備援快照；地圖與六個環節仍可完成。")});try{const restored=parseWeekSixDraft(localStorage.getItem(WEEK_SIX_DRAFT_KEY))??parseWeekSixDraft(localStorage.getItem(WEEK_SIX_LEGACY_DRAFT_KEY));if(restored)setDraft(restored)}catch{}setHydrated(true);return()=>controller.abort()},[]);
 useEffect(()=>{if(!hydrated)return;try{localStorage.setItem(WEEK_SIX_DRAFT_KEY,JSON.stringify({...draft,updatedAt:new Date().toISOString()}));if(localStorage.getItem(WEEK_SIX_LEGACY_DRAFT_KEY))localStorage.removeItem(WEEK_SIX_LEGACY_DRAFT_KEY)}catch{}},[draft,hydrated]);
 useEffect(()=>{if(notice!=="訊息已複製，可前往 Email 寄信囉。")return;const timeout=window.setTimeout(()=>setNotice(""),3200);return()=>window.clearTimeout(timeout)},[notice]);
 const matches=useMemo(()=>matchActionOrganizations(dedupeActionOrganizations(adoptions?.organizations??[]),draft.profile,location),[adoptions,draft.profile,location]);
 const filteredMatches=useMemo(()=>filterActionMatches(matches,draft.resourceCategoryFilter,draft.actionFilter),[matches,draft.resourceCategoryFilter,draft.actionFilter]);
 const countyMatches=useMemo(()=>draft.profile.county?filteredMatches.filter(m=>m.organization.county===draft.profile.county):filteredMatches,[filteredMatches,draft.profile.county]);
 const usingNearbyFallback=false;
 const mapMatches=countyMatches;
 const visible=useMemo(()=>mapMatches.slice(0,8),[mapMatches]);
 const selected=matches.find(m=>m.organization.id===draft.selectedOrganizationId)?.organization??null;
 const patch=(p:Partial<WeekSixJourneyDraft>)=>setDraft(d=>({...d,...p}));
 const toggleProfile=(key:"participationModes"|"skills",value:string)=>setDraft(d=>{const values=d.profile[key] as string[];return{...d,profile:{...d.profile,[key]:values.includes(value)?values.filter(v=>v!==value):[...values,value]}}});
 const requestLocation=()=>{if(!navigator.geolocation){setLocationMessage("此瀏覽器不支援定位，請使用縣市選單。");return}if(sessionStorage.getItem("shelterlab-week6-location-denied")==="1"){setLocationMessage("定位權限先前已被拒絕，請使用縣市選單；主要功能仍可使用。");return}setLocationMessage("正在取得約略位置…");navigator.geolocation.getCurrentPosition(p=>{setLocation({latitude:p.coords.latitude,longitude:p.coords.longitude});setLocationMessage("定位只在此頁計算約略距離，不會寫入草稿或傳送至外部服務。")},()=>{sessionStorage.setItem("shelterlab-week6-location-denied","1");setLocationMessage("定位未開啟，已改用手動縣市選擇；主要功能仍可使用。")},{enableHighAccuracy:false,timeout:8000,maximumAge:300000})};
 const canNext=()=>{switch(draft.stage){case 0:return Boolean((draft.profile.county||location)&&draft.selectedOrganizationId&&visible.some(m=>m.organization.id===draft.selectedOrganizationId));case 1:{const availableIds=new Set(visible.map(m=>m.organization.id)),chosen=draft.comparisonOrganizationIds.filter(id=>availableIds.has(id)),required=requiredComparisonCount(visible.length);return required>0&&chosen.length>=required&&chosen.includes(draft.selectedOrganizationId)}case 2:return Boolean(draft.profile.adultSupport&&draft.profile.preferredRole);case 3:return areSafetyAnswersCorrect(draft.safetyAnswers);case 4:return Boolean(selected&&draft.contactDrafts[draft.contactMethod].trim());default:return false}};
 const next=()=>{if(!canNext()){setNotice(draft.stage===3?"請先修正尚未答對的安全情境，再前往下一環節。":"請先完成本環節的必要項目。");return}const nextDraft={...draft};if(draft.stage===0&&!draft.comparisonOrganizationIds.includes(draft.selectedOrganizationId))nextDraft.comparisonOrganizationIds=[draft.selectedOrganizationId];if(draft.stage===3&&selected){const generated=buildContactDrafts(selected,draft.profile);nextDraft.contactDrafts={phone:draft.contactDrafts.phone||generated.phone,email:draft.contactDrafts.email||generated.email,visit_proposal:draft.contactDrafts.visit_proposal||generated.visit_proposal,school_proposal:draft.contactDrafts.school_proposal||generated.school_proposal}};const stage=Math.min(5,draft.stage+1);setDraft({...nextDraft,stage,furthestStage:Math.max(draft.furthestStage,stage)});setNotice("");window.scrollTo({top:0,behavior:"smooth"})};
 const complete=()=>{const r=draft.actionRecord;if(!r.actionType.trim()||!r.plannedDate||!r.adultSupportNote.trim()||!r.conditionsToConfirm.trim()||!r.nextStep.trim()||!r.alternativePlan.trim()||r.reflection.trim().length<20){setNotice("請補齊行動、日期、成人協助、確認條件、下一步、替代方案與至少 20 字的行前預期成果。");return}setDraft(d=>({...d,status:"completed"}));completeWeek(6);setNotice("");};
 const editPlan=()=>{patch({status:"draft",stage:5});setNotice("");window.scrollTo({top:0,behavior:"smooth"})};
 const restartSearch=()=>{if(!window.confirm("重新尋找會清除目前選擇的單位、聯絡草稿與行動計畫；學校、年齡、縣市和篩選條件會保留。要繼續嗎？"))return;setDraft(current=>{const fresh=createWeekSixDraft();return{...fresh,profile:{...current.profile},selectedSchoolId:current.selectedSchoolId,resourceCategoryFilter:current.resourceCategoryFilter,actionFilter:current.actionFilter,openDataDate:current.openDataDate}});setNotice("");window.scrollTo({top:0,behavior:"smooth"})};
 const chooseStage=(i:number)=>{if(i<=draft.furthestStage){patch({stage:i});setNotice("");window.scrollTo({top:0,behavior:"smooth"})}};
 return <main className={styles.page}><nav className={styles.nav}><Link href="/student">← 返回六週地圖</Link><span>WEEK 06 · 現場與行動</span></nav><header className={styles.hero}><p>資料驅動行動設計</p><h1>動保行動資源地圖</h1><p>先找到官方單位，再選擇行動方式；查清真實需求、安全與資格條件後，完成自己的行動計畫。</p></header>
 <ol className={styles.stepper}>{STAGES.map((name,i)=><li key={name}><button type="button" disabled={i>draft.furthestStage} aria-current={draft.stage===i?"step":undefined} onClick={()=>chooseStage(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
 <section className={styles.stageHeading}><span>環節 {draft.stage+1}/6</span><h2>{STAGES[draft.stage]}</h2></section>
 {draft.stage===0&&<Nearby
   profile={draft.profile} categoryFilter={draft.resourceCategoryFilter} actionFilter={draft.actionFilter}
   mapMatches={mapMatches} visible={visible} usingNearbyFallback={usingNearbyFallback} location={location}
   selectedId={draft.selectedOrganizationId} selectedSchoolId={draft.selectedSchoolId} schools={schools} message={locationMessage} dataError={dataError}
   onProfile={profile=>setDraft(d=>({...d,profile,selectedSchoolId:profile.county===d.profile.county?d.selectedSchoolId:"",selectedOrganizationId:"",comparisonOrganizationIds:[]}))}
   onCategory={(resourceCategoryFilter:ResourceCategoryFilter)=>patch({resourceCategoryFilter,selectedOrganizationId:"",comparisonOrganizationIds:[]})}
   onAction={(actionFilter:ActionFilter)=>patch({actionFilter,selectedOrganizationId:"",comparisonOrganizationIds:[]})}
   onSchool={selectedSchoolId=>{const school=schools?.schools.find(item=>item.id===selectedSchoolId);setDraft(d=>({...d,selectedSchoolId,profile:{...d.profile,county:school?.county??d.profile.county},selectedOrganizationId:"",comparisonOrganizationIds:[]}))}}
   onLocate={requestLocation} onSelect={id=>patch({selectedOrganizationId:id})}
 />}
 {draft.stage===1&&<Needs matches={visible} ids={draft.comparisonOrganizationIds} selectedId={draft.selectedOrganizationId} county={draft.profile.county} adoptions={adoptions} stats={stats} needs={needs} onToggle={id=>patch({comparisonOrganizationIds:draft.comparisonOrganizationIds.includes(id)?draft.comparisonOrganizationIds.filter(v=>v!==id):[...draft.comparisonOrganizationIds,id].slice(0,3)})} onSelect={id=>patch({selectedOrganizationId:id})}/>}
 {draft.stage===2&&<Role profile={draft.profile} onChange={(profile:ActionProfile)=>patch({profile})} onToggle={toggleProfile}/>}
 {draft.stage===3&&<Safety answers={draft.safetyAnswers} onAnswer={(id,v)=>patch({safetyAnswers:{...draft.safetyAnswers,[id]:v}})}/>}
 {draft.stage===4&&selected&&<Contact
   organization={selected} method={draft.contactMethod} drafts={draft.contactDrafts}
   onMethod={(contactMethod:ContactMethod)=>patch({contactMethod})}
   onDraft={value=>patch({contactDrafts:{...draft.contactDrafts,[draft.contactMethod]:value}})} onCopied={setNotice}
 />}
 {draft.stage===5&&selected&&<Commitment
   organization={selected} record={draft.actionRecord} completed={draft.status==="completed"}
   onChange={actionRecord=>patch({actionRecord})} onComplete={complete} onEdit={editPlan} onRestart={restartSearch}
 />}
 {!selected&&draft.stage>0&&<p className={styles.notice}>找不到先前選擇的單位，請返回第一環節重新選擇。</p>}
 <div className={styles.stageActions}>{draft.stage>0&&<button type="button" onClick={()=>chooseStage(draft.stage-1)}>← 上一環節</button>}{draft.stage<5&&<button type="button" className={styles.primary} onClick={next}>完成任務，前往下一環節 →</button>}{draft.status==="completed"&&<Link href="/student">帶著行動摘要回到地圖</Link>}</div>{notice&&<p role="status" aria-live="polite" className={notice==="訊息已複製，可前往 Email 寄信囉。"?`${styles.toast} ${styles.copyToast}`:styles.toast}>{notice}</p>}</main>;
}
