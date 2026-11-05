export const TAIWAN_COUNTIES = [
  "基隆市", "臺北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣"
] as const;
export type TaiwanCounty = typeof TAIWAN_COUNTIES[number];
export type ParticipationMode = "online" | "school" | "onsite";
export type CommitmentType = "one_time" | "long_term";
export type MinorPolicy = "allowed" | "guardian_required" | "teacher_group_only" | "contact_to_confirm" | "adult_only";
export type OrganizationType = "public_shelter" | "animal_home" | "government_agency" | "animal_protection_office" | "education_park" | "animal_welfare_education_park" | "registered_nonprofit" | "private_rescue_group" | "animal_welfare_association" | "foundation" | "rescue_group" | "other_partner" | "other_verified_organization";
export type OrganizationManagementMode = "partner_managed" | "platform_curated" | "external_redirect";
export type OrganizationVerificationLevel = "government_official" | "official_partnership" | "verified_nonprofit" | "public_information_only" | "pending_verification";
export type DataSourceLayer = "government_open_data" | "official_announcement" | "platform_partner" | "demo";
export type ActionTag = "visit" | "volunteer" | "material_donation" | "school_outreach" | "reporting" | "adoption_promotion";
export type ResourceCategoryFilter = "all" | "government" | "public_care" | "education_park" | "registered_nonprofit" | "rescue_group" | "partner_managed" | "internal_application" | "visit" | "volunteer" | "school_outreach";
export type ActionFilter = "all" | ActionTag;
export type VerificationState = "published" | "not_published";
export type ActionOrganization = { id:string; name:string; county:string; latitude:number; longitude:number; address:string; phone:string; openingHours?:string; officialUrl:string; organizationType:OrganizationType; managementMode:OrganizationManagementMode; verificationLevel:OrganizationVerificationLevel; sourceLayer:DataSourceLayer; officialSource:string; sourceUrl:string; actionTags:ActionTag[]; studentNotes:string[]; requiresAdult:boolean; ageLimitNote:string; hasOfficialVolunteerInfo:boolean; evidenceLinks?:Array<{label:string;url:string}>; minimumAge?:number; minorPolicy:MinorPolicy; participationModes:ParticipationMode[]; actionTypes:string[]; commitmentTypes:CommitmentType[]; officialServices?:string[]; volunteerInformation?:VerificationState; verificationStatus:"official"|"manually_verified"; verifiedAt:string; dataSource:string; openDogCount?:number|null; isDemo?:boolean; demoNotice?:string };
export type TimeAvailability = "under_1"|"1_2"|"3_5"|"over_5";
export type TravelAbility = "online_only"|"within_county"|"guardian_accompanied"|"cross_county";
export type SkillTag = "photo_video"|"graphic_design"|"writing_social"|"data_analysis"|"event_planning"|"sorting"|"animal_care"|"recommend";
export type ActionCommitment = "one_time"|"long_term"|"both";
export type AdultSupport = "confirmed"|"need_to_ask"|"not_available";
export type PreferredRole = "information"|"school_project"|"remote_support"|"onsite_learning"|"material_coordinator"|"contact_proposer"|"not_sure";
export type ActionProfile = { age:number; county:string; weeklyTime:TimeAvailability; participationModes:ParticipationMode[]; travelAbility:TravelAbility; skills:SkillTag[]; commitment:ActionCommitment; adultSupport:AdultSupport; preferredRole:PreferredRole };
export type Coordinates = { latitude:number; longitude:number };
export type OrganizationMatch = { organization:ActionOrganization; eligible:boolean; exactMatch:boolean; reasons:string[]; distanceKm:number|null; score:number };
export type ContactMethod = "phone"|"email"|"visit_proposal"|"school_proposal";
export type ActionStatus = "not_started"|"prepared"|"contacted"|"waiting"|"scheduled"|"completed";
export type ActionRecord = { actionType:string; plannedDate:string; status:ActionStatus; adultSupportNote:string; conditionsToConfirm:string; nextStep:string; alternativePlan:string; reflection:string };
export type WeekSixJourneyDraft = { version:2; stage:number; furthestStage:number; profile:ActionProfile; selectedSchoolId:string; resourceCategoryFilter:ResourceCategoryFilter; actionFilter:ActionFilter; selectedOrganizationId:string; comparisonOrganizationIds:string[]; safetyAnswers:Record<string,string>; contactMethod:ContactMethod; contactDrafts:Record<ContactMethod,string>; actionRecord:ActionRecord; updatedAt:string; status:"draft"|"completed"; openDataDate:string };
export type WeekSixLegacyDraft = { version:1; profile:Omit<ActionProfile,"adultSupport"|"preferredRole">; selectedOrganizationId:string; selectedAt:string; status:"draft"; openDataDate:string };
export const WEEK_SIX_DRAFT_KEY = "shelterlab-week6-action-draft-v2";
export const WEEK_SIX_LEGACY_DRAFT_KEY = "shelterlab-week6-action-draft-v1";
export const UNKNOWN_OFFICIAL_TEXT = "官方公開資料未載明，請於行動前逕向該機構確認。";
export const UNKNOWN_MINOR_POLICY_TEXT = "政府收容資料庫未提供未成年參與規定，請向機構洽詢。";
export const ORGANIZATION_TYPE_LABELS:Record<OrganizationType,string> = { public_shelter:"公立動物收容所", animal_home:"動物之家", government_agency:"縣市動物保護處／防疫處", animal_protection_office:"縣市動物保護處／防疫處", education_park:"動物保護教育園區", animal_welfare_education_park:"動物保護教育園區", registered_nonprofit:"已驗證民間動保團體", private_rescue_group:"民間救援團體", animal_welfare_association:"動物保護協會", foundation:"動保基金會", rescue_group:"救援／中途組織", other_partner:"其他教育合作單位", other_verified_organization:"其他經確認的動保機構" };
export const ACTION_TAG_LABELS:Record<ActionTag,string> = { visit:"可參訪", volunteer:"可洽詢志工", material_donation:"可物資募集", school_outreach:"可教育宣導", reporting:"可學習通報", adoption_promotion:"可協助認養曝光" };
export const DATA_SOURCE_LAYER_LABELS:Record<DataSourceLayer,string> = { government_open_data:"政府開放資料", official_announcement:"官方公告", platform_partner:"平台合作", demo:"示範資料" };
export const DEFAULT_ACTION_PROFILE:ActionProfile = { age:16, county:"", weeklyTime:"1_2", participationModes:["online"], travelAbility:"within_county", skills:["recommend"], commitment:"both", adultSupport:"need_to_ask", preferredRole:"not_sure" };
export const DEFAULT_ACTION_RECORD:ActionRecord = { actionType:"", plannedDate:"", status:"not_started", adultSupportNote:"", conditionsToConfirm:"", nextStep:"", alternativePlan:"", reflection:"" };
export function simulatedActionPlanForOrganization(organization:Pick<ActionOrganization,"actionTags"|"organizationType">){
  if(organization.actionTags.includes("visit"))return"收容機構參訪與行前提問研討";
  if(organization.actionTags.includes("adoption_promotion"))return"待認養動物敘事整理與校園宣導";
  if(organization.actionTags.includes("material_donation"))return"校園物資募集與資源分類行動";
  if(organization.actionTags.includes("school_outreach"))return"校園生命教育宣導專案協作";
  if(organization.actionTags.includes("volunteer"))return"學生志工服務行前諮詢與評估";
  return organization.organizationType==="government_agency"||organization.organizationType==="animal_protection_office"?"動物保護通報法定流程學習":"動保機構需求訪談與行動提案研擬";
}
export function createWeekSixDraft():WeekSixJourneyDraft { return { version:2, stage:0, furthestStage:0, profile:{...DEFAULT_ACTION_PROFILE}, selectedSchoolId:"", resourceCategoryFilter:"all", actionFilter:"all", selectedOrganizationId:"", comparisonOrganizationIds:[], safetyAnswers:{}, contactMethod:"phone", contactDrafts:{phone:"",email:"",visit_proposal:"",school_proposal:""}, actionRecord:{...DEFAULT_ACTION_RECORD}, updatedAt:new Date().toISOString(), status:"draft", openDataDate:"" }; }

