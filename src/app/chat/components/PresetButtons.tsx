import { Code, Briefcase, Target, Zap } from "lucide-react";

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
    label: "Tech Alignment",
    description: "Direct JD-to-CV stack overlap with architecture impact proof.",
    tone: "cyan",
  },
  {
    id: "domain-transfer" satisfies PresetId,
    icon: Briefcase,
    label: "Domain Transfer",
    description: "Gap-aware transfer analysis with practical ramp-up proof.",
    tone: "purple",
  },
  {
    id: "ro-synergy" satisfies PresetId,
    icon: Target,
    label: "Feature Ownership",
    description: "End-to-end lifecycle ownership and cross-functional delivery.",
    tone: "emerald",
  },
  {
    id: "velocity" satisfies PresetId,
    icon: Zap,
    label: "Velocity",
    description:
      "Capacity margin and SDLC pipeline acceleration analysis.",
    tone: "amber",
  },
] as const;

export function PresetButtons({ onPresetClick, disabled }: PresetButtonsProps) {
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
          interactive={!disabled}
          className={cn(
            "group relative overflow-hidden bg-slate-800/50 transition-all duration-300",
            "shadow-lg shadow-cyan-500/10",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => onPresetClick?.(preset.label, preset.id)}
            className="relative h-auto w-full justify-start whitespace-normal rounded-xl p-4 text-left hover:bg-transparent"
          >
            <span className="block min-w-0">
              <GradientIcon
                icon={preset.icon}
                tone={preset.tone}
                className="mb-3"
              />
              <span className="mb-1 block text-wrap text-sm font-semibold leading-5 text-slate-100">
                {preset.label}
              </span>
              <span className="block text-wrap text-xs leading-5 text-slate-400">
                {preset.description}
              </span>
            </span>
          </Button>
        </CareerPanel>
      ))}
    </div>
  );
}

export default PresetButtons;
