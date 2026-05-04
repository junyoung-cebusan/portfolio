import type {
  AnalysisResult,
  DetailAnalysisTone,
} from "./detailAnalysisConfig";

// ---------------------------------------------------------------------------
// Style mappings
// ---------------------------------------------------------------------------

export const iconColor: Record<DetailAnalysisTone, string> = {
  cyan: "text-cyan-500",
  purple: "text-purple-500",
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  red: "text-red-500",
} as const;

export const borderColor: Record<DetailAnalysisTone, string> = {
  cyan: "border-cyan-500/50",
  purple: "border-purple-500/50",
  emerald: "border-emerald-500/50",
  amber: "border-amber-500/50",
  red: "border-red-500/50",
} as const;

export const panelGradient: Record<DetailAnalysisTone, string> = {
  cyan: "from-cyan-500/20 to-sky-500/20",
  purple: "from-purple-500/20 to-fuchsia-500/20",
  emerald: "from-emerald-500/20 to-teal-500/20",
  amber: "from-amber-500/20 to-orange-500/20",
  red: "from-red-500/20 to-rose-500/20",
} as const;

// ---------------------------------------------------------------------------
// Highlight range types and utilities
// ---------------------------------------------------------------------------

export type HighlightRange = {
  result: AnalysisResult;
  start: number;
  end: number;
};

/**
 * Compute highlight ranges from JD text and analysis results.
 * Returns sorted, non-overlapping ranges ready for rendering.
 */
export function getHighlightRanges(
  jdText: string,
  results: AnalysisResult[],
): HighlightRange[] {
  return results
    .map((result) => {
      const sourceRange = result.source_range;
      const hasValidSourceRange =
        sourceRange &&
        jdText.slice(sourceRange.start, sourceRange.end) === result.keyword;
      const start = hasValidSourceRange
        ? sourceRange.start
        : jdText.indexOf(result.keyword);

      if (start === -1) {
        return null;
      }

      const end = hasValidSourceRange
        ? sourceRange.end
        : start + result.keyword.length;

      return {
        result,
        start,
        end,
      };
    })
    .filter((range): range is NonNullable<typeof range> => Boolean(range))
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .reduce<HighlightRange[]>((ranges, range) => {
      const previous = ranges.at(-1);

      if (previous && range.start < previous.end) {
        return ranges;
      }

      ranges.push(range);
      return ranges;
    }, []);
}
