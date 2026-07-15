import type { EngineUser } from "../research-license/engine";
import type { AuditEvent } from "../research-license/engine";
import { persistAuditEvents } from "../audit/persistent-audit";
import { inquiryDemoActors, sprint9ADemoService } from "./demo-data";
import type { InquiryActor, InquiryState } from "./types";

export function asInquiryActor(user:EngineUser):InquiryActor{if(user.id===inquiryDemoActors.teacher.id)return inquiryDemoActors.teacher;if(user.id===inquiryDemoActors.shelter.id)return inquiryDemoActors.shelter;if(user.id===inquiryDemoActors.admin.id)return inquiryDemoActors.admin;return{id:user.id,role:user.role,authorizedCourseIds:user.authorizedCoursePlanIds};}
function snapshot(state:InquiryState):InquiryState{return{projects:new Map(structuredClone([...state.projects.entries()])),evidenceLinks:structuredClone(state.evidenceLinks),designs:structuredClone(state.designs),datasets:structuredClone(state.datasets),analyses:structuredClone(state.analyses),cerStatements:structuredClone(state.cerStatements),systemMaps:structuredClone(state.systemMaps),recommendations:structuredClone(state.recommendations),reviews:structuredClone(state.reviews),competencyEvidence:structuredClone(state.competencyEvidence),auditEvents:structuredClone(state.auditEvents)};}
function restore(target:InquiryState,backup:InquiryState){Object.assign(target,backup);}
export async function runAuditedInquiryMutation<T extends{auditEvents:AuditEvent[]}>(mutation:()=>T){const backup=snapshot(sprint9ADemoService.state);try{const result=mutation();if(result.auditEvents.length)await persistAuditEvents(result.auditEvents);return result;}catch(error){restore(sprint9ADemoService.state,backup);throw error;}}
export{sprint9ADemoService};

