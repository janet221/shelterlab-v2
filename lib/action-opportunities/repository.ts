"use client";

export {
  areSafetyAnswersCorrect,
  buildContactDrafts,
  createWeekSixDraft,
  dedupeActionOrganizations,
  filterActionMatches,
  haversineDistanceKm,
  matchActionOrganizations,
  normalizeCountyName,
  parseWeekSixDraft,
  requiredComparisonCount,
  roleSummary
} from "@/lib/week-six-action";

import { FALLBACK_ACTION_ORGANIZATIONS } from "@/data/action-organizations";
import { PROTOTYPE_PARTNER_ORGANIZATIONS } from "@/data/action-partner-organizations";
import { createPrototypeOpportunities } from "@/data/action-opportunities";
import type { ActionOrganization, SkillTag, TravelAbility } from "@/lib/week-six-action";
import { canSubmitIndividualApplication, evaluateActivityEligibility, normalizeEligibilityRules, validateEligibilityForPublishing } from "./eligibility";
import {
  DEFAULT_ACTION_PREFERENCES,
  type ActionNotification,
  type ActionOpportunity,
  type ActionPreferences,
  type ActivityResult,
  type ApplicationProfileSnapshot,
  type ApplicationEmailDecision,
  type OrganizationRegistration,
  type ApplicationStatus,
  type MatchInvitation,
  type OpportunityApplication,
  type OpportunityStatus,
  type SavedSearch,
  type StudentActionProfile,
  type StudentMatchProfile,
  type StructuredMessage,
  type VisitProgram,
  type VisitRequest,
  type VisitRequestStatus,
} from "./types";

const KEYS = {
  organizations:"shelterlab-action-organizations-v2",
  currentOrganization:"shelterlab-current-partner-organization-v1",
  opportunitySchema:"shelterlab-action-opportunities-schema-v4",
  opportunities:"shelterlab-action-opportunities-v1",
  preferences:"shelterlab-action-preferences-v1",
  searches:"shelterlab-action-searches-v1",
  notifications:"shelterlab-action-notifications-v1",
  applications:"shelterlab-action-applications-v2",
  legacyApplications:"shelterlab-action-applications-v1",
  matchProfiles:"shelterlab-student-match-profiles-v1",
  invitations:"shelterlab-match-invitations-v1",
  visitPrograms:"shelterlab-visit-programs-v1",
  visitRequests:"shelterlab-visit-requests-v1",
  messages:"shelterlab-action-messages-v1",
  activityResults:"shelterlab-activity-results-v1",
  bookmarks:"shelterlab-action-bookmarks-v1",
  studentActionProfile:"shelterlab-student-action-profile-v1",
  organizationRegistrations:"shelterlab-organization-registrations-v1",
};

