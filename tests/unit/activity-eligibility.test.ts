import { beforeEach,describe,expect,it } from "vitest";
import { createPrototypeOpportunities } from "@/data/action-opportunities";
import { applicationRepository,opportunityPrototype,opportunityRepository } from "@/lib/action-opportunities/browser-repository";
import { canSubmitIndividualApplication,evaluateActivityEligibility,normalizeEligibilityRules,validateEligibilityForPublishing } from "@/lib/action-opportunities/eligibility";
import type { ActionOpportunity,ActivityEligibilityRule,StudentActionProfile } from "@/lib/action-opportunities/types";

class MemoryStorage implements Storage{private values=new Map<string,string>();get length(){return this.values.size}clear(){this.values.clear()}getItem(key:string){return this.values.get(key)??null}key(index:number){return [...this.values.keys()][index]??null}removeItem(key:string){this.values.delete(key)}setItem(key:string,value:string){this.values.set(key,String(value))}}
const rule=(overrides:Partial<ActivityEligibilityRule>):ActivityEligibilityRule=>({id:"rule",participationMode:"individual",guardianConsentRequired:false,adultCompanionRequired:false,teacherOrGroupLeaderRequired:false,trainingRequired:false,insuranceRequired:false,...overrides});
const activity=(rules?:ActivityEligibilityRule[]):ActionOpportunity=>({...createPrototypeOpportunities()[0],id:`eligibility-${Math.random()}`,minimumAge:0,eligibilityRules:rules,riskLevel:"low",eligibilitySourceType:rules?"organization_submission":"not_confirmed",alternativeActions:[]});
const student=(age?:number,overrides:Partial<StudentActionProfile>={}):StudentActionProfile=>({studentId:"student",displayName:"學生",age,county:"高雄市",schoolId:"school",schoolName:"測試高中",schoolLevel:"senior_high",gmail:"student@gmail.com",skills:[],interests:[],availableTimes:[],transportation:[],guardianConsent:false,adultSupportAvailable:false,guardianConsentAvailable:false,adultCompanionAvailable:false,schoolParticipationAvailable:false,youthGroupParticipationAvailable:false,acceptsOnlineAction:true,acceptsCampusAction:true,updatedAt:"",...overrides});
const adult=rule({id:"adult",minAge:18});
const consent=rule({id:"consent",minAge:16,maxAge:17,participationMode:"guardian_consent",guardianConsentRequired:true});
const group=rule({id:"group",maxAge:15,participationMode:"school_group",guardianConsentRequired:true,teacherOrGroupLeaderRequired:true});

describe("activity eligibility engine",()=>{
  beforeEach(()=>{Object.defineProperty(globalThis,"localStorage",{value:new MemoryStorage(),configurable:true});Object.defineProperty(globalThis,"window",{value:{dispatchEvent:()=>true},configurable:true});opportunityPrototype.reset()});
  it("allows an 18-year-old to use an adult individual route",()=>expect(evaluateActivityEligibility(student(18),activity([adult])).result).toBe("eligible_directly"));
  it("matches a 17-year-old to the guardian-consent route, not the adult route",()=>expect(evaluateActivityEligibility(student(17),activity([adult,consent])).matchedRuleId).toBe("consent"));
  it("allows application when a 17-year-old has guardian consent",()=>expect(canSubmitIndividualApplication(evaluateActivityEligibility(student(17,{guardianConsentAvailable:true}),activity([consent])))).toBe(true));
  it("returns a missing guardian-consent action when consent is unavailable",()=>expect(evaluateActivityEligibility(student(17),activity([consent])).requiredActions).toContain("取得家長同意"));
  it("limits a 15-year-old to a school-group route",()=>expect(evaluateActivityEligibility(student(15),activity([group])).result).toBe("school_or_youth_group_only"));
  it("keeps the group route when school participation is available",()=>expect(evaluateActivityEligibility(student(15,{schoolParticipationAvailable:true,guardianConsentAvailable:true}),activity([group])).requiredActions).toHaveLength(0));
  it("shows an organization alternative when a young student lacks group support",()=>{const value=activity([group]);value.alternativeActions=[{title:"教育活動",description:"先參加教育活動",mode:"campus_action"}];expect(evaluateActivityEligibility(student(15),value).result).toBe("alternative_action_only")});
  it("marks an activity without age rules as unknown",()=>expect(evaluateActivityEligibility(student(17),activity()).result).toBe("eligibility_unknown"));
  it("does not infer age when the student has not entered it",()=>expect(evaluateActivityEligibility(student(undefined),activity([adult])).missingInformation).toContain("學生年齡"));
  it("handles adult, consent and under-16 group routes in one activity",()=>{const value=activity([adult,consent,group]);expect(evaluateActivityEligibility(student(18),value).matchedRuleId).toBe("adult");expect(evaluateActivityEligibility(student(17),value).matchedRuleId).toBe("consent");expect(evaluateActivityEligibility(student(15),value).matchedRuleId).toBe("group")});
  it("converts a legacy minimumAge safely",()=>{const legacy={...activity(),minimumAge:18,maximumAge:undefined,eligibilityRules:undefined};expect(normalizeEligibilityRules(legacy)).toMatchObject([{minAge:18,participationMode:"individual"}])});
  it("blocks publishing a high-risk minor route without all safeguards",()=>{const value=activity([consent]);value.riskLevel="high";expect(validateEligibilityForPublishing(value).join(" ")).toContain("高風險")});
  it("rechecks the latest rules when the student submits",()=>{const saved=opportunityRepository.save({...activity([consent]),id:"changing-rules",status:"published"});opportunityRepository.save({...saved,eligibilityRules:[adult],minimumAge:18});const result=applicationRepository.apply(saved,17,undefined,{studentProfile:student(17,{guardianConsentAvailable:true})});expect(result.ok).toBe(false)});
  it("cannot bypass an ineligible result by calling the repository directly",()=>{const saved=opportunityRepository.save({...activity([adult]),id:"adult-only",status:"published"});expect(applicationRepository.apply(saved,15,undefined,{studentProfile:student(15)}).ok).toBe(false)});
});
