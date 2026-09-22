import { beforeEach, describe, expect, it } from "vitest";
import { createPrototypeOpportunities } from "@/data/action-opportunities";
import { activityResultRepository, applicationNotificationService, applicationRepository, bookmarkRepository, deriveOpportunityStatus, invitationRepository, matchesOpportunityQuery, messageRepository, notificationRepository, opportunityPrototype, opportunityRepository, organizationRegistrationRepository, organizationRepository, preferenceRepository, studentActionProfileRepository, studentMatchProfileRepository, visitProgramRepository, visitRequestRepository } from "@/lib/action-opportunities/browser-repository";
import { DEFAULT_ACTION_PREFERENCES, OPPORTUNITY_SOURCE_LABELS, type ActionOpportunity } from "@/lib/action-opportunities/types";

class MemoryStorage implements Storage {
  private values=new Map<string,string>();
  get length(){return this.values.size}
  clear(){this.values.clear()}
  getItem(key:string){return this.values.get(key)??null}
  key(index:number){return [...this.values.keys()][index]??null}
  removeItem(key:string){this.values.delete(key)}
  setItem(key:string,value:string){this.values.set(key,String(value))}
}

const future=(days:number)=>new Date(Date.now()+days*86400000).toISOString();
const base=()=>createPrototypeOpportunities()[0];
const save=(overrides:Partial<ActionOpportunity>)=>{const suffix=Math.random().toString(36).slice(2);return opportunityRepository.save({...base(),id:`scenario-${suffix}`,title:`情境測試 ${suffix}`,status:"published",...overrides})};

