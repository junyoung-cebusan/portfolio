import {
  collectChatCompletionText,
  createTextStreamResponse,
  hasLLMConfig,
  streamChatCompletionText,
} from "@/lib/llm/openai-compatible";
import type {
  AnalyzeJsonRequestBody,
  AnalyzeRequestInput,
  ApiErrorResponse,
} from "@/lib/api/contracts";
import {
  extractReadableDocumentText,
  isDocxDocument,
  isPdfDocument,
} from "@/lib/llm/document-reader";
import { jdMatchSchema } from "@/lib/llm/jd-match-schema";
import {
  isPresetId,
  presetAnalysisSchemas,
  type PresetId,
} from "@/lib/llm/preset-analysis-schema";
import {
  buildChatPrompt,
  buildStructuredSystemPrompt,
  buildStructuredUserPrompt,
  buildTextSystemPrompt,
  getAnalyzeJSONSchemaInstruction,
  getTextLanguage,
} from "@/lib/analysis/prompts";
import { getCandidateEvidenceForLanguage } from "@/lib/analysis/candidate-evidence";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/messages";

export const runtime = "nodejs";
export const maxDuration = 180;

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const CHAT_TIMEOUT_MS = getPositiveIntegerEnv("LLM_CHAT_TIMEOUT_MS", 90_000);
const ANALYSIS_TIMEOUT_MS = getPositiveIntegerEnv(
  "LLM_ANALYSIS_TIMEOUT_MS",
  120_000,
);
const ANALYSIS_MAX_TOKENS = getPositiveIntegerEnv(
  "LLM_ANALYSIS_MAX_TOKENS",
  1_600,
);
const CHAT_MAX_TOKENS = getPositiveIntegerEnv("LLM_CHAT_MAX_TOKENS", 600);

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      status: "status" in error ? error.status : undefined,
      cause: error.cause,
    };
  }

  return { message: String(error) };
}

function getFriendlyStreamError(error: unknown) {
  const details = getErrorDetails(error);
  const message = details.message.toLowerCase();

  if (
    details.name === "TimeoutError" ||
    message.includes("timeout") ||
    message.includes("aborted")
  ) {
    return "The local model did not finish the analysis in time. Increase LLM_ANALYSIS_TIMEOUT_MS or retry once the Mac Mini is idle.";
  }

  return "The AI response was interrupted. Please try again in a moment.";
}

async function getJDTextFromRequest(
  req: Request,
): Promise<AnalyzeRequestInput> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as AnalyzeJsonRequestBody;
    const jdText = body.jdText ?? body.prompt;
    const message =
      typeof body.message === "string" ? body.message.trim() : undefined;
    const mode = body.mode === "chat" ? "chat" : "analyze";
    const locale = isLocale(body.locale) ? body.locale : defaultLocale;

    if (mode === "analyze" && (typeof jdText !== "string" || !jdText.trim())) {
      return {
        ok: false,
        error: "Missing JD text. Send a non-empty 'jdText' value.",
        status: 400,
      };
    }

    return {
      ok: true,
      mode,
      jdText: typeof jdText === "string" ? jdText.trim() : "",
      message,
      preset: isPresetId(body.preset) ? body.preset : undefined,
      locale,
    };
  }

  if (
    !contentType.includes("multipart/form-data") &&
    !contentType.includes("application/x-www-form-urlencoded")
  ) {
    return {
      ok: false,
      error: "Unsupported request type. Send multipart/form-data or JSON.",
      status: 400,
    };
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const mode = formData.get("mode") === "chat" ? "chat" : "analyze";
  const messageValue = formData.get("message");
  const presetValue = formData.get("preset");
  const fallbackJDText = formData.get("jdText");
  const localeValue = formData.get("locale");
  const locale = isLocale(localeValue) ? localeValue : defaultLocale;

  if (!(file instanceof File) && typeof fallbackJDText !== "string") {
    return {
      ok: false,
      error: "Missing file. Upload a PDF or .docx file as 'file'.",
      status: 400,
    };
  }

  if (file instanceof File && !isPdfDocument(file) && !isDocxDocument(file)) {
    return {
      ok: false,
      error: "Unsupported file type. Please upload a PDF or .docx file.",
      status: 400,
    };
  }

  const jdText =
    file instanceof File
      ? await extractReadableDocumentText(file)
      : typeof fallbackJDText === "string"
        ? fallbackJDText.trim()
        : "";

  if (mode === "analyze" && !jdText) {
    return {
      ok: false,
      error: "Could not extract text from the uploaded document.",
      status: 400,
    };
  }

  return {
    ok: true,
    mode,
    jdText,
    message: typeof messageValue === "string" ? messageValue.trim() : undefined,
    preset: isPresetId(presetValue) ? presetValue : undefined,
    locale,
  };
}

