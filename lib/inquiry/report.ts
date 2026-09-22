import type { AnalysisResult, CERStatement, InquiryDataset, InquiryEvidenceLink, InquiryProject, InquiryRecommendation, OneHealthSystemMap, ResearchDesign } from "./types";

export type InquiryReport = { projectId: string; version: number; status: string; syntheticDemo: boolean; sections: { number: number; title: string; content: string }[]; evidenceAppendix: { id: string; citation: string; sourceVersion: string; verificationState: string }[]; publicSafe: boolean };

const redact = (text: string) => text.replace(/GREEN_OBSERVATION|KENNEL[-_ ]?\d+|student_demo_\d+|STU-TEST-\d+/gi, "[REDACTED]");

export function buildInquiryReport(input: { project: InquiryProject; evidence: InquiryEvidenceLink[]; design?: ResearchDesign; datasets: InquiryDataset[]; analyses: AnalysisResult[]; cer: CERStatement[]; systemMap?: OneHealthSystemMap; recommendations: InquiryRecommendation[]; publicView: boolean }): InquiryReport {
  const visibleEvidence = input.publicView ? input.evidence.filter((item) => item.privacyClassification === "public" && item.verificationState !== "UNVERIFIED") : input.evidence;
  const clean = (value: string) => input.publicView ? redact(value) : value;
  const latestVersions = input.datasets.map((dataset) => dataset.versions.at(-1)!);
  const sections = [
    input.project.title, input.project.background, `${input.project.oneHealthDimensions.join(", ")}: ${input.project.oneHealthConnection}`,
    input.project.researchQuestion, input.project.hypothesis, visibleEvidence.map((item)=>item.citationText).join("; "),
    input.design ? `${input.design.populationOrSample}；${input.design.samplingMethod}；樣本數=${input.design.sampleSizePlanned}` : "尚無資料（UNKNOWN）",
    `自變項：${input.project.independentVariable}；依變項：${input.project.dependentVariable}；控制變項：${input.project.controlledVariables.join("、")}`,
    input.design ? `${input.design.ethicalLimits}；${input.design.safetyLimits}；${input.design.privacyLimits}` : "尚無資料（UNKNOWN）",
    visibleEvidence.map((item)=>`${item.evidenceType}:${item.sourceEntityId}@${item.sourceVersion}`).join("; "),
    latestVersions.flatMap((version)=>version.cleaningActions.map((action)=>`${action.action}：${action.reason ?? action.formulaDescription ?? "已記錄"}`)).join("；") || "沒有資料清理動作",
    input.analyses.map((item)=>`${item.method}：${JSON.stringify(item.calculatedValue)}（n=${item.denominator}）`).join("；"),
    input.analyses.map((item)=>`${item.chartSpecification.title}［${item.chartSpecification.evidenceLabel}］`).join("；"),
    input.cer.map((item)=>`主張：${item.claim} 證據：${item.evidenceLinkIds.join("、")} 推理：${item.reasoning}`).join("；"),
    input.cer.map((item)=>item.alternativeExplanation).join("；"), input.cer.map((item)=>item.limitation).join("；"),
    input.systemMap ? `${input.systemMap.nodes.length} 個節點；${input.systemMap.edges.length} 個有證據連結的關係` : "尚無資料（UNKNOWN）",
    input.recommendations.map((item)=>`${item.targetActor}：${item.recommendation}［${item.evidenceStrength}］`).join("；"),
    input.project.reflection, visibleEvidence.map((item)=>item.citationText).join("\n"),
    visibleEvidence.map((item)=>`${item.id} -> ${item.sourceEntityId}@${item.sourceVersion} [${item.verificationState}]`).join("\n")
  ].map(clean);
  const titles = ["專案名稱","研究背景","One Health 問題","研究問題","假設","文獻與官方資料來源","研究設計","變項","倫理與安全","資料來源","資料清理紀錄","分析","圖表","主張－證據－推理","替代解釋","研究限制","One Health 系統圖","收容所或社區建議","反思","參考資料","證據鏈附錄"];
  return { projectId: input.project.id, version: input.project.revisionNumber, status: input.project.status, syntheticDemo: input.project.syntheticDemo, sections: titles.map((title,index)=>({number:index+1,title,content:sections[index]||"尚無資料（UNKNOWN）"})), evidenceAppendix: visibleEvidence.map((item)=>({id:item.id,citation:item.citationText,sourceVersion:item.sourceVersion,verificationState:item.verificationState})), publicSafe: input.publicView };
}
