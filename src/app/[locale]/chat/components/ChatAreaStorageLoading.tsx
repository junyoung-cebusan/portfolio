import { CareerSkeleton } from "@/components/career-ui";

export function ChatAreaStorageLoading() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm" aria-busy="true" aria-live="polite">
        <CareerSkeleton className="mx-auto mb-5 h-12 w-12 rounded-xl" />
        <CareerSkeleton className="mx-auto mb-3 h-5 w-44" />
        <CareerSkeleton className="mx-auto h-4 w-64 max-w-full" />
      </div>
    </div>
  );
}

export default ChatAreaStorageLoading;
