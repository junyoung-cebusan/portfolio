import { useCallback, useEffect, useRef } from "react";

type ScrollToBottomOptions = {
  behavior?: ScrollBehavior;
};

type UseScrollToBottomOptions = {
  scrollOnMountWhen?: boolean;
};

export function useScrollToBottom<TElement extends HTMLElement>({
  scrollOnMountWhen = false,
}: UseScrollToBottomOptions = {}) {
  const scrollContainerRef = useRef<TElement>(null);

  const scrollToBottom = useCallback(
    ({ behavior = "smooth" }: ScrollToBottomOptions = {}) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const scrollContainer = scrollContainerRef.current;
          if (!scrollContainer) return;

          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior,
          });
        });
      });
    },
    [],
  );

  useEffect(() => {
    if (!scrollOnMountWhen) return;

    scrollToBottom({ behavior: "auto" });
  }, [scrollOnMountWhen, scrollToBottom]);

  return {
    scrollContainerRef,
    scrollToBottom,
  };
}
