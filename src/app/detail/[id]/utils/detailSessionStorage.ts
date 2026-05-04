import type { AnalysisResult } from "./detailAnalysisConfig";
import { detailJDText } from "./detailAnalysisConfig";

export const DETAIL_ANALYSIS_STORAGE_KEY = "young-portfolio:detail-analysis";
export const DETAIL_HIGHLIGHT_STORAGE_KEY = "young-portfolio:detail-highlight";
export const DETAIL_GRAPH_STORAGE_KEY = "young-portfolio:detail-graph";
export const DETAIL_ANALYSIS_STORAGE_EVENT = "detail-analysis-storage-change";

export type DetailJDSnapshot = {
  title: string;
  jdText: string;
  updatedAt: string;
};

export type StoredAnalysisResults = {
  jdText: string;
  results: AnalysisResult[];
  updatedAt: string;
};

export function createDetailJDSnapshot(
  jdText: string,
  title = "Current Job Description",
): DetailJDSnapshot {
  const normalizedText = jdText.trim() || detailJDText;

  return {
    title,
    jdText: normalizedText,
    updatedAt: new Date().toISOString(),
  };
}

export function getEmptyDetailJDSnapshot(): DetailJDSnapshot {
  return {
    title: "No Job Description",
    jdText: detailJDText,
    updatedAt: new Date(0).toISOString(),
  };
}

export function saveDetailJDSnapshot(snapshot: DetailJDSnapshot) {
  window.sessionStorage.setItem(
    DETAIL_ANALYSIS_STORAGE_KEY,
    JSON.stringify(snapshot),
  );
  window.dispatchEvent(new Event(DETAIL_ANALYSIS_STORAGE_EVENT));
}

export function parseDetailJDSnapshot(
  rawSnapshot: string | null,
): DetailJDSnapshot | null {
  if (!rawSnapshot) {
    return null;
  }

  try {
    const snapshot = JSON.parse(rawSnapshot) as Partial<DetailJDSnapshot>;

    if (typeof snapshot.jdText !== "string" || !snapshot.jdText.trim()) {
      return null;
    }

    return {
      title:
        typeof snapshot.title === "string" && snapshot.title.trim()
          ? snapshot.title
          : "Current Job Description",
      jdText: snapshot.jdText,
      updatedAt:
        typeof snapshot.updatedAt === "string"
          ? snapshot.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function loadDetailJDSnapshot(): DetailJDSnapshot | null {
  const rawSnapshot = window.sessionStorage.getItem(
    DETAIL_ANALYSIS_STORAGE_KEY,
  );

  return parseDetailJDSnapshot(rawSnapshot);
}

export function subscribeToDetailStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DETAIL_ANALYSIS_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DETAIL_ANALYSIS_STORAGE_EVENT, onStoreChange);
  };
}

export function getStoredDetailSnapshot() {
  return window.sessionStorage.getItem(DETAIL_ANALYSIS_STORAGE_KEY);
}

export function getServerDetailSnapshot() {
  return null;
}

export function saveHighlightResults(
  results: AnalysisResult[],
  jdText: string,
) {
  const stored: StoredAnalysisResults = {
    jdText,
    results,
    updatedAt: new Date().toISOString(),
  };
  window.sessionStorage.setItem(
    DETAIL_HIGHLIGHT_STORAGE_KEY,
    JSON.stringify(stored),
  );
  window.dispatchEvent(new Event(DETAIL_ANALYSIS_STORAGE_EVENT));
}

export function loadHighlightResults(): StoredAnalysisResults | null {
  const raw = window.sessionStorage.getItem(DETAIL_HIGHLIGHT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAnalysisResults>;
    if (typeof parsed.jdText !== "string" || !Array.isArray(parsed.results)) {
      return null;
    }
    return {
      jdText: parsed.jdText,
      results: parsed.results as AnalysisResult[],
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveGraphResults(results: AnalysisResult[], jdText: string) {
  const stored: StoredAnalysisResults = {
    jdText,
    results,
    updatedAt: new Date().toISOString(),
  };
  window.sessionStorage.setItem(
    DETAIL_GRAPH_STORAGE_KEY,
    JSON.stringify(stored),
  );
  window.dispatchEvent(new Event(DETAIL_ANALYSIS_STORAGE_EVENT));
}

export function loadGraphResults(): StoredAnalysisResults | null {
  const raw = window.sessionStorage.getItem(DETAIL_GRAPH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAnalysisResults>;
    if (typeof parsed.jdText !== "string" || !Array.isArray(parsed.results)) {
      return null;
    }
    return {
      jdText: parsed.jdText,
      results: parsed.results as AnalysisResult[],
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
