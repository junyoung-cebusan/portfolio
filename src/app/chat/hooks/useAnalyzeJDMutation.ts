import { useMutation } from "@tanstack/react-query";

import { analyzeJobDescription } from "@/lib/api/generated";
import type { ApiError } from "@/lib/api/generated";
import { queryKeys } from "@/lib/react-query/queryUtils";
import type { PresetId } from "@/lib/llm/preset-analysis-schema";

type AnalyzeJDInput = {
  mode: "analyze" | "chat";
  jdText?: string;
  file?: File;
  message?: string;
  preset?: PresetId;
  onChunk: (content: string) => void;
  onMode?: (mode: string) => void;
};

function getFriendlyRequestError(error: unknown) {
  if (typeof error === "object" && error !== null && "error" in error) {
    const apiError = error as Partial<ApiError>;
    if (typeof apiError.error === "string") return apiError.error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return "The AI response timed out. Please try a shorter JD or a more focused question.";
  }

  if (error instanceof TypeError && error.message.includes("network")) {
    return "The AI response was interrupted before it finished. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The AI request failed. Please try again.";
}

async function getResponseError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === "string"
      ? body.error
      : "Failed to analyze the job description.";
  }

  const errorText = await response.text();
  return errorText || "Failed to analyze the job description.";
}

async function analyzeJD({
  mode,
  jdText,
  file,
  message,
  preset,
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

      response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      responseBody = response.body;
    } else {
      const result = await analyzeJobDescription({
        body: { mode, jdText, message, preset },
        parseAs: "stream",
        throwOnError: true,
      });

      response = result.response;
      responseBody = result.data as unknown as ReadableStream<Uint8Array> | null;
    }
  } catch (error) {
    throw new Error(getFriendlyRequestError(error));
  }

  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }

  if (!responseBody) {
    throw new Error("The analysis response did not include a stream.");
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

    throw new Error(getFriendlyRequestError(error));
  }

  return analysisContent;
}

export function useAnalyzeJDMutation(sessionId: string) {
  return useMutation({
    mutationKey: queryKeys.chat.sendMessage(sessionId),
    mutationFn: analyzeJD,
  });
}
