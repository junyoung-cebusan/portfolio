import { ArrowRight, CheckCircle2 } from "lucide-react";

import {
  AnalysisCard,
  AnalysisCardHeader,
  CareerPanel,
  GradientBadge,
  InfoBlock,
} from "@/components/career-ui";
import type { DomainTransferAnalysis } from "@/lib/llm/preset-analysis-schema";

const defaultMappings = [
  {
    pastProject: "CEMS (Component Engineering Management System)",
    jdRequirement: "Scalable web applications & component architecture",
    proof:
      "Built and maintained a large-scale component library used across 50+ projects. Deep understanding of abstraction, reusability, and scalability patterns.",
    strength: 95,
  },
  {
    pastProject: "Data Analytics Dashboard (Real-time metrics)",
    jdRequirement: "Performance optimization & GraphQL APIs",
    proof:
      "Implemented real-time data visualization with optimized rendering strategies. Experience with data fetching patterns and API optimization.",
    strength: 88,
  },
  {
    pastProject: "Cross-functional Team Leadership",
    jdRequirement: "Collaborate with cross-functional teams",
    proof:
      "Led coordination between design, backend, and product teams. Established communication protocols and delivery timelines.",
    strength: 92,
  },
];

type DomainTransferCardProps = {
  data?: Partial<DomainTransferAnalysis>;
};

export function DomainTransferCard({ data }: DomainTransferCardProps) {
  const mappings = data?.mappings?.length ? data.mappings : defaultMappings;

  return (
    <AnalysisCard tone="purple">
      <AnalysisCardHeader
        title="Domain Transfer"
        description={
          data?.summary ??
          "Gap-aware transfer analysis with practical ramp-up proof."
        }
        action={
          <GradientBadge tone="purple">
            {data?.matchLabel ?? "Direct Match"}
          </GradientBadge>
        }
      />

      <div className="space-y-4 p-6">
        {mappings.map((mapping, index) => (
          <CareerPanel
            key={`${mapping.pastProject}-${mapping.jdRequirement}-${index}`}
            tone="purple"
            interactive
            className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-5"
          >
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-600" />

            <div className="mb-4 flex items-start gap-3">
              <div className="flex-1">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {mapping.strength}% Alignment
                </div>
                <h4 className="mb-1 text-sm font-semibold text-slate-200">
                  {mapping.pastProject}
                </h4>
              </div>
            </div>

            <div className="my-3 flex items-center gap-2 text-slate-600">
              <div className="h-px flex-1 bg-slate-700" />
              <ArrowRight className="h-4 w-4" />
              <div className="h-px flex-1 bg-slate-700" />
            </div>

            <InfoBlock label="JD Requirement" className="mb-3">
              <p className="text-sm font-medium text-cyan-400">
                {mapping.jdRequirement}
              </p>
            </InfoBlock>

            <InfoBlock
              label="Correlation Proof"
              labelTone="emerald"
              className="bg-emerald-500/5"
            >
              <p className="text-xs leading-relaxed text-slate-300">
                {mapping.proof}
              </p>
            </InfoBlock>
          </CareerPanel>
        ))}
      </div>
    </AnalysisCard>
  );
}

export default DomainTransferCard;
