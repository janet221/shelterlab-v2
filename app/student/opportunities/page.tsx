"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StudentActionProfileForm from "@/app/student/_components/student-action-profile-form";
import {
  ACTION_DATA_EVENT,
  bookmarkRepository,
  decorateOpportunity,
  matchesOpportunityQuery,
  opportunityRepository,
  organizationRepository,
  preferenceRepository,
  studentActionProfileRepository,
} from "@/lib/action-opportunities/browser-repository";
import { canSubmitIndividualApplication, eligibilityLabel, evaluateActivityEligibility, primaryEligibilityRuleLabel } from "@/lib/action-opportunities/eligibility";
import {
  DEFAULT_ACTION_PREFERENCES,
  OPPORTUNITY_CATEGORY_LABELS,
  OPPORTUNITY_SOURCE_LABELS,
  SKILL_LABELS,
  type ActionOpportunity,
  type ActionOrganization,
  type ActionPreferences,
  type OpportunityCategory,
  type StudentActionProfile,
} from "@/lib/action-opportunities/types";
import { TAIWAN_COUNTIES, type OrganizationType, type SkillTag } from "@/lib/action-opportunities/types";
import styles from "./opportunities.module.css";

const OpportunityMap=dynamic(()=>import("./opportunity-map"),{ssr:false});
const SIMULATED_PLAN_KEY="shelterlab-simulated-action-plan-v1";
type SimulatedPlanItem={organizationId:string;organizationName:string;scenario:string;county:string;addedAt:string};
const SCENARIOS=["模擬參訪前詢問","模擬學生志工諮詢","模擬校園合作提案","模擬物資整理行動","模擬認養推廣協助","模擬資料與社群協作"] as const;
const SCENARIO_CATEGORIES:Record<(typeof SCENARIOS)[number],OpportunityCategory>={"模擬參訪前詢問":"visit","模擬學生志工諮詢":"volunteer","模擬校園合作提案":"school_outreach","模擬物資整理行動":"material_drive","模擬認養推廣協助":"adoption_event","模擬資料與社群協作":"data_support"};
const formatDate=(value?:string)=>value?new Intl.DateTimeFormat("zh-TW",{dateStyle:"medium"}).format(new Date(value)):"尚未設定";
const distanceKm=(from:{latitude:number;longitude:number},item:ActionOpportunity)=>{if(item.latitude===undefined||item.longitude===undefined)return Number.POSITIVE_INFINITY;const rad=(value:number)=>value*Math.PI/180,dLat=rad(item.latitude-from.latitude),dLon=rad(item.longitude-from.longitude),a=Math.sin(dLat/2)**2+Math.cos(rad(from.latitude))*Math.cos(rad(item.latitude))*Math.sin(dLon/2)**2;return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))};

function matchesOrganizationFilter(type:OrganizationType|undefined,mode:string,filter:string){
  if(!filter)return true;
  if(filter==="government")return ["public_shelter","animal_home","government_agency","animal_protection_office","education_park","animal_welfare_education_park"].includes(type??"");
  if(filter==="public_care")return ["public_shelter","animal_home"].includes(type??"");
  if(filter==="private")return ["registered_nonprofit","animal_welfare_association","foundation","other_verified_organization"].includes(type??"");
  if(filter==="rescue")return ["rescue_group","private_rescue_group"].includes(type??"");
  if(filter==="education")return ["education_park","animal_welfare_education_park"].includes(type??"");
  if(filter==="partner")return mode==="partner_managed";
  return true;
}

