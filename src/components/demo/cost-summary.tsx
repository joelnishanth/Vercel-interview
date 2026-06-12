"use client";

import { parseEfficiencyMetrics } from "@/lib/audit-schemas";
import { formatNumber, formatUsd } from "@/lib/token-utils";
import { cn } from "@/lib/utils";

export function CostSummary({
  efficiency,
  overallScore,
  isStreaming = false,
}: {
  efficiency?: unknown;
  overallScore?: number;
  isStreaming?: boolean;
}) {
  const metrics = parseEfficiencyMetrics(efficiency);
  const raw = efficiency as Record<string, unknown> | undefined;

  const hasCost = raw?.costEfficiency != null && typeof (raw.costEfficiency as Record<string, unknown>).estimatedSavingsUsd === "number";
  const hasCarbon = raw?.carbonIntensity != null && typeof (raw.carbonIntensity as Record<string, unknown>).netReductionGrams === "number";
  const hasWater = raw?.waterEfficiency != null && typeof (raw.waterEfficiency as Record<string, unknown>).reductionMl === "number";

  const hasAny = metrics || hasCost || hasCarbon || hasWater;
  if (!hasAny) return null;

  const cost = metrics?.costEfficiency;
  const carbon = metrics?.carbonIntensity;
  const water = metrics?.waterEfficiency;

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-3">
        <div
          className={cn(
            "rounded-xl border p-6 text-center transition-all duration-500",
            cost ? "border-accent/20 bg-accent/5" : "border-border bg-card/30",
          )}
        >
          {cost ? (
            <>
              <p className="text-3xl font-bold tracking-tight text-accent">
                {cost.estimatedSavingsUsd < 0.01
                  ? formatUsd(cost.estimatedSavingsUsd * 1000)
                  : formatUsd(cost.estimatedSavingsUsd)}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                Cost saved{cost.estimatedSavingsUsd < 0.01 ? " /1K reqs" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(cost.savingsPercent)}% reduction vs cloud inference
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold tracking-tight text-muted-foreground/40">
                {hasCost ? formatUsd((raw!.costEfficiency as Record<string, number>).estimatedSavingsUsd * 1000) : "—"}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">Cost saved /1K reqs</p>
              <p className="text-xs text-muted-foreground">
                {isStreaming ? "Calculating…" : "—"}
              </p>
            </>
          )}
        </div>

        <div
          className={cn(
            "rounded-xl border p-6 text-center transition-all duration-500",
            carbon ? "border-border bg-card/50" : "border-border bg-card/30",
          )}
        >
          {carbon ? (
            <>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {carbon.netReductionGrams < 0.1
                  ? `${formatNumber(carbon.netReductionGrams * 1000, 1)}g`
                  : `${formatNumber(carbon.netReductionGrams, 1)}g`}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                CO₂e avoided{carbon.netReductionGrams < 0.1 ? " /1K reqs" : ""}
              </p>
              <p className="text-xs text-muted-foreground">SCI for AI aligned estimate</p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold tracking-tight text-muted-foreground/40">
                {hasCarbon ? `${formatNumber((raw!.carbonIntensity as Record<string, number>).netReductionGrams * 1000, 1)}g` : "—"}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">CO₂e avoided /1K reqs</p>
              <p className="text-xs text-muted-foreground">
                {isStreaming ? "Calculating…" : "—"}
              </p>
            </>
          )}
        </div>

        <div
          className={cn(
            "rounded-xl border p-6 text-center transition-all duration-500",
            water ? "border-border bg-card/50" : "border-border bg-card/30",
          )}
        >
          {water ? (
            <>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {water.reductionMl < 0.1
                  ? `${formatNumber(water.reductionMl * 1000, 1)} mL`
                  : `${formatNumber(water.reductionMl, 1)} mL`}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                Water saved{water.reductionMl < 0.1 ? " /1K reqs" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Datacenter cooling dependency reduced
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold tracking-tight text-muted-foreground/40">
                {hasWater ? `${formatNumber((raw!.waterEfficiency as Record<string, number>).reductionMl * 1000, 1)} mL` : "—"}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">Water saved /1K reqs</p>
              <p className="text-xs text-muted-foreground">
                {isStreaming ? "Calculating…" : "—"}
              </p>
            </>
          )}
        </div>
      </div>

      {overallScore !== undefined && Number.isFinite(overallScore) && (
        <p className="text-center text-sm text-muted-foreground">
          Overall efficiency score:{" "}
          <span className="font-semibold text-foreground">{overallScore}/100</span>
        </p>
      )}
    </div>
  );
}
