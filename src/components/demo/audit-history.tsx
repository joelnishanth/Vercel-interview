"use client";

import type { StoredAudit } from "@/lib/audit-history";
import { cn } from "@/lib/utils";

const riskStyles = {
  high: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  clean: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AuditHistory({
  history,
  selectedId,
  onSelect,
  onRemove,
  onClear,
}: {
  history: StoredAudit[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  if (history.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Past audits</h2>
          <p className="text-xs text-muted-foreground">
            Stored in this browser for your account. Click a card to review.
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground underline hover:text-foreground"
        >
          Clear history
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {history.map((entry) => {
          const { summary, findings } = entry.result;
          const isSelected = entry.id === selectedId;
          const riskClass =
            riskStyles[summary.overallRisk as keyof typeof riskStyles] ??
            "border-border bg-secondary text-muted-foreground";

          return (
            <div
              key={entry.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(entry.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(entry.id);
                }
              }}
              className={cn(
                "rounded-xl border bg-card/50 p-4 text-left transition-colors hover:border-accent/40",
                isSelected
                  ? "border-accent ring-1 ring-accent/30"
                  : "border-border",
              )}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="text-[10px] text-muted-foreground">
                  {formatWhen(entry.createdAt)}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                    riskClass,
                  )}
                >
                  {summary.overallRisk}
                </span>
              </div>

              <p className="line-clamp-2 font-mono text-xs text-foreground">
                {entry.contextPreview}
                {entry.contextLength > entry.contextPreview.length ? "…" : ""}
              </p>

              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <span>{findings.length} findings</span>
                <span>{summary.overallEfficiencyScore}/100 score</span>
                <span>{summary.totalTokens.toLocaleString()} tokens</span>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(entry.id);
                  }}
                  className="text-[10px] text-muted-foreground underline hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
