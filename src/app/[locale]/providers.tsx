"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@wrksz/themes";
import { useState, type ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { Locale, Messages } from "@/lib/i18n/messages";
import { NextIntlClientProvider } from "next-intl";

type ProvidersProps = {
  children: ReactNode;
  locale: Locale;
  messages: Messages;
};

export function Providers({ children, locale, messages }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <QueryClientProvider client={queryClient}>
          <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
