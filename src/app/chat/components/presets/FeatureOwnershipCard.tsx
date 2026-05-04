import { Target, Users, Calendar, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

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

type FeatureOwnershipCardProps = {
  data?: Partial<ROSynergyAnalysis>;
};

export function FeatureOwnershipCard({ data }: FeatureOwnershipCardProps) {
  const tCategory = useTranslations("analysis.categories.featureOwnership");
  const tPreset = useTranslations("analysis.presets");
  const roAreas = data?.areas?.length ? data.areas : null;

  return (
    <AnalysisCard tone="emerald">
      <AnalysisCardHeader
        title={tCategory("title")}
        description={data?.summary ?? tCategory("description")}
        action={
          <GradientBadge tone="emerald">
            {data?.fitLabel ?? tPreset("strongFit")}
          </GradientBadge>
        }
      />

      <div className="p-6">
        <CareerPanel tone="emerald" variant="soft" className="mb-6 p-4">
          <p className="text-sm leading-relaxed text-foreground dark:text-slate-300">
            <ToneText tone="emerald" className="font-semibold">
              {data?.fitLabel ?? tPreset("strongAlignment")}
            </ToneText>{" "}
            {data?.summary ?? tPreset("defaultOwnershipSummary")}
          </p>
        </CareerPanel>

        <div className="space-y-4">
          {roAreas?.map((area, index) => {
            const AreaIcon = areaIcons[index % areaIcons.length];

            return (
              <CareerPanel
                key={area.title}
                tone="emerald"
                variant="elevated"
                interactive
                className="p-5"
              >
                <div className="mb-3 flex items-start gap-4">
                  <GradientIcon
                    icon={AreaIcon}
                    tone="emerald"
                    className="h-12 w-12"
                  />
                  <div className="flex-1">
                    <h4 className="mb-1 text-base font-semibold text-foreground dark:text-slate-100">
                      {area.title}
                    </h4>
                    <p className="text-sm text-muted-foreground dark:text-slate-400">
                      {area.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <ToneText tone="emerald" className="text-2xl font-bold">
                      {area.alignment}%
                    </ToneText>
                    <div className="text-xs text-muted-foreground dark:text-slate-500">
                      {tPreset("alignmentLabel")}
                    </div>
                  </div>
                </div>

                <ProgressMeter
                  value={area.alignment}
                  tone="emerald"
                  className="mb-3"
                />

                <InfoBlock label={tPreset("evidence")}>
                  <p className="mt-1 text-sm text-foreground dark:text-slate-300">
                    {area.evidence}
                  </p>
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
