"use client";

import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-utils";

/**
 * Hook to reset React Query cache for detail analysis queries.
 * Use this when the JD changes to ensure loading states are properly shown.
 */
export function useDetailCacheReset() {
  const queryClient = useQueryClient();

  /**
   * Resets the React Query cache for highlight and graph analysis queries
   * associated with the given JD text.
   * This forces the queries to refetch, showing loading states.
   */
  const resetDetailCache = (jdText: string) => {
    queryClient.resetQueries({
      queryKey: queryKeys.detail.highlight(jdText),
    });
    queryClient.resetQueries({
      queryKey: queryKeys.detail.graph(jdText),
    });
  };

  return { resetDetailCache };
}
