import { useCallback, useRef } from "react";

type ScrollToBottomOptions = {
  behavior?: ScrollBehavior;
};

export function useScrollToBottom<TElement extends HTMLElement>() {
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

  return {
    scrollContainerRef,
    scrollToBottom,
  };
}