export const WEEK_SIX_MIN_RESPONSE_LENGTH = 20;
const LOW_QUALITY_RESPONSES = new Set(["略", "不知道", "不清楚", "沒有", "無", "隨便", "123", "不知道啦"]);
function normalizedMeaningfulText(value:string){return value.normalize("NFKC").replace(/\s+/g,"").trim();}
export function weekSixTextQualityError(value:string,label:string,minLength=WEEK_SIX_MIN_RESPONSE_LENGTH){
  const text=normalizedMeaningfulText(value);
  if(!text||LOW_QUALITY_RESPONSES.has(text)||/^\d+$/.test(text)||/^(.)\1{4,}$/u.test(text))return`「${label}」請勿僅填寫簡略文字、數字或重複字元，請完整述明具體內容。`;
  if([...text].length<minLength)return`「${label}」內容須達 ${minLength} 字以上，請說明更完善之反思與學習所得。`;
  return"";
}
export function validateWeekSixDraftQuality(draft:Pick<WeekSixJourneyDraft,"profile"|"contactMethod"|"contactDrafts"|"actionRecord">){
  if(!Number.isInteger(draft.profile.age)||draft.profile.age<12||draft.profile.age>100)return"請確認年齡格式正確，須填寫 12 至 100 歲之整數。";
  if(draft.contactMethod==="email"){
    const emails=draft.contactDrafts.email.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)??[];
    const suspicious=draft.contactDrafts.email.match(/\b[^\s@]+@[^\s@]+\b/g)??[];
    if(suspicious.length>emails.length)return"電子郵件格式不符合規範，請檢查帳號、@ 符號與網域完整性。";
  }
  const record=draft.actionRecord;
  if(!record.actionType.trim()||!record.plannedDate||!record.adultSupportNote.trim())return"請先完成參與方式、預計聯絡日期與成人協助規劃等基本項目。";
  for(const [key,label] of [["conditionsToConfirm","參與前需要確認的事項"],["nextStep","下一步與時間規劃"]] as const){
    const error=weekSixTextQualityError(record[key],label);
    if(error)return error;
  }
  return"";
}

