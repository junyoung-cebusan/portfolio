import { Code, Briefcase, Target, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

import { CareerPanel, GradientIcon } from "@/components/career-ui";
import { Button } from "@/components/button";
import type { PresetId } from "@/lib/llm/preset-analysis-schema";
import { cn } from "@/lib/shadcn/utils";

interface PresetButtonsProps {
  onPresetClick?: (preset: string, presetId: PresetId) => void;
  disabled?: boolean;
}

const presets = [
  {
    id: "tech-alignment" satisfies PresetId,
    icon: Code,
    labelKey: "techAlignment.title",
    descriptionKey: "techAlignment.description",
    tone: "cyan",
  },
  {
    id: "domain-transfer" satisfies PresetId,
    icon: Briefcase,
    labelKey: "domainTransfer.title",
    descriptionKey: "domainTransfer.description",
    tone: "purple",
  },
  {
    id: "ownership" satisfies PresetId,
    icon: Target,
    labelKey: "featureOwnership.title",
    descriptionKey: "featureOwnership.description",
    tone: "emerald",
  },
  {
    id: "velocity" satisfies PresetId,
    icon: Zap,
    labelKey: "velocity.title",
    descriptionKey: "velocity.description",
    tone: "amber",
  },
] as const;

export function PresetButtons({ onPresetClick, disabled }: PresetButtonsProps) {
  const t = useTranslations("analysis.categories");

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 transition-all duration-300",
        disabled && "pointer-events-none",
      )}
      aria-disabled={disabled}
    >
      {presets.map((preset) => (
        <CareerPanel
          key={preset.id}
          tone={preset.tone}
          variant="elevated"
          interactive={!disabled}
          className="group relative overflow-hidden transition-all duration-300"
        >
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => onPresetClick?.(t(preset.labelKey), preset.id)}
            className="relative h-auto w-full justify-start whitespace-normal rounded-xl p-4 text-left hover:bg-transparent"
          >
            <span className="block min-w-0">
              <GradientIcon
                icon={preset.icon}
                tone={preset.tone}
                className="mb-3"
              />
              <span className="mb-1 block text-wrap text-sm font-semibold leading-5 text-foreground dark:text-slate-100">
                {t(preset.labelKey)}
              </span>
              <span className="block text-wrap text-xs leading-5 text-muted-foreground dark:text-slate-400">
                {t(preset.descriptionKey)}
              </span>
            </span>
          </Button>
        </CareerPanel>
      ))}
    </div>
  );
}

export default PresetButtons;
