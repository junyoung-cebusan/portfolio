"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-utils";
import { messages, type Locale } from "@/lib/i18n/messages";
import type { AnalysisResult } from "../utils/detailAnalysisConfig";

async function fetchDetailAnalysis(jdText: string, locale: Locale) {
  const response = await fetch("/api/detail-analysis", {
    method: "POST",
    body: JSON.stringify({ jdText, locale }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(messages[locale].errors.failedDetailAnalysis);
  }

  const data = (await response.json()) as {
    analysis_results: AnalysisResult[];
  };

  return data.analysis_results;
}

export function useDetailAnalysisQuery(
  jdText: string,
  locale: Locale,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.detail.analysis(jdText, locale),
    queryFn: () => fetchDetailAnalysis(jdText, locale),
    enabled: Boolean(jdText.trim()) && enabled,
  });
}