export const SAFETY_SCENARIOS = [
 {id:"injured",question:"路邊犬隻明顯受傷或受困且尚有呼吸，應如何進行首要處置？",options:[["move","沒有防護就直接把犬隻抱上車"],["1959","保持安全距離、記錄地點與傷勢，並撥打 1959 動物保護專線"],["post","只把照片貼到社群等待網友處理"]],answer:"1959",explanation:"遭遇受傷或受困動物應向 1959 專線通報。處置時須以維護自身與交通安全為優先，提供精確地點與觀察訊息，切勿自行進行無防護接觸。"},
  {id:"chasing",question:"若犬群於車道追逐車輛且危及用路人安全，應如何處理？",options:[["ignore","等隔天再說"],["chase","跑進車道驅趕犬群"],["110","先前往安全區域，若有即時危險請撥打 110，後續犬隻管領事宜再轉報 1959"]],answer:"110",explanation:"涉及即時交通或人身安全事故請先撥打 110 報案；犬隻後續管領處置可由 1959 轉介地方動物保護主管機關辦理。"},
  {id:"fire",question:"犬隻受困於火場或深坑等具即時生命危險情境，合適之處置方式為何？",options:[["119","撥打 119 通報，說明緊急救援位置與現場風險"],["email","寄一般詢問電子郵件"],["enter","自行進入危險區域救援"]],answer:"119",explanation:"火災或重大受困等緊急災害救助應由 119 消防單位處理。切勿冒然進入危險現場，避免衍生二次災害。"},
  {id:"general",question:"若欲瞭解收容機構是否開放學生參訪或志工服務（非緊急狀況），應如何聯繫？",options:[["1959","把 1959 當作活動報名專線"],["official","於服務時間透過官方電話或網站確認資格與實務需求"],["visit","未預約即前往現場"]],answer:"official",explanation:"一般參訪或合作不屬於緊急通報範疇。應透過機構公開之官方管道聯繫，事前確認年齡條件、陪同規範、服務時段與具體項目。"}
  ,{id:"volunteer",question:"規劃參與機構志工服務時，首要執行步驟為何？",options:[["show_up","直接到現場請工作人員安排工作"],["official","查閱官方招募公告，核對年齡、培訓、保險及陪同規定，並由成人協助聯繫"],["promise","先向同學承諾一定能取得志工時數"]],answer:"official",explanation:"志工服務、服務學習與一般參訪之規定不同。應依官方公告核對資格與申辦流程，未成年學生須由教師或家長共同評估與決策。"}
  ,{id:"donation",question:"班級欲辦理動保機構物資募集活動，何者為負責任之規劃管道？",options:[["confirm","事前向機構確認當前需求品項、規格、數量及交運管道，再行規劃募集"],["collect","先大量募集家中用不到的物品再送去"],["guess","照社群貼文猜單位現在需要什麼"]],answer:"confirm",explanation:"機構物資需求隨收容狀況與庫存有所變動。事前向官方窗口確認需求，方能避免捐贈不合用物品而增加機構處理負擔。"}
] as const;

