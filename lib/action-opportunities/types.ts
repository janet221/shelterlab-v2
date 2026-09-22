export const TAIWAN_COUNTIES = [
  "基隆市", "臺北市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣", "宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣"
] as const;
export type TaiwanCounty = typeof TAIWAN_COUNTIES[number];
export type ActionParticipationMode = "online" | "school" | "onsite";
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
export type ActionOrganization = { id:string; name:string; county:string; latitude:number; longitude:number; address:string; phone:string; openingHours?:string; officialUrl:string; organizationType:OrganizationType; managementMode:OrganizationManagementMode; verificationLevel:OrganizationVerificationLevel; sourceLayer:DataSourceLayer; officialSource:string; sourceUrl:string; actionTags:ActionTag[]; studentNotes:string[]; requiresAdult:boolean; ageLimitNote:string; hasOfficialVolunteerInfo:boolean; evidenceLinks?:Array<{label:string;url:string}>; minimumAge?:number; minorPolicy:MinorPolicy; participationModes:ActionParticipationMode[]; actionTypes:string[]; commitmentTypes:CommitmentType[]; officialServices?:string[]; volunteerInformation?:VerificationState; verificationStatus:"official"|"manually_verified"; verifiedAt:string; dataSource:string; openDogCount?:number|null; isDemo?:boolean; demoNotice?:string };
export type TimeAvailability = "under_1"|"1_2"|"3_5"|"over_5";
export type TravelAbility = "online_only"|"within_county"|"guardian_accompanied"|"cross_county";
export type SkillTag = "photo_video"|"graphic_design"|"writing_social"|"data_analysis"|"event_planning"|"sorting"|"animal_care"|"recommend";
export type ActionCommitment = "one_time"|"long_term"|"both";
export type AdultSupport = "confirmed"|"need_to_ask"|"not_available";
export type PreferredRole = "information"|"school_project"|"remote_support"|"onsite_learning"|"material_coordinator"|"contact_proposer"|"not_sure";
export type ActionProfile = { age:number; county:string; weeklyTime:TimeAvailability; participationModes:ActionParticipationMode[]; travelAbility:TravelAbility; skills:SkillTag[]; commitment:ActionCommitment; adultSupport:AdultSupport; preferredRole:PreferredRole };
export type Coordinates = { latitude:number; longitude:number };
export type OrganizationMatch = { organization:ActionOrganization; eligible:boolean; exactMatch:boolean; reasons:string[]; distanceKm:number|null; score:number };
export type ContactMethod = "phone"|"email"|"visit_proposal"|"school_proposal";
export type ActionStatus = "not_started"|"prepared"|"contacted"|"waiting"|"scheduled"|"completed";
export type ActionRecord = { actionType:string; plannedDate:string; status:ActionStatus; adultSupportNote:string; conditionsToConfirm:string; nextStep:string; alternativePlan:string; reflection:string };
export type WeekSixJourneyDraft = { version:2; stage:number; furthestStage:number; profile:ActionProfile; selectedSchoolId:string; resourceCategoryFilter:ResourceCategoryFilter; actionFilter:ActionFilter; selectedOrganizationId:string; comparisonOrganizationIds:string[]; safetyAnswers:Record<string,string>; contactMethod:ContactMethod; contactDrafts:Record<ContactMethod,string>; actionRecord:ActionRecord; updatedAt:string; status:"draft"|"completed"; openDataDate:string };
export type WeekSixLegacyDraft = { version:1; profile:Omit<ActionProfile,"adultSupport"|"preferredRole">; selectedOrganizationId:string; selectedAt:string; status:"draft"; openDataDate:string };
export const WEEK_SIX_DRAFT_KEY = "shelterlab-week6-action-draft-v2";
export const WEEK_SIX_LEGACY_DRAFT_KEY = "shelterlab-week6-action-draft-v1";
export const UNKNOWN_OFFICIAL_TEXT = "官方資料未說明，請在行動前向單位確認。";
export const UNKNOWN_MINOR_POLICY_TEXT = "政府收容資料未提供學生參與規定，請向單位確認。";
export const ORGANIZATION_TYPE_LABELS:Record<OrganizationType,string> = { public_shelter:"公立動物收容所", animal_home:"動物之家", government_agency:"縣市動物保護處／防疫處", animal_protection_office:"縣市動物保護處／防疫處", education_park:"動物保護教育園區", animal_welfare_education_park:"動物保護教育園區", registered_nonprofit:"已驗證民間動保團體", private_rescue_group:"民間救援團體", animal_welfare_association:"動物保護協會", foundation:"動保基金會", rescue_group:"救援／中途組織", other_partner:"其他教育合作單位", other_verified_organization:"其他經確認的動保機構" };
export const ACTION_TAG_LABELS:Record<ActionTag,string> = { visit:"可參訪", volunteer:"可洽詢志工", material_donation:"可物資募集", school_outreach:"可教育宣導", reporting:"可學習通報", adoption_promotion:"可協助認養曝光" };
export const DATA_SOURCE_LAYER_LABELS:Record<DataSourceLayer,string> = { government_open_data:"政府開放資料", official_announcement:"官方公告", platform_partner:"平台合作", demo:"示範資料" };
export const DEFAULT_ACTION_PROFILE:ActionProfile = { age:16, county:"", weeklyTime:"1_2", participationModes:["online"], travelAbility:"within_county", skills:["recommend"], commitment:"both", adultSupport:"need_to_ask", preferredRole:"not_sure" };
export const DEFAULT_ACTION_RECORD:ActionRecord = { actionType:"", plannedDate:"", status:"not_started", adultSupportNote:"", conditionsToConfirm:"", nextStep:"", alternativePlan:"", reflection:"" };
export type AiActionMatchRequest={profile:ActionProfile;organizations:ActionOrganization[]};export type AiContactDraftRequest={organization:ActionOrganization;profile:ActionProfile;format:"phone"|"email"};export interface WeekSixAiService{matchActions(input:AiActionMatchRequest):Promise<never>;createContactDraft(input:AiContactDraftRequest):Promise<never>;}export interface ActionPassportService{saveDraft(draft:WeekSixJourneyDraft):Promise<never>;}

