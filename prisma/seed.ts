import { PrismaClient, Prisma } from "@prisma/client";
import { createDatasetAdapter, SyntheticDemoDatasetAdapter } from "../lib/government-data/adapters";
import { activatedOfficialDatasets, configuredGovernmentDatasets, syntheticEducationDataset } from "../lib/government-data/sprint6-fixtures";
import { activatedDatasetProductUses } from "../lib/government-data/product-uses";
import { behaviorCodeRegistry } from "../lib/living-lab/behavior-registry";
import { buildSprint7Demo } from "../lib/living-lab/demo-data";
import {
  defaultQuizBlueprint,
  phase2LearningModules,
  phase2LearningStandards,
  phase2Questions
} from "../lib/research-license/phase2-data";
import { curriculumModules } from "../lib/research-license/curriculum";
import {
  phase4CoursePlan,
  phase4CourseWeeks,
  phase4CurriculumResources,
  phase4QuestionBlueprints,
  phase4QuestionDrafts,
  phase4ResourceMappings,
  phase4StudentResourceProgress
} from "../lib/curriculum-library/phase4-data";

const prisma = new PrismaClient();
const syncedAt = new Date("2026-01-01T02:00:00.000Z");
const officialSyncedAt = new Date("2026-07-11T06:00:00.000Z");

async function seedGovernmentDatasets() {
  for (const dataset of configuredGovernmentDatasets) {
    await prisma.governmentDataset.upsert({
      where: { datasetId: dataset.datasetId },
      update: {
        name: dataset.name,
        agency: dataset.agency,
        sourceUrl: dataset.sourceUrl,
        updateFrequency: dataset.updateFrequency,
        licenseNote: dataset.licenseNote,
        status: dataset.active ? "mock_synced" : "disabled",
        lastSyncedAt: dataset.active ? officialSyncedAt : null,
        lastSuccessfulSyncedAt: dataset.active ? officialSyncedAt : null,
        lastSyncAttemptedAt: dataset.active ? officialSyncedAt : null,
        lastSyncError: null,
        syncCron: "0 2 * * *",
        lastCheckedAt: dataset.lastCheckedAt,
        referenceStatus: "verified",
        verificationState: dataset.verificationState,
        attributionText: dataset.attribution,
        schemaVersion: dataset.schemaVersion,
        retrievalStatus: dataset.retrievalStatus,
        validationStatus: dataset.validationStatus,
        active: dataset.active,
        adapterKey: dataset.adapterKey,
        failureMessage: null
      },
      create: {
        datasetId: dataset.datasetId,
        name: dataset.name,
        agency: dataset.agency,
        sourceUrl: dataset.sourceUrl,
        updateFrequency: dataset.updateFrequency,
        licenseNote: dataset.licenseNote,
        status: dataset.active ? "mock_synced" : "disabled",
        syncCron: "0 2 * * *",
        lastCheckedAt: dataset.lastCheckedAt,
        referenceStatus: "verified",
        verificationState: dataset.verificationState,
        attributionText: dataset.attribution,
        schemaVersion: dataset.schemaVersion,
        retrievalStatus: dataset.retrievalStatus,
        validationStatus: dataset.validationStatus,
        active: dataset.active,
        adapterKey: dataset.adapterKey,
        lastSyncedAt: dataset.active ? officialSyncedAt : null,
        lastSuccessfulSyncedAt: dataset.active ? officialSyncedAt : null,
        lastSyncAttemptedAt: dataset.active ? officialSyncedAt : null
      }
    });
  }

  await prisma.governmentDataset.upsert({
    where: { datasetId: syntheticEducationDataset.datasetId },
    update: {
      name: syntheticEducationDataset.name,
      agency: syntheticEducationDataset.agency,
      sourceUrl: syntheticEducationDataset.sourceUrl,
      updateFrequency: syntheticEducationDataset.updateFrequency,
      licenseNote: syntheticEducationDataset.licenseNote,
      attributionText: syntheticEducationDataset.attribution,
      verificationState: "SYNTHETIC_DEMO",
      schemaVersion: syntheticEducationDataset.schemaVersion,
      retrievalStatus: "SUCCESS",
      validationStatus: "PASSED",
      active: true,
      adapterKey: syntheticEducationDataset.adapterKey,
      lastCheckedAt: syncedAt,
      lastSyncedAt: syncedAt,
      lastSuccessfulSyncedAt: syncedAt,
      lastSyncAttemptedAt: syncedAt,
      failureMessage: null
    },
    create: {
      datasetId: syntheticEducationDataset.datasetId,
      name: syntheticEducationDataset.name,
      agency: syntheticEducationDataset.agency,
      sourceUrl: syntheticEducationDataset.sourceUrl,
      updateFrequency: syntheticEducationDataset.updateFrequency,
      licenseNote: syntheticEducationDataset.licenseNote,
      attributionText: syntheticEducationDataset.attribution,
      status: "mock_synced",
      referenceStatus: "demo",
      verificationState: "SYNTHETIC_DEMO",
      schemaVersion: syntheticEducationDataset.schemaVersion,
      retrievalStatus: "SUCCESS",
      validationStatus: "PASSED",
      active: true,
      adapterKey: syntheticEducationDataset.adapterKey,
      syncCron: "0 2 * * *",
      lastCheckedAt: syncedAt,
      lastSyncedAt: syncedAt,
      lastSuccessfulSyncedAt: syncedAt,
      lastSyncAttemptedAt: syncedAt
    }
  });

  const snapshot = await new SyntheticDemoDatasetAdapter().createSnapshot({ now: syncedAt });
  await prisma.governmentDatasetSnapshot.upsert({
    where: { datasetId_contentHash: { datasetId: snapshot.datasetId, contentHash: snapshot.contentHash } },
    update: { isLastSuccessful: true, retrievedAt: snapshot.retrievedAt },
    create: {
      id: snapshot.id,
      datasetId: snapshot.datasetId,
      snapshotVersion: snapshot.snapshotVersion,
      schemaVersion: snapshot.schemaVersion,
      verificationState: snapshot.verificationState,
      retrievedAt: snapshot.retrievedAt,
      recordCount: snapshot.recordCount,
      contentHash: snapshot.contentHash,
      normalizedData: snapshot.normalizedRows as Prisma.InputJsonValue,
      sourceMetadata: snapshot.provenance as Prisma.InputJsonValue,
      isLastSuccessful: true
    }
  });
  await prisma.governmentDatasetSyncRun.upsert({
    where: { id: "sync_synthetic_eduod_001" },
    update: { status: "SUCCEEDED", snapshotId: snapshot.id, completedAt: syncedAt },
    create: { id: "sync_synthetic_eduod_001", datasetId: snapshot.datasetId, snapshotId: snapshot.id, adapterKey: "synthetic-demo", status: "SUCCEEDED", correlationId: "seed-sprint6", startedAt: syncedAt, completedAt: syncedAt, previewCount: snapshot.recordCount, importedCount: snapshot.recordCount }
  });
  await prisma.governmentDatasetAttribution.upsert({
    where: { datasetId_version: { datasetId: snapshot.datasetId, version: 1 } },
    update: { attributionText: syntheticEducationDataset.attribution },
    create: { datasetId: snapshot.datasetId, attributionText: syntheticEducationDataset.attribution, licenseNote: syntheticEducationDataset.licenseNote, sourceUrl: syntheticEducationDataset.sourceUrl, validFrom: syncedAt, version: 1 }
  });
  for (const [sourceField, normalizedField, dataType] of [
    ["demoRegion", "demo_region", "string"],
    ["moduleCode", "module_code", "string"],
    ["participants", "participants", "integer"],
    ["completed", "completed", "integer"]
  ] as const) {
    await prisma.governmentDatasetFieldMapping.upsert({
      where: { datasetId_normalizedField_version: { datasetId: snapshot.datasetId, normalizedField, version: 1 } },
      update: { sourceField, dataType },
      create: { datasetId: snapshot.datasetId, sourceField, normalizedField, dataType, required: true, version: 1 }
    });
  }
  for (const [usageModule, entityType, entityId, purpose] of [
    ["LEARNING_RESOURCE_MAPPING", "curriculum_resource", "res_synthetic_eduod_literacy", "Teach denominator-aware interpretation with synthetic records."],
    ["QUESTION_GENERATION", "question_generation_blueprint", "qgb_urban_ecology_v1", "Ground one deterministic Research License draft."],
    ["COMPETITION_EVIDENCE", "competition_trace", "sprint6_complete_chain", "Show open data as an integral educational input."]
  ] as const) {
    await prisma.governmentDatasetUsage.upsert({
      where: { datasetId_usageModule_entityType_entityId_version: { datasetId: snapshot.datasetId, usageModule, entityType, entityId, version: 1 } },
      update: { snapshotId: snapshot.id, purpose, active: true },
      create: { datasetId: snapshot.datasetId, snapshotId: snapshot.id, usageModule, entityType, entityId, purpose, version: 1, active: true }
    });
  }

  for (const dataset of activatedOfficialDatasets) {
    const adapter = createDatasetAdapter(dataset.datasetId);
    const officialSnapshot = await adapter.createSnapshot({ now: officialSyncedAt });
    await prisma.governmentDatasetSnapshot.upsert({
      where: { datasetId_contentHash: { datasetId: dataset.datasetId, contentHash: officialSnapshot.contentHash } },
      update: { isLastSuccessful: true, retrievedAt: officialSnapshot.retrievedAt, sourceMetadata: officialSnapshot.provenance as Prisma.InputJsonValue },
      create: {
        id: officialSnapshot.id,
        datasetId: dataset.datasetId,
        snapshotVersion: officialSnapshot.snapshotVersion,
        schemaVersion: officialSnapshot.schemaVersion,
        verificationState: officialSnapshot.verificationState,
        retrievedAt: officialSnapshot.retrievedAt,
        recordCount: officialSnapshot.recordCount,
        contentHash: officialSnapshot.contentHash,
        normalizedData: officialSnapshot.normalizedRows as Prisma.InputJsonValue,
        sourceMetadata: officialSnapshot.provenance as Prisma.InputJsonValue,
        isLastSuccessful: true
      }
    });
    await prisma.governmentDatasetSyncRun.upsert({
      where: { id: `sync_verified_${dataset.datasetId}_001` },
      update: { status: "SUCCEEDED", snapshotId: officialSnapshot.id, completedAt: officialSyncedAt },
      create: { id: `sync_verified_${dataset.datasetId}_001`, datasetId: dataset.datasetId, snapshotId: officialSnapshot.id, adapterKey: dataset.adapterKey, status: "SUCCEEDED", correlationId: "seed-sprint6-1", startedAt: officialSyncedAt, completedAt: officialSyncedAt, previewCount: officialSnapshot.recordCount, importedCount: officialSnapshot.recordCount }
    });
    await prisma.governmentDatasetAttribution.upsert({
      where: { datasetId_version: { datasetId: dataset.datasetId, version: 1 } },
      update: { attributionText: dataset.attribution, licenseNote: dataset.licenseNote, sourceUrl: dataset.sourceUrl },
      create: { datasetId: dataset.datasetId, attributionText: dataset.attribution, licenseNote: dataset.licenseNote, sourceUrl: dataset.sourceUrl, validFrom: officialSyncedAt, version: 1 }
    });
    const use = activatedDatasetProductUses.find((item) => item.datasetId === dataset.datasetId)!;
    for (const [index, usageModule] of use.usageModules.entries()) {
      const entityId = use.entityIds[Math.min(index, use.entityIds.length - 1)];
      await prisma.governmentDatasetUsage.upsert({
        where: { datasetId_usageModule_entityType_entityId_version: { datasetId: dataset.datasetId, usageModule, entityType: "sprint6_1_product_use", entityId, version: 1 } },
        update: { snapshotId: officialSnapshot.id, purpose: use.productFeature, active: true },
        create: { datasetId: dataset.datasetId, snapshotId: officialSnapshot.id, usageModule, entityType: "sprint6_1_product_use", entityId, purpose: `${use.productFeature}: ${use.educationalOutcome}`, version: 1, active: true }
      });
    }
  }
}

