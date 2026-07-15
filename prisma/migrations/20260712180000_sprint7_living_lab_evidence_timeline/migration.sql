-- Sprint 7 additive migration. Review against the target database before execution.
-- No production database was available during generation.

ALTER TYPE "ObservationSessionStatus" ADD VALUE IF NOT EXISTS 'teacher_rejected';
ALTER TYPE "ObservationSessionStatus" ADD VALUE IF NOT EXISTS 'shelter_rejected';
ALTER TYPE "ObservationSessionStatus" ADD VALUE IF NOT EXISTS 'shelter_confirmed';

CREATE TYPE "ObservationMissionStatus" AS ENUM (
  'draft', 'awaiting_shelter_confirmation', 'assigned', 'available',
  'in_progress', 'submitted', 'teacher_revision', 'teacher_rejected',
  'shelter_revision', 'shelter_rejected', 'shelter_confirmed', 'published',
  'cancelled', 'archived'
);
CREATE TYPE "ObservationConfidenceLevel" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "ObservationEvidenceType" AS ENUM ('direct_observation', 'media_reference', 'shelter_record');
CREATE TYPE "ObservationPrivacyState" AS ENUM ('pending', 'approved_internal', 'approved_public', 'rejected', 'quarantined');
CREATE TYPE "ObservationReviewerRole" AS ENUM ('teacher', 'shelter_staff', 'admin');
CREATE TYPE "ObservationReviewDecision" AS ENUM ('approve', 'request_revision', 'reject', 'confirm');
CREATE TYPE "EvidenceTimelineEventType" AS ENUM (
  'shelter_intake', 'mission_assigned', 'observation_started',
  'observation_submitted', 'teacher_review', 'revision',
  'shelter_confirmation', 'publication', 'unpublication',
  'professional_note', 'evidence_profile_update', 'foster_placeholder',
  'outing_placeholder', 'adoption_placeholder'
);
CREATE TYPE "EvidenceTimelineVisibility" AS ENUM ('internal', 'public');

