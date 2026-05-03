"use client";

import { useState } from "react";
import type { ReactElement } from "react";

import {
  CareerPanel,
  HighlightMark,
  InfoBlock,
  LegendItem,
  StatusPill,
} from "@/components/career-ui";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/popover";
import { cn } from "@/lib/shadcn/utils";

import {
  analysisResults,
  analysisCategoryMeta,
  detailJDText,
  type AnalysisResult,
} from "../utils/detailAnalysisConfig";

interface TextViewProps {
  jdText?: string;
  results?: AnalysisResult[];
}

const iconColor = {
  cyan: "text-cyan-500",
  purple: "text-purple-500",
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  red: "text-red-500",
} as const;

const borderColor = {
  cyan: "border-cyan-500/50",
  purple: "border-purple-500/50",
  emerald: "border-emerald-500/50",
  amber: "border-amber-500/50",
  red: "border-red-500/50",
} as const;

const panelGradient = {
  cyan: "from-cyan-500/20 to-sky-500/20",
  purple: "from-purple-500/20 to-fuchsia-500/20",
  emerald: "from-emerald-500/20 to-teal-500/20",
  amber: "from-amber-500/20 to-orange-500/20",
  red: "from-red-500/20 to-rose-500/20",
} as const;

type HighlightRange = {
  result: AnalysisResult;
  start: number;
  end: number;
};

function getHighlightRanges(
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

export function TextView({
  jdText = detailJDText,
  results = analysisResults,
}: TextViewProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const hasHighlights = results.length > 0;

  const renderTextWithHighlights = () => {
    const parts: ReactElement[] = [];
    let currentIndex = 0;
    const highlightRanges = getHighlightRanges(jdText, results);

    highlightRanges.forEach(({ result, start, end }) => {
      if (currentIndex < start) {
        parts.push(
          <span key={`text-${currentIndex}`}>
            {jdText.substring(currentIndex, start)}
          </span>,
        );
      }

      const meta = analysisCategoryMeta[result.category];
      const Icon = meta.icon;

      parts.push(
        <Popover
          key={result.id}
          open={openPopover === result.id}
          onOpenChange={(open) => setOpenPopover(open ? result.id : null)}
        >
          <PopoverTrigger asChild>
            <HighlightMark
              tone={meta.tone}
              active={openPopover === result.id}
              data-analysis-node={result.id}
            >
              {result.keyword}
            </HighlightMark>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              "w-96 rounded-xl bg-gradient-to-br bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl",
              borderColor[meta.tone],
              panelGradient[meta.tone],
            )}
            sideOffset={8}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-5 w-5", iconColor[meta.tone])} />
                <h4 className="font-semibold text-slate-100">{meta.title}</h4>
              </div>
              <StatusPill tone={meta.tone}>{result.badge}</StatusPill>
            </div>

            <InfoBlock label="AI Insight">
              <p className="text-sm text-slate-300">{result.insight}</p>
            </InfoBlock>

            <InfoBlock
              label="Correlation Proof"
              labelTone={meta.tone}
              className="mt-3"
            >
              <p className="text-sm text-slate-300">{result.proof}</p>
            </InfoBlock>

            <PopoverArrow className="fill-slate-800" />
          </PopoverContent>
        </Popover>,
      );

      currentIndex = end;
    });

    if (currentIndex < jdText.length) {
      parts.push(
        <span key={`text-${currentIndex}`}>
          {jdText.substring(currentIndex)}
        </span>,
      );
    }

    return parts;
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col items-start justify-between gap-2 pb-2 sm:flex-row sm:gap-4">
        <h2 className="text-2xl font-bold text-slate-100">JD Analysis</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(analysisCategoryMeta).map(([category, meta]) => (
            <StatusPill key={category} tone={meta.tone}>
              {meta.label}
            </StatusPill>
          ))}
        </div>
      </div>

      <CareerPanel className="rounded-2xl p-8 leading-relaxed text-slate-300">
        {renderTextWithHighlights()}
      </CareerPanel>

      <CareerPanel className="mt-6 border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-4">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <LegendItem
            label={
              hasHighlights
                ? "Click highlighted keywords for analysis"
                : "No exact JD keyword matches found for detail analysis"
            }
            shape="dot"
          />
        </div>
      </CareerPanel>
    </div>
  );
}

export default TextView;