async function seedUsersAndShelter() {
  const shelter = await prisma.shelter.upsert({
    where: { shelterId: "SHELTER_TPE_001" },
    update: {},
    create: {
      shelterId: "SHELTER_TPE_001",
      name: "Taipei Demo Public Animal Shelter",
      county: "Taipei City",
      city: "Taipei City",
      zones: ["GREEN_OBSERVATION", "YELLOW_STAFF_GUIDED", "RED_STAFF_ONLY"]
    }
  });

  const student = await prisma.user.upsert({
    where: { testCode: "STU-TEST-001" },
    update: { role: "student" },
    create: { id: "student_demo_001", role: "student", testCode: "STU-TEST-001" }
  });

  const teacher = await prisma.user.upsert({
    where: { testCode: "TEA-TEST-001" },
    update: { role: "teacher" },
    create: { id: "teacher_demo_001", role: "teacher", testCode: "TEA-TEST-001" }
  });

  const shelterStaff = await prisma.user.upsert({
    where: { testCode: "SHF-TEST-001" },
    update: { role: "shelter_staff", shelterId: shelter.shelterId },
    create: { id: "shelter_staff_demo_001", role: "shelter_staff", testCode: "SHF-TEST-001", shelterId: shelter.shelterId }
  });

  const admin = await prisma.user.upsert({
    where: { testCode: "ADM-TEST-001" },
    update: { role: "admin" },
    create: { id: "admin_demo_001", role: "admin", testCode: "ADM-TEST-001" }
  });

  const dog = await prisma.dog.upsert({
    where: { dogId: "DOG-TPE-001" },
    update: {},
    create: {
      dogId: "DOG-TPE-001",
      shelterId: shelter.shelterId,
      publicName: "Biscuit",
      sex: "female",
      ageBand: "adult",
      zone: "GREEN_OBSERVATION",
      riskFlag: "none",
      adoptionStatus: "available"
    }
  });

  return { student, teacher, shelterStaff, admin, dog };
}

async function seedPhase1CompatibilityQuestions() {
  for (const [index, curriculumModuleSeed] of curriculumModules.entries()) {
    const createdModule = await prisma.curriculumModule.upsert({
      where: { key: curriculumModuleSeed.key },
      update: {
        title: curriculumModuleSeed.title,
        description: curriculumModuleSeed.description,
        tags: [...curriculumModuleSeed.tags],
        sortOrder: index + 1
      },
      create: {
        key: curriculumModuleSeed.key,
        title: curriculumModuleSeed.title,
        description: curriculumModuleSeed.description,
        tags: [...curriculumModuleSeed.tags],
        sortOrder: index + 1
      }
    });

    await prisma.quizQuestion.upsert({
      where: {
        moduleId_prompt: {
          moduleId: createdModule.id,
          prompt: `${curriculumModuleSeed.title} demo question`
        }
      },
      update: {
        options: ["Observable behavior", "Subjective label", "Unsafe contact", "Unsupported claim"],
        correctOptionIndex: 0,
        curriculumTags: [...curriculumModuleSeed.tags],
        governmentDatasetId: index === 0 ? "41236" : undefined,
        teacherReviewStatus: "pending"
      },
      create: {
        moduleId: createdModule.id,
        prompt: `${curriculumModuleSeed.title} demo question`,
        options: ["Observable behavior", "Subjective label", "Unsafe contact", "Unsupported claim"],
        correctOptionIndex: 0,
        curriculumTags: [...curriculumModuleSeed.tags],
        governmentDatasetId: index === 0 ? "41236" : undefined,
        teacherReviewStatus: "pending"
      }
    });
  }
}