export default function OpportunitySearchPage(){
  const [items,setItems]=useState<ActionOpportunity[]>([]);
  const [organizations,setOrganizations]=useState<ActionOrganization[]>([]);
  const [bookmarks,setBookmarks]=useState<string[]>([]);
  const [preferences,setPreferences]=useState<ActionPreferences>(DEFAULT_ACTION_PREFERENCES);
  const [profile,setProfile]=useState<StudentActionProfile>(()=>studentActionProfileRepository.get());
  const [query,setQuery]=useState("");
  const [history,setHistory]=useState(false);
  const [mode,setMode]=useState<"list"|"map">("list");
  const [sort,setSort]=useState("new");
  const [message,setMessage]=useState("");
  const [city,setCity]=useState("");
  const [district,setDistrict]=useState("");
  const [category,setCategory]=useState("");
  const [skill,setSkill]=useState("");
  const [organizationFilter,setOrganizationFilter]=useState("");
  const [dateRange,setDateRange]=useState("all");
  const [serviceHours,setServiceHours]=useState(false);
  const [eligibilityFilter,setEligibilityFilter]=useState("all");
  const [location,setLocation]=useState<{latitude:number;longitude:number}|null>(null);
  const [contacting,setContacting]=useState<ActionOpportunity|null>(null);
  const [section,setSection]=useState<"activities"|"simulation">("activities");
  const [simulationTarget,setSimulationTarget]=useState<ActionOrganization|null>(null);
  const [simulationScenario,setSimulationScenario]=useState<string>(SCENARIOS[0]);
  const [simulatedPlan,setSimulatedPlan]=useState<SimulatedPlanItem[]>([]);
  const [showAllSimulation,setShowAllSimulation]=useState(false);

  const reload=()=>{setItems(opportunityRepository.list());setOrganizations(organizationRepository.list());setBookmarks(bookmarkRepository.list());setPreferences(preferenceRepository.get());setProfile(studentActionProfileRepository.get())};
  useEffect(()=>{reload();try{setSimulatedPlan(JSON.parse(localStorage.getItem(SIMULATED_PLAN_KEY)||"[]") as SimulatedPlanItem[])}catch{}const id=new URLSearchParams(window.location.search).get("opportunity");if(id)setQuery(id);window.addEventListener(ACTION_DATA_EVENT,reload);return()=>window.removeEventListener(ACTION_DATA_EVENT,reload)},[]);

  const visible=useMemo(()=>items.map(item=>decorateOpportunity(item)).filter(item=>{
    const historical=["expired","closed","full","cancelled"].includes(item.status),organization=organizationRepository.get(item.organizationId);
    if(item.isDemo||item.sourceLayer!=="platform_partner"||item.managementMode!=="partner_managed")return false;
    if(history?!historical:historical||item.status!=="published")return false;
    if(!matchesOpportunityQuery(item,query)&&item.id!==query)return false;
    if(!matchesOrganizationFilter(organization?.organizationType,item.managementMode,organizationFilter))return false;
    if(city&&item.city!==city&&item.city!=="全國")return false;
    if(district&&!(item.district??item.address).includes(district))return false;
    if(category&&item.category!==category)return false;
    if(skill&&!item.skillsNeeded.includes(skill as SkillTag))return false;
    if(serviceHours&&!item.serviceHoursProvided)return false;
    if(dateRange!=="all"&&item.eventStartAt){const days=(new Date(item.eventStartAt).getTime()-Date.now())/86400000;if(days>Number(dateRange))return false}
    const eligibility=evaluateActivityEligibility(profile,item);
    if(eligibilityFilter==="direct"&&!canSubmitIndividualApplication(eligibility))return false;
    if(eligibilityFilter==="supported"&&!["eligible_with_guardian_consent","eligible_with_adult","school_or_youth_group_only"].includes(eligibility.result))return false;
    if(eligibilityFilter==="guardian"&&eligibility.result!=="eligible_with_guardian_consent")return false;
    if(eligibilityFilter==="adult"&&eligibility.result!=="eligible_with_adult")return false;
    if(eligibilityFilter==="group"&&eligibility.result!=="school_or_youth_group_only")return false;
    if(eligibilityFilter==="online"&&!item.eligibilityRules?.some(rule=>rule.participationMode==="online_or_campus")&&!item.alternativeActions?.some(action=>["online_action","campus_action"].includes(action.mode)))return false;
    return true;
  }).filter(item=>!location||preferences.maxDistanceKm>=100||distanceKm(location,item)<=preferences.maxDistanceKm||item.participationFormat==="online").sort((a,b)=>{
    if(sort==="new")return new Date(b.publishedAt||0).getTime()-new Date(a.publishedAt||0).getTime();
    if(sort==="deadline")return new Date(a.applicationDeadline||"2999").getTime()-new Date(b.applicationDeadline||"2999").getTime();
    if(sort==="date")return new Date(a.eventStartAt||"2999").getTime()-new Date(b.eventStartAt||"2999").getTime();
    if(sort==="distance"&&location)return distanceKm(location,a)-distanceKm(location,b);
    const eventDifference=new Date(a.eventStartAt||"2999-12-31").getTime()-new Date(b.eventStartAt||"2999-12-31").getTime();
    if(eventDifference)return eventDifference;
    const deadlineDifference=new Date(a.applicationDeadline||"2999-12-31").getTime()-new Date(b.applicationDeadline||"2999-12-31").getTime();
    if(deadlineDifference)return deadlineDifference;
    const skillDifference=profile.skills.filter(skill=>b.skillsNeeded.includes(skill)).length-profile.skills.filter(skill=>a.skillsNeeded.includes(skill)).length;
    if(skillDifference)return skillDifference;
    return new Date(b.publishedAt||b.updatedAt).getTime()-new Date(a.publishedAt||a.updatedAt).getTime();
  }),[items,query,history,city,district,category,skill,organizationFilter,dateRange,serviceHours,eligibilityFilter,location,preferences,profile,sort]);

  const updatePreference=<K extends keyof ActionPreferences>(key:K,value:ActionPreferences[K])=>setPreferences(current=>({...current,[key]:value}));
  const savePreferences=()=>{preferenceRepository.save(preferences);setMessage("已儲存條件與技能；系統會用來排序活動，不會自動替你送出申請。")};
  const takeAction=(item:ActionOpportunity)=>setContacting(item);
  const copyText=async(value:string,label:string)=>{try{await navigator.clipboard.writeText(value);setMessage(`${label}已複製。`)}catch{setMessage(`無法自動複製，請手動選取${label}。`)}};
  const simulationOrganizations=useMemo(()=>organizations.filter(organization=>{
    if(city&&organization.county!==city)return false;
    if(category){const selectedScenario=SCENARIOS.find(value=>SCENARIO_CATEGORIES[value]===category);if(!selectedScenario)return false}
    const needle=query.trim().toLowerCase();
    return !needle||[organization.name,organization.county,organization.address,...organization.actionTypes].join(" ").toLowerCase().includes(needle);
  }),[organizations,city,query,category]);
  const addSimulationPlan=()=>{if(!simulationTarget)return;const next=[...simulatedPlan.filter(item=>item.organizationId!==simulationTarget.id),{organizationId:simulationTarget.id,organizationName:simulationTarget.name,scenario:simulationScenario,county:simulationTarget.county,addedAt:new Date().toISOString()}];localStorage.setItem(SIMULATED_PLAN_KEY,JSON.stringify(next));setSimulatedPlan(next);setSimulationTarget(null);setMessage(`已將「${simulationScenario}」加入我的模擬行動計畫；不會送出申請或更動正式進度。`)};
  const requestLocation=()=>{if(!navigator.geolocation)return setMessage("這個瀏覽器不支援定位，仍可使用縣市篩選。");setMessage("正在取得約略位置…");navigator.geolocation.getCurrentPosition(position=>{setLocation({latitude:position.coords.latitude,longitude:position.coords.longitude});setSort("distance");setMessage("已使用本次約略位置排序；位置不會儲存。")},()=>setMessage("無法取得位置，請改用縣市篩選。"),{enableHighAccuracy:false,timeout:8000,maximumAge:300000})};

  return <main className={styles.page}>
    <header className={styles.header}><div><p className={styles.eyebrow}>課後行動中心</p><h1>ShelterLab 動保活動布告欄</h1><p><strong>聯絡提醒：</strong>活動資料會清楚標示來源與查核時間。ShelterLab 不代替學生送出申請；請確認資格後自行聯絡主辦單位。</p></div><div className={styles.actions}><Link className={styles.button} href="/student">返回六週地圖</Link></div></header>
    <nav className={styles.sectionTabs} aria-label="活動布告欄分區"><button type="button" className={section==="activities"?styles.primary:""} onClick={()=>setSection("activities")}>正式收容所活動資料</button><button type="button" className={section==="simulation"?styles.simulationPrimary:""} onClick={()=>setSection("simulation")}>模擬收容所活動資料</button></nav>

    {contacting&&<ContactModal item={contacting} profile={profile} onClose={()=>setContacting(null)} onCopy={copyText}/>}
    {simulationTarget&&<SimulationModal organization={simulationTarget} scenario={simulationScenario} onScenario={setSimulationScenario} onClose={()=>setSimulationTarget(null)} onAdd={addSimulationPlan}/>}

    <section className={styles.toolbar}>
      <div className={styles.coreFilters}><input aria-label="搜尋行動機會" value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜尋活動、收容所或縣市"/><label>縣市<select value={city} onChange={event=>setCity(event.target.value)}><option value="">全部縣市</option>{TAIWAN_COUNTIES.map(value=><option key={value}>{value}</option>)}</select></label><label>活動類型<select value={category} onChange={event=>setCategory(event.target.value)}><option value="">全部活動</option>{Object.entries(OPPORTUNITY_CATEGORY_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>
      {section==="activities"&&<details className={styles.moreFilters}><summary>更多篩選與排序</summary><div className={styles.eligibilityFilters} aria-label="參加資格篩選"><button className={eligibilityFilter==="all"?styles.primary:""} onClick={()=>setEligibilityFilter("all")}>全部活動</button><button className={eligibilityFilter==="direct"?styles.primary:""} onClick={()=>setEligibilityFilter("direct")}>適合我</button><button className={eligibilityFilter==="supported"?styles.primary:""} onClick={()=>setEligibilityFilter("supported")}>需要成人協助</button><button className={eligibilityFilter==="online"?styles.primary:""} onClick={()=>setEligibilityFilter("online")}>線上／校園</button></div><div className={styles.filters}><label>排序<select aria-label="排序" value={sort} onChange={event=>setSort(event.target.value)}><option value="new">最新上架</option><option value="distance">距離最近</option><option value="deadline">截止日最近</option><option value="date">活動日最近</option></select></label><label>行政區<input value={district} onChange={event=>setDistrict(event.target.value)} placeholder="例如：板橋區"/></label><label>機構類型<select value={organizationFilter} onChange={event=>setOrganizationFilter(event.target.value)}><option value="">全部</option><option value="government">政府單位</option><option value="public_care">公立收容／動物之家</option><option value="education">教育園區</option><option value="private">民間動保團體</option><option value="rescue">救援／中途組織</option><option value="partner">已進駐平台</option></select></label><label>技能<select value={skill} onChange={event=>setSkill(event.target.value)}><option value="">全部技能</option>{Object.entries(SKILL_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>活動日期<select value={dateRange} onChange={event=>setDateRange(event.target.value)}><option value="all">不限日期</option><option value="7">七天內</option><option value="30">一個月內</option></select></label><label>服務時數<select value={serviceHours?"yes":""} onChange={event=>setServiceHours(event.target.value==="yes")}><option value="">不限</option><option value="yes">提供時數</option></select></label></div><button type="button" onClick={requestLocation}>使用約略位置排序</button><button type="button" className={history?"":styles.primary} onClick={()=>setHistory(false)}>目前活動</button><button type="button" className={history?styles.primary:""} onClick={()=>setHistory(true)}>歷史活動</button></details>}
      {section==="simulation"&&<details className={styles.moreFilters}><summary>更多篩選與排序</summary><p className={styles.filterHint}>模擬區沿用相同的搜尋、縣市與活動類型條件；不顯示名額、截止日或資格排序，避免把練習情境誤認為真實招募。</p></details>}
    </section>

    {message&&<p className={`${styles.prototype} ${styles.status}`} role="status">{message}</p>}
    {section==="activities"?<><details className={styles.preferences}><summary><strong>我的參與條件</strong>（選填，用於活動排序）</summary><StudentActionProfileForm profile={profile} onChange={next=>{setProfile(next);setPreferences(current=>({...current,age:next.age??current.age,city:next.county||current.city,skills:next.skills,categories:next.interests,adultSupport:next.adultSupportAvailable}))}} compact/><hr/><div className={styles.preferenceGrid}><label>偏好縣市<select value={preferences.city} onChange={event=>updatePreference("city",event.target.value)}>{TAIWAN_COUNTIES.map(value=><option key={value}>{value}</option>)}</select></label><label>搜尋距離<select value={preferences.maxDistanceKm} onChange={event=>updatePreference("maxDistanceKm",Number(event.target.value))}><option value="5">5 公里</option><option value="15">15 公里</option><option value="30">30 公里</option><option value="100">不限距離</option></select></label><label>需要服務時數<select value={preferences.needsServiceHours?"yes":"no"} onChange={event=>updatePreference("needsServiceHours",event.target.value==="yes")}><option value="no">不一定</option><option value="yes">需要</option></select></label></div><p><strong>感興趣的活動</strong></p><div className={styles.tags}>{Object.entries(OPPORTUNITY_CATEGORY_LABELS).map(([value,label])=><button type="button" key={value} className={preferences.categories.includes(value as OpportunityCategory)?styles.primary:""} onClick={()=>updatePreference("categories",preferences.categories.includes(value as OpportunityCategory)?preferences.categories.filter(item=>item!==value):[...preferences.categories,value as OpportunityCategory])}>{label}</button>)}</div><p><strong>我擁有的技能</strong></p><div className={styles.tags}>{Object.entries(SKILL_LABELS).map(([value,label])=><button type="button" key={value} className={preferences.skills.includes(value as SkillTag)?styles.primary:""} onClick={()=>updatePreference("skills",preferences.skills.includes(value as SkillTag)?preferences.skills.filter(item=>item!==value):[...preferences.skills,value as SkillTag])}>{label}</button>)}</div><div className={styles.actions}><button className={styles.primary} onClick={savePreferences}>儲存排序條件</button></div></details><section className={styles.results}><div className={styles.resultsHeader}><div><h2>{history?"歷史活動":"目前可查詢的活動"}</h2><p>{visible.length} 筆。官方資料、外部公告與平台合作活動會清楚分開。</p></div><div className={styles.modeSwitch}><button className={mode==="list"?styles.primary:""} onClick={()=>setMode("list")}>卡片列表</button><button className={mode==="map"?styles.primary:""} onClick={()=>setMode("map")}>查看地圖</button></div></div>{mode==="map"?<OpportunityMap items={visible} onSelect={id=>{setQuery(id);setMode("list")}}/>:<div className={styles.grid}>{visible.map(item=><StudentOpportunityCard key={item.id} item={item} profile={profile} history={history} bookmarked={bookmarks.includes(item.id)} distance={location?distanceKm(location,item):null} onBookmark={()=>{bookmarkRepository.toggle(item);setBookmarks(bookmarkRepository.list())}} onAction={()=>takeAction(item)}/>)}</div>}{visible.length===0&&<div className={`${styles.empty} ${styles.officialEmpty}`}><strong>目前尚無正式合作收容所活動</strong><p>正式區只顯示經 ShelterLab 確認、由合作單位發布的活動。你可以先切換至「模擬收容所活動資料」，練習搜尋、規劃及撰寫 Gmail 詢問內容。</p></div>}</section></>:<section className={styles.simulationArea}><div className={styles.simulationNotice}><strong>模擬體驗情境</strong><p>以下內容只用來練習規劃與聯絡，不代表任何單位正在招募、與 ShelterLab 合作或同意接受申請。</p></div>{simulatedPlan.length>0&&<div className={styles.planPanel}><h2>我的模擬行動計畫</h2><div className={styles.planList}>{simulatedPlan.map(item=><article key={item.organizationId}><div><strong>{item.scenario}</strong><p>{item.organizationName} · {item.county}</p></div><button type="button" onClick={()=>{const next=simulatedPlan.filter(plan=>plan.organizationId!==item.organizationId);localStorage.setItem(SIMULATED_PLAN_KEY,JSON.stringify(next));setSimulatedPlan(next)}}>移除</button></article>)}</div></div>}<div className={styles.resultsHeader}><div><h2>選擇一個單位進行練習</h2><p>共 {simulationOrganizations.length} 個可搜尋單位；不顯示虛構日期、名額或招募資格。</p></div></div><div className={styles.grid}>{simulationOrganizations.slice(0,showAllSimulation?simulationOrganizations.length:12).map(organization=><SimulationCard key={organization.id} organization={organization} planned={simulatedPlan.some(item=>item.organizationId===organization.id)} onSelect={()=>{setSimulationTarget(organization);setSimulationScenario(SCENARIOS[0])}}/>)}</div>{simulationOrganizations.length===0&&<div className={styles.empty}>找不到符合搜尋條件的單位。</div>}{simulationOrganizations.length>12&&<button type="button" className={styles.showMore} onClick={()=>setShowAllSimulation(value=>!value)}>{showAllSimulation?"收合單位":"顯示全部單位"}</button>}</section>}
  </main>;
}

function StudentOpportunityCard({item,profile,history,bookmarked,distance,onBookmark,onAction}:{item:ReturnType<typeof decorateOpportunity>;profile:StudentActionProfile;history:boolean;bookmarked:boolean;distance:number|null;onBookmark:()=>void;onAction:()=>void}){
  const eligibility=evaluateActivityEligibility(profile,item),sourceLabel=item.sourceLayer==="demo"?"展示資料":OPPORTUNITY_SOURCE_LABELS[item.sourceType];
  const tone=eligibility.result==="eligible_directly"?styles.eligibilityGood:["eligible_with_guardian_consent","eligible_with_adult"].includes(eligibility.result)?styles.eligibilityPrepare:eligibility.result==="school_or_youth_group_only"?styles.eligibilityGroup:styles.eligibilityMuted;
  return <article className={`${styles.card} ${history?styles.history:""}`}><button type="button" className={styles.bookmarkButton} onClick={onBookmark} aria-label={bookmarked?"取消收藏":"收藏活動"} title={bookmarked?"取消收藏":"收藏活動"}>{bookmarked?"★":"☆"}</button><div className={styles.badges}><span className={`${styles.badge} ${tone}`}>{eligibilityLabel(eligibility)}</span><span className={styles.badge}>{sourceLabel}</span></div><h2><Link href={`/student/opportunities/${item.id}`}>{item.title}</Link></h2><p><strong>{item.organizationName}</strong></p><p>{item.summary||item.description}</p><dl><div><dt>日期</dt><dd>{formatDate(item.eventStartAt)}</dd></div><div><dt>地點</dt><dd>{distance!==null&&Number.isFinite(distance)?`${item.city} · 約 ${distance.toFixed(1)} 公里`:`${item.city}${item.district?` ${item.district}`:""}`}</dd></div><div><dt>資格</dt><dd>{primaryEligibilityRuleLabel(item)}</dd></div></dl><div className={styles.tags}>{item.workItems.slice(0,3).map(value=><span className={styles.tag} key={value}>{value}</span>)}</div><div className={styles.actions}><button className={canSubmitIndividualApplication(eligibility)?styles.primary:""} disabled={item.status!=="published"} onClick={onAction}>查看聯絡方式</button></div></article>;
}

function SimulationCard({organization,planned,onSelect}:{organization:ActionOrganization;planned:boolean;onSelect:()=>void}){
  return <article className={`${styles.card} ${styles.simulationCard}`}><div className={styles.badges}><span className={`${styles.badge} ${styles.simulationBadge}`}>模擬體驗</span><span className={styles.badge}>非真實招募</span></div><h2>{organization.name}</h2><p><strong>{organization.county}</strong> · {organization.address}</p><p>選擇一個學生可理解的行動情境，練習確認資格、成人協助與聯絡前準備。</p><div className={styles.tags}>{organization.actionTypes.slice(0,3).map(value=><span className={styles.tag} key={value}>{value}</span>)}</div><button type="button" className={styles.simulationPrimary} onClick={onSelect}>{planned?"調整模擬行動計畫":"加入模擬行動計畫"}</button></article>;
}

function SimulationModal({organization,scenario,onScenario,onClose,onAdd}:{organization:ActionOrganization;scenario:string;onScenario:(value:string)=>void;onClose:()=>void;onAdd:()=>void}){
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[onClose]);
  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className={`${styles.contactModal} ${styles.simulationModal}`} role="dialog" aria-modal="true" aria-labelledby="simulation-title"><button type="button" className={styles.modalClose} onClick={onClose} aria-label="關閉模擬行動視窗">×</button><p className={styles.eyebrow}>模擬體驗 · 非真實招募</p><h2 id="simulation-title">為 {organization.name} 規劃一項行動</h2><div className={styles.simulationWarning}>此情境只供課後練習，不代表該單位正在招募、已同意合作或會收到你的資料。</div><label className={styles.scenarioSelect}>選擇練習情境<select value={scenario} onChange={event=>onScenario(event.target.value)}>{SCENARIOS.map(value=><option key={value}>{value}</option>)}</select></label><div className={styles.contactBlock}><strong>加入計畫前先確認</strong><ul><li>{organization.ageLimitNote||"年齡與未成年參與規定需向單位確認。"}</li><li>{organization.requiresAdult?"需要先安排家長、教師或其他成人協助。":"仍應確認是否需要家長同意或成人陪同。"}</li><li>不會產生正式申請，也不會寄送 Email。</li></ul></div><div className={styles.modalActions}><button type="button" className={styles.simulationPrimary} onClick={onAdd}>確認加入模擬計畫</button><button type="button" onClick={onClose}>取消</button></div></section></div>;
}

function ContactModal({item,profile,onClose,onCopy}:{item:ActionOpportunity;profile:StudentActionProfile;onClose:()=>void;onCopy:(value:string,label:string)=>void}){
  useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[onClose]);
  const organization=organizationRepository.get(item.organizationId);
  const email=item.contactEmail?.trim()||"";
  const phone=item.contactPhone?.trim()||organization?.phone?.trim()||"";
  const studentName=profile.displayName.trim()||"一位對動物保護有興趣的學生";
  const school=profile.schoolName.trim()?`來自 ${profile.schoolName} 的`:"";
  const subject=`詢問「${item.title}」參與方式`;
  const template=`${item.organizationName} 您好：\n\n我是${school}${studentName}，透過 ShelterLab 看到貴單位的「${item.title}」活動，想進一步了解參與方式。\n\n想請教目前是否仍可報名，以及年齡、家長同意、成人陪同、行前訓練與服務時間等資格條件。若需要準備其他資料，也請告訴我。\n\n謝謝您撥空回覆。\n\n${studentName}`;
  const mailto=email?`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(template)}`:"";
  return <div className={styles.modalBackdrop} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className={styles.contactModal} role="dialog" aria-modal="true" aria-labelledby="contact-title"><button type="button" className={styles.modalClose} onClick={onClose} aria-label="關閉聯絡視窗">×</button><p className={styles.eyebrow}>外部聯絡</p><h2 id="contact-title">聯絡 {item.organizationName}</h2><p>請先確認活動資格，再使用自己的 Gmail 或郵件軟體聯絡。ShelterLab 不會代替你寄信或保存信件內容。</p><div className={styles.contactBlock}><strong>主辦單位官方 Email</strong><div className={styles.copyRow}><code>{email||"目前資料未公開 Email"}</code>{email&&<button type="button" onClick={()=>onCopy(email,"Email")}>一鍵複製</button>}</div>{phone&&phone!=="尚待查核"&&<p>電話：<a href={`tel:${phone.replace(/[^\d+]/g,"")}`}>{phone}</a></p>}</div><div className={styles.contactBlock}><strong>建議信件範本</strong><pre>{template}</pre><button type="button" onClick={()=>onCopy(template,"信件範本")}>一鍵複製信件範本</button></div><div className={styles.modalActions}>{email?<a className={`${styles.button} ${styles.primary}`} href={mailto}>開啟 Gmail／郵件軟體</a>:<a className={`${styles.button} ${styles.primary}`} href={item.sourceUrl} target="_blank" rel="noreferrer">前往官方來源查詢聯絡方式</a>}<a className={styles.button} href={item.sourceUrl} target="_blank" rel="noreferrer">查看活動原始來源</a><button type="button" onClick={onClose}>關閉</button></div></section></div>;
}
