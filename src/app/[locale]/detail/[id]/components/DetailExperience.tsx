"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Network, TextSelect } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { AppHeader, CareerShell } from "@/components/career-ui";
import { HeaderDisplayTools } from "@/components/header-display-tools";
import { Switch } from "@/components/switch";
import { cn } from "@/lib/shadcn/utils";

import {
  getEmptyDetailJDSnapshot,
  getServerDetailSnapshot,
  getStoredDetailSnapshot,
  parseDetailJDSnapshot,
  subscribeToDetailStorage,
} from "../utils/detailSessionStorage";
import { GraphView } from "./GraphView";
import GraphViewSkeleton from "./GraphViewSkeleton";
import { TextView } from "./TextView";
import { TextViewSkeleton } from "./TextViewSkeleton";
import {
  useHighlightAnalysisQuery,
  useGraphAnalysisQuery,
} from "../hooks/useDetailAnalysisQuery";
import { useClientHydration } from "@/app/[locale]/chat/hooks/useClientHydration";

export function DetailExperience() {
  const t = useTranslations("common");
  const [isGraphView, setIsGraphView] = useState(false);

  const storedSnapshot = useClientHydration(
    subscribeToDetailStorage,
    getStoredDetailSnapshot,
    getServerDetailSnapshot,
  );
  const snapshot = useMemo(
    () => parseDetailJDSnapshot(storedSnapshot) ?? getEmptyDetailJDSnapshot(),
    [storedSnapshot],
  );

  const jdText = snapshot.jdText;

  const highlightQuery = useHighlightAnalysisQuery(jdText);
  const graphQuery = useGraphAnalysisQuery(jdText);

  const highlightResults = highlightQuery.data ?? [];
  const graphResults = graphQuery.data;

  return (
    <CareerShell className="flex h-dvh flex-col overflow-hidden">
      <AppHeader className="shrink-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Button
            asChild
            variant="ghost"
            className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <Link href="/chat">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden font-medium sm:inline">
                {t("backToChat")}
              </span>
            </Link>
          </Button>

          <div
            className="flex items-center gap-3 rounded-lg border border-border bg-card/80 px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none"
            aria-label={t("detailViewMode")}
          >
            <TextSelect
              className={cn(
                "h-4 w-4",
                isGraphView
                  ? "text-muted-foreground dark:text-slate-500"
                  : "text-emerald-700 dark:text-emerald-400",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                isGraphView
                  ? "text-muted-foreground dark:text-slate-500"
                  : "text-emerald-700 dark:text-emerald-400",
              )}
            >
              {t("text")}
            </span>
            <Switch
              variant="viewMode"
              checked={isGraphView}
              onCheckedChange={setIsGraphView}
              aria-label={t("detailViewMode")}
              className="h-6 w-11"
            />
            <span
              className={cn(
                "text-sm font-medium",
                isGraphView
                  ? "text-cyan-700 dark:text-cyan-400"
                  : "text-muted-foreground dark:text-slate-500",
              )}
            >
              {t("graph")}
            </span>
            <Network
              className={cn(
                "h-4 w-4",
                isGraphView
                  ? "text-cyan-700 dark:text-cyan-400"
                  : "text-muted-foreground dark:text-slate-500",
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <HeaderDisplayTools />
          </div>
        </div>
      </AppHeader>

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
        <div className="mx-auto mb-6 w-full max-w-4xl shrink-0">
          <p className="text-xs font-medium uppercase text-muted-foreground dark:text-slate-500">
            {t("currentJd")}
          </p>
          <div className="mt-1 flex items-center justify-between gap-4">
            <h1 className="truncate text-xl font-semibold text-foreground dark:text-slate-100">
              {snapshot.title === "No Job Description"
                ? t("noJobDescription")
                : snapshot.title === "Current Job Description"
                  ? t("currentJobDescription")
                  : snapshot.title}
            </h1>
          </div>
        </div>

        <div className="flex min-w-0 min-h-0 w-full flex-1 transition-all duration-300 ease-out">
          {isGraphView ? (
            <section className="flex min-w-0 min-h-0 w-full flex-1 animate-in fade-in duration-300">
              {graphQuery.isFetching ? (
                <GraphViewSkeleton />
              ) : (
                <GraphView
                  nodes={graphResults?.nodes ?? []}
                  edges={graphResults?.edges ?? []}
                />
              )}
            </section>
          ) : (
            <section className="flex min-w-0 min-h-0 w-full flex-1 animate-in fade-in duration-300">
              {highlightQuery.isFetching ? (
                <TextViewSkeleton />
              ) : (
                <TextView jdText={jdText} results={highlightResults} />
              )}
            </section>
          )}
        </div>
      </main>
    </CareerShell>
  );
}
