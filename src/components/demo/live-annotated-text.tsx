"use client";

import { useMemo } from "react";
import type { AuditFinding } from "@/lib/audit-schemas";
import { cn } from "@/lib/utils";
import { countTokens } from "@/lib/token-utils";

const FINDING_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  pii: { bg: "bg-red-500/15", border: "border-red-500/40", text: "text-red-600 dark:text-red-400" },
  redundancy: { bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-600 dark:text-amber-400" },
  oversized: { bg: "bg-purple-500/15", border: "border-purple-500/40", text: "text-purple-600 dark:text-purple-400" },
  "weak-citation": { bg: "bg-blue-500/15", border: "border-blue-500/40", text: "text-blue-600 dark:text-blue-400" },
  "low-value": { bg: "bg-gray-500/15", border: "border-gray-500/40", text: "text-gray-600 dark:text-gray-400" },
};

const SEVERITY_INTENSITY: Record<string, string> = {
  high: "ring-2 ring-offset-1",
  medium: "",
  low: "opacity-80",
};

interface Annotation {
  start: number;
  end: number;
  finding: AuditFinding;
}

function findAnnotationRanges(
  context: string,
  findings: AuditFinding[],
): Annotation[] {
  const annotations: Annotation[] = [];

  for (const finding of findings) {
    if (!finding.location) continue;

    const searchText = finding.location
      .replace(/^["']|["']$/g, "")
      .trim();

    if (searchText.length < 3) continue;

    const idx = context.indexOf(searchText);
    if (idx !== -1) {
      annotations.push({
        start: idx,
        end: idx + searchText.length,
        finding,
      });
    } else {
      const normalizedSearch = searchText.toLowerCase().slice(0, 60);
      const normalizedContext = context.toLowerCase();
      const approxIdx = normalizedContext.indexOf(normalizedSearch);
      if (approxIdx !== -1) {
        annotations.push({
          start: approxIdx,
          end: approxIdx + normalizedSearch.length,
          finding,
        });
      }
    }
  }

  annotations.sort((a, b) => a.start - b.start);

  const deduped: Annotation[] = [];
  for (const ann of annotations) {
    const last = deduped[deduped.length - 1];
    if (last && ann.start < last.end) continue;
    deduped.push(ann);
  }

  return deduped;
}

interface AnnotatedSegment {
  text: string;
  annotation?: Annotation;
}

function buildSegments(
  context: string,
  annotations: Annotation[],
): AnnotatedSegment[] {
  if (annotations.length === 0) {
    return [{ text: context }];
  }

  const segments: AnnotatedSegment[] = [];
  let cursor = 0;

  for (const ann of annotations) {
    if (ann.start > cursor) {
      segments.push({ text: context.slice(cursor, ann.start) });
    }
    segments.push({
      text: context.slice(ann.start, ann.end),
      annotation: ann,
    });
    cursor = ann.end;
  }

  if (cursor < context.length) {
    segments.push({ text: context.slice(cursor) });
  }

  return segments;
}

export function LiveAnnotatedText({
  context,
  findings,
  isLoading,
  tokenCount,
}: {
  context: string;
  findings: AuditFinding[];
  isLoading: boolean;
  tokenCount: number;
}) {
  const annotations = useMemo(
    () => findAnnotationRanges(context, findings ?? []),
    [context, findings],
  );

  const segments = useMemo(
    () => buildSegments(context, annotations),
    [context, annotations],
  );

  const wastedTokens = useMemo(
    () => (findings ?? []).reduce((sum, f) => sum + (f.tokenImpact ?? 0), 0),
    [findings],
  );

  const wastedPercent = tokenCount > 0 ? ((wastedTokens / tokenCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card/50">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Live Analysis
          </span>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>
            <span className="font-mono font-medium text-foreground">
              {tokenCount.toLocaleString()}
            </span>{" "}
            tokens (real)
          </span>
          {findings.length > 0 && (
            <>
              <span>
                <span className="font-mono font-medium text-foreground">
                  {findings.length}
                </span>{" "}
                findings
              </span>
              <span>
                <span className="font-mono font-medium text-red-500">
                  {wastedPercent.toFixed(0)}%
                </span>{" "}
                waste
              </span>
            </>
          )}
        </div>
        {isLoading && (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Analyzing…
          </span>
        )}
      </div>

      {/* Waste progress bar */}
      {findings.length > 0 && (
        <div className="border-b border-border px-4 py-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Token efficiency</span>
            <span>{(100 - wastedPercent).toFixed(0)}% efficient</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-accent transition-all duration-700"
              style={{ width: `${Math.max(0, 100 - wastedPercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* Annotated text */}
      <div className="max-h-[360px] overflow-y-auto px-4 py-3">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground/80">
          {segments.map((seg, i) => {
            if (!seg.annotation) {
              return <span key={i}>{seg.text}</span>;
            }

            const colors = FINDING_COLORS[seg.annotation.finding.type] ?? FINDING_COLORS["low-value"];
            const severity = SEVERITY_INTENSITY[seg.annotation.finding.severity] ?? "";

            return (
              <span
                key={i}
                className={cn(
                  "relative inline rounded-sm border px-0.5 transition-all duration-500",
                  colors.bg,
                  colors.border,
                  severity,
                  "animate-in fade-in duration-500",
                )}
                title={`${seg.annotation.finding.type} (${seg.annotation.finding.severity}): ${seg.annotation.finding.title}`}
              >
                {seg.text}
                <span
                  className={cn(
                    "absolute -top-4 left-0 rounded px-1 py-0.5 text-[8px] font-bold uppercase leading-none",
                    colors.bg,
                    colors.text,
                  )}
                >
                  {seg.annotation.finding.type}
                </span>
              </span>
            );
          })}
        </pre>
      </div>

      {/* Legend */}
      {findings.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2">
          {Object.entries(FINDING_COLORS).map(([type, colors]) => {
            const count = findings.filter((f) => f.type === type).length;
            if (count === 0) return null;
            return (
              <span
                key={type}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium",
                  colors.bg,
                  colors.border,
                  colors.text,
                )}
              >
                {type} ({count})
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