CREATE TABLE "observation_mission" (
  "id" TEXT NOT NULL,
  "course_id" TEXT,
  "classroom_id" TEXT,
  "teacher_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "shelter_id" TEXT NOT NULL,
  "dog_id" TEXT NOT NULL,
  "assigned_by" TEXT NOT NULL,
  "shelter_confirmer_id" TEXT,
  "title" TEXT NOT NULL,
  "scientific_purpose" TEXT NOT NULL,
  "research_question" TEXT,
  "allowed_zone" TEXT NOT NULL,
  "scheduled_start" TIMESTAMP(3) NOT NULL,
  "scheduled_end" TIMESTAMP(3) NOT NULL,
  "maximum_duration_sec" INTEGER NOT NULL DEFAULT 300,
  "protocol_version" TEXT NOT NULL DEFAULT 'SL-OBS-1',
  "status" "ObservationMissionStatus" NOT NULL DEFAULT 'draft',
  "cancellation_reason" TEXT,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "observation_mission_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "observation_session"
  ADD COLUMN "mission_id" TEXT,
  ADD COLUMN "parent_session_id" TEXT,
  ADD COLUMN "revision_number" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "shelter_id" TEXT,
  ADD COLUMN "started_at_server" TIMESTAMP(3),
  ADD COLUMN "ended_at_server" TIMESTAMP(3),
  ADD COLUMN "deadline_at_server" TIMESTAMP(3),
  ADD COLUMN "client_started_at" TIMESTAMP(3),
  ADD COLUMN "last_autosaved_at" TIMESTAMP(3),
  ADD COLUMN "submitted_at" TIMESTAMP(3),
  ADD COLUMN "teacher_reviewed_at" TIMESTAMP(3),
  ADD COLUMN "shelter_confirmed_at" TIMESTAMP(3),
  ADD COLUMN "row_version" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "protocol_version" TEXT NOT NULL DEFAULT 'SL-OBS-1',
  ADD COLUMN "environment_context_json" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN "general_notes" TEXT,
  ADD COLUMN "incident_flag" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "privacy_state" "ObservationPrivacyState" NOT NULL DEFAULT 'pending',
  ADD COLUMN "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "quality_score" INTEGER,
  ADD COLUMN "quality_score_version" TEXT,
  ADD COLUMN "published_by_id" TEXT,
  ADD COLUMN "unpublished_at" TIMESTAMP(3),
  ADD COLUMN "unpublish_reason" TEXT;

ALTER TABLE "behavior_event"
  ADD COLUMN "sequence_number" INTEGER,
  ADD COLUMN "confidence_level" "ObservationConfidenceLevel" NOT NULL DEFAULT 'medium',
  ADD COLUMN "context_code" TEXT,
  ADD COLUMN "evidence_type" "ObservationEvidenceType" NOT NULL DEFAULT 'direct_observation',
  ADD COLUMN "media_asset_id" TEXT,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "duration_sec" DROP NOT NULL;

WITH ranked_events AS (
  SELECT "id", ROW_NUMBER() OVER (
    PARTITION BY "session_id" ORDER BY "created_at", "id"
  ) - 1 AS sequence_number
  FROM "behavior_event"
)
UPDATE "behavior_event" AS event
SET "sequence_number" = ranked_events.sequence_number
FROM ranked_events
WHERE event."id" = ranked_events."id";

ALTER TABLE "behavior_event" ALTER COLUMN "sequence_number" SET NOT NULL;
ALTER TABLE "behavior_event" ALTER COLUMN "sequence_number" SET DEFAULT 0;
ALTER TABLE "behavior_event" ALTER COLUMN "updated_at" DROP DEFAULT;

CREATE TABLE "observation_review" (
  "id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "reviewer_id" TEXT NOT NULL,
  "reviewer_role" "ObservationReviewerRole" NOT NULL,
  "decision" "ObservationReviewDecision" NOT NULL,
  "reason_code" TEXT,
  "reason_text" TEXT,
  "reviewed_session_version" INTEGER NOT NULL,
  "rubric_json" JSONB NOT NULL DEFAULT '{}',
  "professional_context_note" TEXT,
  "idempotency_key" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "observation_review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "observation_quality_score" (
  "id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "dimensions_json" JSONB NOT NULL,
  "explanation_json" JSONB NOT NULL,
  "score_version" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "observation_quality_score_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "observation_publication" (
  "id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "version_identifier" TEXT NOT NULL,
  "published_by_id" TEXT NOT NULL,
  "published_at" TIMESTAMP(3) NOT NULL,
  "unpublished_by_id" TEXT,
  "unpublished_at" TIMESTAMP(3),
  "unpublish_reason" TEXT,
  "visibility_json" JSONB NOT NULL DEFAULT '{}',
  "snapshot_json" JSONB NOT NULL,
  "source_trace_json" JSONB NOT NULL,
  "idempotency_key" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "observation_publication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "evidence_timeline_entry" (
  "id" TEXT NOT NULL,
  "dog_id" TEXT NOT NULL,
  "session_id" TEXT,
  "event_date" TIMESTAMP(3) NOT NULL,
  "event_type" "EvidenceTimelineEventType" NOT NULL,
  "source_entity_type" TEXT NOT NULL,
  "source_entity_id" TEXT NOT NULL,
  "source_version" TEXT NOT NULL,
  "visibility" "EvidenceTimelineVisibility" NOT NULL,
  "verification_state" "EvidenceVerificationState" NOT NULL,
  "actor_role" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "evidence_links" TEXT[] NOT NULL,
  "audit_reference" TEXT NOT NULL,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "evidence_timeline_entry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dog_evidence_profile" (
  "id" TEXT NOT NULL,
  "dog_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "evidence_count" INTEGER NOT NULL DEFAULT 0,
  "latest_confirmed_at" TIMESTAMP(3),
  "context_diversity" INTEGER NOT NULL DEFAULT 0,
  "completeness_score" INTEGER NOT NULL DEFAULT 0,
  "approved_by_id" TEXT,
  "approved_at" TIMESTAMP(3),
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "dog_evidence_profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dog_evidence_profile_statement" (
  "id" TEXT NOT NULL,
  "profile_id" TEXT NOT NULL,
  "dimension" TEXT NOT NULL,
  "statement" TEXT NOT NULL,
  "evidence_source_ids" TEXT[] NOT NULL,
  "evidence_dates" TIMESTAMP(3)[] NOT NULL,
  "confirmation_state" TEXT NOT NULL,
  "shelter_approved" BOOLEAN NOT NULL DEFAULT false,
  "session_id" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "dog_evidence_profile_statement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_asset" (
  "id" TEXT NOT NULL,
  "source_session_id" TEXT NOT NULL,
  "storage_provider" TEXT,
  "storage_key" TEXT,
  "checksum_sha256" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "capture_time" TIMESTAMP(3),
  "uploader_role" TEXT NOT NULL,
  "privacy_state" "ObservationPrivacyState" NOT NULL DEFAULT 'pending',
  "face_present" BOOLEAN,
  "student_present" BOOLEAN,
  "reviewer_id" TEXT,
  "review_reason" TEXT,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_asset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shelter_professional_note" (
  "id" TEXT NOT NULL,
  "dog_id" TEXT NOT NULL,
  "session_id" TEXT,
  "author_id" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "visibility" "EvidenceTimelineVisibility" NOT NULL DEFAULT 'internal',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shelter_professional_note_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "behavior_code_definition" (
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "definition" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "overlapping_allowed" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 1,
  "updated_by_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "behavior_code_definition_pkey" PRIMARY KEY ("code")
);

CREATE INDEX "observation_mission_student_id_status_idx" ON "observation_mission"("student_id", "status");
CREATE INDEX "observation_mission_teacher_id_status_idx" ON "observation_mission"("teacher_id", "status");
CREATE INDEX "observation_mission_shelter_id_status_idx" ON "observation_mission"("shelter_id", "status");
CREATE INDEX "observation_mission_dog_id_idx" ON "observation_mission"("dog_id");
CREATE INDEX "observation_session_mission_id_idx" ON "observation_session"("mission_id");
CREATE INDEX "observation_session_parent_session_id_idx" ON "observation_session"("parent_session_id");
CREATE UNIQUE INDEX "behavior_event_session_id_sequence_number_key" ON "behavior_event"("session_id", "sequence_number");
CREATE UNIQUE INDEX "observation_review_idempotency_key_key" ON "observation_review"("idempotency_key");
CREATE INDEX "observation_review_session_id_reviewer_role_idx" ON "observation_review"("session_id", "reviewer_role");
CREATE UNIQUE INDEX "observation_quality_score_session_id_score_version_key" ON "observation_quality_score"("session_id", "score_version");
CREATE UNIQUE INDEX "observation_publication_idempotency_key_key" ON "observation_publication"("idempotency_key");
CREATE INDEX "observation_publication_session_id_published_at_idx" ON "observation_publication"("session_id", "published_at");
CREATE INDEX "evidence_timeline_entry_dog_id_event_date_idx" ON "evidence_timeline_entry"("dog_id", "event_date");
CREATE INDEX "evidence_timeline_entry_visibility_verification_state_idx" ON "evidence_timeline_entry"("visibility", "verification_state");
CREATE UNIQUE INDEX "dog_evidence_profile_dog_id_version_key" ON "dog_evidence_profile"("dog_id", "version");
CREATE INDEX "dog_evidence_profile_dog_id_status_idx" ON "dog_evidence_profile"("dog_id", "status");
CREATE INDEX "dog_evidence_profile_statement_profile_id_dimension_idx" ON "dog_evidence_profile_statement"("profile_id", "dimension");
CREATE INDEX "media_asset_source_session_id_privacy_state_idx" ON "media_asset"("source_session_id", "privacy_state");
CREATE INDEX "media_asset_checksum_sha256_idx" ON "media_asset"("checksum_sha256");
CREATE INDEX "shelter_professional_note_dog_id_created_at_idx" ON "shelter_professional_note"("dog_id", "created_at");
CREATE INDEX "behavior_code_definition_active_idx" ON "behavior_code_definition"("active");

ALTER TABLE "observation_mission" ADD CONSTRAINT "observation_mission_shelter_id_fkey" FOREIGN KEY ("shelter_id") REFERENCES "shelter"("shelter_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "observation_mission" ADD CONSTRAINT "observation_mission_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dog"("dog_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "observation_session" ADD CONSTRAINT "observation_session_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "observation_mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "observation_session" ADD CONSTRAINT "observation_session_parent_session_id_fkey" FOREIGN KEY ("parent_session_id") REFERENCES "observation_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "observation_review" ADD CONSTRAINT "observation_review_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "observation_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "observation_quality_score" ADD CONSTRAINT "observation_quality_score_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "observation_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "observation_publication" ADD CONSTRAINT "observation_publication_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "observation_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evidence_timeline_entry" ADD CONSTRAINT "evidence_timeline_entry_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dog"("dog_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "evidence_timeline_entry" ADD CONSTRAINT "evidence_timeline_entry_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "observation_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "dog_evidence_profile" ADD CONSTRAINT "dog_evidence_profile_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dog"("dog_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dog_evidence_profile_statement" ADD CONSTRAINT "dog_evidence_profile_statement_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "dog_evidence_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dog_evidence_profile_statement" ADD CONSTRAINT "dog_evidence_profile_statement_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "observation_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_source_session_id_fkey" FOREIGN KEY ("source_session_id") REFERENCES "observation_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "behavior_event" ADD CONSTRAINT "behavior_event_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shelter_professional_note" ADD CONSTRAINT "shelter_professional_note_dog_id_fkey" FOREIGN KEY ("dog_id") REFERENCES "dog"("dog_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shelter_professional_note" ADD CONSTRAINT "shelter_professional_note_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "observation_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
