import type { DataSourceLayer, OrganizationManagementMode, OrganizationVerificationLevel, SkillTag, TravelAbility } from "@/lib/week-six-action";

export {
  ACTION_TAG_LABELS,
  DATA_SOURCE_LAYER_LABELS,
  ORGANIZATION_TYPE_LABELS,
  SAFETY_SCENARIOS,
  TAIWAN_COUNTIES,
  WEEK_SIX_DRAFT_KEY,
  WEEK_SIX_LEGACY_DRAFT_KEY
} from "@/lib/week-six-action";
export type {
  ActionOrganization,
  ActionProfile,
  DataSourceLayer,
  OrganizationManagementMode,
  OrganizationMatch,
  OrganizationType,
  OrganizationVerificationLevel,
  SkillTag,
  TaiwanCounty,
  TravelAbility
} from "@/lib/week-six-action";

export type OpportunityStatus = "draft" | "pending_review" | "published" | "full" | "closed" | "expired" | "suspended" | "cancelled";
export type OpportunityCategory = "volunteer" | "visit" | "education" | "school_outreach" | "adoption_photo" | "social_media" | "data_support" | "material_drive" | "adoption_event" | "care_training" | "other";
export type OpportunitySourceType = "official" | "private_public_recruitment" | "partner_submitted" | "admin_added";
export type OpportunityApplicationMode = "internal_application" | "external_form" | "official_website" | "phone_contact" | "email_contact" | "information_only";
export type RecruitmentPattern = "one_time" | "recurring" | "contact_required" | "no_fixed_deadline";
export type ParticipationFormat = "onsite" | "online" | "hybrid";
export type ParticipationMode = "individual" | "guardian_consent" | "guardian_accompanied" | "school_group" | "youth_group" | "online_or_campus";
export type ActivityRiskLevel = "low" | "medium" | "high";
export type EligibilitySourceType = "official_announcement" | "organization_submission" | "platform_verified" | "not_confirmed";
export type AlternativeActionMode = "guardian_activity" | "school_group" | "youth_group" | "campus_action" | "online_action" | "contact_organization";
export type ActivityEligibilityRule = {
  id:string; minAge?:number; maxAge?:number; participationMode:ParticipationMode;
  guardianConsentRequired:boolean; adultCompanionRequired:boolean; teacherOrGroupLeaderRequired:boolean;
  trainingRequired:boolean; insuranceRequired:boolean; professionalSupervisionRequired?:boolean; emergencyPlanRequired?:boolean; note?:string;
};
export type ActivityAlternativeAction = { title:string; description:string; mode:AlternativeActionMode; };
export type EligibilityResultType = "eligible_directly" | "eligible_with_guardian_consent" | "eligible_with_adult" | "school_or_youth_group_only" | "alternative_action_only" | "not_eligible" | "eligibility_unknown";
export type EligibilityResult = {
  result:EligibilityResultType; matchedRuleId?:string; reasons:string[]; requiredActions:string[]; missingInformation:string[];
  alternativeActions:ActivityAlternativeAction[];
};
export type SchoolLevel = "junior_high" | "senior_high" | "vocational_high" | "comprehensive";
export type OrganizationAccountVerificationStatus = "pending" | "verified" | "rejected";
export type ApplicationKind = "direct_application" | "matching_invitation";
export type ApplicationStatus = "submitted" | "viewed" | "reviewing" | "under_review" | "needs_information" | "needs_teacher_confirmation" | "accepted" | "waitlisted" | "rejected" | "declined" | "withdrawn" | "scheduled" | "completed" | "cancelled";
export type NotificationCategory = "new_opportunity" | "application" | "organization" | "visit" | "reminder" | "system" | "saved" | "matching";
export type NotificationKind = "preference_match" | "deadline_soon" | "capacity_low" | "application_submitted" | "application_accepted" | "waitlisted" | "needs_information" | "teacher_confirmation" | "declined" | "schedule_updated" | "safety_reminder" | "cancelled" | "reflection_reminder" | "service_record_updated" | "opportunity_updated" | "matching_invitation" | "visit_updated";

