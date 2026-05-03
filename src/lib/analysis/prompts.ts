import { z } from "zod";

import { jdMatchSchema } from "@/lib/llm/jd-match-schema";
import {
  presetAnalysisSchemas,
  type PresetId,
} from "@/lib/llm/preset-analysis-schema";
import { messages } from "@/lib/i18n/messages";

export type PromptLanguage = "en" | "ja";

const detailAnalysisCategorySchema = z.enum([
  "Tech Alignment",
  "Domain Transfer",
  "Feature Ownership",
  "Velocity & Pipeline Acceleration",
  "Risk",
]);

export const detailAnalysisSchema = z.object({
  analysis_results: z.array(
    z.object({
      keyword: z
        .string()
        .min(1)
        .describe("Exact contiguous substring copied verbatim from the JD text."),
      category: detailAnalysisCategorySchema.describe(
        "One analysis type for the highlighted JD phrase.",
      ),
      badge: z
        .string()
        .min(1)
        .describe(
          "Short UI badge such as Direct Stack Match, Transfer Gap, E2E Ownership, Velocity Margin, or Risk.",
        ),
      insight: z
        .string()
        .min(1)
        .describe(
          "AI insight explaining the likely company need behind this JD phrase.",
        ),
      proof: z
        .string()
        .min(1)
        .describe(
          "CV-grounded correlation proof or credible gap/ramp-up explanation.",
        ),
    }),
  ),
});

export type RawDetailAnalysisResult = z.infer<
  typeof detailAnalysisSchema
>["analysis_results"][number];

export function getTextLanguage(text: string): PromptLanguage {
  const japaneseMatches =
    text.match(/[\u3040-\u30ff\u3400-\u9fff]/g)?.length ?? 0;
  const latinMatches = text.match(/[A-Za-z]/g)?.length ?? 0;

  return japaneseMatches > 0 && japaneseMatches >= latinMatches * 0.2
    ? "ja"
    : "en";
}

function getLanguageAlignmentInstruction(language: PromptLanguage) {
  if (language === "ja") {
    return [
      "出力言語: 日本語。",
      "JDが日本語の場合、JSON内のユーザーに表示される自然文はすべて日本語で書くこと。",
      "英語の技術名、製品名、固有名詞、コード用語は自然な範囲で原文のまま保持してよい。",
      "JDから抜き出す keyword など、原文一致が要求される値は翻訳しないこと。",
      "JSON schemaで固定されたenum、id、category、statusなどの値は、許可された値をそのまま使うこと。",
      "英語の定型ラベルを使わず、日本語UIとして自然な短い表現にすること。",
      messages.ja.prompt.glossary,
    ].join("\n");
  }

  return [
    "Output language: English.",
    "Write every user-facing natural-language string in English.",
    "Keep exact JD keywords verbatim when exact extraction is required.",
    messages.en.prompt.glossary,
  ].join("\n");
}