async function seedLearningModulesAndStandards(adminId: string, teacherId: string) {
  for (const learningModuleSeed of phase2LearningModules) {
    await prisma.learningModule.upsert({
      where: { code: learningModuleSeed.code },
      update: {
        title: learningModuleSeed.title,
        description: learningModuleSeed.description,
        moduleOrder: learningModuleSeed.moduleOrder,
        estimatedMinutes: learningModuleSeed.estimatedMinutes,
        passingScore: learningModuleSeed.passingScore,
        status: learningModuleSeed.status,
        version: learningModuleSeed.version,
        publishedAt: syncedAt,
        reviewedById: teacherId
      },
      create: {
        id: learningModuleSeed.id,
        code: learningModuleSeed.code,
        title: learningModuleSeed.title,
        description: learningModuleSeed.description,
        moduleOrder: learningModuleSeed.moduleOrder,
        estimatedMinutes: learningModuleSeed.estimatedMinutes,
        passingScore: learningModuleSeed.passingScore,
        status: learningModuleSeed.status,
        version: learningModuleSeed.version,
        publishedAt: syncedAt,
        createdById: adminId,
        reviewedById: teacherId
      }
    });
  }

  for (const standard of phase2LearningStandards) {
    await prisma.learningStandard.upsert({
      where: { id: standard.id },
      update: {
        jurisdiction: standard.jurisdiction,
        curriculumName: standard.curriculumName,
        subject: standard.subject,
        educationLevel: standard.educationLevel,
        gradeBand: standard.gradeBand,
        learningContentCode: standard.learningContentCode,
        learningContentText: standard.learningContentText,
        learningPerformanceCode: standard.learningPerformanceCode,
        learningPerformanceText: standard.learningPerformanceText,
        coreCompetencyCode: standard.coreCompetencyCode,
        coreCompetencyText: standard.coreCompetencyText,
        sourceAgency: standard.sourceAgency,
        governmentDatasetId: standard.governmentDatasetId,
        sourceUrl: standard.sourceUrl,
        version: standard.version,
        status: standard.status,
        tags: standard.tags
      },
      create: {
        id: standard.id,
        jurisdiction: standard.jurisdiction,
        curriculumName: standard.curriculumName,
        subject: standard.subject,
        educationLevel: standard.educationLevel,
        gradeBand: standard.gradeBand,
        learningContentCode: standard.learningContentCode,
        learningContentText: standard.learningContentText,
        learningPerformanceCode: standard.learningPerformanceCode,
        learningPerformanceText: standard.learningPerformanceText,
        coreCompetencyCode: standard.coreCompetencyCode,
        coreCompetencyText: standard.coreCompetencyText,
        sourceAgency: standard.sourceAgency,
        governmentDatasetId: standard.governmentDatasetId,
        sourceUrl: standard.sourceUrl,
        version: standard.version,
        status: standard.status,
        tags: standard.tags
      }
    });

    for (const moduleCode of standard.moduleCodes) {
      const targetModule = phase2LearningModules.find((item) => item.code === moduleCode);
      if (targetModule) {
        await prisma.learningModuleStandard.upsert({
          where: { moduleId_standardId: { moduleId: targetModule.id, standardId: standard.id } },
          update: {},
          create: { moduleId: targetModule.id, standardId: standard.id }
        });
      }
    }
  }
}

async function seedQuestions(teacherId: string, reviewerId: string) {
  for (const question of phase2Questions) {
    const targetModule = phase2LearningModules.find((item) => item.code === question.moduleCode);
    if (!targetModule) {
      continue;
    }

    await prisma.question.upsert({
      where: { id: question.id },
      update: {
        moduleId: targetModule.id,
        questionType: question.questionType,
        prompt: question.prompt,
        explanation: question.explanation,
        difficulty: question.difficulty,
        status: question.status,
        version: question.version,
        sourceType: question.sourceType,
        sourceDatasetId: question.sourceDatasetId,
        sourceReference: question.sourceReference,
        copyrightNote: question.copyrightNote,
        createdById: teacherId,
        reviewedById: reviewerId,
        approvedAt: syncedAt
      },
      create: {
        id: question.id,
        moduleId: targetModule.id,
        questionType: question.questionType,
        prompt: question.prompt,
        explanation: question.explanation,
        difficulty: question.difficulty,
        status: question.status,
        version: question.version,
        sourceType: question.sourceType,
        sourceDatasetId: question.sourceDatasetId,
        sourceReference: question.sourceReference,
        copyrightNote: question.copyrightNote,
        createdById: teacherId,
        reviewedById: reviewerId,
        approvedAt: syncedAt
      }
    });

    await prisma.questionOption.deleteMany({ where: { questionId: question.id } });
    for (const option of question.options) {
      await prisma.questionOption.create({
        data: {
          id: option.id,
          questionId: question.id,
          optionKey: option.optionKey,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          explanation: option.explanation,
          optionOrder: option.optionOrder
        }
      });
    }

    await prisma.questionLearningStandard.deleteMany({ where: { questionId: question.id } });
    for (const standardId of question.standardIds) {
      await prisma.questionLearningStandard.create({
        data: { questionId: question.id, standardId }
      });
    }

    for (const datasetId of question.datasetIds) {
      await prisma.questionGovernmentDataset.upsert({
        where: { questionId_datasetId: { questionId: question.id, datasetId } },
        update: { usageNote: "Question source snapshot preserved for Research License traceability." },
        create: { questionId: question.id, datasetId, usageNote: "Question source snapshot preserved for Research License traceability." }
      });
    }
  }
}

async function seedBlueprint(adminId: string) {
  const blueprint = await prisma.quizBlueprint.upsert({
    where: { code_version: { code: defaultQuizBlueprint.code, version: defaultQuizBlueprint.version } },
    update: {
      title: defaultQuizBlueprint.title,
      educationLevel: defaultQuizBlueprint.educationLevel,
      status: defaultQuizBlueprint.status,
      totalQuestions: defaultQuizBlueprint.totalQuestions,
      timeLimitMinutes: defaultQuizBlueprint.timeLimitMinutes,
      passingScore: defaultQuizBlueprint.passingScore,
      maxAttempts: defaultQuizBlueprint.maxAttempts,
      cooldownMinutes: defaultQuizBlueprint.cooldownMinutes,
      randomizeQuestions: defaultQuizBlueprint.randomizeQuestions,
      randomizeOptions: defaultQuizBlueprint.randomizeOptions,
      publishedAt: syncedAt
    },
    create: {
      id: defaultQuizBlueprint.id,
      code: defaultQuizBlueprint.code,
      title: defaultQuizBlueprint.title,
      educationLevel: defaultQuizBlueprint.educationLevel,
      version: defaultQuizBlueprint.version,
      status: defaultQuizBlueprint.status,
      totalQuestions: defaultQuizBlueprint.totalQuestions,
      timeLimitMinutes: defaultQuizBlueprint.timeLimitMinutes,
      passingScore: defaultQuizBlueprint.passingScore,
      maxAttempts: defaultQuizBlueprint.maxAttempts,
      cooldownMinutes: defaultQuizBlueprint.cooldownMinutes,
      randomizeQuestions: defaultQuizBlueprint.randomizeQuestions,
      randomizeOptions: defaultQuizBlueprint.randomizeOptions,
      createdById: adminId,
      publishedAt: syncedAt
    }
  });

  for (const learningModuleSeed of phase2LearningModules) {
    await prisma.quizBlueprintModuleRequirement.upsert({
      where: { blueprintId_moduleId: { blueprintId: blueprint.id, moduleId: learningModuleSeed.id } },
      update: {
        requiredQuestionCount: defaultQuizBlueprint.requiredPerModule,
        minimumModuleScore: defaultQuizBlueprint.minimumModuleScore,
        difficultyDistribution: defaultQuizBlueprint.difficultyDistribution
      },
      create: {
        blueprintId: blueprint.id,
        moduleId: learningModuleSeed.id,
        requiredQuestionCount: defaultQuizBlueprint.requiredPerModule,
        minimumModuleScore: defaultQuizBlueprint.minimumModuleScore,
        difficultyDistribution: defaultQuizBlueprint.difficultyDistribution
      }
    });
  }

  return blueprint;
}