export function requiredComparisonCount(availableCount:number){return Math.min(2,Math.max(0,Math.floor(availableCount)));}
export function areSafetyAnswersCorrect(answers:Record<string,string>){return SAFETY_SCENARIOS.every(s=>answers[s.id]===s.answer);}

export function filterActionMatches(matches:OrganizationMatch[],category:ResourceCategoryFilter,action:ActionFilter){
  return matches.filter(({organization})=>{
    const categoryMatches=category==="all"
      ||(category==="government"&&["public_shelter","animal_home","government_agency","education_park"].includes(organization.organizationType))
      ||(category==="public_care"&&["public_shelter","animal_home"].includes(organization.organizationType))
      ||(category==="education_park"&&organization.organizationType==="education_park")
      ||(category==="registered_nonprofit"&&organization.organizationType==="registered_nonprofit")
      ||(category==="rescue_group"&&organization.organizationType==="rescue_group")
      ||(category==="partner_managed"&&organization.managementMode==="partner_managed")
      ||(category==="internal_application"&&organization.managementMode==="partner_managed")
      ||(category==="visit"&&organization.actionTags.includes("visit"))
      ||(category==="volunteer"&&organization.hasOfficialVolunteerInfo)
      ||(category==="school_outreach"&&organization.actionTags.includes("school_outreach"));
    const actionMatches=action==="all"||organization.actionTags.includes(action);
    return categoryMatches&&actionMatches;
  });
}

