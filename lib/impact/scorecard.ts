import type { CompetitionCriterion, CompetitionDimension, CompetitionDimensionScore, CompetitionScorecard } from "./types";

type CriterionInput = Omit<CompetitionCriterion, "evidenceHref">;

const criteria: Record<CompetitionDimension, CriterionInput[]> = {
  Innovation: [
    { id: "INN-01", feature: "Open-data-to-field evidence chain", modulePath: "lib/competition/evidence.ts", evidence: "Dataset through Research License and Living Lab provenance", points: 10, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "INN-02", feature: "Shelter Living Laboratory", modulePath: "lib/living-lab/engine.ts", evidence: "Non-contact science with dual human authority", points: 10, maxPoints: 10, evidenceStatus: "SYNTHETIC" },
    { id: "INN-03", feature: "Transparent impact contract", modulePath: "lib/impact/engine.ts", evidence: "Formula, numerator, denominator, confidence and provenance", points: 10, maxPoints: 10, evidenceStatus: "DEMO" }
  ],
  "Technical Quality": [
    { id: "TECH-01", feature: "Typed deterministic domain services", modulePath: "lib/impact/engine.ts", evidence: "No model provider or hidden weighting", points: 10, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "TECH-02", feature: "Automated verification", modulePath: "tests/unit + tests/e2e", evidence: "Unit, API integration, build and browser coverage", points: 10, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "TECH-03", feature: "Durable production runtime", modulePath: "prisma/schema.prisma", evidence: "Schema prepared; runtime repositories and migration execution pending", points: 3, maxPoints: 10, evidenceStatus: "UNVERIFIED" }
  ],
  "Educational Value": [
    { id: "EDU-01", feature: "Research License qualification", modulePath: "lib/research-license/engine.ts", evidence: "80 overall, module minimum and remediation governance", points: 10, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "EDU-02", feature: "Curriculum and question governance", modulePath: "lib/curriculum-library", evidence: "Teacher review and source traceability", points: 9, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "EDU-03", feature: "Learning gain evidence", modulePath: "lib/impact/engine.ts", evidence: "Paired deterministic calculation with causal limitation", points: 5, maxPoints: 10, evidenceStatus: "SYNTHETIC" }
  ],
  "Open Data Utilization": [
    { id: "DATA-01", feature: "Verified official dataset registry", modulePath: "lib/government-data/sprint6-fixtures.ts", evidence: "6318, 40121 and 41236 activated verified fixtures", points: 10, maxPoints: 10, evidenceStatus: "VERIFIED" },
    { id: "DATA-02", feature: "Product-use mapping and attribution", modulePath: "lib/government-data/product-uses.ts", evidence: "Fields, transformation, feature and evidence output", points: 10, maxPoints: 10, evidenceStatus: "VERIFIED" },
    { id: "DATA-03", feature: "Live synchronization", modulePath: "lib/government-data/adapters.ts", evidence: "Adapter boundary exists; Sprint 8 performs no network ingestion", points: 6, maxPoints: 10, evidenceStatus: "UNVERIFIED" }
  ],
  "Social Impact": [
    { id: "SOC-01", feature: "Evidence-backed dog profile", modulePath: "lib/living-lab/engine.ts", evidence: "Published evidence and shelter approval required", points: 8, maxPoints: 10, evidenceStatus: "SYNTHETIC" },
    { id: "SOC-02", feature: "Shelter governance", modulePath: "lib/living-lab/engine.ts", evidence: "Confirmation separate from manual publication", points: 8, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "SOC-03", feature: "Measured field outcomes", modulePath: "SPRINT8_PENDING_APPROVALS.md", evidence: "No approved real pilot or adoption outcome", points: 0, maxPoints: 10, evidenceStatus: "UNVERIFIED" }
  ],
  Sustainability: [
    { id: "SUS-01", feature: "Human-governed operating model", modulePath: "MASTER_ARCHITECTURE.md", evidence: "Explicit teacher, shelter, data and privacy ownership", points: 8, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "SUS-02", feature: "Failure-safe deterministic fallback", modulePath: "lib/question-generation/provider.ts", evidence: "Core demo runs without AI or external network", points: 9, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "SUS-03", feature: "Production operations", modulePath: "PRODUCT_STATUS.md", evidence: "Hosting, identity, backups and SLAs pending", points: 3, maxPoints: 10, evidenceStatus: "UNVERIFIED" }
  ],
  Scalability: [
    { id: "SCALE-01", feature: "Adapter and provider boundaries", modulePath: "lib/government-data + lib/question-generation", evidence: "Source/provider-neutral contracts", points: 8, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "SCALE-02", feature: "Versioned evidence and metrics", modulePath: "prisma/schema.prisma + lib/impact", evidence: "Immutable source and calculation versions", points: 8, maxPoints: 10, evidenceStatus: "DEMO" },
    { id: "SCALE-03", feature: "Multi-tenant durable deployment", modulePath: "SPRINT8_PENDING_APPROVALS.md", evidence: "Production tenancy and repository runtime pending", points: 3, maxPoints: 10, evidenceStatus: "UNVERIFIED" }
  ]
};

function evidenceHref(id: string): string {
  if (id.startsWith("DATA")) return "/government-data";
  if (id.startsWith("EDU")) return id === "EDU-02" ? "/teacher/curriculum/studio" : "/research-license";
  if (["INN-02", "SOC-01", "SOC-02"].includes(id)) return "/living-lab";
  if (id === "INN-01") return "/competition/evidence";
  return "/competition/impact#methodology";
}

function scoreDimension(dimension: CompetitionDimension): CompetitionDimensionScore {
  const items = criteria[dimension];
  const numerator = items.reduce((sum, item) => sum + item.points, 0);
  const denominator = items.reduce((sum, item) => sum + item.maxPoints, 0);
  return { dimension, score: Math.round((numerator / denominator) * 100), numerator, denominator, formula: "SUM(evidence points) / SUM(max evidence points) * 100", evidenceStatus: "DEMO", criteria: items.map((item) => ({ ...item, evidenceHref: evidenceHref(item.id) })) };
}

export function buildCompetitionScorecard(): CompetitionScorecard {
  const dimensions = (Object.keys(criteria) as CompetitionDimension[]).map(scoreDimension);
  return {
    version: "SL-INNOSERVE-MAP-1",
    label: "DEMO",
    disclaimer: "Internal evidence-coverage self-assessment only. This is not an official InnoServe score, weighting, prediction, or judging result.",
    dimensions,
    overall: Math.round(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length)
  };
}

export const sprint8CompetitionScorecard = buildCompetitionScorecard();
