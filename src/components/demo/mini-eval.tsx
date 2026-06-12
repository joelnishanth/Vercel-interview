"use client";

import { useState } from "react";
import { evalTestCases } from "@/data/eval-test-cases";
import { runEvalCase, type EvalResult } from "@/lib/eval-scoring";
import { cn } from "@/lib/utils";

const statusStyles: Record<EvalResult["status"], string> = {
  pending: "bg-secondary text-muted-foreground",
  running: "bg-accent/20 text-accent animate-pulse",
  pass: "bg-green-500/20 text-green-600 dark:text-green-400",
  partial: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  fail: "bg-red-500/20 text-red-600 dark:text-red-400",
  error: "bg-red-500/20 text-red-600 dark:text-red-400",
};

export function MiniEval() {
  const [expanded, setExpanded] = useState(false);
  const [results, setResults] = useState<EvalResult[]>(
    evalTestCases.map((tc) => ({
      testCase: tc,
      status: "pending",
      actualTypes: [],
    })),
  );
  const [running, setRunning] = useState(false);

  const runAll = async () => {
    setExpanded(true);
    setRunning(true);
    for (let i = 0; i < evalTestCases.length; i++) {
      setResults((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: "running" as const } : r,
        ),
      );
      const result = await runEvalCase(evalTestCases[i]);
      setResults((prev) => prev.map((r, idx) => (idx === i ? result : r)));
    }
    setRunning(false);
  };

  const completed = results.filter(
    (r) => !["pending", "running"].includes(r.status),
  );
  const passCount = completed.filter((r) => r.status === "pass").length;
  const passRate = completed.length > 0 
    ? Math.round((passCount / completed.length) * 100) 
    : null;

  return (
    <div className="mt-10 rounded-xl border border-accent/30 bg-accent/5">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            LLM Response Eval
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {evalTestCases.length} test cases · validates AI SDK output quality
          </p>
        </div>
        <div className="flex items-center gap-3">
          {passRate !== null && (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold",
                passRate === 100
                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                  : passRate >= 75
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-red-500/20 text-red-600 dark:text-red-400",
              )}
            >
              {passRate}% pass
            </span>
          )}
          <button
            type="button"
            onClick={() => void runAll()}
            disabled={running}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {running ? "Running…" : "Run Eval"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground underline"
          >
            {expanded ? "Hide" : "Show"} details
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-accent/20 p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((r) => (
              <div
                key={r.testCase.id}
                className="rounded-lg border border-border bg-card/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-foreground">
                    {r.testCase.name}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                      statusStyles[r.status],
                    )}
                  >
                    {r.status}
                  </span>
                </div>
                {r.reason && (
                  <p
                    className={cn(
                      "mt-2 text-[11px]",
                      r.status === "pass"
                        ? "text-green-600 dark:text-green-400"
                        : r.status === "partial"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-500",
                    )}
                  >
                    {r.reason}
                  </p>
                )}
                <div className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
                  <p>
                    <span className="text-foreground/70">Expected:</span>{" "}
                    {r.testCase.expectClean
                      ? "clean"
                      : `${r.testCase.expectedTypes.join(", ")} (${r.testCase.expectedSeverity ?? "any"})`}
                  </p>
                  <p>
                    <span className="text-foreground/70">Actual:</span>{" "}
                    {r.actualTypes.length > 0
                      ? r.actualTypes.join(", ")
                      : r.overallRisk ?? "—"}
                    {r.actualSeverity && ` (${r.actualSeverity})`}
                  </p>
                  {r.durationMs != null && (
                    <p className="text-muted-foreground/70">
                      {r.durationMs}ms
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
            <p className="text-xs font-medium text-foreground">
              What this proves (Track B requirement)
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Test set:</span>{" "}
                8 curated inputs with known issues (PII, duplicates, etc.)
              </li>
              <li>
                <span className="font-medium text-foreground">Rubric:</span>{" "}
                Pass = LLM found expected types + severity; Partial = some found; Fail = missed
              </li>
              <li>
                <span className="font-medium text-foreground">Regression check:</span>{" "}
                If you swap models and pass rate drops, the new model is worse at the audit task
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