async function seedDemoAttemptAndLicense(studentId: string, blueprintId: string) {
  const attempt = await prisma.quizAttempt.upsert({
    where: { id: "attempt_demo_passed_001" },
    update: {
      status: "passed",
      totalScore: 100,
      moduleScoresJson: {
        DOG_BEHAVIOR: 100,
        ONE_HEALTH: 100,
        URBAN_ECOLOGY: 100,
        SHELTER_SAFETY: 100,
        RESEARCH_ETHICS: 100
      }
    },
    create: {
      id: "attempt_demo_passed_001",
      studentId,
      blueprintId,
      blueprintVersion: defaultQuizBlueprint.version,
      startedAt: new Date("2026-01-02T01:00:00.000Z"),
      submittedAt: new Date("2026-01-02T01:20:00.000Z"),
      expiresAt: new Date("2026-01-02T01:30:00.000Z"),
      status: "passed",
      totalScore: 100,
      moduleScoresJson: {
        DOG_BEHAVIOR: 100,
        ONE_HEALTH: 100,
        URBAN_ECOLOGY: 100,
        SHELTER_SAFETY: 100,
        RESEARCH_ETHICS: 100
      },
      attemptNumber: 1,
      integrityFlagsJson: []
    }
  });

  await prisma.researchLicense.upsert({
    where: { qualifyingAttemptId: attempt.id },
    update: {
      status: "active",
      expiresAt: new Date("2026-07-01T01:20:00.000Z")
    },
    create: {
      id: "license_demo_level_1_001",
      studentId,
      licenseLevel: "level_1",
      blueprintId,
      blueprintVersion: defaultQuizBlueprint.version,
      qualifyingAttemptId: attempt.id,
      status: "active",
      issuedAt: new Date("2026-01-02T01:20:00.000Z"),
      expiresAt: new Date("2026-07-01T01:20:00.000Z"),
      certificateCode: "SL-L1-STU-TEST-001-DEMO",
      certificateVersion: 1
    }
  });
}

async function seedObservation(studentId: string, dogId: string) {
  await prisma.observation.upsert({
    where: { observationId: "OBS-TEST-001" },
    update: {},
    create: {
      observationId: "OBS-TEST-001",
      dogId,
      observerId: studentId,
      timestamp: new Date("2026-01-03T02:00:00.000Z"),
      behaviorCode: "QUIET_OBSERVE",
      durationSec: 120,
      context: "Approved green observation zone. Dog stayed behind the gate and watched hallway movement.",
      notes: "Non-contact observation. No student faces captured.",
      mediaUrl: "https://example.test/media/obs-test-001.jpg",
      mediaChecksum: "sha256-demo-001",
      teacherReview: "pending",
      shelterConfirm: "pending",
      workflowStatus: "submitted",
      incidentFlag: false,
      validationFlags: []
    }
  });
}

async function seedObservationSession(studentId: string, dogId: string, teacherId: string, shelterStaffId: string) {
  await prisma.observationSession.upsert({
    where: { id: "obs_session_demo_001" },
    update: {
      status: "published",
      durationSec: 300,
      validationFlags: [],
      publishedAt: new Date("2026-01-03T02:10:00.000Z")
    },
    create: {
      id: "obs_session_demo_001",
      studentId,
      dogId,
      teacherId,
      shelterStaffId,
      startedAt: new Date("2026-01-03T02:00:00.000Z"),
      endedAt: new Date("2026-01-03T02:05:00.000Z"),
      status: "published",
      durationSec: 300,
      locationZone: "GREEN_OBSERVATION",
      weather: "clear",
      temperature: 24,
      notes: "Dog remained behind the gate. Student maintained non-contact distance.",
      validationFlags: [],
      publishedAt: new Date("2026-01-03T02:10:00.000Z")
    }
  });

  await prisma.behaviorEvent.deleteMany({ where: { sessionId: "obs_session_demo_001" } });
  await prisma.behaviorEvent.createMany({
    data: [
      {
        id: "behavior_event_demo_001",
        sessionId: "obs_session_demo_001",
        timestampSecond: 12,
        behaviorCode: "LOOK_AT_HUMAN",
        durationSec: 4,
        confidence: 0.9,
        observerNote: "Dog looked toward hallway."
      },
      {
        id: "behavior_event_demo_002",
        sessionId: "obs_session_demo_001",
        timestampSecond: 30,
        behaviorCode: "SIT",
        durationSec: 15,
        confidence: 0.95,
        observerNote: "Dog sat near rear wall."
      }
    ]
  });
}

