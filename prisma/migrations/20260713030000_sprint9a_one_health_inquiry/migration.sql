-- Sprint 9A additive migration. Prepared only; do not execute without an approved database review.

CREATE TYPE "InquiryType" AS ENUM ('shelter_behavior', 'one_health_public_health', 'urban_ecology', 'shelter_statistics', 'animal_welfare', 'adoption_accessibility', 'data_quality', 'custom_teacher_approved');
CREATE TYPE "InquiryStatus" AS ENUM ('draft', 'question_review', 'design_review', 'data_collection', 'analysis', 'submitted', 'teacher_revision', 'teacher_rejected', 'teacher_approved', 'shelter_review', 'shelter_revision', 'shelter_rejected', 'shelter_confirmed', 'final', 'archived');
CREATE TYPE "InquiryOneHealthDimension" AS ENUM ('human_health', 'animal_health', 'animal_welfare', 'environment', 'public_health', 'education', 'citizen_science', 'local_policy');
CREATE TYPE "InquiryEvidenceType" AS ENUM ('government_dataset_snapshot', 'curriculum_resource', 'learning_standard', 'observation_session', 'published_dog_evidence', 'shelter_statistic', 'student_generated_dataset', 'teacher_reference');
CREATE TYPE "InquiryEvidenceVerificationState" AS ENUM ('VERIFIED', 'DEMO_REFERENCE', 'SYNTHETIC_DEMO', 'SHELTER_CONFIRMED', 'UNVERIFIED');
CREATE TYPE "InquiryPrivacyClassification" AS ENUM ('public', 'restricted', 'private');
CREATE TYPE "InquiryAnalysisMethod" AS ENUM ('count', 'proportion', 'mean', 'median', 'minimum', 'maximum', 'category_comparison', 'time_comparison', 'regional_comparison', 'contingency_table', 'simple_correlation', 'observation_frequency', 'behavior_duration_summary');
CREATE TYPE "InquiryReviewDecision" AS ENUM ('approve', 'request_revision', 'reject', 'confirm');

CREATE TABLE "inquiry_project" (
  "id" TEXT NOT NULL,
  "parent_project_id" TEXT,
  "revision_number" INTEGER NOT NULL DEFAULT 1,
  "course_id" TEXT,
  "classroom_id" TEXT,
  "research_group_id" TEXT,
  "owner_student_id" TEXT NOT NULL,
  "supervising_teacher_id" TEXT NOT NULL,
  "shelter_id" TEXT,
  "title" TEXT NOT NULL,
  "inquiry_type" "InquiryType" NOT NULL,
  "status" "InquiryStatus" NOT NULL DEFAULT 'draft',
  "one_health_dimensions" "InquiryOneHealthDimension"[] NOT NULL,
  "one_health_connection" TEXT NOT NULL,
  "research_question" TEXT NOT NULL,
  "background" TEXT NOT NULL,
  "hypothesis" TEXT NOT NULL,
  "independent_variable" TEXT NOT NULL,
  "dependent_variable" TEXT NOT NULL,
  "controlled_variables" TEXT[] NOT NULL,
  "evidence_scope" TEXT NOT NULL,
  "protocol_version" TEXT NOT NULL DEFAULT 'SL-INQUIRY-1',
  "data_classification" TEXT NOT NULL DEFAULT 'student_private',
  "reflection" TEXT NOT NULL DEFAULT '',
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "row_version" INTEGER NOT NULL DEFAULT 0,
  "submitted_snapshot_json" JSONB,
  "submitted_at" TIMESTAMP(3),
  "teacher_approved_at" TIMESTAMP(3),
  "shelter_confirmed_at" TIMESTAMP(3),
  "published_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "inquiry_project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_project_learning_standard" (
  "project_id" TEXT NOT NULL,
  "standard_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_project_learning_standard_pkey" PRIMARY KEY ("project_id", "standard_id")
);

