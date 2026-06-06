"use client";

import { evalTestCases } from "@/data/eval-test-cases";
import { runEvalCase, type EvalResult } from "@/lib/eval-scoring";
import { EvalResultsTable } from "./eval-results-table";
import { useState } from "react";

export function EvalRunner() {
  const [results, setResults] = useState<EvalResult[]>(
    evalTestCases.map((tc) => ({
      testCase: tc,
      status: "pending",
      actualTypes: [],
    })),
  );
  const [running, setRunning] = useState(false);

  const runAll = async () => {
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

  const completed = results.filter((r) => !["pending", "running"].includes(r.status));
  const passCount = completed.filter((r) => r.status === "pass").length;
  const avgDuration =
    completed.length > 0
      ? Math.round(
          completed.reduce((s, r) => s + (r.durationMs ?? 0), 0) / completed.length,
        )
      : 0;

  const totalCo2 = completed.reduce(
    (s, r) =>
      s + (r.result?.efficiency.carbonIntensity.netReductionGrams ?? 0),
    0,
  );
  const totalPii = completed.reduce(
    (s, r) => s + (r.result?.efficiency.privacyEfficiency.piiFieldsDetected ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {evalTestCases.length} test cases · lightweight eval rubric (Track B)
          </p>
          {completed.length > 0 && (
            <p className="mt-1 text-sm text-foreground">
              Pass rate:{" "}
              <span className="font-semibold">
                {Math.round((passCount / completed.length) * 100)}%
              </span>
              {" · "}Avg latency: {avgDuration}ms
              {" · "}Total CO₂e modeled: {totalCo2.toFixed(1)}g
              {" · "}PII fields caught: {totalPii}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void runAll()}
          disabled={running}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {running ? "Running eval suite…" : "Run All"}
        </button>
      </div>
      <EvalResultsTable results={results} />
    </div>
  );
}
