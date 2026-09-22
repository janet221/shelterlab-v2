import type {
  ActionOpportunity,
  ActivityAlternativeAction,
  ActivityEligibilityRule,
  EligibilityResult,
  EligibilityResultType,
  StudentActionProfile,
} from "./types";

const platformAlternatives:ActivityAlternativeAction[] = [
  {title:"從校園行動開始",description:"可向教師提出生命教育宣導、公開資料整理或班級合作構想。這是平台建議，不代表該機構目前正在招募。",mode:"campus_action"},
  {title:"協助線上推廣",description:"可製作認養宣傳文字、影像或公開資訊素材。這是平台建議，不代表該機構目前正在招募。",mode:"online_action"},
  {title:"詢問其他參與方式",description:"先向機構確認是否另有參訪、親子或教育活動。",mode:"contact_organization"},
];

export const ELIGIBILITY_PRIORITY:Record<EligibilityResultType,number> = {
  eligible_directly:0,
  eligible_with_guardian_consent:1,
  eligible_with_adult:2,
  school_or_youth_group_only:3,
  alternative_action_only:4,
  not_eligible:5,
  eligibility_unknown:6,
};

export function normalizeEligibilityRules(activity:Pick<ActionOpportunity,"eligibilityRules"|"minimumAge"|"maximumAge"|"guardianConsentRequired"|"guardianRequired"|"adultCompanionRequired"|"teacherRequired"|"groupApplication"|"trainingRequired">):ActivityEligibilityRule[]{
  if(activity.eligibilityRules?.length)return activity.eligibilityRules;
  if(!Number.isFinite(activity.minimumAge)||activity.minimumAge<=0)return [];
  const teacher=Boolean(activity.teacherRequired);
  const adult=Boolean(activity.adultCompanionRequired);
  const guardian=Boolean(activity.guardianConsentRequired||activity.guardianRequired);
  return [{
    id:"legacy-minimum-age",
    minAge:activity.minimumAge,
    maxAge:activity.maximumAge,
    participationMode:teacher?(activity.groupApplication?"school_group":"youth_group"):adult?"guardian_accompanied":guardian?"guardian_consent":"individual",
    guardianConsentRequired:guardian,
    adultCompanionRequired:adult,
    teacherOrGroupLeaderRequired:teacher,
    trainingRequired:Boolean(activity.trainingRequired),
    insuranceRequired:false,
    note:"由舊版最低年齡與陪同欄位安全轉換；正式參加前仍應核對來源。",
  }];
}

const ageMatches=(age:number,rule:ActivityEligibilityRule)=>(rule.minAge===undefined||age>=rule.minAge)&&(rule.maxAge===undefined||age<=rule.maxAge);
const hasSchoolSupport=(profile:StudentActionProfile,rule:ActivityEligibilityRule)=>rule.participationMode==="school_group"?Boolean(profile.schoolParticipationAvailable):Boolean(profile.youthGroupParticipationAvailable);

function evaluateRule(profile:StudentActionProfile,rule:ActivityEligibilityRule,alternatives:ActivityAlternativeAction[]):EligibilityResult{
  const requiredActions:string[]=[];
  if(rule.guardianConsentRequired&&!profile.guardianConsentAvailable)requiredActions.push("取得家長同意");
  if(rule.adultCompanionRequired&&!profile.adultCompanionAvailable)requiredActions.push("安排家長或成人全程陪同");
  if(rule.teacherOrGroupLeaderRequired&&!hasSchoolSupport(profile,rule))requiredActions.push(rule.participationMode==="school_group"?"請教師協助團體報名":"請青少年團體領隊協助報名");
  if(rule.trainingRequired)requiredActions.push("依單位安排完成行前訓練");
  if(rule.insuranceRequired)requiredActions.push("向單位確認保險資料");
  if(rule.participationMode==="online_or_campus"){
    const supported=profile.acceptsOnlineAction||profile.acceptsCampusAction;
    if(!supported)requiredActions.push("確認可以進行線上或校園行動");
  }
  let result:EligibilityResultType="eligible_directly";
  if(["school_group","youth_group"].includes(rule.participationMode))result="school_or_youth_group_only";
  else if(rule.participationMode==="guardian_accompanied"||rule.adultCompanionRequired)result="eligible_with_adult";
  else if(rule.participationMode==="guardian_consent"||rule.guardianConsentRequired)result="eligible_with_guardian_consent";
  return {result,matchedRuleId:rule.id,reasons:[rule.note||"年齡符合這一條參與途徑。"],requiredActions,missingInformation:[],alternativeActions:alternatives};
}

