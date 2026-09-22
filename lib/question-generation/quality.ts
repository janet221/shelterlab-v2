import type { GeneratedQuestionDraftOutput } from "../curriculum-library/types";

export type QuestionQualityFlag = {
  code: string;
  severity: "ERROR" | "WARNING";
  field: string;
  message: string;
};

export type QuestionQualityContext = {
  requiresGovernmentData: boolean;
  knownResourceIds: Set<string>;
  knownStandardIds: Set<string>;
  knownDatasetIds: Set<string>;
  existingPrompts?: string[];
  gradeBand?: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
}

function similarity(left: string, right: string): number {
  const a = new Set(normalize(left).split(/\s+/).filter(Boolean));
  const b = new Set(normalize(right).split(/\s+/).filter(Boolean));
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / new Set([...a, ...b]).size;
}

export function validateGeneratedQuestionQuality(
  output: GeneratedQuestionDraftOutput,
  context: QuestionQualityContext
): QuestionQualityFlag[] {
  const flags: QuestionQualityFlag[] = [];
  const add = (code: string, severity: QuestionQualityFlag["severity"], field: string, message: string) =>
    flags.push({ code, severity, field, message });

  if (output.source_resource_ids.length === 0) add("MISSING_RESOURCE_CITATION", "ERROR", "source_resource_ids", "At least one resource citation is required.");
  if (output.learning_standard_ids.length === 0) add("MISSING_STANDARD_MAPPING", "ERROR", "learning_standard_ids", "At least one learning standard is required.");
  if (context.requiresGovernmentData && output.government_dataset_ids.length === 0) add("MISSING_DATASET_PROVENANCE", "ERROR", "government_dataset_ids", "The blueprint requires dataset provenance.");
  if (output.source_resource_ids.some((id) => !context.knownResourceIds.has(id))) add("FABRICATED_RESOURCE_ID", "ERROR", "source_resource_ids", "A cited resource ID does not exist.");
  if (output.learning_standard_ids.some((id) => !context.knownStandardIds.has(id))) add("FABRICATED_STANDARD_ID", "ERROR", "learning_standard_ids", "A cited standard ID does not exist.");
  if (output.government_dataset_ids.some((id) => !context.knownDatasetIds.has(id))) add("FABRICATED_DATASET_ID", "ERROR", "government_dataset_ids", "A cited dataset ID does not exist.");

  const optionKeys = output.options.map((option) => option.optionKey);
  const optionTexts = output.options.map((option) => normalize(option.optionText));
  if (new Set(optionTexts).size !== optionTexts.length) add("DUPLICATE_OPTIONS", "ERROR", "options", "Option text must be unique.");
  if (output.correct_option_keys.some((key) => !optionKeys.includes(key))) add("INVALID_CORRECT_OPTION", "ERROR", "correct_option_keys", "A correct option key does not exist.");
  if (output.question_type === "single_choice" && output.correct_option_keys.length !== 1) add("AMBIGUOUS_SINGLE_CHOICE", "ERROR", "correct_option_keys", "Single-choice questions require exactly one correct answer.");

  if (/\b(always|never)\b|一定|永遠|絕不/i.test(`${output.prompt} ${output.options.map((item) => item.optionText).join(" ")}`)) add("ABSOLUTE_WORDING", "WARNING", "prompt", "Absolute wording requires teacher review.");
  if (/very cute|looks angry|\bhappy\b|很可愛|看起來很兇|很兇/i.test(output.prompt)) add("SUBJECTIVE_WORDING", "WARNING", "prompt", "Subjective language should be replaced with observable evidence.");
  if (/official.{0,12}(code|standard)|正式課綱代碼/i.test(output.prompt) && !output.learning_standard_ids.every((id) => context.knownStandardIds.has(id))) add("FABRICATED_OFFICIAL_CODE", "ERROR", "prompt", "Official curriculum claims require verified identifiers.");
  if (/diagnos|has rabies|infected|確診|患有狂犬病/i.test(`${output.prompt} ${output.explanation}`)) add("UNSUPPORTED_HEALTH_CLAIM", "ERROR", "prompt", "The question contains a diagnostic or unsupported health claim.");
  if (/enter the kennel|touch the dog|feed through|進入犬舍|伸手|餵食/i.test(output.options.find((option) => output.correct_option_keys.includes(option.optionKey))?.optionText ?? "")) add("UNSAFE_INSTRUCTION", "ERROR", "correct_option_keys", "The keyed answer contains unsafe handling instructions.");

  if ((context.existingPrompts ?? []).some((prompt) => similarity(prompt, output.prompt) >= 0.82)) add("HIGH_SIMILARITY", "WARNING", "prompt", "The draft is highly similar to an existing question.");
  const correctText = output.options.filter((option) => output.correct_option_keys.includes(option.optionKey)).map((option) => normalize(option.optionText));
  if (!correctText.some((text) => text.split(" ").filter((word) => word.length > 4).some((word) => normalize(output.explanation).includes(word)))) add("EXPLANATION_ALIGNMENT", "WARNING", "explanation", "The explanation may not clearly support the keyed answer.");
  if (/1-6/.test(context.gradeBand ?? "") && output.difficulty === "advanced") add("GRADE_DIFFICULTY", "WARNING", "difficulty", "Advanced difficulty may exceed the configured grade band.");
  if (!output.bloom_level) add("MISSING_BLOOM_LEVEL", "ERROR", "bloom_level", "Bloom level is required.");
  if (!output.prompt_version) add("MISSING_PROMPT_VERSION", "ERROR", "prompt_version", "Prompt version is required.");
  if (!output.provider_name || !output.provider_version) add("MISSING_PROVIDER_VERSION", "ERROR", "provider_name", "Provider name and version are required.");

  return flags;
}

export function hasBlockingQualityFlags(flags: QuestionQualityFlag[]): boolean {
  return flags.some((flag) => flag.severity === "ERROR");
}