CREATE TABLE "inquiry_evidence_link" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "evidence_type" "InquiryEvidenceType" NOT NULL,
  "source_entity_id" TEXT NOT NULL,
  "source_version" TEXT NOT NULL,
  "verification_state" "InquiryEvidenceVerificationState" NOT NULL,
  "usage_purpose" TEXT NOT NULL,
  "citation_text" TEXT NOT NULL,
  "included_at" TIMESTAMP(3) NOT NULL,
  "included_by" TEXT NOT NULL,
  "privacy_classification" "InquiryPrivacyClassification" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_evidence_link_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_research_design" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "population_or_sample" TEXT NOT NULL,
  "observation_unit" TEXT NOT NULL,
  "sampling_method" TEXT NOT NULL,
  "sample_size_planned" INTEGER NOT NULL,
  "time_period" TEXT NOT NULL,
  "measurement_method" TEXT NOT NULL,
  "variables_json" JSONB NOT NULL,
  "possible_confounders" TEXT[] NOT NULL,
  "ethical_limits" TEXT NOT NULL,
  "safety_limits" TEXT NOT NULL,
  "privacy_limits" TEXT NOT NULL,
  "analysis_plan" TEXT NOT NULL,
  "teacher_design_decision" TEXT NOT NULL,
  "teacher_feedback" TEXT,
  "validation_flags_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_research_design_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_dataset" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "columns_json" JSONB NOT NULL,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_dataset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_dataset_version" (
  "id" TEXT NOT NULL,
  "dataset_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "kind" TEXT NOT NULL,
  "rows_json" JSONB NOT NULL,
  "source_provenance_json" JSONB NOT NULL,
  "immutable" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_dataset_version_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_data_transformation" (
  "id" TEXT NOT NULL,
  "dataset_version_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "column_name" TEXT,
  "previous_value_json" JSONB,
  "new_value_json" JSONB,
  "row_index" INTEGER,
  "reason" TEXT,
  "formula_description" TEXT,
  "actor_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_data_transformation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_analysis_result" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "dataset_version_id" TEXT NOT NULL,
  "method" "InquiryAnalysisMethod" NOT NULL,
  "variables" TEXT[] NOT NULL,
  "filtered_population" TEXT NOT NULL,
  "numerator" DOUBLE PRECISION NOT NULL,
  "denominator" DOUBLE PRECISION NOT NULL,
  "calculated_value_json" JSONB NOT NULL,
  "chart_specification_json" JSONB NOT NULL,
  "source_dataset_versions" TEXT[] NOT NULL,
  "interpretation_note" TEXT NOT NULL,
  "limitation_note" TEXT NOT NULL,
  "validation_flags_json" JSONB NOT NULL,
  "calculation_version" TEXT NOT NULL,
  "generated_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_analysis_result_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_cer_statement" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "claim" TEXT NOT NULL,
  "evidence_link_ids" TEXT[] NOT NULL,
  "reasoning" TEXT NOT NULL,
  "confidence_level" TEXT NOT NULL,
  "alternative_explanation" TEXT NOT NULL,
  "limitation" TEXT NOT NULL,
  "teacher_feedback" TEXT,
  "status" TEXT NOT NULL,
  "validation_flags_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_cer_statement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_system_map" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "nodes_json" JSONB NOT NULL,
  "edges_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_system_map_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_recommendation" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "recommendation" TEXT NOT NULL,
  "target_actor" TEXT NOT NULL,
  "supporting_evidence" TEXT[] NOT NULL,
  "feasibility" TEXT NOT NULL,
  "expected_benefit" TEXT NOT NULL,
  "possible_risk" TEXT NOT NULL,
  "required_resources" TEXT NOT NULL,
  "evaluation_indicator" TEXT NOT NULL,
  "student_scope" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "evidence_strength" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_recommendation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_project_review" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "reviewer_id" TEXT NOT NULL,
  "reviewer_role" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "decision" "InquiryReviewDecision" NOT NULL,
  "reason" TEXT,
  "rubric_json" JSONB NOT NULL DEFAULT '{}',
  "project_revision" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_project_review_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_competency_evidence" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "competency" TEXT NOT NULL,
  "evidence_entity_ids" TEXT[] NOT NULL,
  "teacher_score" INTEGER,
  "teacher_feedback" TEXT,
  "version" INTEGER NOT NULL,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_competency_evidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inquiry_report_version" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "report_json" JSONB NOT NULL,
  "evidence_appendix_json" JSONB NOT NULL,
  "public_safe" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_report_version_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "inquiry_project_owner_student_id_status_idx" ON "inquiry_project"("owner_student_id", "status");