export function evaluateActivityEligibility(profile:StudentActionProfile,activity:ActionOpportunity):EligibilityResult{
  const alternatives=activity.alternativeActions?.length?activity.alternativeActions:platformAlternatives;
  if(profile.age===undefined)return {result:"eligibility_unknown",reasons:["尚未填寫年齡，系統不會用年級推測。"],requiredActions:["先完成學生年齡資料"],missingInformation:["學生年齡"],alternativeActions:alternatives};
  const rules=normalizeEligibilityRules(activity);
  if(!rules.length||activity.eligibilitySourceType==="not_confirmed"&&!activity.eligibilityRules?.length)return {result:"eligibility_unknown",reasons:["活動尚未提供可確認的年齡與參加規定。"],requiredActions:["申請前先聯絡機構確認資格"],missingInformation:["活動年齡與參加資格"],alternativeActions:alternatives};
  const matched=rules.filter(rule=>ageMatches(profile.age as number,rule)).map(rule=>evaluateRule(profile,rule,alternatives));
  if(!matched.length){const minimums=rules.map(rule=>rule.minAge).filter((value):value is number=>value!==undefined),reason=minimums.length&&profile.age<Math.min(...minimums)?`目前年齡不符合；這項活動最低參加年齡為年滿 ${Math.min(...minimums)} 歲。`:"目前年齡不符合已公布的參加途徑。";return alternatives.length?{result:"alternative_action_only",reasons:[reason],requiredActions:[],missingInformation:[],alternativeActions:alternatives}:{result:"not_eligible",reasons:[reason],requiredActions:[],missingInformation:[],alternativeActions:platformAlternatives}}
  const ready=matched.filter(result=>result.requiredActions.filter(action=>!action.includes("行前訓練")&&!action.includes("保險資料")).length===0);
  const candidates=ready.length?ready:matched;
  const selected=[...candidates].sort((a,b)=>ELIGIBILITY_PRIORITY[a.result]-ELIGIBILITY_PRIORITY[b.result])[0];
  if(selected.result==="school_or_youth_group_only"&&selected.requiredActions.length&&activity.alternativeActions?.length)return {...selected,result:"alternative_action_only",reasons:[...selected.reasons,"目前尚未具備團體帶領條件，可先查看替代行動。"]};
  return selected;
}

export function canSubmitIndividualApplication(result:EligibilityResult){
  if(!["eligible_directly","eligible_with_guardian_consent","eligible_with_adult"].includes(result.result))return false;
  return !result.requiredActions.some(action=>action.includes("家長同意")||action.includes("成人全程陪同")||action.includes("教師")||action.includes("領隊")||action.includes("線上或校園"));
}

export function eligibilityLabel(result:EligibilityResult){
  if(result.result==="eligible_directly")return result.requiredActions.length?"符合資格，尚需完成行前準備":"符合資格";
  if(result.result==="eligible_with_guardian_consent")return result.requiredActions.some(value=>value.includes("家長同意"))?"需要家長同意":"家長同意條件已具備";
  if(result.result==="eligible_with_adult")return result.requiredActions.some(value=>value.includes("成人"))?"需要成人陪同":"成人陪同條件已具備";
  if(result.result==="school_or_youth_group_only")return "需要學校或團體協助";
  if(result.result==="alternative_action_only")return "目前無法直接參加，可查看其他行動";
  if(result.result==="not_eligible")return "目前年齡不符合";
  return result.missingInformation.includes("學生年齡")?"請先填寫年齡":"年齡資格尚未確認";
}

export function eligibilityActionLabel(result:EligibilityResult){
  if(canSubmitIndividualApplication(result))return "我要申請";
  if(result.result==="eligible_with_guardian_consent")return "準備家長同意後申請";
  if(result.result==="eligible_with_adult")return "確認陪同人後申請";
  if(result.result==="school_or_youth_group_only")return "查看團體參加方式";
  if(result.result==="alternative_action_only"||result.result==="not_eligible")return "查看其他行動";
  return "先詢問機構";
}

export function primaryEligibilityRuleLabel(activity:ActionOpportunity){
  const rules=normalizeEligibilityRules(activity);
  if(!rules.length)return "年齡資格尚未確認";
  if(rules.length>1)return "提供多種年齡參加途徑";
  const rule=rules[0],range=rule.minAge!==undefined&&rule.maxAge!==undefined?`${rule.minAge}～${rule.maxAge} 歲`:rule.minAge!==undefined?`${rule.minAge} 歲以上`:rule.maxAge!==undefined?`${rule.maxAge} 歲以下`:"不限年齡";
  if(rule.participationMode==="guardian_consent")return `${range}須家長同意`;
  if(rule.participationMode==="guardian_accompanied")return `${range}須成人陪同`;
  if(rule.participationMode==="school_group"||rule.participationMode==="youth_group")return "僅接受學校或青少年團體";
  if(rule.participationMode==="online_or_campus")return "可進行線上／校園行動";
  return `${range}可獨立參加`;
}

export function validateEligibilityForPublishing(activity:ActionOpportunity){
  const errors:string[]=[];
  const rules=activity.eligibilityRules??[];
  if(!rules.length)errors.push("至少設定一條參加資格規則");
  if(activity.eligibilitySourceType==="not_confirmed")errors.push("年齡規定來源尚未確認，只能先儲存草稿");
  if(activity.riskLevel==="high")for(const rule of rules){
    const permitsMinor=rule.maxAge===undefined?rule.minAge===undefined||rule.minAge<18:rule.maxAge<18||rule.minAge===undefined||rule.minAge<18;
    if(permitsMinor&&(!rule.guardianConsentRequired||!rule.adultCompanionRequired||!rule.trainingRequired||!rule.insuranceRequired||!rule.professionalSupervisionRequired||!rule.emergencyPlanRequired)){
      errors.push("高風險活動開放未成年人時，須同時確認家長同意、成人陪同、專業人員、行前訓練、保險與緊急處理方式");break;
    }
  }
  return errors;
}
