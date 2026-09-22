import type { AnalysisMethod, AnalysisResult, ChartSpecification, DatasetRow, InquiryDatasetVersion, ValidationFlag } from "./types";
import { containsCausalLanguage } from "./validation";

const round = (value: number) => Math.round(value * 10000) / 10000;
const numbers = (rows: DatasetRow[], column: string) => rows.map((row) => row[column]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
const counts = (rows: DatasetRow[], column: string) => rows.reduce<Record<string, number>>((result, row) => { const key = String(row[column] ?? "MISSING"); result[key] = (result[key] ?? 0) + 1; return result; }, {});

function correlation(x: number[], y: number[]): number {
  const length = Math.min(x.length, y.length); if (length < 2) return 0;
  const xs = x.slice(0, length); const ys = y.slice(0, length); const mx = xs.reduce((a,b)=>a+b,0)/length; const my = ys.reduce((a,b)=>a+b,0)/length;
  const numerator = xs.reduce((sum,value,index)=>sum+(value-mx)*(ys[index]-my),0);
  const denominator = Math.sqrt(xs.reduce((sum,value)=>sum+(value-mx)**2,0)*ys.reduce((sum,value)=>sum+(value-my)**2,0));
  return denominator === 0 ? 0 : round(numerator/denominator);
}

export function validateChart(chart: ChartSpecification): ValidationFlag[] {
  const flags: ValidationFlag[] = [];
  if (!chart.source.trim()) flags.push({ code: "CHART_SOURCE_REQUIRED", severity: "error", field: "chart.source", message: "Chart source is required." });
  if (chart.sampleSize <= 0) flags.push({ code: "CHART_SAMPLE_SIZE_REQUIRED", severity: "error", field: "chart.sampleSize", message: "Chart sample size must be positive." });
  if (!chart.title.trim() || !chart.unit.trim()) flags.push({ code: "CHART_LABELS_REQUIRED", severity: "error", field: "chart", message: "Chart title and unit are required." });
  return flags;
}

export function calculateAnalysis(input: { id: string; projectId: string; dataset: InquiryDatasetVersion; method: AnalysisMethod; variables: string[]; filteredPopulation: string; interpretationNote: string; limitationNote: string; chart: Omit<ChartSpecification, "sampleSize" | "source"> & { source?: string; sampleSize?: number }; generatedAt: Date }): AnalysisResult {
  const rows = input.dataset.rows; const first = input.variables[0] ?? ""; const second = input.variables[1] ?? "";
  const values = numbers(rows, first); let calculatedValue: number | Record<string, number> = 0; let numerator = 0; let denominator = rows.length;
  if (input.method === "count") calculatedValue = numerator = rows.length;
  else if (input.method === "proportion") { const matched = rows.filter((row) => Boolean(row[first])).length; numerator = matched; calculatedValue = denominator === 0 ? 0 : round(matched/denominator); }
  else if (input.method === "mean" || input.method === "behavior_duration_summary") { numerator = values.reduce((a,b)=>a+b,0); denominator = values.length; calculatedValue = denominator ? round(numerator/denominator) : 0; }
  else if (input.method === "median") { const sorted=[...values].sort((a,b)=>a-b); denominator=sorted.length; calculatedValue=denominator===0?0:denominator%2?sorted[Math.floor(denominator/2)]:round((sorted[denominator/2-1]+sorted[denominator/2])/2); numerator=Number(calculatedValue); }
  else if (input.method === "minimum") { denominator=values.length; calculatedValue=values.length?Math.min(...values):0; numerator=Number(calculatedValue); }
  else if (input.method === "maximum") { denominator=values.length; calculatedValue=values.length?Math.max(...values):0; numerator=Number(calculatedValue); }
  else if (["category_comparison","time_comparison","regional_comparison","observation_frequency"].includes(input.method)) { calculatedValue=counts(rows, first); numerator=Object.values(calculatedValue).reduce((a,b)=>a+b,0); }
  else if (input.method === "contingency_table") { calculatedValue=rows.reduce<Record<string,number>>((result,row)=>{const key=`${String(row[first]??"MISSING")} | ${String(row[second]??"MISSING")}`;result[key]=(result[key]??0)+1;return result;},{}); numerator=Object.values(calculatedValue).reduce((a,b)=>a+b,0); }
  else if (input.method === "simple_correlation") { calculatedValue=correlation(numbers(rows,first),numbers(rows,second)); numerator=Number(calculatedValue); denominator=Math.min(numbers(rows,first).length,numbers(rows,second).length); }
  const chart: ChartSpecification = { ...input.chart, source: input.chart.source ?? input.dataset.id, sampleSize: input.chart.sampleSize ?? rows.length };
  const flags = validateChart(chart);
  if (input.method === "simple_correlation" && containsCausalLanguage(input.interpretationNote)) flags.push({ code: "CAUSAL_WORDING_FOR_CORRELATION", severity: "warning", field: "interpretationNote", message: "Correlation does not establish causation." });
  return { id: input.id, projectId: input.projectId, datasetVersionId: input.dataset.id, method: input.method, variables: input.variables, filteredPopulation: input.filteredPopulation, numerator, denominator, calculatedValue, chartSpecification: chart, sourceDatasetVersions: [input.dataset.id], interpretationNote: input.interpretationNote, limitationNote: input.limitationNote, flags, generatedAt: input.generatedAt, calculationVersion: "SL-INQUIRY-ANALYSIS-1" };
}

export function exportDatasetCsv(version: InquiryDatasetVersion, columns: string[]): string {
  const escape = (value: unknown) => { const text = value === null || value === undefined ? "" : String(value); return /[",\n]/.test(text) ? `"${text.replaceAll('"','""')}"` : text; };
  return [columns.join(","), ...version.rows.map((row)=>columns.map((column)=>escape(row[column])).join(","))].join("\n");
}