function getStructuredSchema(preset?: PresetId) {
  return preset ? presetAnalysisSchemas[preset] : jdMatchSchema;
}

function getStreamErrorObject(error: unknown, preset?: PresetId) {
  const summary = getFriendlyStreamError(error);

  switch (preset) {
    case "tech-alignment":
      return {
        matchScore: 0,
        summary,
        radarData: [
          { skill: "Analysis timed out", yourLevel: 0, required: 0 },
          { skill: "Retry needed", yourLevel: 0, required: 0 },
          { skill: "Shorter JD", yourLevel: 0, required: 0 },
        ],
        techStack: [{ name: "Retry analysis", ready: false, note: summary }],
      };
    case "domain-transfer":
      return {
        matchLabel: "Retry Needed",
        summary,
        mappings: [
          {
            pastProject: "Analysis interrupted",
            jdRequirement: "Retry after increasing local model timeout",
            proof: summary,
            strength: 0,
          },
          {
            pastProject: "Fallback",
            jdRequirement: "Focused analysis",
            proof: "Choose one perspective and retry.",
            strength: 0,
          },
        ],
      };
    case "ownership":
      return {
        fitLabel: "Retry Needed",
        summary,
        areas: [
          {
            title: "Analysis interrupted",
            description:
              "The model timed out before producing leadership analysis.",
            alignment: 0,
            evidence: summary,
          },
          {
            title: "Retry recommendation",
            description:
              "Increase the local model timeout or retry when the Mac Mini is idle.",
            alignment: 0,
            evidence: "No reliable evidence generated.",
          },
          {
            title: "Fallback state",
            description: "Structured result unavailable.",
            alignment: 0,
            evidence: "Please retry.",
          },
        ],
      };
    case "velocity":
      return {
        velocityLabel: "Retry Needed",
        workflowSummary: summary,
        widget1_capacity: [
          {
            label: "Analysis status",
            jd_required: 1,
            candidate_actual: 0,
            unit: "Retry",
          },
        ],
        widget2_pipeline: [
          {
            stage: "Requirements & Synchronization",
            jd_context: "Structured result unavailable.",
            accelerator_title: "RETRY REQUIRED",
            impact: summary,
          },
          {
            stage: "Architecture & Implementation",
            jd_context: "Structured result unavailable.",
            accelerator_title: "RETRY REQUIRED",
            impact:
              "Increase LLM_ANALYSIS_TIMEOUT_MS and retry when the Mac Mini is idle.",
          },
          {
            stage: "Testing & Delivery",
            jd_context: "Structured result unavailable.",
            accelerator_title: "RETRY REQUIRED",
            impact: "Run the analysis again.",
          },
        ],
        metrics: [
          { label: "Status", value: "Timeout", comparison: "retry required" },
          { label: "Result", value: "0%", comparison: "not enough data" },
          {
            label: "Next Step",
            value: "Retry",
            comparison: "increase timeout",
          },
        ],
        widget3_multipliers: [
          summary,
          "Increase LLM_ANALYSIS_TIMEOUT_MS",
          "Retry when the Mac Mini is idle",
        ],
        overallSynergyScore: 0,
        overallSynergyNote: "Structured velocity analysis did not complete.",
      };
    default:
      return {
        overallMatchScore: 0,
        summary,
        matchedSkills: [],
        missingSkills: [],
      };
  }
}

function extractJSONObject(text: string) {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("The local LLM did not return a complete JSON object.");
  }

  return trimmed.slice(start, end + 1);
}

