"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-utils";
import { messages, type Locale } from "@/lib/i18n/messages";
import type { AnalysisResult } from "../utils/detailAnalysisConfig";
import {
  loadGraphResults,
  loadHighlightResults,
  saveGraphResults,
  saveHighlightResults,
} from "../utils/detailSessionStorage";
import {
  createDetailHighlight,
  createDetailGraph,
} from "@/lib/api/generated/sdk.gen";

async function fetchHighlightAnalysis(jdText: string, locale: Locale) {
  // Try sessionStorage first
  const stored = loadHighlightResults();
  if (stored && stored.jdText === jdText) {
    return stored.results;
  }

  // Fetch from API using SDK
  const response = await createDetailHighlight({
    body: { jdText, locale },
  });

  const data = response.data;
  if (!data) {
    throw new Error("Failed to fetch highlight analysis");
  }

  saveHighlightResults(data.analysis_results, jdText);
  return data.analysis_results;
}

async function fetchGraphAnalysis(jdText: string, locale: Locale) {
  // Try sessionStorage first
  const stored = loadGraphResults();
  if (stored && stored.jdText === jdText) {
    return stored.results;
  }

  // Fetch from API using SDK
  const response = await createDetailGraph({
    body: { jdText, locale },
  });

  const data = response.data;
  if (!data) {
    throw new Error("Failed to fetch graph analysis");
  }

  saveGraphResults(data.analysis_results, jdText);
  return data.analysis_results;
}

export function useHighlightAnalysisQuery(
  jdText: string,
  locale: Locale,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.detail.highlight(jdText, locale),
    queryFn: () => fetchHighlightAnalysis(jdText, locale),
    enabled: Boolean(jdText.trim()) && enabled,
  });
}

export function useGraphAnalysisQuery(
  jdText: string,
  locale: Locale,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.detail.graph(jdText, locale),
    queryFn: () => fetchGraphAnalysis(jdText, locale),
    enabled: Boolean(jdText.trim()) && enabled,
  });
}
