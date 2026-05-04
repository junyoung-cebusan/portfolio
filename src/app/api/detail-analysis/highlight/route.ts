import type { AnalysisResult } from "@/app/[locale]/detail/[id]/utils/detailAnalysisConfig";
import {
  detailAnalysisRequestSchema,
  type ApiErrorResponse,
  type DetailAnalysisResponse,
} from "@/lib/api/contracts";
import {
  collectChatCompletionText,
  hasLLMConfig,
} from "@/lib/llm/openai-compatible";
import { extractJSONObject } from "@/lib/llm/extract-json";
import {
  buildDetailHighlightPrompt,
  buildDetailHighlightSystemPrompt,
  detailHighlightSchema,
  getTextLanguage,
  type RawDetailHighlightResult,
} from "@/lib/analysis/prompts";
import { getCandidateEvidenceForLanguage } from "@/lib/analysis/candidate-evidence";

export const runtime = "nodejs";
export const maxDuration = 60;

const DETAIL_HIGHLIGHT_TIMEOUT_MS = 60_000;
const DETAIL_HIGHLIGHT_MAX_TOKENS = 1_000;

function normalizeHighlightResults(
  jdText: string,
  rawResults: RawDetailHighlightResult[],
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
      graph_data: {
        connections: [],
        strength: 0,
      },
    });

    return results;
  }, []);
}

async function runDetailHighlight(jdText: string) {
  if (!hasLLMConfig()) {
    throw new Error("Missing detail analysis provider configuration.");
  }

  const responseLanguage = getTextLanguage(jdText || "");
  const candidateEvidence =
    await getCandidateEvidenceForLanguage(responseLanguage);
  const content = await collectChatCompletionText({
    messages: [
      {
        role: "system",
        content: buildDetailHighlightSystemPrompt(
          detailHighlightSchema,
          responseLanguage,
        ),
      },
      {
        role: "user",
        content: buildDetailHighlightPrompt(
          jdText,
          responseLanguage,
          candidateEvidence,
        ),
      },
    ],
    timeoutMs: DETAIL_HIGHLIGHT_TIMEOUT_MS,
    temperature: 0.1,
    topP: 0.8,
    maxTokens: DETAIL_HIGHLIGHT_MAX_TOKENS,
    responseFormat: { type: "json_object" },
  });

  const result = detailHighlightSchema.parse(
    JSON.parse(extractJSONObject(content)),
  );
  return normalizeHighlightResults(jdText, result.analysis_results);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jdText } = detailAnalysisRequestSchema.parse(body);
    const analysisResults = await runDetailHighlight(jdText);

    return Response.json({
      analysis_results: analysisResults,
    } satisfies DetailAnalysisResponse);
  } catch (error) {
    console.error("[api/detail-analysis/highlight] request failed", error);

    return Response.json(
      {
        error: "Failed to run detail highlight analysis.",
      } satisfies ApiErrorResponse,
      { status: 500 },
    );
  }
}
