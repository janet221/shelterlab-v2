"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StudentActionProfileForm from "@/app/student/_components/student-action-profile-form";
import {
  ACTION_DATA_EVENT,
  applicationRepository,
  bookmarkRepository,
  decorateOpportunity,
  matchesOpportunityQuery,
  opportunityRepository,
  organizationRepository,
  preferenceRepository,
  studentActionProfileRepository,
} from "@/lib/action-opportunities/browser-repository";
import { ELIGIBILITY_PRIORITY, canSubmitIndividualApplication, eligibilityActionLabel, eligibilityLabel, evaluateActivityEligibility, primaryEligibilityRuleLabel } from "@/lib/action-opportunities/eligibility";
import {
  DEFAULT_ACTION_PREFERENCES,
  OPPORTUNITY_CATEGORY_LABELS,
  OPPORTUNITY_SOURCE_LABELS,
  OPPORTUNITY_STATUS_LABELS,
  MANAGEMENT_MODE_LABELS,
  SCHOOL_LEVEL_LABELS,
  SKILL_LABELS,
  VERIFICATION_LEVEL_LABELS,
  type ActionOpportunity,
  type ActionPreferences,
  type OpportunityCategory,
  type SchoolLevel,
  type StudentActionProfile,
} from "@/lib/action-opportunities/types";
import { TAIWAN_COUNTIES, type OrganizationType, type SkillTag } from "@/lib/action-opportunities/types";
import styles from "./opportunities.module.css";

