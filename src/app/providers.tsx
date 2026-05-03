"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@wrksz/themes";
import { useState, type ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AppLocaleProvider } from "@/lib/i18n/use-app-locale";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppLocaleProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        enableColorScheme={false}
      >
        <QueryClientProvider client={queryClient}>
          <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppLocaleProvider>
  );
}
