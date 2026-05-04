"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-utils";
import { type Locale } from "@/lib/i18n/messages";
import {
  loadGraphResults,
  loadHighlightResults,
  saveGraphResults,
  saveHighlightResults,
  type GraphData,
} from "../utils/detailSessionStorage";
import { createDetailHighlight } from "@/lib/api/generated/sdk.gen";

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
    return stored.graphData;
  }

  // Fetch from API directly (response format changed to nodes/edges)
  const response = await fetch("/api/detail-analysis/graph", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jdText, locale }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch graph analysis");
  }

  const data = await response.json();

  // New API returns { nodes: [...], edges: [...] }
  const graphData: GraphData = {
    nodes: data.nodes || [],
    edges: data.edges || [],
  };

  saveGraphResults(graphData, jdText);
  return graphData;
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
