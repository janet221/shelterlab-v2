-- Sprint 8 additive migration. Prepared only; do not execute without an approved database review.

CREATE TYPE "ImpactEvidenceStatus" AS ENUM ('VERIFIED', 'DEMO', 'SYNTHETIC', 'UNVERIFIED');
CREATE TYPE "ImpactConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT', 'DEMO_ONLY');

CREATE TABLE "impact_metric_definition" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "formula" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "source_entity_types" TEXT[] NOT NULL,
  "interpretation_limit" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "impact_metric_definition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "impact_metric_run" (
  "id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "evidence_status" "ImpactEvidenceStatus" NOT NULL,
  "calculated_at" TIMESTAMP(3) NOT NULL,
  "period_start" TIMESTAMP(3),
  "period_end" TIMESTAMP(3),
  "input_snapshot_hash" TEXT,
  "provenance_json" JSONB NOT NULL,
  "warnings" TEXT[] NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "impact_metric_run_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "impact_metric_result" (
  "id" TEXT NOT NULL,
  "definition_id" TEXT NOT NULL,
  "run_id" TEXT NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "numerator" DOUBLE PRECISION NOT NULL,
  "denominator" DOUBLE PRECISION NOT NULL,
  "confidence_level" "ImpactConfidenceLevel" NOT NULL,
  "evidence_status" "ImpactEvidenceStatus" NOT NULL,
  "synthetic_demo" BOOLEAN NOT NULL DEFAULT false,
  "provenance_json" JSONB NOT NULL,
  "limitations" TEXT[] NOT NULL,
  "dimensions_json" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "impact_metric_result_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "competition_score_mapping" (
  "id" TEXT NOT NULL,
  "mapping_version" TEXT NOT NULL,
  "dimension" TEXT NOT NULL,
  "criterion_code" TEXT NOT NULL,
  "feature" TEXT NOT NULL,
  "module_path" TEXT NOT NULL,
  "evidence" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "max_points" INTEGER NOT NULL,
  "evidence_status" "ImpactEvidenceStatus" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "competition_score_mapping_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "impact_metric_definition_code_key" ON "impact_metric_definition"("code");
CREATE INDEX "impact_metric_definition_domain_active_idx" ON "impact_metric_definition"("domain", "active");
CREATE INDEX "impact_metric_run_version_calculated_at_idx" ON "impact_metric_run"("version", "calculated_at");
CREATE UNIQUE INDEX "impact_metric_result_definition_id_run_id_key" ON "impact_metric_result"("definition_id", "run_id");
CREATE INDEX "impact_metric_result_evidence_status_created_at_idx" ON "impact_metric_result"("evidence_status", "created_at");
CREATE UNIQUE INDEX "competition_score_mapping_mapping_version_criterion_code_key" ON "competition_score_mapping"("mapping_version", "criterion_code");
CREATE INDEX "competition_score_mapping_dimension_mapping_version_idx" ON "competition_score_mapping"("dimension", "mapping_version");

ALTER TABLE "impact_metric_result" ADD CONSTRAINT "impact_metric_result_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "impact_metric_definition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "impact_metric_result" ADD CONSTRAINT "impact_metric_result_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "impact_metric_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
