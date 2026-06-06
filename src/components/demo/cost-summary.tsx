"use client";

import type { EfficiencyMetrics } from "@/lib/audit-schemas";
import { formatNumber, formatUsd } from "@/lib/token-utils";

export function CostSummary({
  efficiency,
  overallScore,
}: {
  efficiency?: Partial<EfficiencyMetrics>;
  overallScore?: number;
}) {
  if (!efficiency?.costEfficiency) return null;

  const cost = efficiency.costEfficiency;
  const carbon = efficiency.carbonIntensity;
  const water = efficiency.waterEfficiency;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
        <p className="text-3xl font-bold tracking-tight text-accent">
          {formatUsd(cost.estimatedSavingsUsd)}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">Cost saved</p>
        <p className="text-xs text-muted-foreground">
          {formatNumber(cost.savingsPercent)}% reduction vs sending raw context
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card/50 p-6 text-center">
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {carbon ? `${formatNumber(carbon.netReductionGrams, 1)}g` : "—"}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">CO₂e avoided</p>
        <p className="text-xs text-muted-foreground">SCI for AI aligned estimate</p>
      </div>
      <div className="rounded-xl border border-border bg-card/50 p-6 text-center">
        <p className="text-3xl font-bold tracking-tight text-foreground">
          {water ? `${formatNumber(water.reductionMl, 1)} mL` : "—"}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">Water saved</p>
        <p className="text-xs text-muted-foreground">
          Datacenter cooling dependency reduced
        </p>
      </div>
      {overallScore !== undefined && (
        <p className="col-span-full text-center text-sm text-muted-foreground">
          Overall efficiency score:{" "}
          <span className="font-semibold text-foreground">{overallScore}/100</span>
        </p>
      )}
    </div>
  );
}
