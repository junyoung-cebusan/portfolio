"use client";

import { useQuery } from "@tanstack/react-query";

import { createDetailAnalysis } from "@/lib/api/generated";
import { queryKeys } from "@/lib/react-query/queryUtils";

async function fetchDetailAnalysis(jdText: string) {
  const { data } = await createDetailAnalysis({
    body: { jdText },
    throwOnError: true,
  });

  return data.analysis_results;
}

export function useDetailAnalysisQuery(jdText: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.detail.analysis(jdText),
    queryFn: () => fetchDetailAnalysis(jdText),
    enabled: Boolean(jdText.trim()) && enabled,
  });
}
