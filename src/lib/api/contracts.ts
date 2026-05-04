import { z } from "zod";

import type { AnalysisResult } from "@/app/[locale]/detail/[id]/utils/detailAnalysisConfig";
import type { Locale } from "@/lib/i18n/messages";
import type { LLMChatMessage } from "@/lib/llm/openai-compatible";
import type { PresetId } from "@/lib/llm/preset-analysis-schema";

export type ApiErrorResponse = {
  error: string;
  details?: string;
};

export type ReadDocumentResponse = {
  title: string;
  text: string;
};

export type ChatRequestBody = {
  messages?: LLMChatMessage[];
  prompt?: string;
};

export type AnalyzeMode = "analyze" | "chat";

export type AnalyzeJsonRequestBody = {
  jdText?: unknown;
  prompt?: unknown;
  message?: unknown;
  mode?: unknown;
  preset?: unknown;
  locale?: unknown;
};

export type AnalyzeRequestInput =
  | {
      ok: true;
      mode: AnalyzeMode;
      jdText: string;
      message?: string;
      preset?: PresetId;
      locale: Locale;
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

export const detailAnalysisRequestSchema = z.object({
  jdText: z.string().trim().min(1),
  locale: z.enum(["en", "ja"]).optional(),
});

export type DetailAnalysisRequest = z.infer<typeof detailAnalysisRequestSchema>;

export type DetailAnalysisResponse = {
  analysis_results: AnalysisResult[];
};