export type ActionOpportunity = {
  id:string; organizationId:string; managementMode:OrganizationManagementMode; applicationMode:OpportunityApplicationMode;
  externalId?:string; sourceId:string; sourceName:string; sourceUrl:string; sourceType:OpportunitySourceType; sourceLayer:DataSourceLayer;
  organizationName:string; organizationUrl:string; title:string; category:OpportunityCategory; opportunityTypes:OpportunityCategory[];
  description:string; learningGoals:string[]; workItems:string[]; city:string; address:string; latitude?:number; longitude?:number;
  applicationStartAt?:string; applicationDeadline?:string; eventStartAt?:string; eventEndAt?:string; capacity?:number; remainingCapacity?:number;
  minimumAge:number; acceptsMinors:boolean; guardianRequired:boolean; guardianConsentRequired:boolean; teacherRequired:boolean; groupApplication:boolean;
  skillsNeeded:SkillTag[]; skills:string[]; trainingRequired:boolean; safetyNotes:string[]; serviceHoursProvided:boolean; serviceHoursNote?:string;
  contactMethod:string; participationFormat:ParticipationFormat; weekdays:string[]; timeSlots:string[]; status:OpportunityStatus;
  recruitmentPattern:RecruitmentPattern; isRecurring:boolean; firstSeenAt:string; lastSeenAt:string; lastVerifiedAt:string; publishedAt?:string;
  updatedAt:string; verificationNote:string; isDemo?:boolean;
  summary?:string; district?:string; maximumAge?:number; eligibleSchoolLevels?:SchoolLevel[]; suitableSkills?:SkillTag[];
  duties?:string[]; adultCompanionRequired?:boolean; contactName?:string; contactEmail?:string; contactPhone?:string;
  eligibilityRules?:ActivityEligibilityRule[]; riskLevel?:ActivityRiskLevel; eligibilitySourceType?:EligibilitySourceType;
  eligibilitySourceUrl?:string; eligibilityLastVerifiedAt?:string; alternativeActions?:ActivityAlternativeAction[];
};

export type ActionPreferences = { city:string; maxDistanceKm:number; age:number; weekdays:string[]; timeSlots:string[]; adultSupport:boolean; needsServiceHours:boolean; categories:OpportunityCategory[]; skills:SkillTag[]; acceptsOnline:boolean; acceptsGroup:boolean; travelAbility?:TravelAbility };
export type SavedSearch = { id:string; name:string; query:string; preferences:ActionPreferences; createdAt:string };
export type StudentActionProfile = {
  studentId:string; displayName:string; age?:number; county:string; schoolId:string; schoolName:string; schoolLevel:SchoolLevel;
  grade?:string; gmail:string; skills:SkillTag[]; interests:OpportunityCategory[]; availableTimes:string[]; transportation:string[];
  guardianConsent:boolean; adultSupportAvailable:boolean; updatedAt:string;
  guardianConsentAvailable?:boolean; adultCompanionAvailable?:boolean; schoolParticipationAvailable?:boolean;
  youthGroupParticipationAvailable?:boolean; acceptsOnlineAction?:boolean; acceptsCampusAction?:boolean;
};
export type ApplicationProfileSnapshot = { city:string; age:number; weekdays:string[]; timeSlots:string[]; adultSupport:boolean; skills:SkillTag[]; acceptsOnline:boolean; acceptsGroup:boolean; travelAbility:TravelAbility; actionPreferences:OpportunityCategory[]; studentActionProfile?:StudentActionProfile };
export type ApplicationStatusHistory = { status:ApplicationStatus; note:string; changedAt:string; changedBy:"student"|"organization"|"system" };
export type TeacherConfirmationStatus = "not_required" | "pending" | "confirmed";
export type OpportunityApplication = {
  id:string; kind:ApplicationKind; opportunityId:string; organizationId:string; studentId:string; studentLabel:string; age:number; ageBand:string;
  profileSnapshot:ApplicationProfileSnapshot; teacherConfirmationStatus:TeacherConfirmationStatus; motivation:string; learningGoals:string[];
  status:ApplicationStatus; statusHistory:ApplicationStatusHistory[]; createdAt:string; updatedAt:string; meetingInfo?:string; note?:string; serviceHours?:number;
  availableTimes?:string[]; guardianConsentConfirmed?:boolean; adultCompanionConfirmed?:boolean;
};

