import type {
  AnalysisResult,
  DetailAnalysisCategory,
} from "@/app/[locale]/detail/[id]/utils/detailAnalysisConfig";
import {
  detailAnalysisRequestSchema,
  type ApiErrorResponse,
  type DetailAnalysisResponse,
} from "@/lib/api/contracts";
import {
  collectChatCompletionText,
  hasLLMConfig,
} from "@/lib/llm/openai-compatible";
import {
  buildDetailAnalysisPrompt,
  buildDetailAnalysisSystemPrompt,
  detailAnalysisSchema,
  type RawDetailAnalysisResult,
} from "@/lib/analysis/prompts";
import { getCandidateEvidenceForLanguage } from "@/lib/analysis/candidate-evidence";
import { defaultLocale, type Locale } from "@/lib/i18n/messages";

export const runtime = "nodejs";
export const maxDuration = 60;

const DETAIL_ANALYSIS_TIMEOUT_MS = 60_000;
const DETAIL_ANALYSIS_MAX_TOKENS = 1_000;

function getGraphData(category: DetailAnalysisCategory) {
  switch (category) {
    case "TechAlignment":
      return {
        connections: ["frontend_mastery", "architecture_stability"],
        strength: 94,
      };
    case "DomainTransfer":
      return {
        connections: ["domain_translation", "data_ui_experience"],
        strength: 78,
      };
    case "FeatureOwnership":
      return {
        connections: ["feature_lead", "cross_functional_coordination"],
        strength: 92,
      };
    case "Velocity":
      return {
        connections: ["ai_velocity_workflows", "quality_under_pressure"],
        strength: 88,
      };
    case "Risk":
      return {
        connections: ["ai_velocity_workflows", "risk_mitigation"],
        strength: 82,
      };
  }
}

function normalizeLLMResults(
  jdText: string,
  rawResults: RawDetailAnalysisResult[],
): AnalysisResult[] {
  const usedRanges: Array<{ start: number; end: number }> = [];

  return rawResults.reduce<AnalysisResult[]>((results, rawResult) => {
    const start = jdText.indexOf(rawResult.keyword);

    if (start === -1) {
      return results;
    }

    const end = start + rawResult.keyword.length;
    const overlaps = usedRanges.some(
      (range) => start < range.end && end > range.start,
    );

    if (overlaps) {
      return results;
    }

    usedRanges.push({ start, end });
    results.push({
      id: `node_${(results.length + 1).toString().padStart(2, "0")}`,
      keyword: rawResult.keyword,
      category: rawResult.category,
      badge: rawResult.badge,
      insight: rawResult.insight,
      proof: rawResult.proof,
      source_range: { start, end },
      graph_data: getGraphData(rawResult.category),
    });

    return results;
  }, []);
}

function extractJSONObject(text: string) {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The local LLM did not return a JSON object.");
  }

  return trimmed.slice(start, end + 1);
}

async function runDetailAnalysis(jdText: string, locale: Locale) {
  if (!hasLLMConfig()) {
    throw new Error("Missing detail analysis provider configuration.");
  }

  const responseLanguage = locale;
  const candidateEvidence =
    await getCandidateEvidenceForLanguage(responseLanguage);
  const content = await collectChatCompletionText({
    messages: [
      {
        role: "system",
        content: buildDetailAnalysisSystemPrompt(
          detailAnalysisSchema,
          responseLanguage,
        ),
      },
      {
        role: "user",
        content: buildDetailAnalysisPrompt(
          jdText,
          responseLanguage,
          candidateEvidence,
        ),
      },
    ],
    timeoutMs: DETAIL_ANALYSIS_TIMEOUT_MS,
    temperature: 0.1,
    topP: 0.8,
    maxTokens: DETAIL_ANALYSIS_MAX_TOKENS,
    responseFormat: { type: "json_object" },
  });

  const result = detailAnalysisSchema.parse(
    JSON.parse(extractJSONObject(content)),
  );
  return normalizeLLMResults(jdText, result.analysis_results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jdText, locale = defaultLocale } =
      detailAnalysisRequestSchema.parse(body);
    const analysisResults = await runDetailAnalysis(jdText, locale);

    return Response.json({
      analysis_results: analysisResults,
    } satisfies DetailAnalysisResponse);
  } catch (error) {
    console.error("[api/detail-analysis] request failed", error);

    return Response.json(
      { error: "Failed to run detail analysis." } satisfies ApiErrorResponse,
      { status: 500 },
    );
  }
}