export function normalizeCountyName(value:string){return value.trim().replace(/^台/,"臺").replace(/台([北中南東])/,"臺$1");}
function organizationIdentity(value:string){return value.normalize("NFKC").toLowerCase().replace(/[\s　()（）·．。、-]/g,"");}
function organizationIdOrder(value:string){const parsed=Number(value.replace(/\D/g,""));return Number.isFinite(parsed)?parsed:0;}
const SUPERSEDED_ORGANIZATION_IDS=new Set(["PS00000017"]);
export function dedupeActionOrganizations(organizations:ActionOrganization[]):ActionOrganization[]{const deduped=new Map<string,ActionOrganization>();for(const organization of organizations){if(SUPERSEDED_ORGANIZATION_IDS.has(organization.id))continue;const key=`${normalizeCountyName(organization.county)}|${organizationIdentity(organization.name)}`,existing=deduped.get(key);if(!existing){deduped.set(key,organization);continue}const preferred=organizationIdOrder(organization.id)>organizationIdOrder(existing.id)?organization:existing,fallback=preferred===organization?existing:organization;deduped.set(key,{...fallback,...preferred,openingHours:preferred.openingHours||fallback.openingHours,officialUrl:preferred.officialUrl||fallback.officialUrl,officialServices:preferred.officialServices?.length?preferred.officialServices:fallback.officialServices,openDogCount:Math.max(preferred.openDogCount??0,fallback.openDogCount??0)});}return[...deduped.values()];}
export function haversineDistanceKm(from:Coordinates,to:Coordinates){const r=6371,rad=(n:number)=>n*Math.PI/180,dLat=rad(to.latitude-from.latitude),dLon=rad(to.longitude-from.longitude);const a=Math.sin(dLat/2)**2+Math.cos(rad(from.latitude))*Math.cos(rad(to.latitude))*Math.sin(dLon/2)**2;return r*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));}
function minorEligibility(age:number,o:ActionOrganization){if(age>=18)return{eligible:true,reason:"年齡符合法定參與條件"};if(o.minorPolicy==="adult_only"||(o.minimumAge??0)>=18)return{eligible:false,reason:"目前未達直接參與資格"};if(o.minorPolicy==="guardian_required")return{eligible:true,reason:"須具備家長或法定代理人同意書／陪同"};if(o.minorPolicy==="teacher_group_only")return{eligible:true,reason:"須由教師以學校團體方式提出申請"};return{eligible:true,reason:o.minorPolicy==="allowed"?"標示未成年可參與":"未成年參與規範須事前向機構確認"};}
export function matchActionOrganizations(organizations:ActionOrganization[],profile:ActionProfile,location?:Coordinates|null):OrganizationMatch[]{const county=normalizeCountyName(profile.county);return organizations.map(o=>{const minor=minorEligibility(profile.age,o),sameCounty=!county||normalizeCountyName(o.county)===county,publishedModes=o.participationModes.length>0,modeMatch=!publishedModes||profile.participationModes.length===0||profile.participationModes.some(m=>o.participationModes.includes(m)),publishedCommitment=o.commitmentTypes.length>0,commitmentMatch=!publishedCommitment||profile.commitment==="both"||o.commitmentTypes.includes(profile.commitment),travelMatch=profile.travelAbility==="cross_county"||profile.travelAbility==="guardian_accompanied"||(profile.travelAbility==="online_only"?(!publishedModes||o.participationModes.includes("online")):sameCounty),distanceKm=location?haversineDistanceKm(location,o):null,reasons=[minor.reason];if(sameCounty)reasons.push("位處選定之行政區");if(!publishedModes)reasons.push("參與方式尚待向機構確認");if(profile.age<18&&profile.adultSupport==="confirmed")reasons.push("已具備成人協助聯繫規劃");if(!travelMatch)reasons.push("超出當前交通移動範圍");const exactMatch=minor.eligible&&sameCounty&&modeMatch&&commitmentMatch&&travelMatch,score=(minor.eligible?25:0)+(sameCounty?30:0)+(modeMatch?10:0)+(commitmentMatch?10:0)+(travelMatch?15:0)-(distanceKm??0)/100;return{organization:o,eligible:minor.eligible,exactMatch,reasons,distanceKm,score};}).sort((a,b)=>a.exactMatch===b.exactMatch?(location?(a.distanceKm??Infinity)-(b.distanceKm??Infinity):b.score-a.score):a.exactMatch?-1:1);}
function validProfile(value:unknown):ActionProfile{const p=value&&typeof value==="object"?value as Partial<ActionProfile>:{};return{...DEFAULT_ACTION_PROFILE,...p,adultSupport:p.adultSupport??DEFAULT_ACTION_PROFILE.adultSupport,preferredRole:p.preferredRole??DEFAULT_ACTION_PROFILE.preferredRole,participationModes:Array.isArray(p.participationModes)?p.participationModes:DEFAULT_ACTION_PROFILE.participationModes,skills:Array.isArray(p.skills)?p.skills:DEFAULT_ACTION_PROFILE.skills};}
export function parseWeekSixDraft(value:string|null):WeekSixJourneyDraft|null{if(!value)return null;try{const raw=JSON.parse(value) as Partial<WeekSixJourneyDraft>|Partial<WeekSixLegacyDraft>;if(raw.version===1&&raw.profile&&typeof raw.selectedOrganizationId==="string"){const d=createWeekSixDraft();return{...d,profile:validProfile(raw.profile),selectedOrganizationId:raw.selectedOrganizationId,comparisonOrganizationIds:raw.selectedOrganizationId?[raw.selectedOrganizationId]:[],openDataDate:raw.openDataDate??""};}if(raw.version!==2||!raw.profile||typeof raw.selectedOrganizationId!=="string")return null;const d=createWeekSixDraft();return{...d,...raw,profile:validProfile(raw.profile),stage:Math.max(0,Math.min(5,Number(raw.stage)||0)),furthestStage:Math.max(0,Math.min(5,Number(raw.furthestStage)||0)),comparisonOrganizationIds:Array.isArray(raw.comparisonOrganizationIds)?raw.comparisonOrganizationIds.filter((v):v is string=>typeof v==="string").slice(0,3):[],safetyAnswers:raw.safetyAnswers&&typeof raw.safetyAnswers==="object"?raw.safetyAnswers:{},contactDrafts:{...d.contactDrafts,...(raw.contactDrafts??{})},actionRecord:{...d.actionRecord,...(raw.actionRecord??{})}};}catch{return null;}}
export function roleSummary(p:ActionProfile){const roles:Record<PreferredRole,string>={information:"資料整理者",school_project:"宣導設計者",remote_support:"認養曝光協助者",onsite_learning:"參訪紀錄者",material_coordinator:"物資募集者",contact_proposer:"聯絡提案者",not_sure:"先詢問再決定"};const eligibility=p.age>=18?"仍需依機構規定確認參與資格":p.adultSupport==="confirmed"?"已具備成人協助，仍須確認參與型態與最低年齡":"須先確認成人支援、參與型態與最低年齡";return`建議優先由「${roles[p.preferredRole]}」角色切入研習；${eligibility}，後續請依機構官方回覆調整行動計畫。`;}
export function buildContactDrafts(o:ActionOrganization,p:ActionProfile):Record<ContactMethod,string>{const intro=`您好，我是關心動物權益與保護議題之學生，欲瞭解貴機構目前公開且適合學生參與之實務需求。`,conditions=`本人現年 ${p.age} 歲。請問貴機構之參與型態屬正式志工、學生服務學習、參訪導覽或其他形式？最低年齡限制為何？是否須具備家長同意書、學校核可、成人陪同、事前培訓、投保、預約或固定服務時段限制？`;return{phone:`${intro}\n${conditions}\n本人絕不會未經事先確認即逕行前往現場，感謝您的協助。`,email:`主旨：學生參與方式與資格諮詢\n\n${intro}\n${conditions}\n若目前暫無合適學生參與之管道，亦請指引相關官方公開資訊以供查閱。感謝您。`,visit_proposal:`主旨：學生團體參訪 ${o.name} 規劃草案\n\n本計畫擬由教師或家長全程陪同，以生命教育與開放資料驗證為目的進行參訪研習。\n擬事前確認：申請資格、參與人數、預定日期、導覽內容、年齡與安全防護規範、交通配置及影像紀錄限制。\n本草稿僅作為內部研討使用，待負責成人確認後，方透過官方管道提出正式申請。`,school_proposal:`提案主題：與 ${o.name} 合作建立學生體驗學習機制\n\n目的：事前向主管機構確認實際需求，並由教師與學生共同評估執行可行性。\n確認範疇：參與型態、最低年齡、家長或學校同意機制、成人陪同需求、培訓、保險、預約規範、交通配置、服務時段與具體工作範疇。\n後續步驟：由教師或指定成人透過官方管道進行諮詢，不進行未授權之承諾或現場拜訪。`};}
export type AiActionMatchRequest={profile:ActionProfile;organizations:ActionOrganization[]};export type AiContactDraftRequest={organization:ActionOrganization;profile:ActionProfile;format:"phone"|"email"};export interface WeekSixAiService{matchActions(input:AiActionMatchRequest):Promise<never>;createContactDraft(input:AiContactDraftRequest):Promise<never>;}export interface ActionPassportService{saveDraft(draft:WeekSixJourneyDraft):Promise<never>;}
