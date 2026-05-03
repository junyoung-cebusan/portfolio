"use client";

import { useMemo, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";

import { jdMatchSchema } from "@/lib/llm/jd-match-schema";

export default function JDAnalyzerTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<"structured" | "text-only">(
    "structured",
  );
  const [fallbackText, setFallbackText] = useState("");

  const uploadFetch = useMemo(
    () => async (input: RequestInfo | URL, init?: RequestInit) => {
      if (!file) {
        throw new Error("Please choose a PDF or .docx file first.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(input, {
        method: "POST",
        credentials: init?.credentials,
        signal: init?.signal,
        body: formData,
      });

      const nextMode =
        response.headers.get("X-Analysis-Mode") === "text-only"
          ? "text-only"
          : "structured";

      setAnalysisMode(nextMode);

      if (nextMode === "structured" || !response.ok) {
        return response;
      }

      setFallbackText("");

      if (!response.body) {
        return new Response("{}", {
          status: response.status,
          statusText: response.statusText,
        });
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        text += decoder.decode(value, { stream: true });
        setFallbackText(text);
      }

      text += decoder.decode();
      setFallbackText(text);

      return new Response("{}", {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    },
    [file],
  );

  const { object, submit, isLoading, error, stop, clear } = useObject({
    api: "/api/analyze",
    schema: jdMatchSchema,
    fetch: uploadFetch,
    onError: (nextError) => {
      setFormError(nextError.message);
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setAnalysisMode("structured");
    setFallbackText("");

    if (!file) {
      setFormError("Please choose a PDF or .docx file first.");
      return;
    }

    submit({});
  };

  const matchedSkills = object?.matchedSkills ?? [];
  const missingSkills = object?.missingSkills ?? [];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <section className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-300">
            JD Matching Analyzer
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Upload a job description
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300">
            The analyzer extracts text from a PDF or Word document, compares it
            against the hardcoded resume, and streams a structured match result.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Job description file
            <input
              type="file"
              accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={isLoading}
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setFormError(null);
                setAnalysisMode("structured");
                setFallbackText("");
                clear();
              }}
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!file || isLoading}
              className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isLoading ? "Analyzing..." : "Analyze"}
            </button>
            {isLoading && (
              <button
                type="button"
                onClick={stop}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Stop
              </button>
            )}
          </div>

          {file && (
            <p className="text-xs text-slate-400">Selected: {file.name}</p>
          )}
          {(formError || error) && (
            <p className="text-sm text-red-300">
              {formError ?? error?.message}
            </p>
          )}
        </form>

        {analysisMode === "text-only" ? (
          <section className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-amber-950">
                  !
                </span>
                <p>
                  Structured local analysis was unavailable. Switching to
                  lightweight text analysis mode.
                </p>
              </div>
            </div>

            <article className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm font-medium text-slate-300">
                Text Analysis
              </p>
              <div className="mt-4 whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                {fallbackText || "Waiting for lightweight analysis..."}
              </div>
            </article>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-[180px_1fr]">
            <article className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Score</p>
              <p className="mt-2 text-5xl font-semibold text-cyan-300">
                {object?.overallMatchScore ?? "--"}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all"
                  style={{ width: `${object?.overallMatchScore ?? 0}%` }}
                />
              </div>
            </article>

            <article className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Summary</p>
              <p className="mt-2 min-h-16 text-sm leading-6 text-slate-100">
                {object?.summary ?? "Waiting for analysis..."}
              </p>
            </article>

            <article className="rounded-lg border border-slate-800 bg-slate-900 p-4 md:col-span-2">
              <p className="text-sm text-slate-400">Matched Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No streamed skills yet.
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-lg border border-slate-800 bg-slate-900 p-4 md:col-span-2">
              <p className="text-sm text-slate-400">Missing Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {missingSkills.length > 0 ? (
                  missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No streamed gaps yet.
                  </p>
                )}
              </div>
            </article>
          </section>
        )}
      </div>
    </main>
  );
}
