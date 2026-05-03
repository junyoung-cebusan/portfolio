import {
  Zap,
  CheckCircle2,
  Users,
  Code2,
  TestTube,
  Rocket,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  AnalysisCard,
  AnalysisCardHeader,
  CareerPanel,
  GradientBadge,
  GradientIcon,
  InfoBlock,
} from "@/components/career-ui";
import type { VelocityAnalysis } from "@/lib/llm/preset-analysis-schema";
import { cn } from "@/lib/shadcn/utils";

const requirementBars = [
  {
    label: "React.js & Frontend Dev",
    jd_required: 3,
    candidate_actual: 8,
    unit: "Years",
  },
  {
    label: "Leadership / Tech Lead",
    jd_required: 2,
    candidate_actual: 6,
    unit: "Years",
  },
];

const pipelineSteps = [
  {
    id: 1,
    title: "Requirements & Synchronization",
    subtitle: "要件定義・調整",
    jdContext: "Cross-team collaboration and requirement definition",
    accelerator: "FEATURE LEAD EXPERIENCE",
    impact:
      "Spec-in ownership and proactive requirement analysis reduce communication rework caused by misaligned expectations.",
    icon: Users,
    tone: "cyan",
  },
  {
    id: 2,
    title: "Architecture & Implementation",
    subtitle: "設計・実装",
    jdContext: "React.js development and UX improvement",
    accelerator: "8+ YEARS FRONTEND ARCHITECTURE",
    impact:
      "Rapid boilerplate generation, scalable component design, and complex state management significantly shorten implementation time.",
    icon: Code2,
    tone: "purple",
  },
  {
    id: 3,
    title: "Testing & Delivery",
    subtitle: "テスト・運用",
    jdContext: "Testing, maintenance, and CI/CD operations",
    accelerator: "AI-ASSISTED DEV & AUTOMATION",
    impact:
      "Leveraging AI agents (Cursor) for rapid test code generation and utilizing CI/CD pipelines to ensure frictionless deployment.",
    icon: TestTube,
    tone: "emerald",
  },
] as const;

const velocityMultipliers = [
  "Healthcare & B2B Domain Familiarity",
  "Proactive Problem Solving",
  "End-to-End Feature Ownership",
  "Zero Learning Curve",
  "AI-Assisted Workflow (3.5x faster)",
];

type VelocityCardProps = {
  data?: Partial<VelocityAnalysis>;
};

type CapacityRow = {
  label: string;
  jd_required: number;
  candidate_actual: number;
  unit: string;
  rationale?: string;
};

type PipelineStep = {
  id: number;
  title: string;
  subtitle: string;
  jdContext: string;
  accelerator: string;
  impact: string;
  icon: LucideIcon;
  tone: "cyan" | "emerald" | "purple";
};

type BarConfig = ReturnType<typeof calculateBarConfig>;

function calculateBarConfig(jdRequired: number, candidateActual: number) {
  const maxScale = Math.max(jdRequired, candidateActual, 1);
  const jdPercent = (jdRequired / maxScale) * 100;
  const actualPercent = (candidateActual / maxScale) * 100;
  const delta = candidateActual - jdRequired;
  const exactMatch = jdRequired === candidateActual && jdRequired > 0;
  const bothZero = jdRequired === 0 && candidateActual === 0;
  const jdIsZero = jdRequired === 0 && candidateActual > 0;
  const actualIsZero = candidateActual === 0 && jdRequired > 0;
  const actualIsLargerOrEqual = candidateActual >= jdRequired;

  return {
    actualPercent: actualIsZero ? 3 : actualPercent,
    jdPercent: jdIsZero ? 3 : jdPercent,
    delta,
    actualIsLargerOrEqual,
    exactMatch,
    bothZero,
    jdIsZero,
  };
}

function getCapacityStatus(row: CapacityRow, config: BarConfig) {
  if (row.rationale) {
    return row.rationale;
  }

  if (config.bothZero) {
    return `No comparable ${row.unit.toLowerCase()} requirement provided`;
  }

  if (config.exactMatch) {
    return `Exact Match: ${row.candidate_actual} ${row.unit}`;
  }

  if (config.jdIsZero) {
    return `No explicit JD baseline / candidate has ${row.candidate_actual} ${row.unit}`;
  }

  if (config.delta >= 0) {
    return `+${config.delta.toFixed(1)} ${row.unit} Efficiency Surplus`;
  }

  return `${Math.abs(config.delta).toFixed(1)} ${row.unit} Learning Gap`;
}