async function seedSprint7LivingLab(studentId: string, teacherId: string, shelterStaffId: string, adminId: string) {
  const demo = buildSprint7Demo();

  for (const definition of behaviorCodeRegistry) {
    await prisma.behaviorCodeDefinition.upsert({
      where: { code: definition.code },
      update: { label: definition.code.replaceAll("_", " "), definition: definition.definition, active: definition.active, overlappingAllowed: definition.overlappingAllowed, version: definition.version, updatedById: adminId },
      create: { code: definition.code, label: definition.code.replaceAll("_", " "), definition: definition.definition, active: definition.active, overlappingAllowed: definition.overlappingAllowed, version: definition.version, updatedById: adminId }
    });
  }

  for (const mission of demo.state.missions.values()) {
    await prisma.observationMission.upsert({
      where: { id: mission.id },
      update: { courseId: mission.courseId, classroomId: mission.classroomId, teacherId, studentId, shelterId: mission.shelterId, dogId: mission.dogId, assignedBy: teacherId, shelterConfirmerId: shelterStaffId, title: mission.title, scientificPurpose: mission.scientificPurpose, researchQuestion: mission.researchQuestion, allowedZone: mission.allowedZone, scheduledStart: mission.scheduledStart, scheduledEnd: mission.scheduledEnd, maximumDurationSec: mission.maximumDurationSec, protocolVersion: mission.protocolVersion, status: mission.status, cancellationReason: mission.cancellationReason, syntheticDemo: true },
      create: { id: mission.id, courseId: mission.courseId, classroomId: mission.classroomId, teacherId, studentId, shelterId: mission.shelterId, dogId: mission.dogId, assignedBy: teacherId, shelterConfirmerId: shelterStaffId, title: mission.title, scientificPurpose: mission.scientificPurpose, researchQuestion: mission.researchQuestion, allowedZone: mission.allowedZone, scheduledStart: mission.scheduledStart, scheduledEnd: mission.scheduledEnd, maximumDurationSec: mission.maximumDurationSec, protocolVersion: mission.protocolVersion, status: mission.status, cancellationReason: mission.cancellationReason, syntheticDemo: true, createdAt: mission.createdAt }
    });
  }

  for (const session of demo.state.sessions.values()) {
    await prisma.observationSession.upsert({
      where: { id: session.id },
      update: { missionId: session.missionId, parentSessionId: session.parentSessionId, revisionNumber: session.revisionNumber, studentId, dogId: session.dogId, shelterId: session.shelterId, teacherId, shelterStaffId, startedAt: session.startedAtServer, endedAt: session.endedAtServer, startedAtServer: session.startedAtServer, endedAtServer: session.endedAtServer, deadlineAtServer: session.deadlineAtServer, clientStartedAt: session.clientStartedAt, lastAutosavedAt: session.lastAutosavedAt, submittedAt: session.submittedAt, teacherReviewedAt: session.teacherReviewedAt, shelterConfirmedAt: session.shelterConfirmedAt, publishedAt: session.publishedAt, status: session.status, durationSec: session.durationSec, locationZone: session.environmentContext.observationZone, notes: session.generalNotes, rowVersion: session.rowVersion, protocolVersion: session.protocolVersion, environmentContext: session.environmentContext as Prisma.InputJsonValue, generalNotes: session.generalNotes, validationFlags: session.validationFlags as unknown as Prisma.InputJsonValue, incidentFlag: session.incidentFlag, privacyState: session.privacyState, syntheticDemo: true, qualityScore: session.qualityScore?.total, qualityScoreVersion: session.qualityScore?.version, publishedById: session.status === "published" ? shelterStaffId : undefined },
      create: { id: session.id, missionId: session.missionId, parentSessionId: session.parentSessionId, revisionNumber: session.revisionNumber, studentId, dogId: session.dogId, shelterId: session.shelterId, teacherId, shelterStaffId, startedAt: session.startedAtServer, endedAt: session.endedAtServer, startedAtServer: session.startedAtServer, endedAtServer: session.endedAtServer, deadlineAtServer: session.deadlineAtServer, clientStartedAt: session.clientStartedAt, lastAutosavedAt: session.lastAutosavedAt, submittedAt: session.submittedAt, teacherReviewedAt: session.teacherReviewedAt, shelterConfirmedAt: session.shelterConfirmedAt, publishedAt: session.publishedAt, status: session.status, durationSec: session.durationSec, locationZone: session.environmentContext.observationZone, notes: session.generalNotes, rowVersion: session.rowVersion, protocolVersion: session.protocolVersion, environmentContext: session.environmentContext as Prisma.InputJsonValue, generalNotes: session.generalNotes, validationFlags: session.validationFlags as unknown as Prisma.InputJsonValue, incidentFlag: session.incidentFlag, privacyState: session.privacyState, syntheticDemo: true, qualityScore: session.qualityScore?.total, qualityScoreVersion: session.qualityScore?.version, publishedById: session.status === "published" ? shelterStaffId : undefined }
    });
    await prisma.behaviorEvent.deleteMany({ where: { sessionId: session.id } });
    if (session.behaviorEvents.length > 0) await prisma.behaviorEvent.createMany({ data: session.behaviorEvents.map((event) => ({ id: event.id, sessionId: session.id, sequenceNumber: event.sequenceNumber, timestampSecond: event.timestampSecond, behaviorCode: event.behaviorCode, durationSec: event.durationSec, confidence: event.confidenceLevel === "high" ? 0.9 : event.confidenceLevel === "medium" ? 0.6 : 0.3, confidenceLevel: event.confidenceLevel, observerNote: event.observerNote, contextCode: event.contextCode, evidenceType: event.evidenceType, mediaAssetId: undefined, createdAt: event.createdAt })) });
    if (session.qualityScore) await prisma.observationQualityScore.upsert({ where: { sessionId_scoreVersion: { sessionId: session.id, scoreVersion: session.qualityScore.version } }, update: { score: session.qualityScore.total, dimensionsJson: session.qualityScore.dimensions, explanationJson: session.qualityScore.explanation }, create: { id: `quality_${session.id}`, sessionId: session.id, score: session.qualityScore.total, dimensionsJson: session.qualityScore.dimensions, explanationJson: session.qualityScore.explanation, scoreVersion: session.qualityScore.version } });
  }

  await prisma.observationReview.deleteMany({ where: { session: { syntheticDemo: true } } });
  if (demo.state.reviews.length > 0) await prisma.observationReview.createMany({ data: demo.state.reviews.map((review) => ({ id: review.id, sessionId: review.sessionId, reviewerId: review.reviewerId, reviewerRole: review.role, decision: review.decision, reasonCode: review.reasonCode, reasonText: review.reasonText, reviewedSessionVersion: review.reviewedSessionVersion, rubricJson: review.rubric, professionalContextNote: review.professionalContextNote, idempotencyKey: review.idempotencyKey, createdAt: review.createdAt })) });

  await prisma.mediaAsset.deleteMany({ where: { syntheticDemo: true } });
  if (demo.state.mediaAssets.length > 0) await prisma.mediaAsset.createMany({ data: demo.state.mediaAssets.map((asset) => ({ id: asset.id, sourceSessionId: asset.sourceSessionId, storageProvider: asset.storageProvider, storageKey: asset.storageKey, checksumSha256: asset.checksumSha256, mimeType: asset.mimeType, sizeBytes: asset.sizeBytes, captureTime: asset.captureTime, uploaderRole: asset.uploaderRole, privacyState: asset.privacyState, facePresent: asset.facePresent, studentPresent: asset.studentPresent, reviewerId: asset.reviewerId, reviewReason: asset.reviewReason, syntheticDemo: true, createdAt: asset.createdAt })) });

  await prisma.observationPublication.deleteMany({ where: { session: { syntheticDemo: true } } });
  if (demo.state.publications.length > 0) await prisma.observationPublication.createMany({ data: demo.state.publications.map((publication) => ({ id: publication.id, sessionId: publication.sessionId, versionIdentifier: publication.versionIdentifier, publishedById: shelterStaffId, publishedAt: publication.publishedAt, unpublishedById: publication.unpublishedById, unpublishedAt: publication.unpublishedAt, unpublishReason: publication.unpublishReason, visibilityJson: { public: true }, snapshotJson: publication.snapshot as unknown as Prisma.InputJsonValue, sourceTraceJson: { missionId: publication.snapshot.missionId, sessionId: publication.sessionId, revisionNumber: publication.snapshot.revisionNumber }, idempotencyKey: publication.idempotencyKey })) });

  await prisma.evidenceTimelineEntry.deleteMany({ where: { syntheticDemo: true } });
  if (demo.state.timeline.length > 0) await prisma.evidenceTimelineEntry.createMany({ data: demo.state.timeline.map((entry) => ({ id: entry.id, dogId: entry.dogId, sessionId: entry.sessionId, eventDate: entry.eventDate, eventType: entry.eventType as never, sourceEntityType: entry.sourceEntityType, sourceEntityId: entry.sourceEntityId, sourceVersion: entry.sourceVersion, visibility: entry.visibility, verificationState: "SYNTHETIC_DEMO", actorRole: entry.actorRole, summary: entry.summary, evidenceLinks: entry.evidenceLinks, auditReference: entry.auditReference, syntheticDemo: true })) });

  for (const profile of demo.state.profiles) {
    await prisma.dogEvidenceProfile.upsert({ where: { dogId_version: { dogId: profile.dogId, version: profile.version } }, update: { status: profile.status, evidenceCount: profile.evidenceCount, latestConfirmedAt: profile.latestConfirmedAt, contextDiversity: profile.contextDiversity, completenessScore: profile.completenessScore, approvedById: shelterStaffId, approvedAt: profile.approvedAt, syntheticDemo: true }, create: { id: profile.id, dogId: profile.dogId, version: profile.version, status: profile.status, evidenceCount: profile.evidenceCount, latestConfirmedAt: profile.latestConfirmedAt, contextDiversity: profile.contextDiversity, completenessScore: profile.completenessScore, approvedById: shelterStaffId, approvedAt: profile.approvedAt, syntheticDemo: true } });
    await prisma.dogEvidenceProfileStatement.deleteMany({ where: { profileId: profile.id } });
    await prisma.dogEvidenceProfileStatement.createMany({ data: profile.statements.map((statement) => ({ id: statement.id, profileId: profile.id, dimension: statement.dimension, statement: statement.statement, evidenceSourceIds: statement.evidenceSourceIds, evidenceDates: statement.evidenceDates, confirmationState: statement.confirmationState, shelterApproved: true, sessionId: demo.state.publications[0]?.sessionId, version: statement.version })) });
  }

  await prisma.auditLog.deleteMany({ where: { correlationId: "seed-sprint7-living-lab" } });
  await prisma.auditLog.createMany({ data: demo.state.auditEvents.map((event) => ({ actorId: event.actorId === "system" ? adminId : event.actorId, actorRole: event.actorRole, organizationScope: event.organizationScope, courseScope: event.courseScope, correlationId: "seed-sprint7-living-lab", entityType: event.entityType, entityId: event.entityId, action: event.action, fromStatus: event.fromStatus, toStatus: event.toStatus, changes: (event.changes ?? {}) as Prisma.InputJsonValue, previousState: event.previousState as Prisma.InputJsonValue | undefined, newState: event.newState as Prisma.InputJsonValue | undefined, reason: event.reason, createdAt: event.timestamp })) });
}

