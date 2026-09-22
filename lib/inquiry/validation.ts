import type { CERStatement, InquiryEvidenceLink, InquiryProject, ResearchDesign, ValidationFlag } from "./types";

const causal = /\b(causes?|caused|proves?|leads? to|results? in|because of)\b/i;
const diagnosis = /\b(diagnos|disease-positive|infected|aggressive|dangerous)\b/i;

const flag = (code: string, severity: ValidationFlag["severity"], field: string, message: string): ValidationFlag => ({ code, severity, field, message });

export function validateProjectFoundation(project: InquiryProject, evidence: InquiryEvidenceLink[]): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  if (project.oneHealthDimensions.length < 2) flags.push(flag("TWO_ONE_HEALTH_DIMENSIONS_REQUIRED", "error", "oneHealthDimensions", "Select at least two One Health dimensions."));
  if (!project.oneHealthConnection.trim() || project.oneHealthConnection.trim().length < 20) flags.push(flag("ONE_HEALTH_CONNECTION_REQUIRED", "error", "oneHealthConnection", "Explain how the selected dimensions interact."));
  if (project.learningStandardIds.length === 0) flags.push(flag("LEARNING_STANDARD_REQUIRED", "error", "learningStandardIds", "Link at least one LearningStandard."));
  if (evidence.length === 0) flags.push(flag("APPROVED_EVIDENCE_REQUIRED", "error", "evidence", "Link at least one approved evidence source."));
  else if (!evidence.some((item) => item.verificationState !== "UNVERIFIED")) flags.push(flag("APPROVED_EVIDENCE_REQUIRED", "error", "evidence", "At least one evidence source must be verified, approved, or explicitly synthetic demo evidence."));
  if (diagnosis.test(`${project.researchQuestion} ${project.hypothesis}`)) flags.push(flag("PROHIBITED_DIAGNOSTIC_OR_DANGEROUSNESS_CLAIM", "error", "researchQuestion", "Inquiry cannot diagnose or label dangerousness."));
  return flags;
}

export function validateResearchDesign(project: InquiryProject, design: Omit<ResearchDesign, "flags">, evidence: InquiryEvidenceLink[] = []): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  if (!/[?？]$/.test(project.researchQuestion.trim())) flags.push(flag("QUESTION_NOT_OBSERVABLE", "warning", "researchQuestion", "Phrase the question as an observable, answerable question."));
  if (!project.hypothesis.trim() || !/(higher|lower|more|less|different|associated|relationship|差異|較高|較低|相關)/i.test(project.hypothesis)) flags.push(flag("HYPOTHESIS_NOT_TESTABLE", "warning", "hypothesis", "State a directional or comparative testable hypothesis."));
  if (!project.independentVariable.trim() || !project.dependentVariable.trim() || design.variables.length < 2) flags.push(flag("VARIABLE_UNDEFINED", "error", "variables", "Define independent and dependent variables."));
  if (!/(compare|between|versus|group|county|time|before|after|比較|縣市|時間)/i.test(`${project.researchQuestion} ${design.analysisPlan}`)) flags.push(flag("MISSING_COMPARISON", "warning", "analysisPlan", "Describe the comparison or reference group."));
  if (design.sampleSizePlanned < 3) flags.push(flag("SAMPLE_TOO_SMALL", "warning", "sampleSizePlanned", "A sample below three is highly limited."));
  if (causal.test(`${project.researchQuestion} ${project.hypothesis}`) && !/experiment|random|intervention/i.test(design.samplingMethod)) flags.push(flag("CAUSAL_LANGUAGE_WITHOUT_CAUSAL_DESIGN", "warning", "hypothesis", "Observational or aggregate comparison cannot prove causation."));
  if (!design.ethicalLimits.trim()) flags.push(flag("MISSING_ETHICAL_BOUNDARY", "error", "ethicalLimits", "Document ethical limits."));
  if (!design.privacyLimits.trim()) flags.push(flag("MISSING_PRIVACY_BOUNDARY", "error", "privacyLimits", "Document privacy limits."));
  if (!design.measurementMethod.toLowerCase().includes(project.dependentVariable.toLowerCase().split(" ")[0])) flags.push(flag("METHOD_INCONSISTENT_WITH_QUESTION", "warning", "measurementMethod", "Confirm that the method measures the dependent variable."));
  const expectedEvidence: Partial<Record<InquiryProject["inquiryType"], InquiryEvidenceLink["evidenceType"][]>> = {
    shelter_statistics: ["government_dataset_snapshot", "shelter_statistic"],
    shelter_behavior: ["observation_session", "published_dog_evidence"]
  };
  const expected = expectedEvidence[project.inquiryType];
  if (expected && !evidence.some((item) => expected.includes(item.evidenceType))) flags.push(flag("EVIDENCE_SOURCE_MISMATCH", "warning", "evidence", "The selected evidence type does not match the inquiry design."));
  return flags;
}

export function validateCER(cer: Pick<CERStatement, "claim" | "evidenceLinkIds" | "reasoning" | "alternativeExplanation" | "limitation">, links: InquiryEvidenceLink[], correlational: boolean): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  if (cer.evidenceLinkIds.length === 0) flags.push(flag("CLAIM_REQUIRES_EVIDENCE", "error", "evidenceLinkIds", "A claim must cite evidence."));
  if (!cer.reasoning.trim()) flags.push(flag("REASONING_REQUIRED", "error", "reasoning", "Connect evidence to a scientific concept."));
  if (cer.evidenceLinkIds.some((id) => links.find((item) => item.id === id)?.verificationState === "UNVERIFIED")) flags.push(flag("UNVERIFIED_EVIDENCE_FOR_FINAL_CLAIM", "error", "evidenceLinkIds", "Unverified external evidence cannot support a final factual claim."));
  if (correlational && causal.test(cer.claim)) flags.push(flag("CAUSAL_WORDING_FOR_CORRELATION", "warning", "claim", "Describe association, not proven causation."));
  if (diagnosis.test(cer.claim)) flags.push(flag("UNSUPPORTED_HEALTH_OR_BEHAVIOR_CLAIM", "error", "claim", "Claims cannot diagnose or assign dangerousness/emotional certainty."));
  if (!cer.alternativeExplanation.trim()) flags.push(flag("ALTERNATIVE_EXPLANATION_REQUIRED", "warning", "alternativeExplanation", "Keep plausible alternative explanations visible."));
  if (!cer.limitation.trim()) flags.push(flag("LIMITATION_REQUIRED", "error", "limitation", "State evidence and design limitations."));
  return flags;
}

export const containsCausalLanguage = (text: string) => causal.test(text);
