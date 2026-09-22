import type {
  QuestionDifficulty,
  QuestionSourceType,
  QuestionStatus,
  QuestionType
} from "./types";

export const learningModuleCodes = [
  "DOG_BEHAVIOR",
  "ONE_HEALTH",
  "URBAN_ECOLOGY",
  "SHELTER_SAFETY",
  "RESEARCH_ETHICS"
] as const;

export type LearningModuleCode = (typeof learningModuleCodes)[number];

export type LearningModuleSeed = {
  id: string;
  code: LearningModuleCode;
  title: string;
  description: string;
  moduleOrder: number;
  estimatedMinutes: number;
  passingScore: number;
  status: "published";
  version: number;
};

export const phase2LearningModules: LearningModuleSeed[] = [
  {
    id: "lm_dog_behavior_v1",
    code: "DOG_BEHAVIOR",
    title: "Dog Behavior and Objective Observation",
    description: "Dog body language, stress signals, and objective non-contact behavior observation.",
    moduleOrder: 1,
    estimatedMinutes: 25,
    passingScore: 60,
    status: "published",
    version: 1
  },
  {
    id: "lm_one_health_v1",
    code: "ONE_HEALTH",
    title: "One Health and Zoonotic Disease Prevention",
    description: "Human-animal-environment relationships, hygiene, parasites, rabies awareness, and infection control.",
    moduleOrder: 2,
    estimatedMinutes: 25,
    passingScore: 60,
    status: "published",
    version: 1
  },
  {
    id: "lm_urban_ecology_v1",
    code: "URBAN_ECOLOGY",
    title: "Urban Ecology, Population, and Habitat",
    description: "Population distribution, habitat, food resources, human-dog conflict, GIS concepts, and environmental variables.",
    moduleOrder: 3,
    estimatedMinutes: 25,
    passingScore: 60,
    status: "published",
    version: 1
  },
  {
    id: "lm_shelter_safety_v1",
    code: "SHELTER_SAFETY",
    title: "Shelter Safety and Incident Reporting",
    description: "Non-contact rules, color zones, PPE, emergency procedures, prohibited actions, and incident reporting.",
    moduleOrder: 4,
    estimatedMinutes: 20,
    passingScore: 60,
    status: "published",
    version: 1
  },
  {
    id: "lm_research_ethics_v1",
    code: "RESEARCH_ETHICS",
    title: "Research Ethics and Data Quality",
    description: "Objective recording, privacy, consent, media restrictions, data quality, bias, and responsible communication.",
    moduleOrder: 5,
    estimatedMinutes: 25,
    passingScore: 60,
    status: "published",
    version: 1
  }
];

export type LearningStandardSeed = {
  id: string;
  jurisdiction: string;
  curriculumName: string;
  subject: string;
  educationLevel: string;
  gradeBand: string;
  learningContentCode: string;
  learningContentText: string;
  learningPerformanceCode: string;
  learningPerformanceText: string;
  coreCompetencyCode: string;
  coreCompetencyText: string;
  sourceAgency: string;
  governmentDatasetId?: string;
  sourceUrl: string;
  version: string;
  status: "official_verified" | "demo_reference" | "unverified";
  tags: string[];
  moduleCodes: LearningModuleCode[];
};

