import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/generated";
import { queryKeys } from "@/lib/react-query/query-utils";
import type { PresetId } from "@/lib/llm/preset-analysis-schema";
import { messages, type Locale } from "@/lib/i18n/messages";
import { analyzeJobDescription } from "@/lib/api/generated/sdk.gen";

type AnalyzeJDInput = {
  mode: "analyze" | "chat";
  jdText?: string;
  file?: File;
  message?: string;
  preset?: PresetId;
  locale: Locale;
  onChunk: (content: string) => void;
  onMode?: (mode: string) => void;
};

function getFriendlyRequestError(error: unknown, locale: Locale) {
  const t = messages[locale].errors;

  if (typeof error === "object" && error !== null && "error" in error) {
    const apiError = error as Partial<ApiError>;
    if (typeof apiError.error === "string") return apiError.error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return t.aiTimeout;
  }

  if (error instanceof TypeError && error.message.includes("network")) {
    return t.aiInterrupted;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return t.aiRequestFailed;
}

async function analyzeJD({
  mode,
  jdText,
  file,
  message,
  preset,
  locale,
  onChunk,
  onMode,
}: AnalyzeJDInput) {
  try {
    const sdkResponse = await analyzeJobDescription({
      body: file
        ? ({ file, mode, message, preset, jdText } as never)
        : { jdText, message, mode, preset },
      headers: file
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
      throwOnError: false,
      // This tells client-fetch not to consume the stream automatically
      parseAs: "stream",
    });

    const response = sdkResponse.response;
    if (!response) {
      throw new Error("No response from SDK");
    }

    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const body = (await response.json()) as { error?: unknown };
        throw new Error(
          typeof body.error === "string" ? body.error : "Failed to analyze",
        );
      }
      const errorText = await response.text();
      throw new Error(errorText || "Failed to analyze");
    }

    const responseBody = response.body;
    if (!responseBody) {
      throw new Error(messages[locale].errors.missingStream);
    }

    onMode?.(response.headers.get("X-Analysis-Mode") ?? mode);

    const reader = responseBody.getReader();
    const decoder = new TextDecoder();
    let analysisContent = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        analysisContent += decoder.decode(value, { stream: true });
        onChunk(analysisContent);
      }

      analysisContent += decoder.decode();
    } catch (error) {
      if (analysisContent.trim()) {
        return analysisContent;
      }

      throw new Error(getFriendlyRequestError(error, locale));
    }

    return analysisContent;
  } catch (error) {
    throw new Error(getFriendlyRequestError(error, locale));
  }
}

export function useAnalyzeJDMutation(sessionId: string) {
  return useMutation({
    mutationKey: queryKeys.chat.sendMessage(sessionId),
    mutationFn: analyzeJD,
  });
}