export type OrganizationRegistration = {
  id:string; organizationId?:string; requestedOrganizationName?:string; organizationType:string; county:string; address?:string;
  officialWebsite?:string; publicPhone:string; officialEmail:string; sourceUrl?:string; contactName:string; contactTitle:string;
  verificationStatus:OrganizationAccountVerificationStatus; submittedAt:string; updatedAt:string; isNewOrganizationRequest:boolean;
};

export type ApplicationEmailDecision = "accepted" | "waitlisted" | "rejected" | "needs_information";
export interface ApplicationNotificationService {
  createDecisionEmail(input:{ applicationId:string; recipientEmail:string; decision:ApplicationEmailDecision; subject?:string; body?:string }): { subject:string; body:string; mailtoUrl:string; sentByPlatform:false };
}

export const SCHOOL_LEVEL_LABELS:Record<SchoolLevel,string> = { junior_high:"國民中學", senior_high:"普通型高中", vocational_high:"技術型高中／高職", comprehensive:"綜合型高中" };

export type StudentMatchProfile = {
  id:string; studentId:string; displayName:string; ageBand:string; age:number; city:string; weekdays:string[]; timeSlots:string[]; travelAbility:TravelAbility;
  skills:SkillTag[]; actionPreferences:OpportunityCategory[]; teacherConfirmationStatus:TeacherConfirmationStatus; optedIn:boolean; createdAt:string; updatedAt:string;
};
export type MatchInvitation = { id:string; organizationId:string; studentMatchProfileId:string; opportunityId:string; status:"pending"|"accepted"|"declined"; message:string; createdAt:string; updatedAt:string; applicationId?:string };

export type VisitProgramStatus = "draft"|"published"|"closed";
export type VisitProgram = {
  id:string; organizationId:string; title:string; programType:"guided_visit"|"life_education"|"career_exploration"|"custom"; gradeBands:string[];
  capacity:number; durationMinutes:number; learningGoals:string[]; preTasks:string[]; itinerary:string[]; learningStations:string[]; safetyRules:string[];
  animalContactRules:string[]; worksheet:string; reflectionPrompt:string; availableDates:string[]; visitTime?:string; status:VisitProgramStatus; createdAt:string; updatedAt:string;
};
export type VisitRequestStatus = "submitted"|"under_review"|"needs_information"|"accepted"|"reschedule_proposed"|"declined"|"cancelled"|"completed";
export type VisitRequest = {
  id:string; visitProgramId:string; organizationId:string; studentId:string; requesterRole:"student"|"teacher"; requestedDate:string; participantCount:number;
  status:VisitRequestStatus; proposedDate?:string; note:string; statusHistory:Array<{status:VisitRequestStatus;note:string;changedAt:string;changedBy:"student"|"organization"|"system"}>; createdAt:string; updatedAt:string;
};
export type StructuredMessage = { id:string; organizationId:string; applicationId?:string; visitRequestId?:string; type:"status_update"|"information_request"|"meeting"|"teacher_notice"|"general"; recipient:"student"|"teacher"|"organization"; content:string; createdAt:string; read:boolean };
export type ActivityResult = { id:string; organizationId:string; opportunityId:string; applicationId:string; serviceHours:number; tasksCompleted:string[]; partnerNote:string; completedAt:string };
export type ActionNotification = { id:string; category:NotificationCategory; kind:NotificationKind; title:string; summary:string; source:string; createdAt:string; read:boolean; saved:boolean; archived:boolean; opportunityId?:string; applicationId?:string; visitRequestId?:string; invitationId?:string; actionLabel:string; actionHref:string };