export const phase2LearningStandards: LearningStandardSeed[] = [
  {
    id: "std_demo_observation_classification",
    jurisdiction: "Taiwan",
    curriculumName: "DEMO_REFERENCE Natural Science Curriculum Alignment",
    subject: "Natural Science",
    educationLevel: "junior_high",
    gradeBand: "7-9",
    learningContentCode: "DEMO-OBS-01",
    learningContentText: "Use observable characteristics to classify and describe natural phenomena.",
    learningPerformanceCode: "DEMO-INQ-01",
    learningPerformanceText: "Record evidence objectively and distinguish observation from interpretation.",
    coreCompetencyCode: "DEMO-SCI-A",
    coreCompetencyText: "Scientific inquiry and evidence-based reasoning.",
    sourceAgency: "ShelterLab",
    governmentDatasetId: "29027",
    sourceUrl: "https://data.gov.tw/dataset/29027",
    version: "demo-2026",
    status: "demo_reference",
    tags: ["observation and classification", "scientific inquiry", "evidence-based reasoning"],
    moduleCodes: ["DOG_BEHAVIOR", "RESEARCH_ETHICS"]
  },
  {
    id: "std_demo_data_interpretation",
    jurisdiction: "Taiwan",
    curriculumName: "DEMO_REFERENCE Natural Science Curriculum Alignment",
    subject: "Natural Science",
    educationLevel: "senior_high",
    gradeBand: "10-12",
    learningContentCode: "DEMO-DATA-01",
    learningContentText: "Interpret simple datasets and identify limits of evidence.",
    learningPerformanceCode: "DEMO-DATA-02",
    learningPerformanceText: "Use tables, charts, and field notes to support claims.",
    coreCompetencyCode: "DEMO-SCI-B",
    coreCompetencyText: "Data interpretation and responsible scientific communication.",
    sourceAgency: "ShelterLab",
    governmentDatasetId: "15391",
    sourceUrl: "https://data.gov.tw/dataset/15391",
    version: "demo-2026",
    status: "demo_reference",
    tags: ["data interpretation", "evidence-based reasoning"],
    moduleCodes: ["URBAN_ECOLOGY", "RESEARCH_ETHICS"]
  },
  {
    id: "std_demo_ecology_population",
    jurisdiction: "Taiwan",
    curriculumName: "DEMO_REFERENCE Natural Science Curriculum Alignment",
    subject: "Natural Science",
    educationLevel: "junior_high",
    gradeBand: "7-9",
    learningContentCode: "DEMO-ECO-01",
    learningContentText: "Explain how organisms interact with habitat, resources, and human activity.",
    learningPerformanceCode: "DEMO-ECO-02",
    learningPerformanceText: "Connect ecological variables to population distribution.",
    coreCompetencyCode: "DEMO-SCI-C",
    coreCompetencyText: "Ecology and systems thinking.",
    sourceAgency: "ShelterLab",
    governmentDatasetId: "41236",
    sourceUrl: "https://data.gov.tw/dataset/41236",
    version: "demo-2026",
    status: "demo_reference",
    tags: ["ecology and population distribution", "urban ecology"],
    moduleCodes: ["URBAN_ECOLOGY"]
  },
  {
    id: "std_demo_one_health",
    jurisdiction: "Taiwan",
    curriculumName: "DEMO_REFERENCE Natural Science Curriculum Alignment",
    subject: "Natural Science",
    educationLevel: "junior_high",
    gradeBand: "7-9",
    learningContentCode: "DEMO-OH-01",
    learningContentText: "Describe links among human health, animal health, and environments.",
    learningPerformanceCode: "DEMO-OH-02",
    learningPerformanceText: "Apply hygiene and prevention principles to field learning.",
    coreCompetencyCode: "DEMO-SCI-D",
    coreCompetencyText: "One Health and risk prevention.",
    sourceAgency: "ShelterLab",
    governmentDatasetId: "6318",
    sourceUrl: "https://data.gov.tw/dataset/6318",
    version: "demo-2026",
    status: "demo_reference",
    tags: ["One Health", "evidence-based reasoning"],
    moduleCodes: ["ONE_HEALTH", "SHELTER_SAFETY"]
  },
  {
    id: "std_demo_research_ethics",
    jurisdiction: "Taiwan",
    curriculumName: "DEMO_REFERENCE Natural Science Curriculum Alignment",
    subject: "Natural Science",
    educationLevel: "senior_high",
    gradeBand: "10-12",
    learningContentCode: "DEMO-ETH-01",
    learningContentText: "Protect privacy and data quality in field investigation.",
    learningPerformanceCode: "DEMO-ETH-02",
    learningPerformanceText: "Identify bias and avoid unsupported claims.",
    coreCompetencyCode: "DEMO-SCI-E",
    coreCompetencyText: "Research ethics and responsible communication.",
    sourceAgency: "ShelterLab",
    sourceUrl: "UNVERIFIED",
    version: "demo-2026",
    status: "demo_reference",
    tags: ["research ethics", "data quality", "privacy"],
    moduleCodes: ["RESEARCH_ETHICS", "DOG_BEHAVIOR"]
  },
  {
    id: "std_demo_safety_inquiry",
    jurisdiction: "Taiwan",
    curriculumName: "DEMO_REFERENCE Natural Science Curriculum Alignment",
    subject: "Natural Science",
    educationLevel: "junior_high",
    gradeBand: "7-9",
    learningContentCode: "DEMO-SAFE-01",
    learningContentText: "Follow safety constraints during field inquiry.",
    learningPerformanceCode: "DEMO-SAFE-02",
    learningPerformanceText: "Report incidents and stop unsafe procedures.",
    coreCompetencyCode: "DEMO-SCI-F",
    coreCompetencyText: "Safe scientific practice.",
    sourceAgency: "ShelterLab",
    sourceUrl: "UNVERIFIED",
    version: "demo-2026",
    status: "demo_reference",
    tags: ["scientific inquiry", "safety", "research ethics"],
    moduleCodes: ["SHELTER_SAFETY"]
  }
];

