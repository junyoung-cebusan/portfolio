import {
  CareerPanel,
  CareerSkeleton,
  StatusPill,
} from "@/components/career-ui";
import { cn } from "@/lib/shadcn/utils";

export function TextViewSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex shrink-0 flex-col items-start justify-between gap-2 pb-2 sm:flex-row sm:gap-4">
        <CareerSkeleton className="h-8 w-36" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <StatusPill key={index} tone="slate">
              <CareerSkeleton className="h-3 w-14 bg-slate-300 dark:bg-slate-600" />
            </StatusPill>
          ))}
        </div>
      </div>

      <CareerPanel className="min-h-0 flex-1 overflow-hidden rounded-2xl p-8">
        <div className="space-y-3">
          {Array.from({ length: 16 }).map((_, index) => (
            <CareerSkeleton
              key={index}
              className={cn(
                "h-4",
                index % 7 === 0
                  ? "w-3/5"
                  : index % 5 === 0
                    ? "w-4/5"
                    : "w-full",
              )}
            />
          ))}
        </div>
      </CareerPanel>

      <CareerPanel tone="cyan" variant="soft" className="mt-6 shrink-0 p-4">
        <CareerSkeleton className="h-4 w-64 max-w-full" />
      </CareerPanel>
    </div>
  );
}

export default TextViewSkeleton;