export const SAFETY_SCENARIOS = [
 {id:"injured",question:"路邊犬隻明顯受傷、受困，且仍有呼吸，你會先怎麼做？",options:[["move","沒有防護就直接把犬隻抱上車"],["1959","保持安全距離、記錄位置與狀況，撥 1959 動物保護專線"],["post","只把照片貼到社群等待網友處理"]],answer:"1959",explanation:"受傷或受困動物可向 1959 通報。先確保自己與交通安全，提供清楚位置與可觀察狀況，不自行冒險接觸。"},
 {id:"chasing",question:"犬群正在車道追車，已危及用路人安全，你會怎麼做？",options:[["ignore","等隔天再說"],["chase","跑進車道驅趕犬群"],["110","先到安全處，若危險正在發生就撥 110，並可再向 1959 通報犬隻問題"]],answer:"110",explanation:"正在發生、影響交通或人身安全的事件可先撥 110；犬隻後續處理可由 1959 轉介地方動保機關。"},
 {id:"fire",question:"犬隻受困火場或深坑，現場有立即生命危險，你會怎麼做？",options:[["119","撥 119 說明緊急救援位置與風險"],["email","寄一般詢問 Email"],["enter","自己進入危險區域救援"]],answer:"119",explanation:"火災、重大受困等緊急救援由 119 處理。不要讓自己成為第二名受困者。"},
 {id:"general",question:"你想詢問收容所是否接受學生參訪或協助，沒有緊急危險，應怎麼做？",options:[["1959","把 1959 當作活動報名專線"],["official","在開放時間用官方電話或網站先詢問資格與需求"],["visit","未預約就直接到現場"]],answer:"official",explanation:"一般合作或參訪不是緊急通報。應使用該單位公開的官方聯絡方式，先確認年齡、陪同、時段與內容。"}
 ,{id:"volunteer",question:"你想參加單位的志工服務，第一步應該是什麼？",options:[["show_up","直接到現場請工作人員安排工作"],["official","查看官方招募公告，確認年齡、訓練、保險與陪同規定，再由成人協助聯絡"],["promise","先向同學承諾一定能取得志工時數"]],answer:"official",explanation:"志工、服務學習、參訪是不同參與方式。先依官方公告確認資格與流程，未成年學生需讓教師或家長參與決定。"}
 ,{id:"donation",question:"班級想替動保單位募集物資，怎麼做比較負責任？",options:[["confirm","先詢問目前需要的品項、規格、數量與收取方式，再決定是否募集"],["collect","先大量募集家中用不到的物品再送去"],["guess","照社群貼文猜單位現在需要什麼"]],answer:"confirm",explanation:"物資需求會隨時間、庫存與照護對象改變。先向官方窗口確認，才能避免把不合用的物品變成單位負擔。"}
] as const;



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
