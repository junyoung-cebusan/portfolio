import {
  detailAnalysisRequestSchema,
  type ApiErrorResponse,
} from "@/lib/api/contracts";
import {
  collectChatCompletionText,
  hasLLMConfig,
} from "@/lib/llm/openai-compatible";
import { extractJSONObject } from "@/lib/llm/extract-json";
import {
  buildDetailGraphPrompt,
  buildDetailGraphSystemPrompt,
  detailGraphSchema,
  getTextLanguage,
  type RawDetailGraphResult,
} from "@/lib/analysis/prompts";
import { getCandidateEvidenceForLanguage } from "@/lib/analysis/candidate-evidence";

export const runtime = "nodejs";
export const maxDuration = 60;

const DETAIL_GRAPH_TIMEOUT_MS = 60_000;
const DETAIL_GRAPH_MAX_TOKENS = 1_500;

async function runDetailGraph(jdText: string) {
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
        content: buildDetailGraphSystemPrompt(
          detailGraphSchema,
          responseLanguage,
        ),
      },
      {
        role: "user",
        content: buildDetailGraphPrompt(
          jdText,
          responseLanguage,
          candidateEvidence,
        ),
      },
    ],
    timeoutMs: DETAIL_GRAPH_TIMEOUT_MS,
    temperature: 0.1,
    topP: 0.8,
    maxTokens: DETAIL_GRAPH_MAX_TOKENS,
    responseFormat: { type: "json_object" },
  });

  const result = detailGraphSchema.parse(
    JSON.parse(extractJSONObject(content)),
  ) as RawDetailGraphResult;

  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jdText } = detailAnalysisRequestSchema.parse(body);
    const graphData = await runDetailGraph(jdText);

    return Response.json(graphData);
  } catch (error) {
    console.error("[api/detail-analysis/graph] request failed", error);

    return Response.json(
      {
        error: "Failed to run detail graph analysis.",
      } satisfies ApiErrorResponse,
      { status: 500 },
    );
  }
}