async function streamLocalText(
  jdText: string,
  options?: {
    message?: string;
    mode?: "chat" | "text-only";
    locale?: Locale;
  },
) {
  const languageSource = jdText || options?.message || "";
  const responseLanguage = options?.locale ?? getTextLanguage(languageSource);
  const candidateEvidence =
    await getCandidateEvidenceForLanguage(responseLanguage);

  return createTextStreamResponse(
    streamChatCompletionText({
      messages: [
        {
          role: "system",
          content: buildTextSystemPrompt({
            resumeEvidence: candidateEvidence,
            responseLanguage,
          }),
        },
        {
          role: "user",
          content:
            options?.mode === "chat"
              ? buildChatPrompt(jdText, options.message)
              : jdText,
        },
      ],
      timeoutMs:
        options?.mode === "chat" ? CHAT_TIMEOUT_MS : ANALYSIS_TIMEOUT_MS,
      temperature: 0.3,
      topP: 0.85,
      maxTokens:
        options?.mode === "chat" ? CHAT_MAX_TOKENS : ANALYSIS_MAX_TOKENS,
    }),
    {
      headers: {
        "X-Analysis-Mode": options?.mode === "chat" ? "chat" : "text-only",
      },
      onStreamError: (error) => {
        console.error("[api/analyze] local LLM text stream failed", {
          error: getErrorDetails(error),
        });
        return getFriendlyStreamError(error);
      },
    },
  );
}

async function getStructuredAnalysisJSON(
  jdText: string,
  preset?: PresetId,
  locale: Locale = defaultLocale,
) {
  try {
    const responseLanguage = locale;
    const candidateEvidence =
      await getCandidateEvidenceForLanguage(responseLanguage);
    const content = await collectChatCompletionText({
      messages: [
        {
          role: "system",
          content: [
            buildStructuredSystemPrompt({
              resumeEvidence: candidateEvidence,
              preset,
              responseLanguage,
            }),
            "",
            getAnalyzeJSONSchemaInstruction(preset),
          ].join("\n"),
        },
        {
          role: "user",
          content: buildStructuredUserPrompt(jdText, preset),
        },
      ],
      timeoutMs: ANALYSIS_TIMEOUT_MS,
      temperature: 0.1,
      topP: 0.8,
      maxTokens: ANALYSIS_MAX_TOKENS,
      responseFormat: { type: "json_object" },
    });
    const schema = getStructuredSchema(preset);
    const rawOutput = JSON.parse(extractJSONObject(content)) as unknown;
    const parsed = schema.parse(rawOutput);

    return JSON.stringify(parsed);
  } catch (error) {
    console.error("[api/analyze] local LLM structured analysis failed", {
      error: getErrorDetails(error),
    });

    return JSON.stringify(getStreamErrorObject(error, preset));
  }
}

async function streamLocalStructured(
  jdText: string,
  preset?: PresetId,
  locale: Locale = defaultLocale,
) {
  const content = await getStructuredAnalysisJSON(jdText, preset, locale);

  return createTextStreamResponse(
    (async function* streamValidatedStructuredJSON() {
      yield content;
    })(),
    {
      headers: {
        "X-Analysis-Mode": "structured",
      },
    },
  );
}

export async function POST(req: Request) {
  let requestInput: Extract<AnalyzeRequestInput, { ok: true }>;

  try {
    const result = await getJDTextFromRequest(req);

    if (!result.ok) {
      return Response.json({ error: result.error } satisfies ApiErrorResponse, {
        status: result.status,
      });
    }

    requestInput = result;
  } catch (error) {
    console.error("[api/analyze] JD input parsing failed", {
      error: getErrorDetails(error),
    });

    return Response.json(
      {
        error: getErrorDetails(error).message || "Failed to parse JD input.",
      } satisfies ApiErrorResponse,
      { status: 400 },
    );
  }

  if (!hasLLMConfig()) {
    console.error("[api/analyze] Missing local LLM configuration.", {
      required: ["LLM_PROFILE with LLM_LOCAL_* or LLM_CLOUD_*"],
    });

    return Response.json(
      {
        error: "Missing analysis provider configuration.",
      } satisfies ApiErrorResponse,
      { status: 500 },
    );
  }

  if (requestInput.mode === "chat") {
    return await streamLocalText(requestInput.jdText, {
      message: requestInput.message,
      mode: "chat",
      locale: requestInput.locale,
    });
  }

  return await streamLocalStructured(
    requestInput.jdText,
    requestInput.preset,
    requestInput.locale,
  );
}