const OpportunityMap=dynamic(()=>import("./opportunity-map"),{ssr:false});
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
  const [bookmarks,setBookmarks]=useState<string[]>([]);
  const [preferences,setPreferences]=useState<ActionPreferences>(DEFAULT_ACTION_PREFERENCES);
  const [profile,setProfile]=useState<StudentActionProfile>(()=>studentActionProfileRepository.get());
  const [query,setQuery]=useState("");
  const [history,setHistory]=useState(false);
  const [mode,setMode]=useState<"list"|"map">("list");
  const [sort,setSort]=useState("fit");
  const [message,setMessage]=useState("");
  const [city,setCity]=useState("");
  const [district,setDistrict]=useState("");
  const [category,setCategory]=useState("");
  const [skill,setSkill]=useState("");
  const [organizationFilter,setOrganizationFilter]=useState("");
  const [schoolLevel,setSchoolLevel]=useState("");
  const [adultCompanion,setAdultCompanion]=useState("");
  const [dateRange,setDateRange]=useState("all");
  const [serviceHours,setServiceHours]=useState(false);
  const [eligibilityFilter,setEligibilityFilter]=useState("all");
  const [location,setLocation]=useState<{latitude:number;longitude:number}|null>(null);
  const [applying,setApplying]=useState<ActionOpportunity|null>(null);
  const [motivation,setMotivation]=useState("");
  const [learningGoal,setLearningGoal]=useState("");
  const [consent,setConsent]=useState(false);

  const reload=()=>{setItems(opportunityRepository.list());setBookmarks(bookmarkRepository.list());setPreferences(preferenceRepository.get());setProfile(studentActionProfileRepository.get())};
  useEffect(()=>{reload();const id=new URLSearchParams(window.location.search).get("opportunity");if(id)setQuery(id);window.addEventListener(ACTION_DATA_EVENT,reload);return()=>window.removeEventListener(ACTION_DATA_EVENT,reload)},[]);

  const visible=useMemo(()=>items.map(item=>decorateOpportunity(item)).filter(item=>{
    const historical=["expired","closed","full","cancelled"].includes(item.status),organization=organizationRepository.get(item.organizationId);
    if(history?!historical:historical||item.status!=="published")return false;
    if(!matchesOpportunityQuery(item,query)&&item.id!==query)return false;
    if(!matchesOrganizationFilter(organization?.organizationType,item.managementMode,organizationFilter))return false;
    if(city&&item.city!==city&&item.city!=="全國")return false;
    if(district&&!(item.district??item.address).includes(district))return false;
    if(category&&item.category!==category)return false;
    if(skill&&!item.skillsNeeded.includes(skill as SkillTag))return false;
    if(serviceHours&&!item.serviceHoursProvided)return false;
    if(adultCompanion==="yes"&&!item.adultCompanionRequired&&!item.guardianRequired&&!item.teacherRequired)return false;
    if(adultCompanion==="no"&&(item.adultCompanionRequired||item.guardianRequired||item.teacherRequired))return false;
    if(schoolLevel&&item.eligibleSchoolLevels?.length&&!item.eligibleSchoolLevels.includes(schoolLevel as SchoolLevel))return false;
    if(dateRange!=="all"&&item.eventStartAt){const days=(new Date(item.eventStartAt).getTime()-Date.now())/86400000;if(days>Number(dateRange))return false}
    const eligibility=evaluateActivityEligibility(profile,item);
    if(eligibilityFilter==="direct"&&!canSubmitIndividualApplication(eligibility))return false;
    if(eligibilityFilter==="guardian"&&eligibility.result!=="eligible_with_guardian_consent")return false;
    if(eligibilityFilter==="adult"&&eligibility.result!=="eligible_with_adult")return false;
    if(eligibilityFilter==="group"&&eligibility.result!=="school_or_youth_group_only")return false;
    if(eligibilityFilter==="online"&&!item.eligibilityRules?.some(rule=>rule.participationMode==="online_or_campus")&&!item.alternativeActions?.some(action=>["online_action","campus_action"].includes(action.mode)))return false;
    return true;
  }).filter(item=>!location||preferences.maxDistanceKm>=100||distanceKm(location,item)<=preferences.maxDistanceKm||item.participationFormat==="online").sort((a,b)=>{
    if(sort==="new")return new Date(b.publishedAt||0).getTime()-new Date(a.publishedAt||0).getTime();
    if(sort==="deadline")return new Date(a.applicationDeadline||"2999").getTime()-new Date(b.applicationDeadline||"2999").getTime();
    if(sort==="date")return new Date(a.eventStartAt||"2999").getTime()-new Date(b.eventStartAt||"2999").getTime();
    if(sort==="county")return a.city.localeCompare(b.city,"zh-Hant");
    if(sort==="distance"&&location)return distanceKm(location,a)-distanceKm(location,b);
    const eligibilityDifference=ELIGIBILITY_PRIORITY[evaluateActivityEligibility(profile,a).result]-ELIGIBILITY_PRIORITY[evaluateActivityEligibility(profile,b).result];
    if(eligibilityDifference)return eligibilityDifference;
    const countyDifference=Number(b.city===profile.county)-Number(a.city===profile.county);
    if(countyDifference)return countyDifference;
    const eventDifference=new Date(a.eventStartAt||"2999-12-31").getTime()-new Date(b.eventStartAt||"2999-12-31").getTime();
    if(eventDifference)return eventDifference;
    const deadlineDifference=new Date(a.applicationDeadline||"2999-12-31").getTime()-new Date(b.applicationDeadline||"2999-12-31").getTime();
    if(deadlineDifference)return deadlineDifference;
    const skillDifference=profile.skills.filter(skill=>b.skillsNeeded.includes(skill)).length-profile.skills.filter(skill=>a.skillsNeeded.includes(skill)).length;
    if(skillDifference)return skillDifference;
    return new Date(b.publishedAt||b.updatedAt).getTime()-new Date(a.publishedAt||a.updatedAt).getTime();
  }),[items,query,history,city,district,category,skill,organizationFilter,schoolLevel,adultCompanion,dateRange,serviceHours,eligibilityFilter,location,preferences,profile,sort]);

  const updatePreference=<K extends keyof ActionPreferences>(key:K,value:ActionPreferences[K])=>setPreferences(current=>({...current,[key]:value}));
  const savePreferences=()=>{preferenceRepository.save(preferences);setMessage("已儲存條件與技能；系統會用來排序活動，不會自動替你送出申請。")};
  const takeAction=(item:ActionOpportunity)=>{
    const eligibility=evaluateActivityEligibility(profile,item);
    if(!canSubmitIndividualApplication(eligibility)){window.location.href=`/student/opportunities/${item.id}`;return}
    if(item.applicationMode==="internal_application"){setApplying(item);setMotivation("");setLearningGoal(item.learningGoals[0]||"");setConsent(false);return}
    if(item.applicationMode==="information_only"){setMessage("這筆資料僅供查詢，不會在 ShelterLab 內收取個人資料。請依來源說明確認下一步。");return}
    const organization=organizationRepository.get(item.organizationId);
    if(item.applicationMode==="phone_contact"){if(organization?.phone&&organization.phone!=="尚待查核")window.location.href=`tel:${organization.phone.replace(/[^\d+]/g,"")}`;else setMessage("目前沒有可確認的電話，請查看官方來源。");return}
    if(item.applicationMode==="email_contact"){window.location.href=`mailto:${item.contactEmail??""}?subject=${encodeURIComponent(item.title)}`;return}
    window.open(item.sourceUrl,"_blank","noopener,noreferrer");
  };
  const submitApplication=()=>{
    if(!applying)return;
    if(!profile.schoolId||!profile.schoolName)return setMessage("請先在「我的聯絡與行動資料」從官方名錄選擇學校。");
    if(!studentActionProfileRepository.isValidGmail(profile.gmail))return setMessage("請先填寫有效的 Gmail 聯絡信箱。");
    if(!consent)return setMessage("請先確認只把這份申請快照提供給目前選擇的機構。");
    studentActionProfileRepository.save(profile);
    if(profile.age===undefined)return setMessage("請先填寫年齡；系統不會用年級推測資格。");
    const result=applicationRepository.apply(applying,profile.age,{...preferences,age:profile.age,city:profile.county,skills:profile.skills,categories:profile.interests,adultSupport:Boolean(profile.adultCompanionAvailable||profile.schoolParticipationAvailable||profile.youthGroupParticipationAvailable)},{studentProfile:profile,motivation:motivation.trim()||"希望把課程學到的資料判讀轉成安全、可行的行動。",learningGoals:learningGoal.trim()?[learningGoal.trim()]:applying.learningGoals,availableTimes:profile.availableTimes,guardianConsentConfirmed:profile.guardianConsentAvailable??profile.guardianConsent,adultCompanionConfirmed:profile.adultCompanionAvailable??profile.adultSupportAvailable});
    setMessage(result.ok?"已送出站內申請；這個機構會收到本次申請快照，可到行動信箱查看狀態。":result.reason);
    if(result.ok)setApplying(null);
  };
  const requestLocation=()=>{if(!navigator.geolocation)return setMessage("這個瀏覽器不支援定位，仍可使用縣市篩選。");setMessage("正在取得約略位置…");navigator.geolocation.getCurrentPosition(position=>{setLocation({latitude:position.coords.latitude,longitude:position.coords.longitude});setSort("distance");setMessage("已使用本次約略位置排序；位置不會儲存。")},()=>setMessage("無法取得位置，請改用縣市篩選。"),{enableHighAccuracy:false,timeout:8000,maximumAge:300000})};

  return <main className={styles.page}>
    <header className={styles.header}><p>WEEK 06 · 從資料走到行動</p><h1>動保活動布告欄</h1><p>這裡延伸第六週的動保行動機會雷達：地圖上看到的是單位，布告欄呈現的是活動。來源、資格、名額與申請方式會分開標示。</p><div className={styles.actions}><Link className={styles.button} href="/student">返回六週地圖</Link><Link className={`${styles.button} ${styles.primary}`} href="/student/action-inbox">查看行動信箱</Link></div></header>
    <div className={styles.prototype}><strong>同瀏覽器 Prototype：</strong>站內活動、申請與回覆只保存在這台裝置；示範活動不代表真實合作或招募。官方／外部活動會帶你到原始管道，不會在平台內收取個資。</div>

    {applying&&<section className={styles.preferences} role="dialog" aria-modal="true" aria-labelledby="application-title"><h2 id="application-title">申請「{applying.title}」</h2><p>以下資料只會隨這一筆申請提供給「{applying.organizationName}」，不會公開在布告欄或匿名媒合池。</p><div className={styles.preferenceGrid}><label>學生名稱<input value={profile.displayName} readOnly/></label><label>學校<input value={profile.schoolName||"尚未選擇"} readOnly/></label><label>年級<input value={profile.grade||"未填"} readOnly/></label><label>Gmail<input value={profile.gmail||"尚未填寫"} readOnly/></label><label>可參加時間<input value={profile.availableTimes.join("、")||"未填"} readOnly/></label><label>交通方式<input value={profile.transportation.join("、")||"未填"} readOnly/></label></div><label>申請動機<textarea aria-label="申請動機" value={motivation} onChange={event=>setMotivation(event.target.value)} placeholder="說明你為什麼想參與，以及你理解的責任…"/></label><label>學習目標<textarea aria-label="學習目標" value={learningGoal} onChange={event=>setLearningGoal(event.target.value)}/></label><label className={styles.consent}><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)}/>我同意把這份申請快照（包含 Gmail 與學校）提供給目前選擇的機構；ShelterLab 不會自動寄信。</label><div className={styles.actions}><button onClick={()=>setApplying(null)}>取消</button><button className={styles.primary} onClick={submitApplication}>確認送出站內申請</button></div></section>}

    <section className={styles.toolbar}><div className={styles.searchRow}><input aria-label="搜尋行動機會" value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜尋活動、機構、縣市、工作內容或技能"/><select aria-label="排序" value={sort} onChange={event=>setSort(event.target.value)}><option value="fit">最適合我</option><option value="distance">距離最近</option><option value="new">最新上架</option><option value="deadline">截止日最近</option><option value="date">活動日最近</option><option value="county">縣市排序</option></select><button type="button" onClick={requestLocation}>使用約略位置</button><button className={history?"":styles.primary} onClick={()=>setHistory(false)}>目前活動</button><button className={history?styles.primary:""} onClick={()=>setHistory(true)}>歷史活動</button></div>
      <div className={styles.eligibilityFilters} aria-label="參加資格篩選"><button className={eligibilityFilter==="all"?styles.primary:""} onClick={()=>setEligibilityFilter("all")}>查看所有活動</button><button className={eligibilityFilter==="direct"?styles.primary:""} onClick={()=>setEligibilityFilter("direct")}>適合我現在參加</button><button className={eligibilityFilter==="guardian"?styles.primary:""} onClick={()=>setEligibilityFilter("guardian")}>家長同意後可參加</button><button className={eligibilityFilter==="adult"?styles.primary:""} onClick={()=>setEligibilityFilter("adult")}>成人陪同後可參加</button><button className={eligibilityFilter==="group"?styles.primary:""} onClick={()=>setEligibilityFilter("group")}>需要教師或團體帶領</button><button className={eligibilityFilter==="online"?styles.primary:""} onClick={()=>setEligibilityFilter("online")}>線上或校園內可完成</button></div>
      <div className={styles.filters}><label>縣市<select value={city} onChange={event=>setCity(event.target.value)}><option value="">全部縣市</option>{TAIWAN_COUNTIES.map(value=><option key={value}>{value}</option>)}</select></label><label>行政區<input value={district} onChange={event=>setDistrict(event.target.value)} placeholder="例如：板橋區"/></label><label>機構類型<select value={organizationFilter} onChange={event=>setOrganizationFilter(event.target.value)}><option value="">全部</option><option value="government">政府單位</option><option value="public_care">公立收容／動物之家</option><option value="education">教育園區</option><option value="private">民間動保團體</option><option value="rescue">救援／中途組織</option><option value="partner">已進駐平台</option></select></label><label>活動類型<select value={category} onChange={event=>setCategory(event.target.value)}><option value="">全部活動</option>{Object.entries(OPPORTUNITY_CATEGORY_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>技能<select value={skill} onChange={event=>setSkill(event.target.value)}><option value="">全部技能</option>{Object.entries(SKILL_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>學校階段<select value={schoolLevel} onChange={event=>setSchoolLevel(event.target.value)}><option value="">全部階段</option>{Object.entries(SCHOOL_LEVEL_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>成人陪同<select value={adultCompanion} onChange={event=>setAdultCompanion(event.target.value)}><option value="">不限</option><option value="yes">需要陪同</option><option value="no">不要求陪同</option></select></label><label>活動日期<select value={dateRange} onChange={event=>setDateRange(event.target.value)}><option value="all">不限日期</option><option value="7">七天內</option><option value="30">一個月內</option></select></label><label>服務時數<select value={serviceHours?"yes":""} onChange={event=>setServiceHours(event.target.value==="yes")}><option value="">不限</option><option value="yes">提供時數</option></select></label></div>
    </section>

    <details className={styles.preferences}><summary><strong>我的條件、學校與聯絡資料</strong>（用於排序；只有主動申請時才提供聯絡資料）</summary><StudentActionProfileForm profile={profile} onChange={next=>{setProfile(next);setPreferences(current=>({...current,age:next.age??current.age,city:next.county||current.city,skills:next.skills,categories:next.interests,adultSupport:next.adultSupportAvailable}))}} compact/><hr/><div className={styles.preferenceGrid}><label>偏好縣市<select value={preferences.city} onChange={event=>updatePreference("city",event.target.value)}>{TAIWAN_COUNTIES.map(value=><option key={value}>{value}</option>)}</select></label><label>搜尋距離<select value={preferences.maxDistanceKm} onChange={event=>updatePreference("maxDistanceKm",Number(event.target.value))}><option value="5">5 公里</option><option value="15">15 公里</option><option value="30">30 公里</option><option value="100">不限距離</option></select></label><label>需要服務時數<select value={preferences.needsServiceHours?"yes":"no"} onChange={event=>updatePreference("needsServiceHours",event.target.value==="yes")}><option value="no">不一定</option><option value="yes">需要</option></select></label></div><p><strong>感興趣的活動</strong></p><div className={styles.tags}>{Object.entries(OPPORTUNITY_CATEGORY_LABELS).map(([value,label])=><button type="button" key={value} className={preferences.categories.includes(value as OpportunityCategory)?styles.primary:""} onClick={()=>updatePreference("categories",preferences.categories.includes(value as OpportunityCategory)?preferences.categories.filter(item=>item!==value):[...preferences.categories,value as OpportunityCategory])}>{label}</button>)}</div><p><strong>我擁有的技能</strong></p><div className={styles.tags}>{Object.entries(SKILL_LABELS).map(([value,label])=><button type="button" key={value} className={preferences.skills.includes(value as SkillTag)?styles.primary:""} onClick={()=>updatePreference("skills",preferences.skills.includes(value as SkillTag)?preferences.skills.filter(item=>item!==value):[...preferences.skills,value as SkillTag])}>{label}</button>)}</div><div className={styles.actions}><button className={styles.primary} onClick={savePreferences}>儲存排序條件</button><button onClick={()=>{preferenceRepository.save(preferences);applicationRepository.createOpenMatching(preferences);setMessage("已建立匿名媒合條件；機構只會看到年齡層、縣市、時間與技能，不會看到 Gmail 或學校。")}}>開放匿名媒合</button><button onClick={()=>{const organization=organizationRepository.partnerManaged()[0];if(!organization)return setMessage("目前沒有可接收站內參訪需求的合作單位。");applicationRepository.createVisitRequest(organization.id,"希望由教師協助洽詢團體參訪。",preferences);setMessage("已建立參訪需求；可到行動信箱查看狀態。")}}>提出參訪需求</button></div></details>

    {message&&<p className={`${styles.prototype} ${styles.status}`} role="status">{message}</p>}
    <section className={styles.results}><div className={styles.resultsHeader}><div><h2>{history?"歷史活動":"目前可查詢的活動"}</h2><p>{visible.length} 筆。官方資料、外部公告與平台合作活動會清楚分開。</p></div><div className={styles.modeSwitch}><button className={mode==="list"?styles.primary:""} onClick={()=>setMode("list")}>卡片列表</button><button className={mode==="map"?styles.primary:""} onClick={()=>setMode("map")}>查看地圖</button></div></div>
      {mode==="map"?<OpportunityMap items={visible} onSelect={id=>{setQuery(id);setMode("list")}}/>:<div className={styles.grid}>{visible.map(item=><StudentOpportunityCard key={item.id} item={item} profile={profile} history={history} bookmarked={bookmarks.includes(item.id)} distance={location?distanceKm(location,item):null} onBookmark={()=>{bookmarkRepository.toggle(item);setBookmarks(bookmarkRepository.list())}} onAction={()=>takeAction(item)}/>)}</div>}
      {visible.length===0&&<div className={styles.empty}>沒有符合條件的活動。請調整篩選，或切換「歷史活動」。</div>}
    </section>
  </main>;
}

function StudentOpportunityCard({item,profile,history,bookmarked,distance,onBookmark,onAction}:{item:ReturnType<typeof decorateOpportunity>;profile:StudentActionProfile;history:boolean;bookmarked:boolean;distance:number|null;onBookmark:()=>void;onAction:()=>void}){
  const eligibility=evaluateActivityEligibility(profile,item),organization=organizationRepository.get(item.organizationId),sourceLabel=item.sourceLayer==="demo"?"展示資料":OPPORTUNITY_SOURCE_LABELS[item.sourceType];
  const tone=eligibility.result==="eligible_directly"?styles.eligibilityGood:["eligible_with_guardian_consent","eligible_with_adult"].includes(eligibility.result)?styles.eligibilityPrepare:eligibility.result==="school_or_youth_group_only"?styles.eligibilityGroup:styles.eligibilityMuted;
  return <article className={`${styles.card} ${history?styles.history:""}`}><div className={styles.badges}>{item.badges.map(value=><span className={`${styles.badge} ${styles.hot}`} key={value}>{value}</span>)}<span className={`${styles.badge} ${tone}`}>{eligibilityLabel(eligibility)}</span><span className={styles.badge}>{sourceLabel}</span><span className={styles.badge}>{MANAGEMENT_MODE_LABELS[item.managementMode]}</span><span className={styles.badge}>{OPPORTUNITY_STATUS_LABELS[item.status]}</span></div><h2>{item.title}</h2><p><strong>{item.organizationName}</strong></p>{organization&&<p>{VERIFICATION_LEVEL_LABELS[organization.verificationLevel]} · 最後查核 {formatDate(organization.verifiedAt)}</p>}<p>{item.summary||item.description}</p><dl><div><dt>縣市／地點</dt><dd>{item.city}{item.district?` ${item.district}`:""} · {distance!==null&&Number.isFinite(distance)?`約 ${distance.toFixed(1)} 公里`:item.address}</dd></div><div><dt>活動日期</dt><dd>{formatDate(item.eventStartAt)}～{formatDate(item.eventEndAt)}</dd></div><div><dt>報名截止</dt><dd>{formatDate(item.applicationDeadline)}</dd></div><div><dt>剩餘名額</dt><dd>{item.remainingCapacity===undefined?"需洽詢":`${item.remainingCapacity}／${item.capacity}`}</dd></div><div><dt>主要資格</dt><dd>{primaryEligibilityRuleLabel(item)}</dd></div><div><dt>下一步</dt><dd>{eligibility.requiredActions.join("、")||"可查看完整說明後申請"}</dd></div><div><dt>技能</dt><dd>{item.skillsNeeded.map(value=>SKILL_LABELS[value]).join("、")||"不限"}</dd></div></dl>{eligibility.result==="eligibility_unknown"&&<p className={styles.warning}>年齡資格尚未確認，申請前請先聯絡機構。</p>}{["alternative_action_only","not_eligible"].includes(eligibility.result)&&<p className={styles.warning}>{eligibility.reasons[0]}仍可查看替代行動，不會隱藏活動資訊。</p>}{organization?.verificationLevel==="pending_verification"&&<p className={styles.warning}>申請前請向單位確認；目前不提供站內申請，也不收取個人資料。</p>}<div className={styles.tags}>{item.workItems.map(value=><span className={styles.tag} key={value}>{value}</span>)}</div><div className={styles.actions}><Link className={styles.button} href={`/student/opportunities/${item.id}`}>查看活動詳情</Link><button onClick={onBookmark}>{bookmarked?"已收藏":"收藏"}</button><button className={canSubmitIndividualApplication(eligibility)?styles.primary:""} disabled={item.status!=="published"} onClick={onAction}>{eligibilityActionLabel(eligibility)}</button></div></article>;
}