export type QuestionOptionSeed = {
  id: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
  optionOrder: number;
};

export type QuestionSeed = {
  id: string;
  moduleCode: LearningModuleCode;
  questionType: QuestionType;
  prompt: string;
  explanation: string;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  version: number;
  sourceType: QuestionSourceType;
  sourceDatasetId?: string;
  sourceReference?: string;
  copyrightNote: string;
  standardIds: string[];
  resourceIds: string[];
  datasetIds: string[];
  bloomLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate";
  providerName?: string;
  providerVersion?: string;
  promptVersion?: string;
  options: QuestionOptionSeed[];
};

const moduleResourceIds: Record<LearningModuleCode, string[]> = {
  DOG_BEHAVIOR: ["res_teacher_behavior_primer"],
  ONE_HEALTH: ["res_teacher_one_health_primer"],
  URBAN_ECOLOGY: ["res_teacher_urban_ecology_primer"],
  SHELTER_SAFETY: ["res_teacher_safety_primer"],
  RESEARCH_ETHICS: ["res_teacher_ethics_primer"]
};

function singleChoice(
  id: string,
  moduleCode: LearningModuleCode,
  prompt: string,
  correct: string,
  distractors: string[],
  explanation: string,
  difficulty: QuestionDifficulty,
  standardIds: string[],
  questionType: QuestionType = "single_choice"
): QuestionSeed {
  const optionTexts = [correct, ...distractors];
  return {
    id,
    moduleCode,
    questionType,
    prompt,
    explanation,
    difficulty,
    status: "published",
    version: 1,
    sourceType: "project_seed",
    copyrightNote: "ShelterLab-authored demonstration question. Not copied from an examination source.",
    standardIds,
    resourceIds: moduleResourceIds[moduleCode],
    datasetIds: [],
    bloomLevel: difficulty === "advanced" ? "analyze" : difficulty === "intermediate" ? "apply" : "understand",
    options: optionTexts.map((optionText, index) => ({
      id: `${id}_opt_${index + 1}`,
      optionKey: String.fromCharCode(65 + index),
      optionText,
      isCorrect: index === 0,
      explanation: index === 0 ? "Correct option." : "Distractor option.",
      optionOrder: index + 1
    }))
  };
}

