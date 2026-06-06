"use client";

import type { AuditFinding, AuditResult } from "@/lib/audit-schemas";
import { cn } from "@/lib/utils";

const severityStyles = {
  high: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

function FindingCard({ finding }: { finding: AuditFinding }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
            severityStyles[finding.severity],
          )}
        >
          {finding.severity}
        </span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {finding.type}
        </span>
        <span className="text-xs text-muted-foreground">
          ~{finding.tokenImpact.toLocaleString()} tokens
        </span>
      </div>
      <h3 className="font-medium text-foreground">{finding.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{finding.description}</p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {finding.location}
      </p>
      <p className="mt-2 text-xs text-accent">{finding.recommendation}</p>
    </div>
  );
}

export function AuditResults({
  result,
  isLoading,
}: {
  result?: Partial<AuditResult>;
  isLoading: boolean;
}) {
  if (!result?.findings && !isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Run an audit to see live findings from the AI Gateway.
      </p>
    );
  }

  const findings = result?.findings ?? [];

  if (findings.length === 0 && isLoading) {
    return (
      <p className="animate-pulse text-sm text-muted-foreground">
        Analyzing context window…
      </p>
    );
  }

  if (findings.length === 0 && result?.summary?.overallRisk === "clean") {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
        <p className="font-medium text-green-700 dark:text-green-400">
          Clean context — no significant issues detected
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Efficiency score: {result.summary.overallEfficiencyScore}/100
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {findings.map((finding, i) => (
        <FindingCard key={`${finding.title}-${i}`} finding={finding} />
      ))}
      {isLoading && (
        <p className="text-xs text-muted-foreground">Streaming more findings…</p>
      )}
    </div>
  );
}
