import { useMutation } from "@tanstack/react-query";

import { readDocument } from "@/lib/api/generated";
import type { ApiError, ReadDocumentResponse } from "@/lib/api/generated";
import { messages } from "@/lib/i18n/messages";
import { queryKeys } from "@/lib/react-query/query-utils";

function getUploadError(error: unknown) {
  if (typeof error === "object" && error !== null && "error" in error) {
    const apiError = error as Partial<ApiError>;
    if (typeof apiError.error === "string") return apiError.error;
  }

  if (error instanceof Error) return error.message;

  return messages.ja.errors.failedToReadDocument;
}

async function readJDDocument(file: File): Promise<ReadDocumentResponse> {
  try {
    const { data } = await readDocument({
      body: { file },
      throwOnError: true,
    });

    return data;
  } catch (error) {
    throw new Error(getUploadError(error));
  }
}

export function useReadJDDocumentMutation() {
  return useMutation({
    mutationKey: queryKeys.chat.readDocument(),
    mutationFn: readJDDocument,
  });
}