export const phase2Questions: QuestionSeed[] = [
  singleChoice("q_dog_01", "DOG_BEHAVIOR", "Which note is the most objective dog behavior record?", "Dog stood at the front of the kennel for 12 seconds.", ["The dog was cute.", "The dog hated visitors.", "The dog wanted to be adopted."], "Objective records describe observable actions without guessing emotions.", "basic", ["std_demo_observation_classification"]),
  singleChoice("q_dog_02", "DOG_BEHAVIOR", "A dog turns away, lowers its body, and moves to the back of the kennel. Which code best fits?", "MOVE_AWAY", ["APP_FRONT", "JUMP_GATE", "SPIN"], "Moving away from the observer is a measurable avoidance behavior.", "basic", ["std_demo_observation_classification"]),
  singleChoice("q_dog_03", "DOG_BEHAVIOR", "Which behavior can be a stress signal when repeated in a tense context?", "Lip licking", ["Sleeping deeply", "Drinking after exercise", "Sitting on cue"], "Lip licking can indicate stress depending on context and should be recorded objectively.", "intermediate", ["std_demo_observation_classification"]),
  singleChoice("q_dog_04", "DOG_BEHAVIOR", "What should a student do if unsure whether a dog is fearful or curious?", "Record the visible body language and avoid labeling emotion.", ["Write the dog is fearful.", "Ask to touch the dog.", "Skip the observation."], "Students should record evidence rather than infer mental states.", "intermediate", ["std_demo_observation_classification", "std_demo_research_ethics"]),
  singleChoice("q_dog_05", "DOG_BEHAVIOR", "Scenario: A dog stays at the rear, ears back, tail tucked, and does not approach. What is the safest observation response?", "Continue non-contact observation from the approved area.", ["Call the dog loudly.", "Offer food through the gate.", "Enter the kennel."], "Non-contact observation protects student and animal welfare.", "advanced", ["std_demo_observation_classification", "std_demo_safety_inquiry"], "scenario_choice"),
  singleChoice("q_dog_06", "DOG_BEHAVIOR", "Why should duration be recorded with behavior codes?", "It supports consistent comparison across observations.", ["It proves the dog is adoptable.", "It replaces all notes.", "It identifies disease."], "Duration turns observation into structured data.", "intermediate", ["std_demo_data_interpretation"]),
  singleChoice("q_oh_01", "ONE_HEALTH", "What does One Health emphasize?", "Connections among human, animal, and environmental health.", ["Only human hospital care.", "Only animal training.", "Only city planning."], "One Health links health across people, animals, and environments.", "basic", ["std_demo_one_health"]),
  singleChoice("q_oh_02", "ONE_HEALTH", "Which is the best hygiene action after shelter observation?", "Wash hands with soap or sanitizer after leaving the observation area.", ["Touch face before washing.", "Share gloves across students.", "Eat snacks in the kennel area."], "Hand hygiene reduces disease transmission risk.", "basic", ["std_demo_one_health", "std_demo_safety_inquiry"]),
  singleChoice("q_oh_03", "ONE_HEALTH", "Why are parasites relevant to shelter field learning?", "They can affect animal welfare and some may pose human health risks.", ["They only matter for wild birds.", "They are always visible.", "They prove a dog is aggressive."], "Parasite awareness is part of risk prevention.", "intermediate", ["std_demo_one_health"]),
  singleChoice("q_oh_04", "ONE_HEALTH", "What is rabies awareness mainly about in this program?", "Understanding prevention principles and avoiding risky contact.", ["Diagnosing rabies during observation.", "Handling unknown animals.", "Replacing staff safety rules."], "Students are not diagnosing disease; they follow prevention rules.", "intermediate", ["std_demo_one_health", "std_demo_safety_inquiry"]),
  singleChoice("q_oh_05", "ONE_HEALTH", "Scenario: A student notices a torn glove after leaving the observation area. What should happen?", "Report it and follow hygiene instructions.", ["Ignore it if no bite occurred.", "Use the glove again.", "Ask another student to inspect the dog."], "Potential exposure or PPE failure should be reported.", "advanced", ["std_demo_one_health", "std_demo_safety_inquiry"], "scenario_choice"),
  singleChoice("q_oh_06", "ONE_HEALTH", "Which statement is evidence-based?", "Hand hygiene lowers transmission risk after contact with contaminated surfaces.", ["All shelter dogs carry disease.", "Healthy-looking animals cannot carry pathogens.", "Masks make all contact safe."], "Evidence-based statements avoid overgeneralization.", "advanced", ["std_demo_one_health", "std_demo_research_ethics"]),
  singleChoice("q_eco_01", "URBAN_ECOLOGY", "Which variable is most relevant to urban free-roaming dog distribution?", "Food resource availability.", ["Dog name length.", "Student favorite color.", "Kennel paint color only."], "Resource availability can influence population distribution.", "basic", ["std_demo_ecology_population"]),
  singleChoice("q_eco_02", "URBAN_ECOLOGY", "What can GIS help students understand?", "Spatial patterns in habitats and observation locations.", ["A dog's emotions directly.", "A student's quiz score.", "A kennel lock code."], "GIS supports spatial reasoning about ecological variables.", "basic", ["std_demo_ecology_population"]),
  singleChoice("q_eco_03", "URBAN_ECOLOGY", "Which is a habitat variable?", "Shade and shelter availability.", ["A student's handwriting.", "The observer's nickname.", "The quiz timer."], "Habitat variables describe environmental conditions.", "intermediate", ["std_demo_ecology_population"]),
  singleChoice("q_eco_04", "URBAN_ECOLOGY", "Why should human-dog conflict be studied carefully?", "It involves behavior, environment, public health, and community context.", ["It is always caused by one dog.", "It can be solved by guessing.", "It does not require evidence."], "Conflict is multi-factorial and needs evidence.", "advanced", ["std_demo_ecology_population", "std_demo_one_health"]),
  singleChoice("q_eco_05", "URBAN_ECOLOGY", "Scenario: Two neighborhoods report different stray dog sightings. What is the best first analysis step?", "Compare observation effort, time, food sources, and habitat variables.", ["Assume one report is false.", "Conclude dogs prefer one neighborhood.", "Publish names of reporters."], "Data interpretation requires checking observation context and variables.", "advanced", ["std_demo_data_interpretation", "std_demo_ecology_population"], "scenario_choice"),
  singleChoice("q_eco_06", "URBAN_ECOLOGY", "What does population distribution describe?", "Where individuals are located across space.", ["How cute animals are.", "Whether one animal is friendly.", "Which student observed first."], "Distribution is a spatial population concept.", "basic", ["std_demo_ecology_population"]),
  {
    ...singleChoice("q_eco_synthetic_data_01", "URBAN_ECOLOGY", "SYNTHETIC_DEMO: Demo Region B has 18 participants and 12 completions. Which completion rate is supported by the fixture?", "67% (12 divided by 18, rounded).", ["12%", "18%", "150%"], "The denominator is all 18 synthetic participants and the numerator is 12 synthetic completions, so 12 / 18 is approximately 67%.", "intermediate", ["std_demo_data_interpretation"]),
    sourceType: "ai_draft",
    sourceDatasetId: "SYNTHETIC_EDUOD_001",
    sourceReference: "internal://shelterlab/synthetic/education-participation-v1",
    resourceIds: ["res_synthetic_eduod_literacy"],
    datasetIds: ["SYNTHETIC_EDUOD_001"],
    providerName: "deterministic",
    providerVersion: "shelterlab-s6-v1",
    promptVersion: "shelterlab-s6-v1"
  },
  singleChoice("q_safe_01", "SHELTER_SAFETY", "What does non-contact observation mean?", "Observe from approved areas without touching, feeding, or entering kennels.", ["Pet dogs only if calm.", "Enter yellow zones with friends.", "Feed treats through gates."], "The program is non-contact to reduce risk.", "basic", ["std_demo_safety_inquiry"]),
  singleChoice("q_safe_02", "SHELTER_SAFETY", "Who may enter red zones?", "Authorized shelter staff only.", ["Any student with a license.", "Teachers without staff approval.", "Students in pairs."], "Red zones are restricted for safety.", "basic", ["std_demo_safety_inquiry"]),
  singleChoice("q_safe_03", "SHELTER_SAFETY", "What should students do during an emergency alarm?", "Stop observation and follow staff instructions.", ["Finish the data sheet first.", "Move closer to the kennel.", "Record video of staff."], "Emergency procedures override observation tasks.", "intermediate", ["std_demo_safety_inquiry"]),
  singleChoice("q_safe_04", "SHELTER_SAFETY", "Which action is prohibited?", "Putting fingers through a kennel gate.", ["Standing in an approved observation area.", "Using a clipboard.", "Writing objective notes."], "Putting fingers through gates creates bite risk.", "basic", ["std_demo_safety_inquiry"]),
  singleChoice("q_safe_05", "SHELTER_SAFETY", "Scenario: A student drops a pencil near a kennel gate. What is safest?", "Ask staff for help and do not reach into restricted space.", ["Reach quickly if the dog is quiet.", "Ask another student to distract the dog.", "Leave the group without telling anyone."], "Students should not reach into restricted areas.", "advanced", ["std_demo_safety_inquiry"], "scenario_choice"),
  singleChoice("q_safe_06", "SHELTER_SAFETY", "Why are incidents reported even when no injury occurs?", "Near misses help improve safety procedures.", ["Reports are only for punishment.", "No-injury events are irrelevant.", "They replace future training."], "Near-miss reporting supports prevention.", "intermediate", ["std_demo_safety_inquiry", "std_demo_research_ethics"]),
  singleChoice("q_eth_01", "RESEARCH_ETHICS", "Which note protects data quality best?", "Dog barked 3 times in 20 seconds after a cart passed.", ["Dog was mean.", "Dog hates carts.", "Dog is unadoptable."], "Objective details support data quality.", "basic", ["std_demo_research_ethics", "std_demo_observation_classification"]),
  singleChoice("q_eth_02", "RESEARCH_ETHICS", "What media rule protects privacy?", "Do not capture student faces or private visitor information.", ["Post all videos publicly.", "Include classmates for scale.", "Record visitor conversations."], "Media restrictions protect privacy and consent.", "basic", ["std_demo_research_ethics"]),
  singleChoice("q_eth_03", "RESEARCH_ETHICS", "What is observer bias?", "A tendency for expectations to influence what is recorded.", ["A required behavior code.", "A shelter zone label.", "A disease symptom."], "Bias can affect data quality.", "intermediate", ["std_demo_research_ethics"]),
  singleChoice("q_eth_04", "RESEARCH_ETHICS", "Why should students avoid adoption claims from one observation?", "One short observation is insufficient evidence for broad claims.", ["Adoption claims are always illegal.", "Data never matters.", "Only photos matter."], "Responsible communication respects evidence limits.", "advanced", ["std_demo_data_interpretation", "std_demo_research_ethics"]),
  singleChoice("q_eth_05", "RESEARCH_ETHICS", "Scenario: A video includes another student's face. What should happen?", "Do not publish it and report the media issue for review.", ["Upload it because the dog is visible.", "Crop later without telling anyone.", "Share it in a class chat."], "Privacy issues must be handled before media use.", "advanced", ["std_demo_research_ethics"], "scenario_choice"),
  singleChoice("q_eth_06", "RESEARCH_ETHICS", "What makes a scientific claim responsible?", "It links evidence to a limited conclusion and notes uncertainty.", ["It sounds confident.", "It gets many likes.", "It avoids all numbers."], "Responsible communication connects evidence and uncertainty.", "intermediate", ["std_demo_data_interpretation", "std_demo_research_ethics"])
];

export const defaultQuizBlueprint = {
  id: "blueprint_level_1_v1",
  code: "LEVEL_1_RESEARCH_LICENSE",
  title: "Level 1 ShelterLab Research License Assessment",
  educationLevel: "secondary",
  version: 1,
  status: "published" as const,
  totalQuestions: 20,
  timeLimitMinutes: 30,
  passingScore: 80,
  maxAttempts: 3,
  cooldownMinutes: 30,
  randomizeQuestions: true,
  randomizeOptions: true,
  requiredPerModule: 4,
  minimumModuleScore: 60,
  difficultyDistribution: {
    basic: 2,
    intermediate: 1,
    advanced: 1
  }
};
