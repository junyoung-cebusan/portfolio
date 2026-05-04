"use client";

import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/react-query/query-utils";
import type { Locale } from "@/lib/i18n/messages";

/**
 * Hook to reset React Query cache for detail analysis queries.
 * Use this when the JD changes to ensure loading states are properly shown.
 */
export function useDetailCacheReset() {
  const queryClient = useQueryClient();

  /**
   * Resets the React Query cache for highlight and graph analysis queries
   * associated with the given JD text and locale.
   * This forces the queries to refetch, showing loading states.
   */
  const resetDetailCache = (jdText: string, locale: Locale) => {
    queryClient.resetQueries({
      queryKey: queryKeys.detail.highlight(jdText, locale),
    });
    queryClient.resetQueries({
      queryKey: queryKeys.detail.graph(jdText, locale),
    });
  };

  return { resetDetailCache };
}
