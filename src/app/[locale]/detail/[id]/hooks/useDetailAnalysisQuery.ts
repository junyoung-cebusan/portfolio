"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-utils";
import {
  loadGraphResults,
  loadHighlightResults,
  saveGraphResults,
  saveHighlightResults,
  type GraphData,
} from "../utils/detailSessionStorage";
import {
  createDetailHighlight,
  createDetailGraph,
} from "@/lib/api/generated/sdk.gen";
import type { GraphResponse } from "@/lib/api/generated/types.gen";

async function fetchHighlightAnalysis(jdText: string) {
  // Try sessionStorage first
  const stored = loadHighlightResults();
  if (stored && stored.jdText === jdText) {
    return stored.results;
  }

  // Fetch from API using SDK - locale is determined by jdText language on server
  const response = await createDetailHighlight({
    body: { jdText },
  });

  const data = response.data;
  if (!data) {
    throw new Error("Failed to fetch highlight analysis");
  }

  saveHighlightResults(data.analysis_results, jdText);
  return data.analysis_results;
}

async function fetchGraphAnalysis(jdText: string) {
  // Try sessionStorage first
  const stored = loadGraphResults();
  if (stored && stored.jdText === jdText) {
    return stored.graphData;
  }

  // Fetch from API using SDK - locale is determined by jdText language on server
  const response = await createDetailGraph({
    body: { jdText },
  });

  const data = response.data as GraphResponse | undefined;
  if (!data) {
    throw new Error("Failed to fetch graph analysis");
  }

  saveGraphResults(data, jdText);
  return data;
}

export function useHighlightAnalysisQuery(jdText: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.detail.highlight(jdText),
    queryFn: () => fetchHighlightAnalysis(jdText),
    enabled: Boolean(jdText.trim()) && enabled,
  });
}

export function useGraphAnalysisQuery(jdText: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.detail.graph(jdText),
    queryFn: () => fetchGraphAnalysis(jdText),
    enabled: Boolean(jdText.trim()) && enabled,
  });
}