export const OPPORTUNITY_CATEGORY_LABELS:Record<OpportunityCategory,string> = { volunteer:"志工服務", visit:"參訪", education:"生命教育", school_outreach:"校園合作", adoption_photo:"認養攝影", social_media:"社群宣傳", data_support:"資料整理", material_drive:"物資募集", adoption_event:"認養活動協助", care_training:"照護訓練", other:"其他行動" };
export const OPPORTUNITY_STATUS_LABELS:Record<OpportunityStatus,string> = { draft:"草稿", pending_review:"等待平台審核", published:"招募中", full:"名額已滿", closed:"已結束", expired:"已截止", suspended:"暫停招募", cancelled:"已取消" };
export const APPLICATION_STATUS_LABELS:Record<ApplicationStatus,string> = { submitted:"已送出", viewed:"機構已查看", reviewing:"審核中", under_review:"審核中", needs_information:"待補資料", needs_teacher_confirmation:"待教師確認", accepted:"已錄取", waitlisted:"候補中", rejected:"未錄取", declined:"未錄取", withdrawn:"已撤回", scheduled:"已排定", completed:"已完成", cancelled:"已取消" };
export const OPPORTUNITY_SOURCE_LABELS:Record<OpportunitySourceType,string> = { official:"官方公開資訊", private_public_recruitment:"民間正式招募頁", partner_submitted:"合作單位刊登", admin_added:"平台依來源整理" };
export const APPLICATION_MODE_LABELS:Record<OpportunityApplicationMode,string> = { internal_application:"站內申請", external_form:"前往外部報名表", official_website:"前往官方管道", phone_contact:"電話洽詢", email_contact:"Email 洽詢", information_only:"查看參與說明" };
export const MANAGEMENT_MODE_LABELS:Record<OrganizationManagementMode,string> = { partner_managed:"已進駐平台", platform_curated:"公開資料單位（尚未進駐）", external_redirect:"外部管道（尚未進駐）" };
export const VERIFICATION_LEVEL_LABELS:Record<OrganizationVerificationLevel,string> = { government_official:"政府官方資料", official_partnership:"平台正式合作", verified_nonprofit:"已驗證民間團體", public_information_only:"僅整理公開資訊", pending_verification:"待驗證" };
export const PARTICIPATION_MODE_LABELS:Record<ParticipationMode,string> = { individual:"個人參加", guardian_consent:"家長同意後參加", guardian_accompanied:"成人全程陪同", school_group:"學校團體", youth_group:"青少年團體", online_or_campus:"線上／校園行動" };
export const RISK_LEVEL_LABELS:Record<ActivityRiskLevel,string> = { low:"低風險", medium:"中風險", high:"高風險" };
export const ELIGIBILITY_SOURCE_LABELS:Record<EligibilitySourceType,string> = { official_announcement:"官方公告", organization_submission:"機構自行刊登", platform_verified:"平台已確認", not_confirmed:"尚未確認" };
export const SKILL_LABELS:Record<SkillTag,string> = { photo_video:"攝影／影像", graphic_design:"視覺設計", writing_social:"文字／社群", data_analysis:"資料整理", event_planning:"活動企劃", sorting:"物資分類", animal_care:"動物照護", recommend:"尚未確定" };
export const DEFAULT_ACTION_PREFERENCES:ActionPreferences = { city:"高雄市", maxDistanceKm:30, age:16, weekdays:["假日"], timeSlots:["白天"], adultSupport:true, needsServiceHours:false, categories:[], skills:[], acceptsOnline:true, acceptsGroup:true, travelAbility:"guardian_accompanied" };
