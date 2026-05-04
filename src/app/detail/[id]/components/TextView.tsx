"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

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
  normalizeCategory,
  type AnalysisResult,
  type DetailAnalysisCategory,
} from "../utils/detailAnalysisConfig";
import {
  borderColor,
  getHighlightRanges,
  iconColor,
  panelGradient,
} from "../utils/textViewUtils";

interface TextViewProps {
  jdText?: string;
  results?: AnalysisResult[];
  className?: string;
}

export function TextView({
  jdText = detailJDText,
  results = analysisResults,
  className,
}: TextViewProps) {
  const tDetail = useTranslations("detail");
  const tCategories = useTranslations("analysis.categories");
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

      const normalizedCategory = normalizeCategory(
        result.category,
      ) as DetailAnalysisCategory;
      const meta = analysisCategoryMeta[normalizedCategory];
      const Icon = meta?.icon;
      const categoryTitle = tCategories(`${meta.translationKey}.title`);

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
                <h4 className="font-semibold text-slate-100">
                  {categoryTitle}
                </h4>
              </div>
              <StatusPill tone={meta.tone}>{result.badge}</StatusPill>
            </div>

            <InfoBlock label={tDetail("aiInsight")}>
              <p className="text-sm text-slate-300">{result.insight}</p>
            </InfoBlock>

            <InfoBlock
              label={tDetail("correlationProof")}
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
    <div
      className={cn(
        "mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col",
        className,
      )}
    >
      <div className="flex shrink-0 flex-col items-start justify-between gap-2 pb-2 sm:flex-row sm:gap-4">
        <h2 className="text-2xl font-bold text-foreground dark:text-slate-100">
          {tDetail("jdAnalysis")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(analysisCategoryMeta).map(([category, meta]) => (
            <StatusPill key={category} tone={meta.tone}>
              {tCategories(`${meta.translationKey}.label`)}
            </StatusPill>
          ))}
        </div>
      </div>

      <CareerPanel className="min-h-0 flex-1 overflow-y-auto rounded-2xl p-8 leading-relaxed text-slate-700 dark:text-slate-300">
        {renderTextWithHighlights()}
      </CareerPanel>

      <CareerPanel tone="cyan" variant="soft" className="mt-6 shrink-0 p-4">
        <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
          <LegendItem
            label={
              hasHighlights
                ? tDetail("clickHighlights")
                : tDetail("noHighlights")
            }
            shape="dot"
          />
        </div>
      </CareerPanel>
    </div>
  );
}

export default TextView;