function getCapacityTone(config: BarConfig) {
  if (config.bothZero) {
    return "text-muted-foreground dark:text-slate-400";
  }

  return config.delta >= 0
    ? "text-cyan-700 dark:text-cyan-400"
    : "text-amber-600 dark:text-amber-400";
}

function mapPipelineSteps(data?: Partial<VelocityAnalysis>): PipelineStep[] {
  if (data?.widget2_pipeline?.length !== 3) {
    return [...pipelineSteps];
  }

  return data.widget2_pipeline.map((step, index) => {
    const fallback = pipelineSteps[index];

    return {
      id: index + 1,
      title: step.stage,
      jdContext: step.jd_context,
      accelerator: step.accelerator_title,
      impact: step.impact,
      subtitle: fallback?.subtitle ?? "",
      icon: fallback?.icon ?? Users,
      tone: fallback?.tone ?? "cyan",
    };
  });
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5 text-cyan-700 dark:text-cyan-400" />}
      <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground dark:text-slate-300">
        {title}
      </h4>
    </div>
  );
}

function CapacityLegend({ row }: { row: CapacityRow }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-sm bg-slate-300 ring-1 ring-slate-400 dark:bg-slate-700 dark:ring-slate-600" />
        <span className="text-muted-foreground dark:text-slate-500">
          JD:{" "}
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            {row.jd_required} {row.unit}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-sm bg-gradient-to-r from-cyan-500 to-blue-600 shadow-sm shadow-cyan-500/50" />
        <span className="font-bold text-cyan-700 dark:text-cyan-400">
          Actual:{" "}
          <span className="text-cyan-700 dark:text-cyan-300">
            {row.candidate_actual} {row.unit}
          </span>
        </span>
      </div>
    </div>
  );
}

function CapacityBar({
  config,
  status,
}: {
  config: BarConfig;
  status: string;
}) {
  if (config.bothZero) {
    return (
      <div className="flex h-full items-center justify-center text-xs font-medium text-muted-foreground dark:text-slate-500">
        No comparable data
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "absolute left-0 top-0 h-12 rounded-lg bg-slate-300/85 ring-1 ring-slate-400/70 transition-all duration-700 dark:bg-slate-700/75 dark:ring-slate-600/70",
          config.exactMatch && "hidden",
          config.jdIsZero
            ? "z-20"
            : config.actualIsLargerOrEqual
              ? "z-10"
              : "z-0",
        )}
        style={{ width: `${config.jdPercent}%` }}
      >
        {config.jdPercent > 18 && (
          <div className="flex h-full items-center justify-center px-3 text-xs font-medium text-slate-700 dark:text-slate-300">
            JD Requirement
          </div>
        )}
      </div>

      <div
        aria-label={status}
        className={cn(
          "absolute left-0 top-0 h-12 rounded-lg bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/50 ring-1 ring-cyan-300/60 transition-all duration-700",
          config.actualIsLargerOrEqual || config.exactMatch ? "z-0" : "z-10",
        )}
        style={{ width: `${config.actualPercent}%` }}
      >
        {config.actualPercent > 18 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-xs font-bold text-white drop-shadow-lg">
            Actual
          </div>
        )}
      </div>
    </>
  );
}

function CapacityComparison({ rows }: { rows: CapacityRow[] }) {
  return (
    <InfoBlock className="p-6">
      <SectionTitle title="Requirement vs. Capacity" />
      <div className="space-y-6">
        {rows.map((row) => {
          const config = calculateBarConfig(
            row.jd_required,
            row.candidate_actual,
          );
          const status = getCapacityStatus(row, config);

          return (
            <div
              key={`${row.label}-${row.jd_required}-${row.candidate_actual}`}
            >
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                <span className="text-sm font-medium text-foreground dark:text-slate-300">
                  {row.label}
                </span>
                <CapacityLegend row={row} />
              </div>

              <div className="relative h-12 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-300 dark:bg-slate-800/80 dark:ring-slate-700">
                <CapacityBar config={config} status={status} />
              </div>

              <p
                className={cn(
                  "mt-3 flex items-center gap-1 text-xs font-medium",
                  getCapacityTone(config),
                )}
              >
                <Zap className="h-3 w-3" />
                {status}
              </p>
            </div>
          );
        })}
      </div>
    </InfoBlock>
  );
}

