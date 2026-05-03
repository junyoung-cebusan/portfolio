import { Bot, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { CareerPanel, GradientIcon } from "@/components/career-ui";

import DomainTransferCard from "./presets/DomainTransferCard";
import FeatureOwnershipCard from "./presets/FeatureOwnershipCard";
import PresetAnalysisSkeleton from "./presets/PresetAnalysisSkeleton";
import TechAlignmentCard from "./presets/TechAlignmentCard";
import VelocityCard from "./presets/VelocityCard";
import type { Message } from "../types";
import PresetButtons from "./PresetButtons";
import type {
  DomainTransferAnalysis,
  PresetId,
  ROSynergyAnalysis,
  TechAlignmentAnalysis,
  VelocityAnalysis,
} from "@/lib/llm/preset-analysis-schema";

export type { Message };

interface MessageListProps {
  messages: Message[];
  canAnalyze: boolean;
  loadingAnalysisMessageId: string | null;
  onPresetClick: (preset: string, presetId: PresetId) => void;
}

function AnalysisResult({
  message,
  isLoading,
}: {
  message: Message;
  isLoading: boolean;
}) {
  const t = useTranslations("analysis.generic");
  const analysis = message.analysis;
  const genericAnalysis =
    analysis && "overallMatchScore" in analysis ? analysis : undefined;
  const matchedSkills = genericAnalysis?.matchedSkills ?? [];
  const missingSkills = genericAnalysis?.missingSkills ?? [];
  const fallbackContent = message.content.trim();
  const isPresetAnalysisLoading = Boolean(message.presetId) && !analysis && isLoading;

  if (isPresetAnalysisLoading) {
    return <PresetAnalysisSkeleton />;
  }

  if (!analysis && fallbackContent) {
    return (
      <CareerPanel
        variant="elevated"
        className="whitespace-pre-wrap rounded-lg p-4 text-sm leading-6"
      >
        {fallbackContent}
      </CareerPanel>
    );
  }

  switch (message.presetId) {
    case "tech-alignment":
      return (
        <TechAlignmentCard data={analysis as Partial<TechAlignmentAnalysis>} />
      );
    case "domain-transfer":
      return (
        <DomainTransferCard
          data={analysis as Partial<DomainTransferAnalysis>}
        />
      );
    case "ro-synergy":
      return (
        <FeatureOwnershipCard data={analysis as Partial<ROSynergyAnalysis>} />
      );
    case "velocity":
      return <VelocityCard data={analysis as Partial<VelocityAnalysis>} />;
    default:
      break;
  }

  return (
    <CareerPanel variant="elevated" className="space-y-4 rounded-lg p-4">
      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
          <p className="text-xs text-cyan-700 dark:text-cyan-200">
            {t("fitScore")}
          </p>
          <p className="mt-1 text-3xl font-bold text-cyan-800 dark:text-cyan-100">
            {genericAnalysis?.overallMatchScore ?? "--"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground dark:text-slate-500">
            {t("summary")}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground dark:text-slate-200">
            {genericAnalysis?.summary ?? (message.content || t("analyzing"))}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground dark:text-slate-500">
          {t("matchedSkills")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {matchedSkills.length ? (
            matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground dark:text-slate-500">
              {t("analyzing")}
            </span>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase text-muted-foreground dark:text-slate-500">
          {t("missingSkills")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {missingSkills.length ? (
            missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-200"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground dark:text-slate-500">
              {t("noGapsDetected")}
            </span>
          )}
        </div>
      </div>
    </CareerPanel>
  );
}

export function MessageList({
  messages,
  canAnalyze,
  loadingAnalysisMessageId,
  onPresetClick,
}: MessageListProps) {
  const tCommon = useTranslations("common");

  const renderPresetContent = (presetType: string) => {
    switch (presetType) {
      case "tech-alignment":
        return <TechAlignmentCard />;
      case "domain-transfer":
        return <DomainTransferCard />;
      case "ro-synergy":
        return <FeatureOwnershipCard />;
      case "velocity":
        return <VelocityCard />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-4">
          {message.role === "user" ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted dark:bg-slate-700">
              <User className="h-4 w-4 text-muted-foreground dark:text-slate-300" />
            </div>
          ) : (
            <GradientIcon icon={Bot} className="h-8 w-8" />
          )}

          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground dark:text-slate-100">
                {message.role === "user" ? tCommon("you") : tCommon("aiAgent")}
              </span>
              <span className="text-xs text-muted-foreground dark:text-slate-500">
                {message.timestamp}
              </span>
            </div>

            {message.kind === "quick-actions" ? (
              <CareerPanel variant="elevated" className="rounded-lg p-4">
                <p className="mb-4 text-sm text-foreground dark:text-slate-200">
                  {message.content}
                </p>
                <PresetButtons
                  disabled={!canAnalyze}
                  onPresetClick={onPresetClick}
                />
              </CareerPanel>
            ) : message.kind === "analysis" ? (
              <AnalysisResult
                message={message}
                isLoading={loadingAnalysisMessageId === message.id}
              />
            ) : message.presetType ? (
              renderPresetContent(message.presetType)
            ) : (
              <CareerPanel
                variant="elevated"
                className="whitespace-pre-wrap rounded-lg p-4 text-sm leading-6"
              >
                {message.content}
              </CareerPanel>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MessageList;
