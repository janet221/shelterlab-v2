-- Sprint 10A additive migration. Prepared only; do not execute without an approved database review.

CREATE TYPE "AdoptionProfileStatus" AS ENUM ('draft', 'review', 'approved', 'published', 'archived');
CREATE TYPE "AdoptionEvidenceType" AS ENUM ('shelter_intake', 'health_check', 'observation', 'teacher_approval', 'shelter_confirmation', 'publication', 'media_photo', 'media_video', 'profile_update');
CREATE TYPE "AdoptionTimelineEventType" AS ENUM ('shelter_intake', 'health_check', 'observation', 'teacher_approval', 'shelter_confirmation', 'publication', 'profile_update', 'foster', 'one_day_outing', 'trial_adoption', 'formal_adoption', 'returned');
CREATE TYPE "AdoptionTimelineState" AS ENUM ('evidence', 'not_recorded', 'future_placeholder');

CREATE TABLE "published_adoption_evidence" (
  "id" TEXT NOT NULL,
  "dog_id" TEXT NOT NULL,
  "evidence_type" "AdoptionEvidenceType" NOT NULL,
  "source_entity_type" TEXT NOT NULL,
  "source_entity_id" TEXT NOT NULL,
  "source_version" TEXT NOT NULL,
  "published_at" TIMESTAMP(3) NOT NULL,
  "reviewer_id" TEXT NOT NULL,
  "reviewer_role" TEXT NOT NULL,
  "confidence" TEXT NOT NULL,
  "context" TEXT NOT NULL,
  "evidence_data_json" JSONB NOT NULL DEFAULT '{}',
  "timeline_entry_id" TEXT NOT NULL,
  "verification_state" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'published',
  "shelter_approved" BOOLEAN NOT NULL DEFAULT false,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "published_adoption_evidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "adoption_profile" (
  "id" TEXT NOT NULL,
  "dog_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "AdoptionProfileStatus" NOT NULL DEFAULT 'published',
  "unknown_information" TEXT[] NOT NULL,
  "not_yet_tested" TEXT[] NOT NULL,
  "latest_evidence_at" TIMESTAMP(3) NOT NULL,
  "approved_by_id" TEXT NOT NULL,
  "approved_at" TIMESTAMP(3) NOT NULL,
  "published_at" TIMESTAMP(3) NOT NULL,
  "generation_method" TEXT NOT NULL,
  "ai_generated" BOOLEAN NOT NULL DEFAULT false,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "adoption_profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "adoption_profile_statement" (
  "id" TEXT NOT NULL,
  "profile_id" TEXT NOT NULL,
  "section" TEXT NOT NULL,
  "statement" TEXT NOT NULL,
  "timeline_entry_ids" TEXT[] NOT NULL,
  "reviewer_ids" TEXT[] NOT NULL,
  "confidence" TEXT NOT NULL,
  "verification_states" TEXT[] NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "adoption_profile_statement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "adoption_profile_statement_evidence" (
  "statement_id" TEXT NOT NULL,
  "evidence_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "adoption_profile_statement_evidence_pkey" PRIMARY KEY ("statement_id", "evidence_id")
);

CREATE TABLE "evidence_completeness_score" (
  "id" TEXT NOT NULL,
  "dog_id" TEXT NOT NULL,
  "profile_id" TEXT NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "dimensions_json" JSONB NOT NULL,
  "formula" TEXT NOT NULL,
  "score_version" TEXT NOT NULL,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "calculated_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "evidence_completeness_score_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "profile_gap_assessment" (
  "id" TEXT NOT NULL,
  "dog_id" TEXT NOT NULL,
  "profile_id" TEXT NOT NULL,
  "gaps_json" JSONB NOT NULL,
  "gap_version" TEXT NOT NULL,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "calculated_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "profile_gap_assessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "adoption_timeline_event" (
  "id" TEXT NOT NULL,
  "dog_id" TEXT NOT NULL,
  "event_type" "AdoptionTimelineEventType" NOT NULL,
  "event_date" TIMESTAMP(3),
  "state" "AdoptionTimelineState" NOT NULL,
  "label" TEXT NOT NULL,
  "evidence_ids" TEXT[] NOT NULL,
  "source_versions" TEXT[] NOT NULL,
  "reviewer_roles" TEXT[] NOT NULL,
  "verification_states" TEXT[] NOT NULL,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "adoption_timeline_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "published_adoption_evidence_source_version_key" ON "published_adoption_evidence"("source_entity_type", "source_entity_id", "source_version", "evidence_type", "timeline_entry_id");
CREATE INDEX "published_adoption_evidence_dog_id_evidence_type_published_at_idx" ON "published_adoption_evidence"("dog_id", "evidence_type", "published_at");
CREATE INDEX "published_adoption_evidence_status_shelter_approved_idx" ON "published_adoption_evidence"("status", "shelter_approved");
CREATE UNIQUE INDEX "adoption_profile_dog_id_version_key" ON "adoption_profile"("dog_id", "version");
CREATE INDEX "adoption_profile_dog_id_status_idx" ON "adoption_profile"("dog_id", "status");
CREATE INDEX "adoption_profile_statement_profile_id_section_idx" ON "adoption_profile_statement"("profile_id", "section");
CREATE INDEX "adoption_profile_statement_evidence_evidence_id_idx" ON "adoption_profile_statement_evidence"("evidence_id");
CREATE UNIQUE INDEX "evidence_completeness_score_profile_id_key" ON "evidence_completeness_score"("profile_id");
CREATE INDEX "evidence_completeness_score_dog_id_calculated_at_idx" ON "evidence_completeness_score"("dog_id", "calculated_at");
CREATE UNIQUE INDEX "profile_gap_assessment_profile_id_key" ON "profile_gap_assessment"("profile_id");
CREATE INDEX "profile_gap_assessment_dog_id_calculated_at_idx" ON "profile_gap_assessment"("dog_id", "calculated_at");
CREATE INDEX "adoption_timeline_event_dog_id_event_date_idx" ON "adoption_timeline_event"("dog_id", "event_date");
CREATE INDEX "adoption_timeline_event_state_event_type_idx" ON "adoption_timeline_event"("state", "event_type");

ALTER TABLE "published_adoption_evidence" ADD CONSTRAINT "published_adoption_evidence_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dog"("dog_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "adoption_profile" ADD CONSTRAINT "adoption_profile_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dog"("dog_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "adoption_profile_statement" ADD CONSTRAINT "adoption_profile_statement_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "adoption_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "adoption_profile_statement_evidence" ADD CONSTRAINT "adoption_profile_statement_evidence_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "adoption_profile_statement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "adoption_profile_statement_evidence" ADD CONSTRAINT "adoption_profile_statement_evidence_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "published_adoption_evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evidence_completeness_score" ADD CONSTRAINT "evidence_completeness_score_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "adoption_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "profile_gap_assessment" ADD CONSTRAINT "profile_gap_assessment_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "adoption_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "adoption_timeline_event" ADD CONSTRAINT "adoption_timeline_event_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dog"("dog_id") ON DELETE RESTRICT ON UPDATE CASCADE;
