"use client";

import type { EvalResult } from "@/lib/eval-scoring";
import { cn } from "@/lib/utils";

const statusStyles: Record<EvalResult["status"], string> = {
  pending: "text-muted-foreground",
  running: "text-accent animate-pulse",
  pass: "text-green-600 dark:text-green-400",
  partial: "text-amber-600 dark:text-amber-400",
  fail: "text-red-600 dark:text-red-400",
  error: "text-red-600 dark:text-red-400",
};

export function EvalResultsTable({ results }: { results: EvalResult[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-secondary/30">
          <tr>
            <th className="px-4 py-3 font-medium text-foreground">Test</th>
            <th className="px-4 py-3 font-medium text-foreground">Status</th>
            <th className="px-4 py-3 font-medium text-foreground">Expected</th>
            <th className="px-4 py-3 font-medium text-foreground">Actual</th>
            <th className="px-4 py-3 font-medium text-foreground">Reason</th>
            <th className="px-4 py-3 font-medium text-foreground">Ms</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row) => (
            <tr key={row.testCase.id} className="border-b border-border/60">
              <td className="px-4 py-3 text-foreground">{row.testCase.name}</td>
              <td
                className={cn(
                  "px-4 py-3 font-medium capitalize",
                  statusStyles[row.status],
                )}
              >
                {row.status}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {row.testCase.expectClean
                  ? "clean"
                  : `${row.testCase.expectedTypes.join(", ")} (${row.testCase.expectedSeverity ?? "any"})`}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {row.actualTypes.length > 0
                  ? row.actualTypes.join(", ")
                  : row.overallRisk ?? "—"}
                {row.actualSeverity && ` (${row.actualSeverity})`}
              </td>
              <td className="max-w-[240px] px-4 py-3 text-xs text-muted-foreground">
                {row.reason ?? row.error ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.durationMs ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