async function seedPhase4Curriculum(adminId: string, teacherId: string, studentId: string, defaultBlueprintId: string) {
  for (const resource of phase4CurriculumResources) {
    await prisma.curriculumResource.upsert({
      where: { id: resource.id },
      update: {
        title: resource.title,
        resourceType: resource.resourceType,
        providerName: resource.providerName,
        sourceAgency: resource.sourceAgency,
        sourceUrl: resource.sourceUrl,
        governmentDatasetId: resource.governmentDatasetId,
        externalResourceId: resource.externalResourceId,
        subject: resource.subject,
        educationLevel: resource.educationLevel,
        gradeBand: resource.gradeBand,
        topicTags: resource.topicTags,
        learningContentCodes: resource.learningContentCodes,
        learningPerformanceCodes: resource.learningPerformanceCodes,
        coreCompetencyCodes: resource.coreCompetencyCodes,
        durationMinutes: resource.durationMinutes,
        language: resource.language,
        description: resource.description,
        copyrightNote: resource.copyrightNote,
        licenseNote: resource.licenseNote,
        verificationStatus: resource.verificationStatus,
        evidenceVerificationState: resource.evidenceVerificationState ?? "UNVERIFIED",
        verificationNote: resource.verificationNote,
        rejectionReason: resource.rejectionReason,
        verifiedAt: resource.verifiedAt,
        verifiedById: resource.verifiedBy,
        lastCheckedAt: resource.lastCheckedAt,
        availabilityStatus: resource.availabilityStatus
      },
      create: {
        id: resource.id,
        title: resource.title,
        resourceType: resource.resourceType,
        providerName: resource.providerName,
        sourceAgency: resource.sourceAgency,
        sourceUrl: resource.sourceUrl,
        governmentDatasetId: resource.governmentDatasetId,
        externalResourceId: resource.externalResourceId,
        subject: resource.subject,
        educationLevel: resource.educationLevel,
        gradeBand: resource.gradeBand,
        topicTags: resource.topicTags,
        learningContentCodes: resource.learningContentCodes,
        learningPerformanceCodes: resource.learningPerformanceCodes,
        coreCompetencyCodes: resource.coreCompetencyCodes,
        durationMinutes: resource.durationMinutes,
        language: resource.language,
        description: resource.description,
        copyrightNote: resource.copyrightNote,
        licenseNote: resource.licenseNote,
        verificationStatus: resource.verificationStatus,
        evidenceVerificationState: resource.evidenceVerificationState ?? "UNVERIFIED",
        verificationNote: resource.verificationNote,
        rejectionReason: resource.rejectionReason,
        verifiedAt: resource.verifiedAt,
        verifiedById: resource.verifiedBy,
        lastCheckedAt: resource.lastCheckedAt,
        availabilityStatus: resource.availabilityStatus
      }
    });
  }

  await prisma.coursePlan.upsert({
    where: { code: phase4CoursePlan.code },
    update: {
      title: phase4CoursePlan.title,
      educationLevel: phase4CoursePlan.educationLevel,
      gradeBand: phase4CoursePlan.gradeBand,
      description: phase4CoursePlan.description,
      status: phase4CoursePlan.status,
      version: phase4CoursePlan.version
    },
    create: {
      id: phase4CoursePlan.id,
      code: phase4CoursePlan.code,
      title: phase4CoursePlan.title,
      educationLevel: phase4CoursePlan.educationLevel,
      gradeBand: phase4CoursePlan.gradeBand,
      description: phase4CoursePlan.description,
      status: phase4CoursePlan.status,
      version: phase4CoursePlan.version,
      createdById: adminId
    }
  });

  await prisma.teacherCourseAuthorization.upsert({
    where: {
      teacherId_coursePlanId: {
        teacherId,
        coursePlanId: phase4CoursePlan.id
      }
    },
    update: { active: true, grantedById: adminId },
    create: {
      teacherId,
      coursePlanId: phase4CoursePlan.id,
      grantedById: adminId,
      active: true
    }
  });

  for (const week of phase4CourseWeeks) {
    const learningModule = phase2LearningModules.find((item) => item.code === week.moduleCode);
    await prisma.courseWeek.upsert({
      where: { coursePlanId_weekNumber: { coursePlanId: phase4CoursePlan.id, weekNumber: week.weekNumber } },
      update: {
        title: week.title,
        focus: week.focus,
        moduleId: learningModule?.id,
        learningGoals: week.learningGoals,
        assessmentNote: week.assessmentNote
      },
      create: {
        id: week.id,
        coursePlanId: phase4CoursePlan.id,
        weekNumber: week.weekNumber,
        title: week.title,
        focus: week.focus,
        moduleId: learningModule?.id,
        learningGoals: week.learningGoals,
        assessmentNote: week.assessmentNote
      }
    });
  }

  for (const mapping of phase4ResourceMappings) {
    if (mapping.targetType === "module") {
      const learningModule = phase2LearningModules.find((item) => item.code === mapping.targetId);
      if (!learningModule) {
        continue;
      }
      await prisma.curriculumResourceLearningModule.upsert({
        where: { resourceId_moduleId: { resourceId: mapping.resourceId, moduleId: learningModule.id } },
        update: {
          requiredOrOptional: mapping.requiredOrOptional,
          displayOrder: mapping.displayOrder,
          teacherNote: mapping.teacherNote,
          startTimeSec: mapping.startTimeSec,
          endTimeSec: mapping.endTimeSec,
          remediationPriority: mapping.remediationPriority,
          mappingStatus: mapping.mappingStatus
        },
        create: {
          resourceId: mapping.resourceId,
          moduleId: learningModule.id,
          requiredOrOptional: mapping.requiredOrOptional,
          displayOrder: mapping.displayOrder,
          teacherNote: mapping.teacherNote,
          startTimeSec: mapping.startTimeSec,
          endTimeSec: mapping.endTimeSec,
          remediationPriority: mapping.remediationPriority,
          mappingStatus: mapping.mappingStatus
        }
      });
    }

    if (mapping.targetType === "standard") {
      await prisma.curriculumResourceLearningStandard.upsert({
        where: { resourceId_standardId: { resourceId: mapping.resourceId, standardId: mapping.targetId } },
        update: {
          requiredOrOptional: mapping.requiredOrOptional,
          displayOrder: mapping.displayOrder,
          teacherNote: mapping.teacherNote,
          startTimeSec: mapping.startTimeSec,
          endTimeSec: mapping.endTimeSec,
          remediationPriority: mapping.remediationPriority,
          mappingStatus: mapping.mappingStatus
        },
        create: {
          resourceId: mapping.resourceId,
          standardId: mapping.targetId,
          requiredOrOptional: mapping.requiredOrOptional,
          displayOrder: mapping.displayOrder,
          teacherNote: mapping.teacherNote,
          startTimeSec: mapping.startTimeSec,
          endTimeSec: mapping.endTimeSec,
          remediationPriority: mapping.remediationPriority,
          mappingStatus: mapping.mappingStatus
        }
      });
    }

    if (mapping.targetType === "course_week") {
      await prisma.curriculumResourceCourseWeek.upsert({
        where: { resourceId_courseWeekId: { resourceId: mapping.resourceId, courseWeekId: mapping.targetId } },
        update: {
          requiredOrOptional: mapping.requiredOrOptional,
          displayOrder: mapping.displayOrder,
          teacherNote: mapping.teacherNote,
          startTimeSec: mapping.startTimeSec,
          endTimeSec: mapping.endTimeSec,
          remediationPriority: mapping.remediationPriority,
          mappingStatus: mapping.mappingStatus
        },
        create: {
          resourceId: mapping.resourceId,
          courseWeekId: mapping.targetId,
          requiredOrOptional: mapping.requiredOrOptional,
          displayOrder: mapping.displayOrder,
          teacherNote: mapping.teacherNote,
          startTimeSec: mapping.startTimeSec,
          endTimeSec: mapping.endTimeSec,
          remediationPriority: mapping.remediationPriority,
          mappingStatus: mapping.mappingStatus
        }
      });
    }
  }

  for (const resource of phase4CurriculumResources.filter((item) => item.verificationStatus === "approved_for_course")) {
    await prisma.curriculumResourceQuizBlueprint.upsert({
      where: { resourceId_quizBlueprintId: { resourceId: resource.id, quizBlueprintId: defaultBlueprintId } },
      update: {
        requiredOrOptional: "optional",
        displayOrder: 1,
        teacherNote: "Phase 4 remediation and Research License support resource.",
        remediationPriority: 50,
        mappingStatus: "active"
      },
      create: {
        resourceId: resource.id,
        quizBlueprintId: defaultBlueprintId,
        requiredOrOptional: "optional",
        displayOrder: 1,
        teacherNote: "Phase 4 remediation and Research License support resource.",
        remediationPriority: 50,
        mappingStatus: "active"
      }
    });
  }

  for (const question of phase2Questions) {
    for (const [index, resourceId] of question.resourceIds.entries()) {
      await prisma.curriculumResourceQuestion.upsert({
        where: { resourceId_questionId: { resourceId, questionId: question.id } },
        update: {
          requiredOrOptional: "optional",
          displayOrder: index + 1,
          teacherNote: "Source mapping for a published ShelterLab-authored or teacher-reviewed question.",
          remediationPriority: 60,
          mappingStatus: "active"
        },
        create: {
          resourceId,
          questionId: question.id,
          requiredOrOptional: "optional",
          displayOrder: index + 1,
          teacherNote: "Source mapping for a published ShelterLab-authored or teacher-reviewed question.",
          remediationPriority: 60,
          mappingStatus: "active"
        }
      });
    }
  }

  for (const blueprint of phase4QuestionBlueprints) {
    const learningModule = phase2LearningModules.find((item) => item.code === blueprint.moduleCode);
    if (!learningModule) {
      continue;
    }
    const persistedBlueprint = await prisma.questionGenerationBlueprint.upsert({
      where: { code_version: { code: blueprint.code, version: blueprint.version } },
      update: {
        title: blueprint.title,
        moduleId: learningModule.id,
        educationLevel: blueprint.educationLevel,
        gradeBand: blueprint.gradeBand,
        questionType: blueprint.questionType,
        bloomLevel: blueprint.bloomLevel,
        difficulty: blueprint.difficulty,
        numberOfQuestions: blueprint.numberOfQuestions,
        requiredResourceCount: blueprint.requiredResourceCount,
        requiredLearningStandardCount: blueprint.requiredLearningStandardCount,
        scenarioContext: blueprint.scenarioContext,
        prohibitedContent: blueprint.prohibitedContent,
        promptVersion: blueprint.promptVersion,
        requiresGovernmentData: blueprint.requiresGovernmentData,
        qualityRulesJson: blueprint.qualityRules as Prisma.InputJsonValue,
        status: blueprint.status,
        reviewedById: blueprint.reviewedBy
      },
      create: {
        id: blueprint.id,
        code: blueprint.code,
        title: blueprint.title,
        moduleId: learningModule.id,
        educationLevel: blueprint.educationLevel,
        gradeBand: blueprint.gradeBand,
        questionType: blueprint.questionType,
        bloomLevel: blueprint.bloomLevel,
        difficulty: blueprint.difficulty,
        numberOfQuestions: blueprint.numberOfQuestions,
        requiredResourceCount: blueprint.requiredResourceCount,
        requiredLearningStandardCount: blueprint.requiredLearningStandardCount,
        scenarioContext: blueprint.scenarioContext,
        prohibitedContent: blueprint.prohibitedContent,
        promptVersion: blueprint.promptVersion,
        requiresGovernmentData: blueprint.requiresGovernmentData,
        qualityRulesJson: blueprint.qualityRules as Prisma.InputJsonValue,
        status: blueprint.status,
        version: blueprint.version,
        createdById: teacherId,
        reviewedById: adminId
      }
    });
    for (const resourceId of blueprint.sourceResourceIds) {
      await prisma.questionGenerationBlueprintResource.upsert({
        where: { blueprintId_resourceId: { blueprintId: persistedBlueprint.id, resourceId } },
        update: {},
        create: { blueprintId: persistedBlueprint.id, resourceId }
      });
    }
    for (const standardId of blueprint.learningStandardIds) {
      await prisma.questionGenerationBlueprintStandard.upsert({
        where: { blueprintId_standardId: { blueprintId: persistedBlueprint.id, standardId } },
        update: {},
        create: { blueprintId: persistedBlueprint.id, standardId }
      });
    }
    for (const datasetId of blueprint.governmentDatasetIds) {
      await prisma.questionGenerationBlueprintGovernmentDataset.upsert({
        where: { blueprintId_datasetId: { blueprintId: persistedBlueprint.id, datasetId } },
        update: {},
        create: { blueprintId: persistedBlueprint.id, datasetId }
      });
    }
  }

  for (const draft of phase4QuestionDrafts) {
    const learningModule = phase2LearningModules.find((item) => item.code === draft.moduleCode);
    if (!learningModule) {
      continue;
    }
    await prisma.questionDraft.upsert({
      where: { id: draft.id },
      update: {
        generationBlueprintId: draft.generationBlueprintId,
        coursePlanId: draft.coursePlanId,
        moduleId: learningModule.id,
        version: draft.version,
        parentDraftId: draft.parentDraftId,
        prompt: draft.prompt,
        questionType: draft.questionType,
        optionsJson: draft.options,
        correctOptionKeys: draft.correctOptionKeys,
        explanation: draft.explanation,
        sourceResourceIds: draft.sourceResourceIds,
        sourceExcerptNotes: draft.sourceExcerptNotes,
        learningStandardIds: draft.learningStandardIds,
        governmentDatasetIds: draft.governmentDatasetIds,
        generationMethod: draft.generationMethod,
        modelName: draft.modelName,
        modelVersion: draft.modelVersion,
        providerName: draft.providerName,
        providerVersion: draft.providerVersion,
        promptVersion: draft.promptVersion,
        generationTimestamp: draft.generationTimestamp,
        factualityCheckStatus: draft.factualityCheckStatus,
        sourceAlignmentStatus: draft.sourceAlignmentStatus,
        teacherReviewStatus: draft.teacherReviewStatus,
        teacherRevisionNotes: draft.teacherRevisionNotes,
        riskFlagsJson: draft.riskFlags,
        similarityFlagsJson: draft.similarityFlags,
        unsupportedClaimFlagsJson: draft.unsupportedClaimFlags,
        bloomLevel: draft.bloomLevel,
        difficulty: draft.difficulty,
        confidenceNote: draft.confidenceNote,
        reviewedById: draft.reviewedBy,
        publishedById: draft.publishedBy,
        approvedAt: draft.teacherReviewStatus === "approved" || draft.teacherReviewStatus === "published" ? syncedAt : undefined,
        publishedAt: draft.teacherReviewStatus === "published" ? syncedAt : undefined
      },
      create: {
        id: draft.id,
        generationBlueprintId: draft.generationBlueprintId,
        coursePlanId: draft.coursePlanId,
        moduleId: learningModule.id,
        version: draft.version,
        parentDraftId: draft.parentDraftId,
        prompt: draft.prompt,
        questionType: draft.questionType,
        optionsJson: draft.options,
        correctOptionKeys: draft.correctOptionKeys,
        explanation: draft.explanation,
        sourceResourceIds: draft.sourceResourceIds,
        sourceExcerptNotes: draft.sourceExcerptNotes,
        learningStandardIds: draft.learningStandardIds,
        governmentDatasetIds: draft.governmentDatasetIds,
        generationMethod: draft.generationMethod,
        modelName: draft.modelName,
        modelVersion: draft.modelVersion,
        providerName: draft.providerName,
        providerVersion: draft.providerVersion,
        promptVersion: draft.promptVersion,
        generationTimestamp: draft.generationTimestamp,
        factualityCheckStatus: draft.factualityCheckStatus,
        sourceAlignmentStatus: draft.sourceAlignmentStatus,
        teacherReviewStatus: draft.teacherReviewStatus,
        teacherRevisionNotes: draft.teacherRevisionNotes,
        riskFlagsJson: draft.riskFlags,
        similarityFlagsJson: draft.similarityFlags,
        unsupportedClaimFlagsJson: draft.unsupportedClaimFlags,
        bloomLevel: draft.bloomLevel,
        difficulty: draft.difficulty,
        confidenceNote: draft.confidenceNote,
        createdById: teacherId,
        reviewedById: draft.reviewedBy,
        publishedById: draft.publishedBy,
        approvedAt: draft.teacherReviewStatus === "approved" || draft.teacherReviewStatus === "published" ? syncedAt : undefined,
        publishedAt: draft.teacherReviewStatus === "published" ? syncedAt : undefined
      }
    });
  }

  for (const item of phase4StudentResourceProgress) {
    await prisma.studentResourceProgress.upsert({
      where: { studentId_resourceId: { studentId, resourceId: item.resourceId } },
      update: {
        moduleCode: item.moduleCode,
        openedAt: item.openedAt,
        completedAt: item.completedAt,
        progressState: item.progressState
      },
      create: {
        studentId,
        resourceId: item.resourceId,
        moduleCode: item.moduleCode,
        openedAt: item.openedAt,
        completedAt: item.completedAt,
        progressState: item.progressState
      }
    });
  }
}