function getPresetInstructions(preset?: PresetId) {
  switch (preset) {
    case "tech-alignment":
      return [
        "Preset: Tech Alignment.",
        "Primary logic: identify identical or directly overlapping technology stack requirements between the JD and CV.",
        "Do not use this preset for domain transfer, generic soft skills, or leadership unless they are tied to concrete engineering stack requirements.",
        "AI Insight: infer the company's current technical situation or business need from the matched stack signals. Examples: migration in progress, strict SEO/performance pressure, design system consolidation, frontend architecture stabilization, or technical debt reduction.",
        "Correlation Proof: prove how the candidate's specific years of experience, architecture work, component design, state management, performance work, or testing experience would solve the inferred company need.",
        "Return radarData for 3-8 concrete technologies or practices from the JD. radarData.yourLevel and radarData.required must be normalized percentage scores from 0 to 100, never raw years or 0-10 values.",
        "Return techStack as ready-to-go items. Set ready=false only for a real gap or weak evidence, and explain the caveat in note.",
        "Return correlationProof as the strongest JD-to-CV proof chain: JD requirement -> candidate evidence -> expected architecture/business impact.",
      ].join("\n");
    case "domain-transfer":
      return [
        "Preset: Domain Transfer.",
        "Primary logic: identify JD-required skills, domains, tools, or environments where the candidate has no, minimal, or only partial direct experience.",
        "AI Insight: infer why the company likely needs the missing skill. Examples: maintaining legacy systems, internal admin tools, domain-specific workflows, reporting systems, regulated data operations, or B2B operational tooling.",
        "Correlation Proof: argue transferability only from concrete CV evidence. Use deep core knowledge such as React lifecycle, TypeScript, Zustand/Redux, component architecture, data UI, API coordination, or testing to explain why practical synchronization is realistic.",
        "Use a 1-2 week ramp-up claim only when the missing skill is adjacent to strong CV evidence. If the gap is farther away, provide a more conservative rampUpWeeks value.",
        "Return gaps for the weakest direct matches. Return mappings that connect each gap to past projects and a concrete ramp plan.",
        "Do not hide gaps. This preset should sound credible by separating direct experience from transferable experience.",
      ].join("\n");
    case "ro-synergy":
      return [
        "Preset: Feature Ownership (End-to-End Lifecycle Management).",
        "Primary logic: evaluate whether the candidate can drive a feature independently rather than only taking assigned coding tasks.",
        "Focus on end-to-end lifecycle ownership: spec-in, requirement clarification, API/design coordination, implementation planning, team sync, testing, release, and post-release accountability.",
        "AI Insight: infer whether the organization needs a proactive Tech Lead or Senior Engineer who can manage feature delivery without micro-management.",
        "Correlation Proof: highlight specific CV evidence of end-to-end work, cross-functional alignment, API design coordination, stakeholder communication, release ownership, and delivery accountability.",
        "Do not claim detailed functional design ownership if the candidate evidence does not support it.",
        "Return areas as lifecycle management capabilities, not generic strengths. Return lifecycleProof as an ordered feature lifecycle.",
      ].join("\n");
    case "velocity":
      return [
        "Preset: Velocity & Pipeline Acceleration.",
        "Primary logic 1, Capacity Analysis: compare the JD's required years against the candidate's actual years. Calculate velocity_margin exactly as candidate_actual - jd_required.",
        "Primary logic 2, Universal Scaling: if candidate_actual is greater than jd_required, status must be Efficiency Surplus. If candidate_actual is less than jd_required, status must be Learning Gap. If equal, status must be Exact Match. If the JD has no numeric baseline, status must be No JD Baseline.",
        "Return widget1_capacity as capacity rows with label, jd_required, candidate_actual, unit, velocity_margin, status, and rationale. Preserve raw numeric values; the UI scales bars later.",
        "Primary logic 3, Pipeline Mapping: return exactly three widget2_pipeline rows in this order: Requirements & Synchronization, Architecture & Implementation, Testing & Delivery.",
        "Pipeline stage 1: map Feature Ownership, requirement clarification, stakeholder coordination, or cross-functional sync to justify zero or reduced communication rework.",
        "Pipeline stage 2: map senior frontend expertise, architecture, boilerplate setup, component design, TypeScript, state management, or performance work to justify rapid implementation.",
        "Pipeline stage 3: map AI agent/Cursor practices, tests, CI/CD, quality control, or release operations to justify high-speed quality control.",
        "Primary logic 4, Feature Ownership: explicitly highlight evidence of managing the lifecycle from spec-in to deployment/release in featureOwnershipProof.",
        "Return widget3_multipliers as concise display strings. Metrics must be short dashboard values such as percentages, margins, multipliers, or labels.",
      ].join("\n");
    default:
      return [
        "Preset: General fit analysis.",
        "Return overall match score, concise summary, matched skills, and missing skills.",
      ].join("\n");
  }
}

export function buildStructuredSystemPrompt({
  resumeEvidence,
  preset,
  responseLanguage,
}: {
  resumeEvidence: string;
  preset?: PresetId;
  responseLanguage: PromptLanguage;
}) {
  return [
    "You are an expert tech recruiter and career matching analyst.",
    "Evaluate the job description against the candidate evidence below.",
    "Use the evidence as the absolute source of truth. Do not invent skills, projects, or experience that are not present in the evidence.",
    "Prefer direct evidence over generic fit claims. If evidence is weak, mark it as a gap or transferable only.",
    "Separate three ideas clearly in the JSON: JD signal, AI insight/inference, and correlation proof from CV evidence.",
    "Use the JD to infer company needs, but label uncertainty through confidence scores and conservative wording.",
    "Return data that exactly matches the selected JSON schema. Score conservatively from 0 to 100 based on direct evidence.",
    "Keep every string useful for UI cards: specific, compact, and grounded in JD/CV evidence.",
    "",
    getLanguageAlignmentInstruction(responseLanguage),
    "",
    getPresetInstructions(preset),
    "",
    "Candidate evidence:",
    resumeEvidence,
  ].join("\n");
}

export function buildTextSystemPrompt({
  resumeEvidence,
  responseLanguage,
}: {
  resumeEvidence: string;
  responseLanguage: PromptLanguage;
}) {
  return [
    "You are an expert tech recruiter and career matching analyst.",
    "Use only the candidate evidence below. Do not invent skills, projects, or experience.",
    "For conversational chat, answer naturally as a career advisor. If JD context is provided, ground the answer in that JD.",
    responseLanguage === "ja"
      ? "If this is a fallback analysis, format the response with these markdown headings in Japanese: 総合マッチスコア, 要約, マッチしているスキル, 不足しているスキル."
      : "If this is a fallback analysis, format the response with these markdown headings: Overall Match Score, Summary, Matched Skills, Missing Skills.",
    "Keep the answer compact, practical, and actionable.",
    "",
    getLanguageAlignmentInstruction(responseLanguage),
    "",
    "Candidate evidence:",
    resumeEvidence,
  ].join("\n");
}

