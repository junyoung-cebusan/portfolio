import { useMutation } from "@tanstack/react-query";

import type { ApiError } from "@/lib/api/generated";
import { queryKeys } from "@/lib/react-query/query-utils";
import type { PresetId } from "@/lib/llm/preset-analysis-schema";
import { messages, type Locale } from "@/lib/i18n/messages";

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

async function getResponseError(response: Response, locale: Locale) {
  const t = messages[locale].errors;
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === "string"
      ? body.error
      : t.failedToAnalyze;
  }

  const errorText = await response.text();
  return errorText || t.failedToAnalyze;
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
  let response: Response;
  let responseBody: ReadableStream<Uint8Array> | null | undefined;

  try {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      if (message) formData.append("message", message);
      if (preset) formData.append("preset", preset);
      if (jdText) formData.append("jdText", jdText);
      formData.append("locale", locale);

      response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      responseBody = response.body;
    } else {
      response = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ mode, jdText, message, preset, locale }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      responseBody = response.body;
    }
  } catch (error) {
    throw new Error(getFriendlyRequestError(error, locale));
  }

  if (!response.ok) {
    throw new Error(await getResponseError(response, locale));
  }

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
}

export function useAnalyzeJDMutation(sessionId: string) {
  return useMutation({
    mutationKey: queryKeys.chat.sendMessage(sessionId),
    mutationFn: analyzeJD,
  });
}