describe("action opportunity radar prototype scenarios",()=>{
  beforeEach(()=>{Object.defineProperty(globalThis,"localStorage",{value:new MemoryStorage(),configurable:true});Object.defineProperty(globalThis,"window",{value:{dispatchEvent:()=>true},configurable:true});opportunityPrototype.reset()});

  it("1. publishes a Kaohsiung weekend opportunity for age 16 and notifies a matching student",()=>{
    preferenceRepository.save({...DEFAULT_ACTION_PREFERENCES,city:"高雄市",age:16,weekdays:["假日"]});
    const item=save({id:"kaohsiung-16-weekend",city:"高雄市",minimumAge:16,weekdays:["假日"],status:"draft",title:"高雄假日志工示範"});
    opportunityRepository.setStatus(item.id,"published");
    expect(opportunityRepository.list().find(value=>value.id===item.id)?.status).toBe("published");
    expect(notificationRepository.list().some(value=>value.kind==="preference_match"&&value.opportunityId===item.id)).toBe(true);
  });

  it("2. blocks a 17-year-old from applying to an age-18 opportunity",()=>{
    const item=save({minimumAge:18,acceptsMinors:false});
    const result=applicationRepository.apply(item,17);
    expect(result.ok).toBe(false);
    if(!result.ok)expect(result.reason).toContain("年滿 18 歲");
    expect(applicationRepository.list()).toHaveLength(0);
  });

  it("3. creates a deadline reminder when a student bookmarks an activity ending in three days",()=>{
    const item=save({applicationDeadline:future(3),remainingCapacity:10});
    bookmarkRepository.toggle(item);
    expect(notificationRepository.list().some(value=>value.kind==="deadline_soon"&&value.opportunityId===item.id)).toBe(true);
  });

  it("4. notifies an applicant when a partner accepts the application",()=>{
    const item=save({minimumAge:16});
    const applied=applicationRepository.apply(item,17);
    expect(applied.ok).toBe(true);
    if(applied.ok)applicationRepository.updateStatus(applied.application.id,"accepted","請於活動前查看集合資訊。","入口集合");
    expect(notificationRepository.list().some(value=>value.kind==="application_accepted"&&value.actionLabel==="查看集合資訊")).toBe(true);
  });

  it("5. sends schedule updates to every applicant after the organization changes the date",()=>{
    const item=save({minimumAge:16});
    applicationRepository.apply(item,17);applicationRepository.apply(item,18);
    opportunityRepository.updateSchedule(item.id,future(10),future(11));
    expect(notificationRepository.list().filter(value=>value.kind==="schedule_updated"&&value.opportunityId===item.id)).toHaveLength(2);
  });

  it("6. derives expired status after the application deadline",()=>{
    const item=save({applicationDeadline:future(-1),status:"published"});
    expect(deriveOpportunityStatus(item)).toBe("expired");
    expect(opportunityRepository.list().find(value=>value.id===item.id)?.status).toBe("expired");
  });

  it("7. keeps a private source labelled as public private recruitment, never government partnership",()=>{
    const item=save({sourceType:"private_public_recruitment",sourceName:"民間示範來源"});
    expect(OPPORTUNITY_SOURCE_LABELS[item.sourceType]).toBe("民間正式招募頁");
    expect(OPPORTUNITY_SOURCE_LABELS[item.sourceType]).not.toContain("政府合作");
    expect(matchesOpportunityQuery({...item,title:"認養攝影協助"},"拍照")).toBe(true);
  });

  it("8. marks the Week 6 action complete and creates a reflection entry after participation",()=>{
    const item=save({minimumAge:16});
    localStorage.setItem("shelterlab-week6-action-draft-v2",JSON.stringify({stage:4,furthestStage:4,status:"draft",actionRecord:{actionType:"",status:"scheduled",nextStep:""}}));
    const applied=applicationRepository.apply(item,17);
    expect(applied.ok).toBe(true);
    if(applied.ok)applicationRepository.updateStatus(applied.application.id,"completed");
    const weekSix=JSON.parse(localStorage.getItem("shelterlab-week6-action-draft-v2")||"{}");
    expect(weekSix.stage).toBe(5);
    expect(weekSix.actionRecord.status).toBe("completed");
    expect(notificationRepository.list().some(value=>value.kind==="reflection_reminder"&&value.actionHref==="/student/week/6")).toBe(true);
  });

  it("9. links an opportunity and application to one organizationId and isolates another partner",()=>{
    const item=save({minimumAge:16});
    const applied=applicationRepository.apply(item,17);
    expect(applied.ok).toBe(true);
    expect(organizationRepository.get(item.organizationId)?.name).toBe(item.organizationName);
    const source=organizationRepository.get(item.organizationId)!;
    organizationRepository.save({...source,id:"second-partner",name:"第二個測試合作單位"});
    expect(applicationRepository.forOrganization(item.organizationId)).toHaveLength(1);
    expect(applicationRepository.forOrganization("second-partner")).toHaveLength(0);
  });

  it("10. never creates an internal application for official redirects or pending private information",()=>{
    const official=opportunityRepository.get("opp-ntpc-official")!;
    const pending=opportunityRepository.get("opp-private-pending")!;
    expect(applicationRepository.apply(official,18).ok).toBe(false);
    expect(applicationRepository.apply(pending,18).ok).toBe(false);
    expect(applicationRepository.list()).toHaveLength(0);
  });

  it("11. exposes only an anonymous student profile in the matching pool",()=>{
    const match=applicationRepository.createOpenMatching({...DEFAULT_ACTION_PREFERENCES,city:"臺中市",age:16,skills:["data_analysis"]});
    expect(match.studentId).toBe("local-demo-student");
    expect(match).toMatchObject({city:"臺中市",age:16,skills:["data_analysis"],optedIn:true});
    expect(applicationRepository.openMatchingPool()).toHaveLength(1);
  });

  it("12. links a visit request and its notification to the receiving organization",()=>{
    const organization=organizationRepository.partnerManaged()[0];
    const visit=applicationRepository.createVisitRequest(organization.id,"班級參訪需求");
    expect(visit?.organizationId).toBe(organization.id);
    expect(visitRequestRepository.forOrganization(organization.id).some(item=>item.id===visit?.id)).toBe(true);
    expect(notificationRepository.list().some(item=>item.visitRequestId===visit?.id&&item.category==="visit")).toBe(true);
  });

  it("13. creates an application only after a student accepts an anonymous invitation",()=>{
    const organization=organizationRepository.partnerManaged()[0],opportunity=opportunityRepository.listForOrganization(organization.id)[0];
    const profile=studentMatchProfileRepository.optIn({...DEFAULT_ACTION_PREFERENCES,age:16});
    const invitation=invitationRepository.invite(organization.id,profile.id,opportunity.id,"邀請查看活動");
    expect(applicationRepository.list()).toHaveLength(0);
    const response=invitationRepository.respond(invitation!.id,"accepted");
    expect(response?.applicationId).toBeTruthy();
    expect(applicationRepository.forOrganization(organization.id)).toHaveLength(1);
  });

  it("14. keeps applications, messages and results isolated by organizationId",()=>{
    const [first,second]=organizationRepository.partnerManaged();
    const opportunity=opportunityRepository.listForOrganization(first.id)[0];
    const applied=applicationRepository.apply(opportunity,18);
    expect(applied.ok).toBe(true);
    if(!applied.ok)return;
    applicationRepository.updateStatus(applied.application.id,"completed","完成示範");
    applicationRepository.addServiceRecord(applied.application.id,"完成紀錄",2);
    expect(applicationRepository.forOrganization(second.id)).toHaveLength(0);
    expect(messageRepository.forOrganization(second.id)).toHaveLength(0);
    expect(activityResultRepository.forOrganization(second.id)).toHaveLength(0);
  });

  it("15. keeps visit programs and requests in dedicated linked records",()=>{
    const organization=organizationRepository.partnerManaged()[2];
    const program=visitProgramRepository.forOrganization(organization.id)[0];
    const request=visitRequestRepository.create({visitProgramId:program.id,organizationId:organization.id,studentId:"local-demo-student",requesterRole:"teacher",requestedDate:program.availableDates[0],participantCount:28,note:"高中班級參訪"});
    expect(request?.visitProgramId).toBe(program.id);
    expect(applicationRepository.list()).toHaveLength(0);
    visitRequestRepository.updateStatus(request!.id,"accepted","日期已確認");
    expect(notificationRepository.list().some(item=>item.visitRequestId===request?.id&&item.kind==="visit_updated")).toBe(true);
  });

  it("16. stores a new organization account request as pending, not as a verified partner",()=>{
    const registration=organizationRegistrationRepository.submit({requestedOrganizationName:"測試動保協會",organizationType:"animal_welfare_association",county:"高雄市",officialWebsite:"https://example.org",publicPhone:"07-1234567",officialEmail:"office@example.org",contactName:"王老師",contactTitle:"專員",isNewOrganizationRequest:true});
    expect(registration.verificationStatus).toBe("pending");
    expect(organizationRepository.partnerManaged().some(item=>item.name==="測試動保協會")).toBe(false);
  });

  it("17. embeds school and Gmail only in an explicit application snapshot",()=>{
    const student=studentActionProfileRepository.save({studentId:"student-17",displayName:"測試學生",age:17,county:"高雄市",schoolId:"school-1",schoolName:"國立高雄高級中學",schoolLevel:"senior_high",grade:"高二",gmail:"student17@gmail.com",skills:["data_analysis"],interests:["data_support"],availableTimes:["假日白天"],transportation:["由成人陪同"],guardianConsent:true,adultSupportAvailable:true,updatedAt:""});
    const item=save({minimumAge:16});
    const applied=applicationRepository.apply(item,17,{...DEFAULT_ACTION_PREFERENCES,age:17},{studentProfile:student,guardianConsentConfirmed:true,adultCompanionConfirmed:true});
    expect(applied.ok).toBe(true);
    if(!applied.ok)return;
    expect(applied.application.profileSnapshot.studentActionProfile?.gmail).toBe("student17@gmail.com");
    expect(applicationRepository.forOrganization(item.organizationId)[0].profileSnapshot.studentActionProfile?.schoolName).toBe("國立高雄高級中學");
    expect(applicationRepository.forOrganization("another-organization")).toHaveLength(0);
  });

  it("18. creates a mailto draft but never marks an email as sent",()=>{
    const item=save({minimumAge:16});
    const applied=applicationRepository.apply(item,18);
    expect(applied.ok).toBe(true);
    if(!applied.ok)return;
    const draft=applicationNotificationService.createDecisionEmail({applicationId:applied.application.id,recipientEmail:"student@gmail.com",decision:"accepted"});
    expect(draft.mailtoUrl).toMatch(/^mailto:/);
    expect(draft.sentByPlatform).toBe(false);
    expect(draft.body).toContain("ShelterLab 尚未自動寄信");
  });
});