CREATE INDEX "inquiry_project_supervising_teacher_id_status_idx" ON "inquiry_project"("supervising_teacher_id", "status");
CREATE INDEX "inquiry_project_shelter_id_status_idx" ON "inquiry_project"("shelter_id", "status");
CREATE INDEX "inquiry_project_parent_project_id_idx" ON "inquiry_project"("parent_project_id");
CREATE INDEX "inquiry_evidence_link_project_id_evidence_type_idx" ON "inquiry_evidence_link"("project_id", "evidence_type");
CREATE INDEX "inquiry_evidence_link_source_entity_id_source_version_idx" ON "inquiry_evidence_link"("source_entity_id", "source_version");
CREATE UNIQUE INDEX "inquiry_research_design_project_id_version_key" ON "inquiry_research_design"("project_id", "version");
CREATE INDEX "inquiry_dataset_project_id_idx" ON "inquiry_dataset"("project_id");
CREATE UNIQUE INDEX "inquiry_dataset_version_dataset_id_version_key" ON "inquiry_dataset_version"("dataset_id", "version");
CREATE INDEX "inquiry_data_transformation_dataset_version_id_created_at_idx" ON "inquiry_data_transformation"("dataset_version_id", "created_at");
CREATE INDEX "inquiry_analysis_result_project_id_generated_at_idx" ON "inquiry_analysis_result"("project_id", "generated_at");
CREATE UNIQUE INDEX "inquiry_cer_statement_project_id_version_key" ON "inquiry_cer_statement"("project_id", "version");
CREATE UNIQUE INDEX "inquiry_system_map_project_id_version_key" ON "inquiry_system_map"("project_id", "version");
CREATE INDEX "inquiry_recommendation_project_id_target_actor_idx" ON "inquiry_recommendation"("project_id", "target_actor");
CREATE INDEX "inquiry_project_review_project_id_stage_created_at_idx" ON "inquiry_project_review"("project_id", "stage", "created_at");
CREATE UNIQUE INDEX "inquiry_competency_evidence_project_id_competency_version_key" ON "inquiry_competency_evidence"("project_id", "competency", "version");
CREATE UNIQUE INDEX "inquiry_report_version_project_id_version_key" ON "inquiry_report_version"("project_id", "version");

ALTER TABLE "inquiry_project" ADD CONSTRAINT "inquiry_project_parent_project_id_fkey" FOREIGN KEY ("parent_project_id") REFERENCES "inquiry_project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inquiry_project_learning_standard" ADD CONSTRAINT "inquiry_project_learning_standard_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_project_learning_standard" ADD CONSTRAINT "inquiry_project_learning_standard_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "learning_standard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inquiry_evidence_link" ADD CONSTRAINT "inquiry_evidence_link_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_research_design" ADD CONSTRAINT "inquiry_research_design_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_dataset" ADD CONSTRAINT "inquiry_dataset_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_dataset_version" ADD CONSTRAINT "inquiry_dataset_version_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "inquiry_dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_data_transformation" ADD CONSTRAINT "inquiry_data_transformation_dataset_version_id_fkey" FOREIGN KEY ("dataset_version_id") REFERENCES "inquiry_dataset_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_analysis_result" ADD CONSTRAINT "inquiry_analysis_result_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_cer_statement" ADD CONSTRAINT "inquiry_cer_statement_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_system_map" ADD CONSTRAINT "inquiry_system_map_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_recommendation" ADD CONSTRAINT "inquiry_recommendation_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_project_review" ADD CONSTRAINT "inquiry_project_review_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_competency_evidence" ADD CONSTRAINT "inquiry_competency_evidence_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inquiry_report_version" ADD CONSTRAINT "inquiry_report_version_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "inquiry_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
