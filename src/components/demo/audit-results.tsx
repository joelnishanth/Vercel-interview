"use client";

import type { AuditFinding, AuditResult, ModelOutput } from "@/lib/audit-schemas";
import { cn } from "@/lib/utils";

const severityStyles = {
  high: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

// ── Design decision: streaming-safe type guard ─────────────────────────
// During streaming, useObject delivers partial objects — a finding might
// have { type: "pii", severity: "high" } but no title yet.
// Rendering a half-populated card looks broken. This guard ensures we
// only render findings with ALL required fields present.
// As the stream progresses, more findings pass this check and appear.
function isRenderableFinding(
  finding: Partial<AuditFinding>,
): finding is AuditFinding {
  return (
    finding.type != null &&
    ["pii", "redundancy", "oversized", "weak-citation", "low-value"].includes(
      finding.type,
    ) &&
    finding.severity != null &&
    ["high", "medium", "low"].includes(finding.severity) &&
    Boolean(finding.title) &&
    Boolean(finding.description) &&
    finding.location != null &&
    typeof finding.tokenImpact === "number" &&
    Number.isFinite(finding.tokenImpact) &&
    Boolean(finding.recommendation)
  );
}

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

function AuditSummary({ summary }: { summary: { totalTokens?: number; wastedTokens?: number; overallRisk?: string; overallEfficiencyScore?: number } }) {
  const riskStyles = {
    high: "text-red-600 dark:text-red-400",
    medium: "text-amber-700 dark:text-amber-400",
    low: "text-blue-700 dark:text-blue-400",
    clean: "text-green-700 dark:text-green-400",
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Audit summary
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-foreground">
            {summary.totalTokens?.toLocaleString() ?? "—"}
          </p>
          <p className="text-[11px] text-muted-foreground">Total tokens</p>
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">
            {summary.wastedTokens?.toLocaleString() ?? "—"}
          </p>
          <p className="text-[11px] text-muted-foreground">Wasted tokens</p>
        </div>
        <div>
          <p
            className={cn(
              "text-lg font-bold capitalize",
              summary.overallRisk
                ? riskStyles[summary.overallRisk as keyof typeof riskStyles]
                : "text-foreground",
            )}
          >
            {summary.overallRisk ?? "—"}
          </p>
          <p className="text-[11px] text-muted-foreground">Overall risk</p>
        </div>
        <div>
          <p className="text-lg font-bold text-accent">
            {summary.overallEfficiencyScore ?? "—"}/100
          </p>
          <p className="text-[11px] text-muted-foreground">Efficiency score</p>
        </div>
      </div>
    </div>
  );
}

// ── Design decision: four distinct UI states ───────────────────────────
// The component handles: idle → loading (skeleton) → streaming (partial
// findings appear progressively) → complete (clean / findings / error).
// Each state has intentional UX: loading shows pulse animation, clean
// shows a green success card, empty+no-summary shows a warning with
// actionable instructions to check the AI provider.
export function AuditResults({
  result,
  isLoading,
}: {
  result?: Partial<AuditResult> | Partial<ModelOutput>;
  isLoading: boolean;
}) {
  const findings = (result?.findings ?? []).filter(isRenderableFinding);
  const hasSummary = Boolean(result?.summary?.overallRisk);
  const hasActivity = isLoading || Boolean(result);

  if (!hasActivity) {
    return (
      <p className="text-sm text-muted-foreground">
        Run an audit to see live findings from the AI Gateway.
      </p>
    );
  }

  if (findings.length === 0 && isLoading && !hasSummary) {
    return (
      <p className="animate-pulse text-sm text-muted-foreground">
        Analyzing context window…
      </p>
    );
  }

  if (
    findings.length === 0 &&
    !isLoading &&
    result?.summary?.overallRisk === "clean"
  ) {
    return (
      <div className="space-y-3">
        {hasSummary && result?.summary && <AuditSummary summary={result.summary as { overallRisk?: string; overallEfficiencyScore?: number; totalTokens?: number; wastedTokens?: number }} />}
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="font-medium text-green-700 dark:text-green-400">
            Clean context — no significant issues detected
          </p>
        </div>
      </div>
    );
  }

  if (findings.length === 0 && !isLoading && !hasSummary) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
        <p className="font-medium text-amber-700 dark:text-amber-400">
          No audit results returned
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The request completed but no structured output was received. Check AI
          Gateway billing and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasSummary && result?.summary && (
        <AuditSummary summary={result.summary as { overallRisk?: string; overallEfficiencyScore?: number; totalTokens?: number; wastedTokens?: number }} />
      )}
      {findings.length > 0 && (
        <>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Findings ({findings.length})
          </p>
          {findings.map((finding, i) => (
            <FindingCard key={`${finding.title}-${i}`} finding={finding} />
          ))}
        </>
      )}
      {isLoading && (
        <p className="text-xs text-muted-foreground">Streaming more findings…</p>
      )}
    </div>
  );
}
