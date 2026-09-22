-- CreateEnum
CREATE TYPE "EvidenceVerificationState" AS ENUM ('VERIFIED', 'METADATA_VERIFIED', 'UNVERIFIED', 'UNAVAILABLE', 'DEMO_REFERENCE', 'SYNTHETIC_DEMO');
-- Sprint 6 additive migration. It preserves all Phase 1-5 tables and data.
-- Review against the target database before execution; no database was available during generation.

-- CreateEnum
CREATE TYPE "DatasetRetrievalStatus" AS ENUM ('CONFIGURED', 'READY', 'SUCCESS', 'FAILED', 'DISABLED');

-- CreateEnum
CREATE TYPE "DatasetValidationStatus" AS ENUM ('PENDING', 'PASSED', 'WARNING', 'FAILED');

-- CreateEnum
CREATE TYPE "DatasetSyncRunStatus" AS ENUM ('STARTED', 'SUCCEEDED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DatasetUsageModule" AS ENUM ('CURRICULUM_DISCOVERY', 'LEARNING_RESOURCE_MAPPING', 'COMPETENCY_CONTEXT', 'QUESTION_GENERATION', 'REMEDIATION', 'INQUIRY_CONTEXT', 'COMPETITION_EVIDENCE');

-- AlterEnum
ALTER TYPE "QuestionStatus" ADD VALUE 'published';

-- AlterTable
ALTER TABLE "quiz_attempt" ADD COLUMN     "competency_scores_json" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "evidence_snapshot_json" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "quiz_attempt_question" ADD COLUMN     "bloom_level_snapshot" "BloomLevel",
ADD COLUMN     "difficulty_snapshot" "QuestionDifficulty",
ADD COLUMN     "government_dataset_ids_snapshot" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "learning_standard_ids_snapshot" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "prompt_version_snapshot" TEXT,
ADD COLUMN     "provider_name_snapshot" TEXT,
ADD COLUMN     "provider_version_snapshot" TEXT,
ADD COLUMN     "resource_ids_snapshot" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "verification_snapshot_json" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "quiz_attempt_question"
ALTER COLUMN "government_dataset_ids_snapshot" SET NOT NULL,
ALTER COLUMN "learning_standard_ids_snapshot" SET NOT NULL,
ALTER COLUMN "resource_ids_snapshot" SET NOT NULL;

-- AlterTable
ALTER TABLE "government_dataset" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "adapter_key" TEXT,
ADD COLUMN     "attribution_text" TEXT,
ADD COLUMN     "failure_message" TEXT,
ADD COLUMN     "retrieval_status" "DatasetRetrievalStatus" NOT NULL DEFAULT 'CONFIGURED',
ADD COLUMN     "schema_version" TEXT,
ADD COLUMN     "validation_status" "DatasetValidationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verification_state" "EvidenceVerificationState" NOT NULL DEFAULT 'UNVERIFIED';

-- AlterTable
ALTER TABLE "curriculum_resource" ADD COLUMN     "evidence_verification_state" "EvidenceVerificationState" NOT NULL DEFAULT 'UNVERIFIED';

-- AlterTable
ALTER TABLE "question_generation_blueprint" ADD COLUMN     "prompt_version" TEXT NOT NULL DEFAULT 'shelterlab-s6-v1',
ADD COLUMN     "requires_government_data" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "question_draft" ADD COLUMN     "government_dataset_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "provider_name" TEXT,
ADD COLUMN     "provider_version" TEXT,
ADD COLUMN     "unsupported_claim_flags_json" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "question_draft"
ALTER COLUMN "government_dataset_ids" SET NOT NULL;

-- AlterTable
ALTER TABLE "audit_log" ADD COLUMN     "actor_role" TEXT,
ADD COLUMN     "correlation_id" TEXT,
ADD COLUMN     "course_scope" TEXT,
ADD COLUMN     "organization_scope" TEXT;

-- CreateTable
CREATE TABLE "government_dataset_snapshot" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "snapshot_version" INTEGER NOT NULL,
    "schema_version" TEXT NOT NULL,
    "verification_state" "EvidenceVerificationState" NOT NULL,
    "retrieved_at" TIMESTAMP(3) NOT NULL,
    "record_count" INTEGER NOT NULL,
    "content_hash" TEXT NOT NULL,
    "source_metadata" JSONB NOT NULL DEFAULT '{}',
    "normalized_data" JSONB NOT NULL DEFAULT '[]',
    "is_last_successful" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "government_dataset_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_dataset_sync_run" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "snapshot_id" TEXT,
    "adapter_key" TEXT NOT NULL,
    "status" "DatasetSyncRunStatus" NOT NULL,
    "correlation_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "preview_count" INTEGER NOT NULL DEFAULT 0,
    "imported_count" INTEGER NOT NULL DEFAULT 0,
    "duplicate_count" INTEGER NOT NULL DEFAULT 0,
    "failure_message" TEXT,
    "previous_snapshot_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "government_dataset_sync_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_dataset_field_mapping" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "source_field" TEXT NOT NULL,
    "normalized_field" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "transformation" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_dataset_field_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_dataset_usage" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "snapshot_id" TEXT,
    "usage_module" "DatasetUsageModule" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "government_dataset_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "government_dataset_attribution" (
    "id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "attribution_text" TEXT NOT NULL,
    "license_note" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "government_dataset_attribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_government_dataset" (
    "question_id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "usage_note" TEXT NOT NULL,
    "snapshot_hash" TEXT,

    CONSTRAINT "question_government_dataset_pkey" PRIMARY KEY ("question_id","dataset_id")
);

-- CreateTable
CREATE TABLE "question_generation_blueprint_resource" (
    "blueprint_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_generation_blueprint_resource_pkey" PRIMARY KEY ("blueprint_id","resource_id")
);

-- CreateTable
CREATE TABLE "question_generation_blueprint_standard" (
    "blueprint_id" TEXT NOT NULL,
    "standard_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_generation_blueprint_standard_pkey" PRIMARY KEY ("blueprint_id","standard_id")
);

-- CreateTable
CREATE TABLE "question_generation_blueprint_government_dataset" (
    "blueprint_id" TEXT NOT NULL,
    "dataset_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_generation_blueprint_government_dataset_pkey" PRIMARY KEY ("blueprint_id","dataset_id")
);

-- CreateTable
CREATE TABLE "ai_provider_configuration" (
    "id" TEXT NOT NULL,
    "provider_key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_provider_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_recommendation" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "module_code" TEXT NOT NULL,
    "standard_ids" TEXT[],
    "competency_tags" TEXT[],
    "resource_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "provenance_json" JSONB NOT NULL DEFAULT '{}',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "remediation_recommendation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "remediation_recommendation"
ALTER COLUMN "standard_ids" SET NOT NULL,
ALTER COLUMN "competency_tags" SET NOT NULL;

-- CreateIndex
CREATE INDEX "government_dataset_snapshot_dataset_id_is_last_successful_idx" ON "government_dataset_snapshot"("dataset_id", "is_last_successful");

-- CreateIndex
CREATE UNIQUE INDEX "government_dataset_snapshot_dataset_id_content_hash_key" ON "government_dataset_snapshot"("dataset_id", "content_hash");

-- CreateIndex
CREATE INDEX "government_dataset_sync_run_dataset_id_started_at_idx" ON "government_dataset_sync_run"("dataset_id", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "government_dataset_field_mapping_dataset_id_normalized_fiel_key" ON "government_dataset_field_mapping"("dataset_id", "normalized_field", "version");

-- CreateIndex
CREATE INDEX "government_dataset_usage_usage_module_active_idx" ON "government_dataset_usage"("usage_module", "active");

-- CreateIndex
CREATE UNIQUE INDEX "government_dataset_usage_dataset_id_usage_module_entity_typ_key" ON "government_dataset_usage"("dataset_id", "usage_module", "entity_type", "entity_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "government_dataset_attribution_dataset_id_version_key" ON "government_dataset_attribution"("dataset_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ai_provider_configuration_provider_key_key" ON "ai_provider_configuration"("provider_key");

-- CreateIndex
CREATE INDEX "remediation_recommendation_attempt_id_module_code_idx" ON "remediation_recommendation"("attempt_id", "module_code");

-- CreateIndex
CREATE UNIQUE INDEX "remediation_recommendation_attempt_id_resource_id_key" ON "remediation_recommendation"("attempt_id", "resource_id");

-- AddForeignKey
ALTER TABLE "government_dataset_snapshot" ADD CONSTRAINT "government_dataset_snapshot_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "government_dataset"("dataset_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_dataset_sync_run" ADD CONSTRAINT "government_dataset_sync_run_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "government_dataset"("dataset_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_dataset_sync_run" ADD CONSTRAINT "government_dataset_sync_run_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "government_dataset_snapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_dataset_field_mapping" ADD CONSTRAINT "government_dataset_field_mapping_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "government_dataset"("dataset_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_dataset_usage" ADD CONSTRAINT "government_dataset_usage_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "government_dataset"("dataset_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_dataset_usage" ADD CONSTRAINT "government_dataset_usage_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "government_dataset_snapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "government_dataset_attribution" ADD CONSTRAINT "government_dataset_attribution_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "government_dataset"("dataset_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_government_dataset" ADD CONSTRAINT "question_government_dataset_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_government_dataset" ADD CONSTRAINT "question_government_dataset_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "government_dataset"("dataset_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_generation_blueprint_resource" ADD CONSTRAINT "question_generation_blueprint_resource_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "question_generation_blueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_generation_blueprint_resource" ADD CONSTRAINT "question_generation_blueprint_resource_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "curriculum_resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_generation_blueprint_standard" ADD CONSTRAINT "question_generation_blueprint_standard_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "question_generation_blueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_generation_blueprint_standard" ADD CONSTRAINT "question_generation_blueprint_standard_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "learning_standard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_generation_blueprint_government_dataset" ADD CONSTRAINT "question_generation_blueprint_government_dataset_blueprint_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "question_generation_blueprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_generation_blueprint_government_dataset" ADD CONSTRAINT "question_generation_blueprint_government_dataset_dataset_i_fkey" FOREIGN KEY ("dataset_id") REFERENCES "government_dataset"("dataset_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_recommendation" ADD CONSTRAINT "remediation_recommendation_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_recommendation" ADD CONSTRAINT "remediation_recommendation_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "curriculum_resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
