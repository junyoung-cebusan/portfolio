import { CheckCircle2, Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

import {
  AnalysisCard,
  AnalysisCardHeader,
  CareerPanel,
  GradientBadge,
  InfoBlock,
  LegendItem,
} from "@/components/career-ui";
import type { TechAlignmentAnalysis } from "@/lib/llm/preset-analysis-schema";

const defaultRadarData = [
  { skill: "React", yourLevel: 95, required: 90 },
  { skill: "TypeScript", yourLevel: 90, required: 85 },
  { skill: "Next.js", yourLevel: 85, required: 80 },
  { skill: "Node.js", yourLevel: 80, required: 70 },
  { skill: "GraphQL", yourLevel: 65, required: 75 },
  { skill: "Testing", yourLevel: 90, required: 80 },
];

const defaultTechStack = [
  { name: "React (8 years)", ready: true },
  { name: "TypeScript (8 years)", ready: true },
  { name: "Next.js App Router (4 years)", ready: true },
  { name: "Zustand/Redux (6 years)", ready: true },
  { name: "GraphQL (2 years)", ready: false, note: "Growing expertise" },
  { name: "Jest/Testing Library (7 years)", ready: true },
];

type TechAlignmentCardProps = {
  data?: Partial<TechAlignmentAnalysis>;
};

function normalizeRadarValue(value: number, scale: number) {
  return Math.max(0, Math.min(100, Math.round(value * scale)));
}

function normalizeRadarData(data: TechAlignmentAnalysis["radarData"]) {
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.yourLevel, item.required]),
  );
  const scale = maxValue <= 10 ? 10 : maxValue <= 20 ? 5 : 1;

  return data.map((item) => ({
    ...item,
    yourLevel: normalizeRadarValue(item.yourLevel, scale),
    required: normalizeRadarValue(item.required, scale),
  }));
}

export function TechAlignmentCard({ data }: TechAlignmentCardProps) {
  const tCategory = useTranslations("analysis.categories.techAlignment");
  const tPreset = useTranslations("analysis.presets");
  const radarData = normalizeRadarData(
    data?.radarData?.length ? data.radarData : defaultRadarData,
  );
  const techStack = data?.techStack?.length ? data.techStack : defaultTechStack;

  return (
    <AnalysisCard tone="cyan">
      <AnalysisCardHeader
        title={tCategory("title")}
        description={
          data?.summary ??
          tCategory("description")
        }
        action={
          <GradientBadge tone="emerald">
            {tPreset("match", { score: String(data?.matchScore ?? "--") })}
          </GradientBadge>
        }
      />

      <div className="p-6">
        <InfoBlock className="mb-6 p-6">
          <h4 className="mb-4 text-sm font-semibold text-foreground dark:text-slate-300">
            {tPreset("skillsComparison")}
          </h4>
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={radarData}
                cx="50%"
                cy="50%"
                outerRadius="92%"
                margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
              >
                <PolarGrid stroke="var(--analysis-chart-grid)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "var(--analysis-chart-label)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "var(--analysis-chart-muted)", fontSize: 11 }}
                  tickCount={6}
                />
                <Radar
                  name={tPreset("actual")}
                  dataKey="yourLevel"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
                <Radar
                  name={tPreset("jdRequirement")}
                  dataKey="required"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <LegendItem tone="cyan" label={tPreset("actual")} />
            <LegendItem tone="emerald" label={tPreset("jdRequirement")} />
          </div>
        </InfoBlock>

        <InfoBlock className="p-6">
          <h4 className="mb-4 text-sm font-semibold text-foreground dark:text-slate-300">
            {tPreset("readyTechStack")}
          </h4>
          <div className="space-y-2">
            {techStack.map((tech) => (
              <CareerPanel
                key={tech.name}
                variant="elevated"
                className="flex items-center gap-3 rounded-lg p-3"
              >
                {tech.ready ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-amber-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground dark:text-slate-200">
                    {tech.name}
                  </p>
                  {tech.note && (
                    <p className="text-xs text-muted-foreground dark:text-slate-500">
                      {tech.note}
                    </p>
                  )}
                </div>
              </CareerPanel>
            ))}
          </div>
        </InfoBlock>
      </div>
    </AnalysisCard>
  );
}

export default TechAlignmentCard;
