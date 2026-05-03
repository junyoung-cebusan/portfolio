import { Target, Users, Calendar, TrendingUp } from "lucide-react";

import {
  AnalysisCard,
  AnalysisCardHeader,
  CareerPanel,
  GradientBadge,
  GradientIcon,
  InfoBlock,
  ProgressMeter,
  ToneText,
} from "@/components/career-ui";
import type { ROSynergyAnalysis } from "@/lib/llm/preset-analysis-schema";

const areaIcons = [Target, Users, Calendar, TrendingUp] as const;

const defaultROAreas = [
  {
    icon: Target,
    title: "Requirement Ownership",
    description: "Owned spec-in clarification through delivery decisions",
    alignment: 95,
    evidence:
      "Translated ambiguous requirements into executable scope, schedules, and implementation plans.",
  },
  {
    icon: Users,
    title: "Cross-functional Coordination",
    description: "Managed dependencies across design, backend, QA, and product",
    alignment: 92,
    evidence:
      "Coordinated stakeholder feedback and dependency resolution without waiting for handoffs.",
  },
  {
    icon: Calendar,
    title: "Lifecycle Delivery",
    description: "Carried feature work from planning through release",
    alignment: 88,
    evidence:
      "Maintained delivery plans while following implementation, testing, and deployment readiness.",
  },
  {
    icon: TrendingUp,
    title: "Lead-level Execution Fit",
    description: "Balanced technical depth with ownership accountability",
    alignment: 90,
    evidence:
      "Mentored developers, set team practices, and stayed accountable for outcome quality.",
  },
];

type FeatureOwnershipCardProps = {
  data?: Partial<ROSynergyAnalysis>;
};

export function FeatureOwnershipCard({ data }: FeatureOwnershipCardProps) {
  const roAreas = data?.areas?.length ? data.areas : defaultROAreas;

  return (
    <AnalysisCard tone="emerald">
      <AnalysisCardHeader
        title="Feature Ownership"
        description={
          data?.summary ??
          "End-to-end lifecycle ownership and cross-functional delivery."
        }
        action={<GradientBadge tone="emerald">{data?.fitLabel ?? "Strong Fit"}</GradientBadge>}
      />

      <div className="p-6">
        <CareerPanel className="mb-6 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-4">
          <p className="text-sm leading-relaxed text-slate-300">
            <ToneText tone="emerald" className="font-semibold">
              {data?.fitLabel ?? "Strong alignment"}
            </ToneText>{" "}
            {data?.summary ??
              "for senior roles requiring independent decision-making. Your experience matches self-directed leadership and cross-functional coordination."}
          </p>
        </CareerPanel>

        <div className="space-y-4">
          {roAreas.map((area, index) => {
            const AreaIcon = areaIcons[index % areaIcons.length];

            return (
            <CareerPanel
              key={area.title}
              tone="emerald"
              interactive
              className="bg-slate-800/50 p-5"
            >
              <div className="mb-3 flex items-start gap-4">
                <GradientIcon
                  icon={AreaIcon}
                  tone="emerald"
                  className="h-12 w-12"
                />
                <div className="flex-1">
                  <h4 className="mb-1 text-base font-semibold text-slate-100">
                    {area.title}
                  </h4>
                  <p className="text-sm text-slate-400">{area.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">
                    {area.alignment}%
                  </div>
                  <div className="text-xs text-slate-500">Alignment</div>
                </div>
              </div>

              <ProgressMeter value={area.alignment} tone="emerald" className="mb-3" />

              <InfoBlock label="Evidence">
                <p className="mt-1 text-sm text-slate-300">{area.evidence}</p>
              </InfoBlock>
            </CareerPanel>
            );
          })}
        </div>
      </div>
    </AnalysisCard>
  );
}

export default FeatureOwnershipCard;
