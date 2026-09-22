import { buildCompetitionEvidenceChain } from "../competition/evidence";
import { sprint8CompetitionScorecard } from "./scorecard";
import type { ImpactMetric, ImpactSnapshot } from "./types";

const show = (metric: ImpactMetric) => `${metric.value}${metric.unit === "percent" ? "%" : metric.unit === "percentage_points" ? " pp" : ""}`;

export function generateImpactReport(snapshot: ImpactSnapshot): string {
  const sections = ["EDUCATION", "LIVING_LAB", "SHELTER", "ADOPTION_SUPPORT", "GOVERNMENT_OPEN_DATA", "ONE_HEALTH", "SOCIAL"] as const;
  const chain = buildCompetitionEvidenceChain();
  const lines = [
    "# ShelterLab Impact Report",
    "",
    `**Report version:** ${snapshot.version}`,
    `**Calculated at:** ${snapshot.calculatedAt.toISOString()}`,
    "**Impact mode:** SYNTHETIC_DEMO except metrics explicitly labeled VERIFIED government-source evidence.",
    "",
    "> This deterministic report contains no AI-generated metric or causal claim. Synthetic outcomes demonstrate calculation and evidence governance only.",
    ""
  ];

  for (const domain of sections) {
    lines.push(`## ${domain.replaceAll("_", " ")}`, "", "| Metric | Value | Formula | Numerator | Denominator | Confidence | Evidence |", "| --- | ---: | --- | ---: | ---: | --- | --- |");
    for (const item of snapshot.metrics.filter((metric) => metric.domain === domain)) {
      lines.push(`| ${item.label} | ${show(item)} | ${item.formula} | ${item.numerator} | ${item.denominator} | ${item.confidenceLevel} | ${item.evidenceStatus} |`);
    }
    lines.push("");
  }

  lines.push("## SDG Mapping", "", "| Goal | Contribution | Metrics | Evidence | Limitation |", "| --- | --- | --- | --- | --- |");
  for (const mapping of snapshot.sdgMappings) lines.push(`| ${mapping.goal} ${mapping.title} | ${mapping.contribution} | ${mapping.metricCodes.join(", ")} | ${mapping.evidenceStatus} | ${mapping.limitation} |`);

  lines.push(
    "",
    "## Open Data Utilization",
    "",
    "Verified offline fixtures for data.gov.tw datasets 6318, 40121, and 41236 support metadata discovery, education context, inquiry, attribution, and competition evidence. Sprint 8 performs no external API call. Dataset verification does not convert synthetic ShelterLab outcomes into measured outcomes.",
    "",
    "## Evidence Chain Summary",
    "",
    `The deterministic education chain contains ${chain.nodes.length} nodes and ${chain.links.length} links; completeness is ${chain.complete ? "COMPLETE" : "INCOMPLETE"}. Sprint 7 extends the judge journey through mission, observation, teacher review, shelter confirmation, manual publication, timeline, and dog profile.`,
    "",
    "## Competition Evidence Coverage",
    "",
    `Internal scorecard version ${sprint8CompetitionScorecard.version} reports ${sprint8CompetitionScorecard.overall}/100 evidence coverage. It is explicitly DEMO and is not an official judging score.`,
    "",
    "## Implemented Features",
    "",
    "- Deterministic metric engine with versioned formulas and provenance",
    "- Education, Living Lab, shelter, adoption-support readiness, open-data, One Health, social, and SDG metrics",
    "- Judge-facing impact dashboard and read-only one-click Demo Mode",
    "- InnoServe feature-to-evidence score mapping",
    "- Automatic Markdown report generation",
    "",
    "## Remaining Work",
    "",
    "- Obtain approved pilot design and real partner participation before reporting measured impact",
    "- Approve privacy suppression thresholds and metric owners",
    "- Execute and verify PostgreSQL migration only in an approved environment",
    "- Replace demo identity/in-memory repositories before field use",
    "- Validate observation quality and impact definitions with education and shelter experts",
    "- Archive official InnoServe rules and weights before comparing against competition criteria",
    ""
  );
  return lines.join("\n");
}