export function buildChatPrompt(jdText: string, message?: string) {
  return [
    jdText
      ? `Job description context:\n${jdText}`
      : "No job description context has been provided yet.",
    "",
    `User message:\n${message || "Please give concise career advice based on the available context."}`,
  ].join("\n");
}

export function buildStructuredUserPrompt(jdText: string, preset?: PresetId) {
  return [
    preset ? `Preset id: ${preset}` : "Preset id: general",
    "",
    "Job description:",
    jdText,
  ].join("\n");
}

function getStructuredSchema(preset?: PresetId) {
  return preset ? presetAnalysisSchemas[preset] : jdMatchSchema;
}

export function getAnalyzeJSONSchemaInstruction(preset?: PresetId) {
  return [
    "Return only valid JSON. Do not wrap it in markdown fences.",
    "Do not include fields that are not in the schema.",
    "Do not stop until the JSON object is complete.",
    "The JSON must match this schema:",
    JSON.stringify(z.toJSONSchema(getStructuredSchema(preset))),
  ].join("\n");
}

export function buildDetailAnalysisSystemPrompt(
  schema: z.ZodType,
  responseLanguage: PromptLanguage,
) {
  return [
    "Return only valid JSON. Do not wrap it in markdown fences.",
    getLanguageAlignmentInstruction(responseLanguage),
    "The JSON must match this schema:",
    JSON.stringify(z.toJSONSchema(schema)),
  ].join("\n");
}

export function buildDetailAnalysisPrompt(
  jdText: string,
  responseLanguage: PromptLanguage,
  resumeEvidence: string,
) {
  return [
    responseLanguage === "ja"
      ? "あなたは詳細ページ向けのシニアエンジニアリング適合分析者です。"
      : "You are a Senior Engineering Match Analyst for a detail page.",
    "The output powers JD text highlights and a relationship graph, so each result must connect one exact JD phrase to one candidate capability or risk.",
    "",
    "Critical extraction rule:",
    "- Every `keyword` MUST be copied verbatim from the JD text below.",
    "- Keep the exact same language, casing, spelling, punctuation, and expression as the JD.",
    "- Do NOT translate keywords.",
    "- Do NOT paraphrase keywords.",
    "- Do NOT output a keyword unless it appears as an exact contiguous substring in jdText.",
    "- If a concept is relevant but no exact source phrase exists, skip it.",
    "",
    getLanguageAlignmentInstruction(responseLanguage),
    "",
    "Candidate evidence:",
    resumeEvidence,
    "",
    "Analyze with exactly these category definitions:",
    "1. Tech Alignment: highlight identical or directly overlapping JD tech stack requirements. Insight should infer company needs such as migration, SEO/performance, architecture stabilization, or technical debt. Proof should connect candidate years and architecture/component experience to that need.",
    "2. Domain Transfer: highlight JD skills or domains where direct CV evidence is absent, minimal, or partial. Insight should infer why the company needs the skill, such as legacy maintenance, admin tools, reporting, or domain-specific systems. Proof should explain transferable core knowledge and a realistic ramp-up path.",
    "3. Feature Ownership: highlight phrases requiring independent feature driving or coordination. Insight should infer a need for a proactive Tech Lead/Senior Engineer. Proof should show end-to-end ownership from spec-in or requirement clarification through delivery without claiming detailed functional design.",
    "4. Velocity & Pipeline Acceleration: highlight years, delivery speed, CI/CD, testing, AI tooling, or process-flow phrases. Insight should explain capacity margin, learning gap, or SDLC acceleration. Proof should map CV evidence to Requirements & Sync, Architecture & Implementation, or Testing & Delivery.",
    "5. Risk: highlight requirements that are true risks, constraints, or gaps. Insight should state the risk plainly. Proof should describe mitigation only from CV evidence.",
    "",
    "Selection rules:",
    "- Prefer 6-10 high-signal highlights if enough JD text exists.",
    "- Cover at least Tech Alignment, Domain Transfer, Feature Ownership, and Velocity when exact JD phrases support them.",
    "- Use Risk only for meaningful gaps or constraints, not as filler.",
    "- Prioritize concise highlightable JD phrases that should open useful popovers.",
    "- Avoid duplicate or overlapping keywords.",
    "- The badge must be short and category-specific.",
    "",
    "Return only JSON matching the schema.",
    "",
    "jdText:",
    jdText,
  ].join("\n");
}