async function seedSprint6Evidence(adminId: string, teacherId: string, studentId: string, blueprintId: string) {
  for (const provider of [
    { providerKey: "deterministic", displayName: "Deterministic Question Provider", mode: "LOCAL_DETERMINISTIC", enabled: true },
    { providerKey: "mock-ai", displayName: "Mock AI Question Provider", mode: "LOCAL_MOCK", enabled: true },
    { providerKey: "external", displayName: "External AI Provider", mode: "DISABLED_STUB", enabled: false }
  ]) {
    await prisma.aIProviderConfiguration.upsert({
      where: { providerKey: provider.providerKey },
      update: { ...provider, updatedById: adminId },
      create: { ...provider, updatedById: adminId, configuration: { credentialsStored: false, competitionMinorDataAllowed: false } }
    });
  }

  const attempt = await prisma.quizAttempt.upsert({
    where: { id: "attempt_synthetic_sprint6_001" },
    update: {
      status: "passed",
      totalScore: 85,
      moduleScoresJson: { DOG_BEHAVIOR: 90, ONE_HEALTH: 85, URBAN_ECOLOGY: 60, SHELTER_SAFETY: 95, RESEARCH_ETHICS: 95 },
      competencyScoresJson: { std_demo_data_interpretation: 50 },
      evidenceSnapshotJson: { verificationState: "SYNTHETIC_DEMO", datasetIds: ["SYNTHETIC_EDUOD_001"], standardIds: ["std_demo_data_interpretation"] }
    },
    create: {
      id: "attempt_synthetic_sprint6_001",
      studentId,
      blueprintId,
      blueprintVersion: defaultQuizBlueprint.version,
      startedAt: new Date("2026-07-11T03:00:00.000Z"),
      submittedAt: new Date("2026-07-11T03:20:00.000Z"),
      expiresAt: new Date("2026-07-11T03:30:00.000Z"),
      status: "passed",
      totalScore: 85,
      moduleScoresJson: { DOG_BEHAVIOR: 90, ONE_HEALTH: 85, URBAN_ECOLOGY: 60, SHELTER_SAFETY: 95, RESEARCH_ETHICS: 95 },
      competencyScoresJson: { std_demo_data_interpretation: 50 },
      evidenceSnapshotJson: { verificationState: "SYNTHETIC_DEMO", datasetIds: ["SYNTHETIC_EDUOD_001"], standardIds: ["std_demo_data_interpretation"] },
      attemptNumber: 2,
      integrityFlagsJson: []
    }
  });

  const sourceQuestion = phase2Questions.find((question) => question.id === "q_eco_synthetic_data_01")!;
  await prisma.quizAttemptQuestion.upsert({
    where: { id: "attempt_question_synthetic_sprint6_001" },
    update: {
      promptSnapshot: sourceQuestion.prompt,
      explanationSnapshot: sourceQuestion.explanation,
      resourceIdsSnapshot: sourceQuestion.resourceIds,
      learningStandardIdsSnapshot: sourceQuestion.standardIds,
      governmentDatasetIdsSnapshot: sourceQuestion.datasetIds,
      verificationSnapshotJson: { dataset: "SYNTHETIC_DEMO", standards: "DEMO_REFERENCE" },
      providerNameSnapshot: sourceQuestion.providerName,
      providerVersionSnapshot: sourceQuestion.providerVersion,
      promptVersionSnapshot: sourceQuestion.promptVersion,
      bloomLevelSnapshot: sourceQuestion.bloomLevel,
      difficultySnapshot: sourceQuestion.difficulty
    },
    create: {
      id: "attempt_question_synthetic_sprint6_001",
      attemptId: attempt.id,
      questionId: sourceQuestion.id,
      questionVersion: sourceQuestion.version,
      moduleCode: sourceQuestion.moduleCode,
      promptSnapshot: sourceQuestion.prompt,
      explanationSnapshot: sourceQuestion.explanation,
      optionsSnapshotJson: sourceQuestion.options,
      questionOrder: 1,
      resourceIdsSnapshot: sourceQuestion.resourceIds,
      learningStandardIdsSnapshot: sourceQuestion.standardIds,
      governmentDatasetIdsSnapshot: sourceQuestion.datasetIds,
      verificationSnapshotJson: { dataset: "SYNTHETIC_DEMO", standards: "DEMO_REFERENCE" },
      providerNameSnapshot: sourceQuestion.providerName,
      providerVersionSnapshot: sourceQuestion.providerVersion,
      promptVersionSnapshot: sourceQuestion.promptVersion,
      bloomLevelSnapshot: sourceQuestion.bloomLevel,
      difficultySnapshot: sourceQuestion.difficulty
    }
  });

  await prisma.remediationRecommendation.upsert({
    where: { attemptId_resourceId: { attemptId: attempt.id, resourceId: "res_teacher_urban_ecology_primer" } },
    update: { priority: 40, standardIds: ["std_demo_data_interpretation"], competencyTags: ["data interpretation", "evidence-based reasoning"] },
    create: {
      id: "remediation_synthetic_sprint6_001",
      attemptId: attempt.id,
      moduleCode: "URBAN_ECOLOGY",
      standardIds: ["std_demo_data_interpretation"],
      competencyTags: ["data interpretation", "evidence-based reasoning"],
      resourceId: "res_teacher_urban_ecology_primer",
      priority: 40,
      provenanceJson: { sourceType: "DETERMINISTIC_MODULE_SCORE", threshold: 80, verificationState: "SYNTHETIC_DEMO" }
    }
  });

  await prisma.auditLog.deleteMany({ where: { correlationId: "seed-sprint6-evidence-chain" } });
  await prisma.auditLog.createMany({
    data: [
      { actorId: adminId, actorRole: "admin", entityType: "government_dataset", entityId: "SYNTHETIC_EDUOD_001", action: "dataset_registered", newState: { verificationState: "SYNTHETIC_DEMO" }, correlationId: "seed-sprint6-evidence-chain" },
      { actorId: adminId, actorRole: "admin", entityType: "government_dataset_snapshot", entityId: "snapshot_synthetic_eduod_seed", action: "dataset_snapshot_created", newState: { mode: "LOCAL_FIXTURE" }, correlationId: "seed-sprint6-evidence-chain" },
      { actorId: teacherId, actorRole: "teacher", courseScope: phase4CoursePlan.id, entityType: "question_generation_blueprint", entityId: "qgb_urban_ecology_v1", action: "generation_blueprint_created", toStatus: "active", correlationId: "seed-sprint6-evidence-chain" },
      { actorId: teacherId, actorRole: "teacher", courseScope: phase4CoursePlan.id, entityType: "question_draft", entityId: "qd_urban_ecology_1", action: "question_generation", toStatus: "ai_draft", correlationId: "seed-sprint6-evidence-chain" },
      { actorId: adminId, actorRole: "admin", courseScope: phase4CoursePlan.id, entityType: "question_draft", entityId: "qd_urban_ecology_1", action: "question_draft_approved", fromStatus: "pending_review", toStatus: "approved", correlationId: "seed-sprint6-evidence-chain" },
      { actorId: adminId, actorRole: "admin", courseScope: phase4CoursePlan.id, entityType: "question", entityId: sourceQuestion.id, action: "question_published", fromStatus: "approved", toStatus: "published", correlationId: "seed-sprint6-evidence-chain" },
      { actorId: studentId, actorRole: "student", entityType: "quiz_attempt", entityId: attempt.id, action: "quiz_submitted", fromStatus: "in_progress", toStatus: "passed", changes: { totalScore: 85 }, correlationId: "seed-sprint6-evidence-chain" },
      { actorId: studentId, actorRole: "student", entityType: "remediation_recommendation", entityId: "remediation_synthetic_sprint6_001", action: "remediation_generated", toStatus: "assigned", changes: { threshold: 80 }, correlationId: "seed-sprint6-evidence-chain" }
    ]
  });
}

async function main() {
  await seedGovernmentDatasets();
  const { student, teacher, shelterStaff, admin, dog } = await seedUsersAndShelter();
  await seedPhase1CompatibilityQuestions();
  await seedLearningModulesAndStandards(admin.id, teacher.id);
  await seedQuestions(teacher.id, admin.id);
  const blueprint = await seedBlueprint(admin.id);
  await seedDemoAttemptAndLicense(student.id, blueprint.id);
  await seedObservation(student.id, dog.dogId);
  await seedObservationSession(student.id, dog.dogId, teacher.id, shelterStaff.id);
  await seedSprint7LivingLab(student.id, teacher.id, shelterStaff.id, admin.id);
  await seedPhase4Curriculum(admin.id, teacher.id, student.id, blueprint.id);
  await seedSprint6Evidence(admin.id, teacher.id, student.id, blueprint.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
