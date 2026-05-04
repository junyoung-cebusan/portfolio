import {
  AnalysisCard,
  AnalysisCardHeader,
  CareerPanel,
  CareerSkeleton,
} from "@/components/career-ui";

export function PresetAnalysisSkeleton() {
  return (
    <AnalysisCard tone="slate" aria-busy="true" aria-live="polite">
      <AnalysisCardHeader
        title="Analyzing"
        description="Generating role-fit analysis..."
        action={<CareerSkeleton className="h-7 w-28 rounded-full" />}
      />

      <div className="space-y-4 p-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <CareerPanel key={index} variant="elevated" className="p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <CareerSkeleton className="h-4 w-32" />
                <CareerSkeleton className="h-5 w-3/4" />
              </div>
              <CareerSkeleton className="h-10 w-10 rounded-lg" />
            </div>

            <CareerSkeleton className="mb-2 h-4 w-full" />
            <CareerSkeleton className="mb-4 h-4 w-5/6" />

            <div className="rounded-lg bg-muted/50 p-3 dark:bg-slate-950/50">
              <CareerSkeleton className="mb-2 h-3 w-24" />
              <CareerSkeleton className="h-4 w-full" />
            </div>
          </CareerPanel>
        ))}
      </div>
    </AnalysisCard>
  );
}

export default PresetAnalysisSkeleton;
