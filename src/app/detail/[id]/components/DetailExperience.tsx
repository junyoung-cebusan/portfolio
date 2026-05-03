"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Network, TextSelect } from "lucide-react";

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
import { TextView } from "./TextView";
import { useDetailAnalysisQuery } from "../hooks/useDetailAnalysisQuery";

export function DetailExperience() {
  const [isGraphView, setIsGraphView] = useState(false);
  const storedSnapshot = useSyncExternalStore(
    subscribeToDetailStorage,
    getStoredDetailSnapshot,
    getServerDetailSnapshot,
  );
  const snapshot = useMemo(
    () => parseDetailJDSnapshot(storedSnapshot) ?? getEmptyDetailJDSnapshot(),
    [storedSnapshot],
  );
  const textAnalysisQuery = useDetailAnalysisQuery(snapshot.jdText);
  const results = textAnalysisQuery.data ?? [];

  return (
    <CareerShell className="flex h-dvh flex-col overflow-hidden">
      <AppHeader className="shrink-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Button
            asChild
            variant="ghost"
            className="rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <Link href="/chat">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden font-medium sm:inline">Back to Chat</span>
            </Link>
          </Button>

          <div
            className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
            aria-label="Detail view mode"
          >
            <TextSelect
              className={cn(
                "h-4 w-4",
                isGraphView ? "text-slate-500" : "text-emerald-400",
              )}
            />
            <span
              className={cn(
                "text-sm",
                isGraphView ? "text-slate-500" : "text-slate-200",
              )}
            >
              Text
            </span>
            <Switch
              checked={isGraphView}
              onCheckedChange={setIsGraphView}
              aria-label="Toggle graph view"
              className="h-6 w-11 bg-slate-700 data-[state=checked]:bg-cyan-500"
            />
            <span
              className={cn(
                "text-sm",
                isGraphView ? "text-slate-200" : "text-slate-500",
              )}
            >
              Graph
            </span>
            <Network
              className={cn(
                "h-4 w-4",
                isGraphView ? "text-cyan-400" : "text-slate-500",
              )}
            />
          </div>

          <HeaderDisplayTools />
        </div>
      </AppHeader>

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
        <div className="mx-auto mb-6 w-full max-w-4xl shrink-0">
          <p className="text-xs font-medium uppercase text-slate-500">
            Current JD
          </p>
          <div className="mt-1 flex items-center justify-between gap-4">
            <h1 className="truncate text-xl font-semibold text-slate-100">
              {snapshot.title}
            </h1>
            <span className="shrink-0 text-xs text-slate-500">
              {textAnalysisQuery.isFetching
                ? "Running text analysis..."
                : "Analysis ready"}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 transition-all duration-300 ease-out">
          {isGraphView ? (
            <section className="flex min-h-0 flex-1 animate-in fade-in duration-300">
              <GraphView results={results} />
            </section>
          ) : (
            <section className="flex min-h-0 flex-1 animate-in fade-in duration-300">
              <TextView jdText={snapshot.jdText} results={results} />
            </section>
          )}
        </div>
      </main>
    </CareerShell>
  );
}
