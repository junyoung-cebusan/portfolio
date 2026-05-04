import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { EmptyHero } from "@/components/career-ui";

import PresetButtons from "./PresetButtons";
import type { PresetId } from "@/lib/llm/preset-analysis-schema";

interface EmptyChatAreaProps {
  hasJDContext: boolean;
  onPresetClick: (preset: string, presetId: PresetId) => void;
}

const portfolioLink = (chunks: React.ReactNode) => (
  <a
    href="https://github.com/junyoung-cebusan/portfolio"
    target="_blank"
    rel="noopener noreferrer"
    className="underline hover:text-cyan-800 dark:hover:text-cyan-200"
  >
    {chunks}
  </a>
);

export function EmptyChatArea({
  hasJDContext,
  onPresetClick,
}: EmptyChatAreaProps) {
  const tChat = useTranslations("chat");
  const tCommon = useTranslations("common");

  const guidanceTitle = hasJDContext
    ? tChat("guidanceDetected")
    : tChat("guidanceStart");
  const guidanceHint = hasJDContext
    ? tChat("hintActive")
    : tChat("hintInactive");

  return (
    <EmptyHero
      icon={Sparkles}
      title={tCommon("aiCareerAgent")}
      description={tChat.rich("heroDescription", { link: portfolioLink })}
      className="h-auto min-h-full justify-start py-8 sm:justify-center"
    >
      <div className="mb-5 text-center">
        <p className="text-base font-semibold text-foreground dark:text-slate-100">
          {guidanceTitle}
        </p>
        <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400">
          {guidanceHint}
        </p>
        <p className="mx-auto mt-4 max-w-2xl rounded-md border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-700 shadow-sm shadow-cyan-950/10 dark:text-cyan-100 dark:shadow-cyan-950/20">
          {tChat.rich("privacy", { link: portfolioLink })}
        </p>
      </div>
      <PresetButtons
        disabled={!hasJDContext}
        onPresetClick={(preset, presetId) =>
          void onPresetClick(preset, presetId)
        }
      />
    </EmptyHero>
  );
}