function Pipeline({ steps }: { steps: PipelineStep[] }) {
  return (
    <InfoBlock className="p-6">
      <SectionTitle title="Accelerated JD Workflow (SDLC)" />
      <div className="relative space-y-4">
        <div className="absolute bottom-8 left-6 top-8 w-px bg-gradient-to-b from-cyan-500/60 via-slate-300 to-emerald-500/50 dark:via-slate-600" />
        {steps.map((step) => (
          <div key={step.id} className="relative flex gap-4">
            <GradientIcon
              icon={step.icon}
              tone={step.tone}
              className="relative z-10 h-12 w-12 ring-4 ring-background dark:ring-slate-950"
            />

            <CareerPanel
              tone={step.tone}
              interactive
              className="flex-1 border-blue-500/20 bg-blue-50 p-5 shadow-lg shadow-blue-500/10 hover:bg-blue-100/70 dark:bg-blue-950/25 dark:shadow-blue-950/30 dark:hover:bg-blue-950/35"
            >
              <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h5 className="text-base font-semibold text-foreground dark:text-slate-100">
                  {step.title}
                </h5>
                {step.subtitle && (
                  <span className="text-xs text-muted-foreground dark:text-slate-500">
                    {step.subtitle}
                  </span>
                )}
              </div>

              <InfoBlock label="JD Context" className="mb-3">
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  {step.jdContext}
                </p>
              </InfoBlock>

              <InfoBlock tone="cyan" variant="tinted">
                <div className="mb-1 flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-cyan-700 dark:text-cyan-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                    Velocity Accelerator: {step.accelerator}
                  </p>
                </div>
                <p className="text-sm font-medium leading-relaxed text-foreground dark:text-slate-200">
                  {step.impact}
                </p>
              </InfoBlock>
            </CareerPanel>
          </div>
        ))}
      </div>
    </InfoBlock>
  );
}

function VelocityMultipliers({
  multipliers,
  note,
}: {
  multipliers: string[];
  note?: string;
}) {
  return (
    <InfoBlock className="p-6">
      <SectionTitle icon={Sparkles} title="Key Velocity Multipliers" />
      <div className="grid gap-2 sm:grid-cols-2">
        {multipliers.map((multiplier, index) => (
          <CareerPanel
            key={`${multiplier}-${index}`}
            tone="cyan"
            variant="soft"
            className="flex min-h-11 items-center gap-2 px-4 py-2 text-sm font-medium text-cyan-700 shadow-lg shadow-cyan-500/10 dark:text-cyan-300"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
            <span>{multiplier}</span>
          </CareerPanel>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground dark:text-slate-400">
        {note ?? (
          <>
            These factors indicate a{" "}
            <span className="font-semibold text-cyan-700 dark:text-cyan-400">
              fast onboarding process
            </span>{" "}
            and{" "}
            <span className="font-semibold text-cyan-700 dark:text-cyan-400">
              high throughput
            </span>
            , reducing management overhead and dependency delays.
          </>
        )}
      </p>
    </InfoBlock>
  );
}

export function VelocityCard({ data }: VelocityCardProps) {
  const capacityRows = data?.widget1_capacity?.length
    ? data.widget1_capacity
    : requirementBars;
  const mappedPipelineSteps = mapPipelineSteps(data);
  const multipliers = data?.widget3_multipliers?.length
    ? data.widget3_multipliers
    : velocityMultipliers;

  return (
    <AnalysisCard tone="cyan">
      <AnalysisCardHeader
        title={"Velocity"}
        description={
          data?.workflowSummary ??
          "Capacity margin and SDLC pipeline acceleration analysis."
        }
        action={
          <GradientBadge tone="cyan" icon={Zap}>
            {data?.velocityLabel ?? "High Velocity"}
          </GradientBadge>
        }
      />

      <div className="space-y-6 p-6">
        <CapacityComparison rows={capacityRows} />
        <Pipeline steps={mappedPipelineSteps} />
        <VelocityMultipliers
          multipliers={multipliers}
          note={data?.overallSynergyNote}
        />
      </div>
    </AnalysisCard>
  );
}

export default VelocityCard;
