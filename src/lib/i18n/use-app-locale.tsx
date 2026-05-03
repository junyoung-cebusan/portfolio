"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";

import { defaultLocale, isLocale, messages, type Locale } from "./messages";

type AppLocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const AppLocaleContext = createContext<AppLocaleContextValue | null>(null);
const LOCALE_STORAGE_KEY = "young-portfolio:locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(storedLocale) ? storedLocale : defaultLocale;
}

type AppLocaleProviderProps = {
  children: ReactNode;
};

export function AppLocaleProvider({ children }: AppLocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const value = useMemo<AppLocaleContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => {
        setLocaleState(nextLocale);
        window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        document.documentElement.lang = nextLocale;
      },
    }),
    [locale],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <AppLocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </AppLocaleContext.Provider>
  );
}

export function useAppLocale() {
  const context = useContext(AppLocaleContext);

  if (!context) {
    throw new Error("useAppLocale must be used within AppLocaleProvider.");
  }

  return context;
}