export const ACTION_DATA_EVENT = "shelterlab-action-data-changed";
export const DEMO_NOTICE = "展示資料，非真實合作或招募。";
const nowIso = () => new Date().toISOString();
const id = (prefix:string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const hasWindow = () => typeof window !== "undefined";
const read = <T,>(key:string,fallback:T):T => {
  if(!hasWindow()) return fallback;
  try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
};
const emit = () => { if(hasWindow()) window.dispatchEvent(new Event(ACTION_DATA_EVENT)); };
const write = <T,>(key:string,value:T) => { if(hasWindow()) localStorage.setItem(key,JSON.stringify(value)); emit(); return value; };
const normalizedName = (value:string) => value.normalize("NFKC").toLowerCase().replace(/[\s　()（）·．。、-]/g,"");
const ageBand = (age:number) => age < 15 ? "12–14 歲" : age < 18 ? "15–17 歲" : "18 歲以上";

const seedOrganizations = () => [...FALLBACK_ACTION_ORGANIZATIONS,...PROTOTYPE_PARTNER_ORGANIZATIONS];
function ensureOrganizations(){
  const seeds=seedOrganizations();
  const existing=read<ActionOrganization[]>(KEYS.organizations,[]);
  const byId=new Map(seeds.map(item=>[item.id,item]));
  for(const item of existing) byId.set(item.id,{...byId.get(item.id),...item});
  const merged=[...byId.values()];
  if(hasWindow() && JSON.stringify(existing)!==JSON.stringify(merged)) write(KEYS.organizations,merged);
  return merged;
}

export const organizationRepository = {
  list(){ return ensureOrganizations(); },
  get(organizationId:string){ return ensureOrganizations().find(item=>item.id===organizationId); },
  findByName(name:string){ const key=normalizedName(name); return ensureOrganizations().find(item=>normalizedName(item.name)===key); },
  partnerManaged(){ return ensureOrganizations().filter(item=>item.managementMode==="partner_managed" && item.verificationLevel==="official_partnership"); },
  save(item:ActionOrganization){
    const items=ensureOrganizations(), index=items.findIndex(value=>value.id===item.id);
    if(index>=0) items[index]=item; else items.unshift(item);
    return write(KEYS.organizations,items);
  },
  upsertMany(values:ActionOrganization[]){
    const byId=new Map(ensureOrganizations().map(item=>[item.id,item]));
    for(const item of values){ const existing=byId.get(item.id); byId.set(item.id,existing?.managementMode==="partner_managed"?{...item,...existing}:item); }
    return write(KEYS.organizations,[...byId.values()]);
  },
  currentPartnerId(){
    const available=this.partnerManaged(), saved=read<string>(KEYS.currentOrganization,"");
    return available.some(item=>item.id===saved) ? saved : (available[0]?.id??"");
  },
  setCurrentPartnerId(organizationId:string){
    if(!this.partnerManaged().some(item=>item.id===organizationId)) return false;
    write(KEYS.currentOrganization,organizationId); return true;
  },
};

export const organizationRegistrationRepository = {
  list(){ return read<OrganizationRegistration[]>(KEYS.organizationRegistrations,[]); },
  submit(input:Omit<OrganizationRegistration,"id"|"verificationStatus"|"submittedAt"|"updatedAt">){
    const now=nowIso();
    const item:OrganizationRegistration={...input,id:id("organization-registration"),verificationStatus:"pending",submittedAt:now,updatedAt:now};
    write(KEYS.organizationRegistrations,[item,...this.list()]);
    return item;
  },
  latest(){ return this.list()[0]??null; },
};

export function deriveOpportunityStatus(item:ActionOpportunity,now=new Date()):OpportunityStatus {
  if(["draft","pending_review","closed","suspended","cancelled"].includes(item.status)) return item.status;
  if(item.applicationDeadline && new Date(item.applicationDeadline)<now) return "expired";
  if(item.eventEndAt && new Date(item.eventEndAt)<now) return "expired";
  if(item.capacity!==undefined && (item.remainingCapacity??0)<=0) return "full";
  return "published";
}

const skillCode=(label:string):SkillTag => {
  if(/攝影|影像/.test(label)) return "photo_video";
  if(/設計/.test(label)) return "graphic_design";
  if(/文字|社群|寫作/.test(label)) return "writing_social";
  if(/資料|分析/.test(label)) return "data_analysis";
  if(/企劃|活動/.test(label)) return "event_planning";
  if(/分類|物資/.test(label)) return "sorting";
  if(/照護|犬|貓/.test(label)) return "animal_care";
  return "recommend";
};

function normalizeOpportunity(input:ActionOpportunity):ActionOpportunity {
  const organization=(input.organizationId ? organizationRepository.get(input.organizationId) : organizationRepository.findByName(input.organizationName))
    ?? (input.sourceType==="partner_submitted" ? organizationRepository.partnerManaged()[0] : undefined);
  const managementMode=input.managementMode ?? organization?.managementMode ?? "platform_curated";
  const safeInternal=managementMode==="partner_managed" && organization?.verificationLevel==="official_partnership";
  const applicationMode=input.applicationMode ?? (safeInternal ? "internal_application" : input.sourceType==="official" ? "official_website" : "information_only");
  const sourceLayer=input.sourceLayer ?? (input.isDemo||organization?.isDemo ? "demo" : input.sourceType==="official" ? "official_announcement" : input.sourceType==="partner_submitted" ? "platform_partner" : "demo");
  const eligibilityRules=normalizeEligibilityRules(input);
  return {
    ...input,
    organizationId:organization?.id ?? input.organizationId ?? `unlinked-${normalizedName(input.organizationName)}`,
    organizationName:organization?.name ?? input.organizationName,
    organizationUrl:organization?.officialUrl ?? input.organizationUrl,
    managementMode,
    sourceLayer,
    applicationMode:safeInternal ? applicationMode : applicationMode==="internal_application" ? "information_only" : applicationMode,
    opportunityTypes:input.opportunityTypes?.length ? input.opportunityTypes : [input.category],
    guardianRequired:input.guardianRequired ?? input.guardianConsentRequired ?? false,
    guardianConsentRequired:input.guardianConsentRequired ?? input.guardianRequired ?? false,
    skillsNeeded:input.skillsNeeded?.length ? input.skillsNeeded : (input.skills??[]).map(skillCode),
    skills:input.skills??[],
    status:deriveOpportunityStatus(input),
    isDemo:input.isDemo ?? organization?.isDemo ?? false,
    eligibilityRules,
    riskLevel:input.riskLevel??"low",
    eligibilitySourceType:input.eligibilitySourceType??(eligibilityRules.length?(input.sourceType==="partner_submitted"?"organization_submission":input.sourceType==="official"?"official_announcement":"not_confirmed"):"not_confirmed"),
    eligibilitySourceUrl:input.eligibilitySourceUrl??input.sourceUrl,
    eligibilityLastVerifiedAt:input.eligibilityLastVerifiedAt??input.lastVerifiedAt,
    alternativeActions:input.alternativeActions??[],
  };
}

export function decorateOpportunity(item:ActionOpportunity,now=new Date()){
  const normalized=normalizeOpportunity(item), status=deriveOpportunityStatus(normalized,now), published=normalized.publishedAt?new Date(normalized.publishedAt).getTime():0, updated=new Date(normalized.updatedAt).getTime(), deadline=normalized.applicationDeadline?new Date(normalized.applicationDeadline).getTime():0, days=(value:number)=>Math.ceil((value-now.getTime())/86400000);
  return {...normalized,status,badges:[normalized.isDemo?"功能示範":"",published&&days(published)>=-7?"NEW 新上架":"",published&&days(published)<-7&&days(updated)>=-3?"資訊更新":"",deadline&&days(deadline)>=0&&days(deadline)<=3?"即將截止":""].filter(Boolean)};
}

export function dedupeOpportunities(items:ActionOpportunity[]){
  const seen=new Map<string,ActionOpportunity>();
  for(const raw of items){
    const item=normalizeOpportunity(raw), key=[item.organizationId,item.title,item.eventStartAt?.slice(0,10)||"",item.address,item.sourceUrl].join("|").toLowerCase(), previous=seen.get(key);
    if(!previous||new Date(item.updatedAt)>new Date(previous.updatedAt)) seen.set(key,item);
  }
  return [...seen.values()];
}

const synonyms:Record<string,string[]>={狗:["犬","犬隻"],貓:["貓咪"],攝影:["影像","照片","拍照"],拍照:["攝影","影像","照片"],志工:["服務","協作"],宣導:["社群","推廣"],參訪:["導覽","教育"]};
export function opportunitySearchText(item:ActionOpportunity){ return [item.organizationName,item.title,item.city,item.description,...item.workItems,...item.skills,...item.learningGoals].join(" ").toLowerCase(); }
export function matchesOpportunityQuery(item:ActionOpportunity,query:string){ const normalized=query.trim().toLowerCase(); if(!normalized)return true; const terms=[normalized,...Object.entries(synonyms).filter(([key])=>normalized.includes(key)).flatMap(([,values])=>values.map(value=>value.toLowerCase()))]; const haystack=opportunitySearchText(item); return terms.some(term=>haystack.includes(term)); }
const eligibilityProfileFromPreferences=(p:ActionPreferences):StudentActionProfile=>({...DEFAULT_STUDENT_ACTION_PROFILE,age:p.age,county:p.city,skills:p.skills,interests:p.categories,guardianConsentAvailable:p.adultSupport,adultCompanionAvailable:p.adultSupport,schoolParticipationAvailable:p.acceptsGroup,youthGroupParticipationAvailable:p.acceptsGroup,acceptsOnlineAction:p.acceptsOnline,acceptsCampusAction:true});
export function matchesPreferences(item:ActionOpportunity,p:ActionPreferences){ const eligibility=evaluateActivityEligibility(eligibilityProfileFromPreferences(p),item);return(item.city===p.city||item.city==="全國")&&!(["not_eligible","eligibility_unknown"].includes(eligibility.result))&&(!p.needsServiceHours||item.serviceHoursProvided)&&(!p.categories.length||p.categories.includes(item.category))&&(!p.skills.length||p.skills.some(skill=>item.skillsNeeded.includes(skill)))&&(p.acceptsOnline||item.participationFormat!=="online")&&(p.acceptsGroup||!item.groupApplication); }
export function opportunityFitScore(item:ActionOpportunity,p:ActionPreferences){ let score=0; const eligibility=evaluateActivityEligibility(eligibilityProfileFromPreferences(p),item);score+={eligible_directly:40,eligible_with_guardian_consent:32,eligible_with_adult:28,school_or_youth_group_only:20,alternative_action_only:8,not_eligible:-40,eligibility_unknown:-15}[eligibility.result]; score+=item.city===p.city?25:item.city==="全國"?15:0; score+=item.weekdays.some(day=>p.weekdays.includes(day))?12:0; score+=item.skillsNeeded.some(skill=>p.skills.includes(skill))?10:0; score+=p.categories.includes(item.category)?10:0; score+=item.remainingCapacity===undefined||item.remainingCapacity>0?5:-30; score+=Math.max(0,7-Math.floor((Date.now()-new Date(item.updatedAt).getTime())/86400000)); return score; }

function ensureOpportunities(){
  const existing=read<ActionOpportunity[]>(KEYS.opportunities,[]), schema=read<string>(KEYS.opportunitySchema,"");
  if(existing.length&&schema==="4"){
    const normalized=dedupeOpportunities(existing);
    if(hasWindow()&&JSON.stringify(existing)!==JSON.stringify(normalized))write(KEYS.opportunities,normalized);
    return normalized;
  }
  const seeds=createPrototypeOpportunities(), seedIds=new Set(seeds.map(item=>item.id));
  const normalized=dedupeOpportunities([...seeds,...existing.filter(item=>!seedIds.has(item.id))]);
  if(hasWindow()){write(KEYS.opportunitySchema,"4");write(KEYS.opportunities,normalized);}
  return normalized;
}

export const opportunityRepository = {
  list(){ return ensureOpportunities().map(item=>({...item,status:deriveOpportunityStatus(item)})); },
  get(opportunityId:string){ return this.list().find(item=>item.id===opportunityId); },
  listForOrganization(organizationId:string){ return this.list().filter(item=>item.organizationId===organizationId); },
  save(input:ActionOpportunity){ const item=normalizeOpportunity(input), items=ensureOpportunities(), index=items.findIndex(value=>value.id===item.id), next={...item,updatedAt:nowIso()}; if(index>=0)items[index]=next;else items.unshift(next); write(KEYS.opportunities,items); return next; },
  createDraft(input:Omit<ActionOpportunity,"id"|"status"|"firstSeenAt"|"lastSeenAt"|"lastVerifiedAt"|"updatedAt">){ const now=nowIso(); return this.save({...input,id:id("opportunity"),status:"draft",firstSeenAt:now,lastSeenAt:now,lastVerifiedAt:now,updatedAt:now}); },
  setStatus(opportunityId:string,status:OpportunityStatus){ const item=this.get(opportunityId); if(!item)return null; if(status==="published"&&validateEligibilityForPublishing(item).length)return null; const updated=this.save({...item,status,publishedAt:status==="published"?(item.publishedAt||nowIso()):item.publishedAt}); if(status==="published")notifyPreferenceMatches(updated); return updated; },
  updateSchedule(opportunityId:string,eventStartAt:string,eventEndAt:string){ const item=this.get(opportunityId); if(!item)return null; const updated=this.save({...item,eventStartAt,eventEndAt}); notifyApplicants(updated,"schedule_updated","活動時間已更新","單位已更新活動日期，請重新確認是否能參加。"); return updated; },
  updateCapacity(opportunityId:string,capacity:number,remainingCapacity:number){ const item=this.get(opportunityId); if(!item)return null; const updated=this.save({...item,capacity,remainingCapacity}); notifyApplicants(updated,"opportunity_updated","活動名額已更新",`目前剩餘 ${remainingCapacity}／${capacity} 名。`); return updated; },
  resetPrototype(){ const publicItems=ensureOpportunities().filter(item=>!item.isDemo); return write(KEYS.opportunities,dedupeOpportunities([...createPrototypeOpportunities().filter(item=>item.isDemo),...publicItems])); },
};

export const preferenceRepository = {
  get(){
    if(hasWindow()&&!localStorage.getItem(KEYS.preferences)){
      try{
        const weekSix=JSON.parse(localStorage.getItem("shelterlab-week6-action-draft-v2")||"null");
        if(weekSix?.version===2&&weekSix.profile)return{...DEFAULT_ACTION_PREFERENCES,city:weekSix.profile.county||DEFAULT_ACTION_PREFERENCES.city,age:weekSix.profile.age||DEFAULT_ACTION_PREFERENCES.age,adultSupport:weekSix.profile.adultSupport==="confirmed",skills:Array.isArray(weekSix.profile.skills)?weekSix.profile.skills:[],travelAbility:weekSix.profile.travelAbility||DEFAULT_ACTION_PREFERENCES.travelAbility};
      }catch{}
    }
    return {...DEFAULT_ACTION_PREFERENCES,...read<ActionPreferences>(KEYS.preferences,DEFAULT_ACTION_PREFERENCES)};
  },
  save(value:ActionPreferences){ return write(KEYS.preferences,value); },
  listSearches(){ return read<SavedSearch[]>(KEYS.searches,[]); },
  saveSearch(name:string,query:string,preferences:ActionPreferences){ const next=[{id:id("search"),name,query,preferences,createdAt:nowIso()},...this.listSearches()]; return write(KEYS.searches,next); },
};

const DEFAULT_STUDENT_ACTION_PROFILE:StudentActionProfile={
  studentId:"local-demo-student",displayName:"本機示範學生",age:16,county:"",schoolId:"",schoolName:"",schoolLevel:"senior_high",grade:"",
  gmail:"",skills:[],interests:[],availableTimes:["假日白天"],transportation:["由成人陪同"],guardianConsent:false,adultSupportAvailable:false,
  guardianConsentAvailable:false,adultCompanionAvailable:false,schoolParticipationAvailable:false,youthGroupParticipationAvailable:false,acceptsOnlineAction:true,acceptsCampusAction:true,updatedAt:""
};

export const studentActionProfileRepository = {
  get(){
    const stored=read<Partial<StudentActionProfile>>(KEYS.studentActionProfile,{});
    const preferences=preferenceRepository.get();
    return {...DEFAULT_STUDENT_ACTION_PROFILE,...stored,age:stored.age??preferences.age,county:stored.county||preferences.city,skills:stored.skills??preferences.skills,interests:stored.interests??preferences.categories,adultSupportAvailable:stored.adultSupportAvailable??preferences.adultSupport,updatedAt:stored.updatedAt||nowIso()};
  },
  save(value:StudentActionProfile){ return write(KEYS.studentActionProfile,{...value,updatedAt:nowIso()}); },
  isValidGmail(value:string){ return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i.test(value.trim()); },
};

export const notificationRepository = {
  list(){ return read<ActionNotification[]>(KEYS.notifications,[]); },
  add(input:Omit<ActionNotification,"id"|"createdAt"|"read"|"saved"|"archived">){ const item={...input,id:id("notice"),createdAt:nowIso(),read:false,saved:false,archived:false}; return write(KEYS.notifications,[item,...this.list()]); },
  markRead(notificationId:string,readValue=true){ return write(KEYS.notifications,this.list().map(item=>item.id===notificationId?{...item,read:readValue}:item)); },
  markAllRead(){ return write(KEYS.notifications,this.list().map(item=>({...item,read:true}))); },
  toggleSaved(notificationId:string){ return write(KEYS.notifications,this.list().map(item=>item.id===notificationId?{...item,saved:!item.saved}:item)); },
  archive(notificationId:string){ return write(KEYS.notifications,this.list().map(item=>item.id===notificationId?{...item,archived:true}:item)); },
  reset(){ return write(KEYS.notifications,[]); },
};

export const bookmarkRepository = {
  list(){ return read<string[]>(KEYS.bookmarks,[]); },
  toggle(opportunity:ActionOpportunity){
    const current=this.list(),saved=current.includes(opportunity.id),next=saved?current.filter(value=>value!==opportunity.id):[opportunity.id,...current];
    write(KEYS.bookmarks,next);
    if(!saved&&opportunity.applicationDeadline){const days=Math.ceil((new Date(opportunity.applicationDeadline).getTime()-Date.now())/86400000);if(days>=0&&days<=3)notificationRepository.add({category:"reminder",kind:"deadline_soon",title:"收藏的機會即將截止",summary:`${opportunity.title} 將在 ${days} 天內截止。`,source:opportunity.organizationName,opportunityId:opportunity.id,actionLabel:"查看活動",actionHref:`/student/opportunities?opportunity=${opportunity.id}`});}
    return next;
  },
};

function snapshot(p:ActionPreferences,studentActionProfile?:StudentActionProfile):ApplicationProfileSnapshot { return {city:p.city,age:p.age,weekdays:p.weekdays,timeSlots:p.timeSlots,adultSupport:p.adultSupport,skills:p.skills,acceptsOnline:p.acceptsOnline,acceptsGroup:p.acceptsGroup,travelAbility:p.travelAbility??"guardian_accompanied",actionPreferences:p.categories,studentActionProfile}; }
function normalizeApplication(raw:Partial<OpportunityApplication> & Record<string,unknown>):OpportunityApplication|null {
  if(!raw.opportunityId||!raw.organizationId) return null;
  const createdAt=typeof raw.createdAt==="string"?raw.createdAt:nowIso(), age=Number(raw.age||16), oldStatus=String(raw.status||"submitted"), status=(oldStatus==="teacher_confirmation"?"needs_teacher_confirmation":oldStatus) as ApplicationStatus;
  const profile={...snapshot(DEFAULT_ACTION_PREFERENCES),...(raw.profileSnapshot as Partial<ApplicationProfileSnapshot>||{}),age};
  return {
    id:String(raw.id||id("application")),kind:raw.kind==="matching_invitation"?"matching_invitation":"direct_application",opportunityId:String(raw.opportunityId),organizationId:String(raw.organizationId),
    studentId:String(raw.studentId||"local-demo-student"),studentLabel:String(raw.studentLabel||"本機示範學生"),age,ageBand:String(raw.ageBand||ageBand(age)),profileSnapshot:profile,
    teacherConfirmationStatus:raw.teacherConfirmationStatus??(status==="needs_teacher_confirmation"?"pending":"not_required"),motivation:String(raw.motivation||"希望把課程學到的資料判讀轉成安全、可行的行動。"),
    learningGoals:Array.isArray(raw.learningGoals)?raw.learningGoals as string[]:[],status,statusHistory:Array.isArray(raw.statusHistory)?raw.statusHistory:[{status,note:String(raw.note||""),changedAt:createdAt,changedBy:"system"}],
    createdAt,updatedAt:typeof raw.updatedAt==="string"?raw.updatedAt:createdAt,meetingInfo:typeof raw.meetingInfo==="string"?raw.meetingInfo:undefined,note:typeof raw.note==="string"?raw.note:undefined,serviceHours:typeof raw.serviceHours==="number"?raw.serviceHours:undefined,
  };
}
function ensureApplications(){
  const current=read<Array<Partial<OpportunityApplication>&Record<string,unknown>>>(KEYS.applications,[]);
  const legacy=read<Array<Partial<OpportunityApplication>&Record<string,unknown>>>(KEYS.legacyApplications,[]);
  const merged=[...legacy,...current].map(normalizeApplication).filter((item):item is OpportunityApplication=>Boolean(item));
  const byId=[...new Map(merged.map(item=>[item.id,item])).values()];
  if(hasWindow()&&JSON.stringify(current)!==JSON.stringify(byId))write(KEYS.applications,byId);
  return byId;
}

export const messageRepository = {
  list(){ return read<StructuredMessage[]>(KEYS.messages,[]); },
  forOrganization(organizationId:string){ return this.list().filter(item=>item.organizationId===organizationId); },
  add(input:Omit<StructuredMessage,"id"|"createdAt"|"read">){ const item={...input,id:id("message"),createdAt:nowIso(),read:false}; return write(KEYS.messages,[item,...this.list()]); },
  markRead(messageId:string){ return write(KEYS.messages,this.list().map(item=>item.id===messageId?{...item,read:true}:item)); },
};

export const applicationRepository = {
  list(){ return ensureApplications(); },
  forOrganization(organizationId:string){ return this.list().filter(item=>item.organizationId===organizationId); },
  apply(item:ActionOpportunity,age:number,preferences={...preferenceRepository.get(),age},options?:{kind?:"direct_application"|"matching_invitation";motivation?:string;learningGoals?:string[];studentProfile?:StudentActionProfile;availableTimes?:string[];guardianConsentConfirmed?:boolean;adultCompanionConfirmed?:boolean}){
    const studentProfile=options?.studentProfile??studentActionProfileRepository.get();
    const latest=opportunityRepository.get(item.id); if(!latest)return{ok:false as const,reason:"活動資料已更新或不存在，請重新整理後再試。"};
    const organization=organizationRepository.get(latest.organizationId),status=deriveOpportunityStatus(latest);
    if(latest.applicationMode!=="internal_application"||latest.managementMode!=="partner_managed"||organization?.verificationLevel!=="official_partnership") return {ok:false as const,reason:"這個機會不是站內申請；請使用卡片標示的官方或外部管道。"};
    if(status!=="published"||(latest.remainingCapacity??1)<=0)return{ok:false as const,reason:"此機會目前無法申請。"};
    const checkedProfile={...studentProfile,age,guardianConsentAvailable:options?.guardianConsentConfirmed??studentProfile.guardianConsentAvailable??studentProfile.guardianConsent,adultCompanionAvailable:options?.adultCompanionConfirmed??studentProfile.adultCompanionAvailable??studentProfile.adultSupportAvailable};
    const eligibility=evaluateActivityEligibility(checkedProfile,latest);
    if(!canSubmitIndividualApplication(eligibility))return{ok:false as const,reason:[...eligibility.reasons,...eligibility.requiredActions].join(" ")||"目前不能使用個人站內申請。"};
    const teacherPending=latest.teacherRequired||age<18&&!preferences.adultSupport,applicationStatus:ApplicationStatus=teacherPending?"needs_teacher_confirmation":"submitted",now=nowIso();
    const application:OpportunityApplication={id:id("application"),kind:options?.kind??"direct_application",opportunityId:latest.id,organizationId:latest.organizationId,studentId:checkedProfile.studentId,studentLabel:checkedProfile.displayName,age,ageBand:ageBand(age),profileSnapshot:snapshot({...preferences,age},checkedProfile),teacherConfirmationStatus:teacherPending?"pending":"not_required",motivation:options?.motivation??"希望把課程學到的資料判讀轉成安全、可行的行動。",learningGoals:options?.learningGoals??latest.learningGoals,status:applicationStatus,statusHistory:[{status:applicationStatus,note:"學生送出申請；系統已依最新活動規則重新檢查資格。",changedAt:now,changedBy:"student"}],createdAt:now,updatedAt:now,availableTimes:options?.availableTimes??checkedProfile.availableTimes,guardianConsentConfirmed:options?.guardianConsentConfirmed??checkedProfile.guardianConsentAvailable??checkedProfile.guardianConsent,adultCompanionConfirmed:options?.adultCompanionConfirmed??checkedProfile.adultCompanionAvailable??checkedProfile.adultSupportAvailable};
    write(KEYS.applications,[application,...this.list()]);
    messageRepository.add({organizationId:latest.organizationId,applicationId:application.id,type:"status_update",recipient:"organization",content:`收到「${latest.title}」的新申請。`});
    notificationRepository.add({category:"application",kind:application.status==="needs_teacher_confirmation"?"teacher_confirmation":"application_submitted",title:application.status==="needs_teacher_confirmation"?"此活動需要教師確認":"申請已送出",summary:`${latest.organizationName} 的「${latest.title}」已建立站內申請紀錄。`,source:"ShelterLab 行動申請",opportunityId:latest.id,applicationId:application.id,actionLabel:"查看申請進度",actionHref:`/student/action-inbox?application=${application.id}`});
    if(teacherPending)messageRepository.add({organizationId:latest.organizationId,applicationId:application.id,type:"teacher_notice",recipient:"teacher",content:"未成年或團體參與需要教師／家長確認，請協助檢視資格與安全條件。"});
    return{ok:true as const,application};
  },
  updateStatus(applicationId:string,status:ApplicationStatus,note="",meetingInfo=""){
    const applications=this.list(),current=applications.find(item=>item.id===applicationId); if(!current)return null;
    const changedAt=nowIso(),updated={...current,status,note,meetingInfo,teacherConfirmationStatus:status==="needs_teacher_confirmation"?"pending":current.teacherConfirmationStatus,statusHistory:[...current.statusHistory,{status,note,changedAt,changedBy:"organization" as const}],updatedAt:changedAt};
    write(KEYS.applications,applications.map(item=>item.id===applicationId?updated:item));
    const opportunity=opportunityRepository.get(current.opportunityId),organization=organizationRepository.get(current.organizationId);
    const config:Partial<Record<ApplicationStatus,[ActionNotification["kind"],string,string]>>={viewed:["application_submitted","機構已查看申請","查看申請進度"],reviewing:["application_submitted","單位已開始審核","查看申請進度"],under_review:["application_submitted","單位已開始審核","查看申請進度"],accepted:["application_accepted","單位已錄取申請","查看集合資訊"],waitlisted:["waitlisted","申請進入候補","查看申請進度"],needs_information:["needs_information","單位要求補充資料","查看需要補充的內容"],needs_teacher_confirmation:["teacher_confirmation","此活動需要教師確認","查看確認事項"],rejected:["declined","單位未錄取申請","查看說明"],declined:["declined","單位未錄取申請","查看說明"],scheduled:["safety_reminder","行前安全提醒","查看集合資訊"],cancelled:["cancelled","活動已取消","查看通知"],completed:["reflection_reminder","活動完成，請留下反思","前往第六週反思"]};
    const selected=config[status];
    if(selected)notificationRepository.add({category:status==="scheduled"?"reminder":"application",kind:selected[0],title:selected[1],summary:note||meetingInfo||`${opportunity?.title??"參與需求"}的狀態已更新。`,source:opportunity?.organizationName??organization?.name??"合作單位",opportunityId:opportunity?.id,applicationId:current.id,actionLabel:selected[2],actionHref:status==="completed"?"/student/week/6":"/student/action-inbox"});
    messageRepository.add({organizationId:current.organizationId,applicationId:current.id,type:status==="needs_information"?"information_request":status==="scheduled"?"meeting":"status_update",recipient:"student",content:note||meetingInfo||`申請狀態更新為 ${status}。`});
    if(status==="needs_teacher_confirmation")messageRepository.add({organizationId:current.organizationId,applicationId:current.id,type:"teacher_notice",recipient:"teacher",content:note||"請教師確認學生的參與資格與安全安排。"});
    if(status==="completed"&&opportunity)syncWeekSixCompletion(opportunity);
    return updated;
  },
  addServiceRecord(applicationId:string,note:string,hours?:number){
    const current=this.list().find(item=>item.id===applicationId); if(!current)return null;
    const result=activityResultRepository.add({organizationId:current.organizationId,opportunityId:current.opportunityId,applicationId:current.id,serviceHours:hours??0,tasksCompleted:["由合作單位確認完成"],partnerNote:note});
    const updated={...current,note,serviceHours:result.serviceHours,updatedAt:nowIso()}; write(KEYS.applications,this.list().map(item=>item.id===applicationId?updated:item));
    notificationRepository.add({category:"application",kind:"service_record_updated",title:"服務成果已更新",summary:note,source:"合作單位",opportunityId:current.opportunityId,applicationId:current.id,actionLabel:"查看行動紀錄",actionHref:"/student/action-inbox"}); return updated;
  },
  // Compatibility aliases for the existing student UI. New code uses the dedicated repositories below.
  createOpenMatching(preferences=preferenceRepository.get()){ return studentMatchProfileRepository.optIn(preferences); },
  openMatchingPool(){ return studentMatchProfileRepository.listOptedIn(); },
  createVisitRequest(organizationId:string,note:string,preferences=preferenceRepository.get()){
    const program=visitProgramRepository.forOrganization(organizationId).find(item=>item.status==="published")??visitProgramRepository.ensureDemoForOrganization(organizationId);
    if(!program)return null;
    return visitRequestRepository.create({visitProgramId:program.id,organizationId,studentId:studentActionProfileRepository.get().studentId,requesterRole:"student",requestedDate:program.availableDates[0]??"待協調",participantCount:preferences.acceptsGroup?20:1,note});
  },
};

export const studentMatchProfileRepository = {
  list(){
    const current=read<StudentMatchProfile[]>(KEYS.matchProfiles,[]);
    if(current.length)return current;
    const legacy=read<Array<Record<string,unknown>>>(KEYS.legacyApplications,[]).filter(item=>item.kind==="open_matching");
    if(!legacy.length)return current;
    const migrated=legacy.map(raw=>{const profile=(raw.profileSnapshot??{}) as Partial<ApplicationProfileSnapshot>,createdAt=String(raw.createdAt||nowIso()),age=Number(raw.age||profile.age||16);return{id:String(raw.id||id("match-profile")),studentId:"local-demo-student",displayName:"匿名學生",ageBand:ageBand(age),age,city:profile.city??"",weekdays:profile.weekdays??[],timeSlots:profile.timeSlots??[],travelAbility:profile.travelAbility??"guardian_accompanied" as TravelAbility,skills:profile.skills??[],actionPreferences:profile.actionPreferences??[],teacherConfirmationStatus:age<18?"pending" as const:"not_required" as const,optedIn:true,createdAt,updatedAt:String(raw.updatedAt||createdAt)};});
    return write(KEYS.matchProfiles,migrated);
  },
  listOptedIn(){ return this.list().filter(item=>item.optedIn); },
  get(profileId:string){ return this.list().find(item=>item.id===profileId); },
  optIn(preferences=preferenceRepository.get()){
    const studentId=studentActionProfileRepository.get().studentId,existing=this.list().find(item=>item.studentId===studentId),now=nowIso();
    const profile:StudentMatchProfile={id:existing?.id??id("match-profile"),studentId,displayName:"匿名學生",ageBand:ageBand(preferences.age),age:preferences.age,city:preferences.city,weekdays:preferences.weekdays,timeSlots:preferences.timeSlots,travelAbility:preferences.travelAbility??"guardian_accompanied",skills:preferences.skills,actionPreferences:preferences.categories,teacherConfirmationStatus:preferences.age<18?"pending":"not_required",optedIn:true,createdAt:existing?.createdAt??now,updatedAt:now};
    const next=[profile,...this.list().filter(item=>item.id!==profile.id)]; return write(KEYS.matchProfiles,next)[0];
  },
  optOut(profileId:string){ return write(KEYS.matchProfiles,this.list().map(item=>item.id===profileId?{...item,optedIn:false,updatedAt:nowIso()}:item)); },
};

export const invitationRepository = {
  list(){ return read<MatchInvitation[]>(KEYS.invitations,[]); },
  forOrganization(organizationId:string){ return this.list().filter(item=>item.organizationId===organizationId); },
  forStudent(studentId="local-demo-student"){ const profiles=new Set(studentMatchProfileRepository.list().filter(item=>item.studentId===studentId).map(item=>item.id)); return this.list().filter(item=>profiles.has(item.studentMatchProfileId)); },
  invite(organizationId:string,profileId:string,opportunityId:string,message:string){
    const opportunity=opportunityRepository.get(opportunityId),profile=studentMatchProfileRepository.get(profileId);
    if(!opportunity||!profile||opportunity.organizationId!==organizationId||!profile.optedIn)return null;
    const now=nowIso(),item:MatchInvitation={id:id("invitation"),organizationId,studentMatchProfileId:profileId,opportunityId,status:"pending",message,createdAt:now,updatedAt:now};
    write(KEYS.invitations,[item,...this.list()]);
    notificationRepository.add({category:"matching",kind:"matching_invitation",title:"收到匿名媒合邀請",summary:`${opportunity.organizationName} 邀請你查看「${opportunity.title}」。`,source:"ShelterLab 匿名媒合",opportunityId,invitationId:item.id,actionLabel:"回覆邀請",actionHref:"/student/action-inbox"});
    return item;
  },
  respond(invitationId:string,response:"accepted"|"declined"){
    const invitation=this.list().find(item=>item.id===invitationId); if(!invitation||invitation.status!=="pending")return null;
    let applicationId:string|undefined;
    if(response==="accepted"){
      const profile=studentMatchProfileRepository.get(invitation.studentMatchProfileId),opportunity=opportunityRepository.get(invitation.opportunityId);
      if(profile&&opportunity){const preferences={...DEFAULT_ACTION_PREFERENCES,city:profile.city,age:profile.age,weekdays:profile.weekdays,timeSlots:profile.timeSlots,skills:profile.skills,categories:profile.actionPreferences,adultSupport:profile.teacherConfirmationStatus==="confirmed",travelAbility:profile.travelAbility};const result=applicationRepository.apply(opportunity,profile.age,preferences,{kind:"matching_invitation",motivation:"我接受單位的匿名媒合邀請，願意進一步確認參與條件。"});if(result.ok)applicationId=result.application.id;}
    }
    const updated={...invitation,status:response,applicationId,updatedAt:nowIso()}; write(KEYS.invitations,this.list().map(item=>item.id===invitationId?updated:item)); return updated;
  },
};

const demoVisitPrograms=():VisitProgram[]=>{
  const now=nowIso(); return organizationRepository.partnerManaged().map((organization,index)=>({id:`visit-program-${organization.id}`,organizationId:organization.id,title:index===2?"動保教育半日參訪（功能示範）":"認識動保工作的團體參訪（功能示範）",programType:"life_education",gradeBands:["國中","高中"],capacity:30,durationMinutes:120,learningGoals:["理解單位工作","練習安全提問"],preTasks:["閱讀公開資料","完成行前問題單"],itinerary:["單位介紹","學習站輪轉","反思整理"],learningStations:["照護流程","認養資訊","安全通報"],safetyRules:["由教師帶隊","遵守場域動線"],animalContactRules:["未經工作人員同意不接觸動物"],worksheet:"記錄一項看見的需求與可行回應。",reflectionPrompt:"這次參訪如何改變你對動保行動的理解？",availableDates:["2026-10-15","2026-11-12"],status:"published",createdAt:now,updatedAt:now}));
};
function ensureVisitPrograms(){const current=read<VisitProgram[]>(KEYS.visitPrograms,[]);if(current.length)return current;return hasWindow()?write(KEYS.visitPrograms,demoVisitPrograms()):demoVisitPrograms();}
export const visitProgramRepository = {
  list(){return ensureVisitPrograms();},
  forOrganization(organizationId:string){return this.list().filter(item=>item.organizationId===organizationId);},
  get(programId:string){return this.list().find(item=>item.id===programId);},
  save(program:VisitProgram){const items=this.list(),index=items.findIndex(item=>item.id===program.id),next={...program,updatedAt:nowIso()};if(index>=0)items[index]=next;else items.unshift(next);write(KEYS.visitPrograms,items);return next;},
  ensureDemoForOrganization(organizationId:string){if(!organizationRepository.partnerManaged().some(item=>item.id===organizationId))return null;return this.forOrganization(organizationId)[0]??demoVisitPrograms().find(item=>item.organizationId===organizationId)??null;},
};

function ensureVisitRequests(){
  const current=read<VisitRequest[]>(KEYS.visitRequests,[]);
  if(current.length)return current;
  const legacy=read<Array<Record<string,unknown>>>(KEYS.legacyApplications,[]).filter(item=>item.kind==="visit_request"&&typeof item.organizationId==="string");
  const migrated:VisitRequest[]=legacy.flatMap(raw=>{const organizationId=String(raw.organizationId),program=visitProgramRepository.ensureDemoForOrganization(organizationId);if(!program)return[];const createdAt=String(raw.createdAt||nowIso());return[{id:String(raw.id||id("visit-request")),visitProgramId:program.id,organizationId,studentId:"local-demo-student",requesterRole:"student",requestedDate:program.availableDates[0]??"待協調",participantCount:1,status:"submitted",proposedDate:undefined,note:String(raw.note||""),statusHistory:[{status:"submitted",note:"由舊版參訪需求遷移",changedAt:createdAt,changedBy:"system"}],createdAt,updatedAt:String(raw.updatedAt||createdAt)}]});
  return migrated.length?write(KEYS.visitRequests,migrated):current;
}
export const visitRequestRepository = {
  list(){return ensureVisitRequests();},
  forOrganization(organizationId:string){return this.list().filter(item=>item.organizationId===organizationId);},
  forStudent(studentId="local-demo-student"){return this.list().filter(item=>item.studentId===studentId);},
  create(input:Omit<VisitRequest,"id"|"status"|"statusHistory"|"createdAt"|"updatedAt">){
    const program=visitProgramRepository.get(input.visitProgramId),organization=organizationRepository.get(input.organizationId);if(!program||!organization||program.organizationId!==input.organizationId||organization.managementMode!=="partner_managed")return null;
    const now=nowIso(),item:VisitRequest={...input,id:id("visit-request"),status:"submitted",statusHistory:[{status:"submitted",note:"參訪需求已送出",changedAt:now,changedBy:"student"}],createdAt:now,updatedAt:now};write(KEYS.visitRequests,[item,...this.list()]);
    messageRepository.add({organizationId:item.organizationId,visitRequestId:item.id,type:"status_update",recipient:"organization",content:`收到「${program.title}」的參訪需求。`});
    notificationRepository.add({category:"visit",kind:"application_submitted",title:"參訪需求已送出",summary:`${organization.name} 已收到結構化參訪需求。`,source:"ShelterLab 參訪需求",visitRequestId:item.id,actionLabel:"查看需求進度",actionHref:"/student/action-inbox"});return item;
  },
  updateStatus(requestId:string,status:VisitRequestStatus,note="",proposedDate=""){
    const request=this.list().find(item=>item.id===requestId);if(!request)return null;const changedAt=nowIso(),updated={...request,status,note,proposedDate:proposedDate||request.proposedDate,statusHistory:[...request.statusHistory,{status,note,changedAt,changedBy:"organization" as const}],updatedAt:changedAt};write(KEYS.visitRequests,this.list().map(item=>item.id===requestId?updated:item));
    messageRepository.add({organizationId:request.organizationId,visitRequestId:request.id,type:status==="needs_information"?"information_request":status==="accepted"||status==="reschedule_proposed"?"meeting":"status_update",recipient:"student",content:note||`參訪需求狀態更新為 ${status}。`});
    notificationRepository.add({category:"visit",kind:"visit_updated",title:"參訪需求有新進度",summary:note||`目前狀態：${status}`,source:organizationRepository.get(request.organizationId)?.name??"合作單位",visitRequestId:request.id,actionLabel:"查看參訪需求",actionHref:"/student/action-inbox"});return updated;
  },
};

export const activityResultRepository = {
  list(){return read<ActivityResult[]>(KEYS.activityResults,[]);},
  forOrganization(organizationId:string){return this.list().filter(item=>item.organizationId===organizationId);},
  add(input:Omit<ActivityResult,"id"|"completedAt">){const item={...input,id:id("result"),completedAt:nowIso()};write(KEYS.activityResults,[item,...this.list().filter(value=>value.applicationId!==input.applicationId)]);return item;},
};

const decisionLabel:Record<ApplicationEmailDecision,string>={accepted:"錄取",waitlisted:"候補",rejected:"未錄取",needs_information:"補充資料"};
export const applicationNotificationService = {
  createDecisionEmail(input:{applicationId:string;recipientEmail:string;decision:ApplicationEmailDecision;subject?:string;body?:string}){
    const application=applicationRepository.list().find(item=>item.id===input.applicationId);
    const opportunity=application?opportunityRepository.get(application.opportunityId):undefined;
    const organization=application?organizationRepository.get(application.organizationId):undefined;
    const label=decisionLabel[input.decision];
    const subject=input.subject?.trim()||`【ShelterLab】${opportunity?.title??"活動申請"}${label}通知`;
    const body=input.body?.trim()||`${application?.studentLabel??"同學"}您好：\n\n你申請的「${opportunity?.title??"活動"}」目前結果為：${label}。\n請依 ${organization?.name??"動保機構"} 後續通知確認時間、安全與陪同條件。\n\n此信由機構人員使用自己的 Email 軟體寄出，ShelterLab 尚未自動寄信。`;
    return {subject,body,mailtoUrl:`mailto:${encodeURIComponent(input.recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,sentByPlatform:false as const};
  }
};

function notifyApplicants(opportunity:ActionOpportunity,kind:ActionNotification["kind"],title:string,summary:string){ for(const application of applicationRepository.list().filter(item=>item.opportunityId===opportunity.id))notificationRepository.add({category:"application",kind,title,summary,source:opportunity.organizationName,opportunityId:opportunity.id,applicationId:application.id,actionLabel:"查看申請進度",actionHref:"/student/action-inbox"}); }
function notifyPreferenceMatches(opportunity:ActionOpportunity){ const preferences=preferenceRepository.get(); if(!matchesPreferences(opportunity,preferences))return; notificationRepository.add({category:"new_opportunity",kind:"preference_match",title:"符合你偏好的新機會上架",summary:`${opportunity.title} · ${opportunity.city}`,source:"動保行動機會雷達",opportunityId:opportunity.id,actionLabel:"查看活動",actionHref:`/student/opportunities?opportunity=${opportunity.id}`}); }
function syncWeekSixCompletion(opportunity:ActionOpportunity){ try{ const key="shelterlab-week6-action-draft-v2",raw=localStorage.getItem(key); if(!raw)return; const draft=JSON.parse(raw); draft.stage=5;draft.furthestStage=5;draft.status="draft";draft.actionRecord={...draft.actionRecord,actionType:draft.actionRecord?.actionType||opportunity.title,status:"completed",nextStep:draft.actionRecord?.nextStep||"完成反思並整理參與證明"};localStorage.setItem(key,JSON.stringify(draft)); }catch{} }

export const opportunityPrototype = {
  reset(){
    const publicOrganizations=ensureOrganizations().filter(item=>!item.isDemo),publicOpportunities=ensureOpportunities().filter(item=>!item.isDemo);
    write(KEYS.opportunitySchema,"4");write(KEYS.organizations,[...PROTOTYPE_PARTNER_ORGANIZATIONS.filter(item=>item.isDemo),...publicOrganizations]);write(KEYS.opportunities,dedupeOpportunities([...createPrototypeOpportunities().filter(item=>item.isDemo),...publicOpportunities]));
    notificationRepository.reset();write(KEYS.applications,[]);write(KEYS.matchProfiles,[]);write(KEYS.invitations,[]);write(KEYS.visitPrograms,demoVisitPrograms());write(KEYS.visitRequests,[]);write(KEYS.messages,[]);write(KEYS.activityResults,[]);write(KEYS.bookmarks,[]);write(KEYS.preferences,DEFAULT_ACTION_PREFERENCES);write(KEYS.searches,[]);write(KEYS.studentActionProfile,DEFAULT_STUDENT_ACTION_PROFILE);write(KEYS.organizationRegistrations,[]);
  },
  keys:KEYS,
};
