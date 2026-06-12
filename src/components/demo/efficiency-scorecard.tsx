"use client";

import {
  parseEfficiencyMetrics,
  type EfficiencyMetrics,
} from "@/lib/audit-schemas";
import { formatNumber, formatUsd } from "@/lib/token-utils";
import { cn } from "@/lib/utils";

type DimensionConfig = {
  key: keyof EfficiencyMetrics;
  label: string;
  format: (m: EfficiencyMetrics) => string;
  percent?: (m: EfficiencyMetrics) => number;
  partialCheck: (raw: Record<string, unknown>) => boolean;
};

const dimensions: DimensionConfig[] = [
  {
    key: "tokenEfficiency",
    label: "Token",
    format: (m) =>
      `${formatNumber(m.tokenEfficiency.cloudTokensAvoided, 0)} avoided (${formatNumber(m.tokenEfficiency.reductionPercent)}%)`,
    percent: (m) => m.tokenEfficiency.reductionPercent,
    partialCheck: (raw) => raw.tokenEfficiency != null && typeof (raw.tokenEfficiency as Record<string, unknown>).reductionPercent === "number",
  },
  {
    key: "costEfficiency",
    label: "Cost",
    format: (m) =>
      `${formatUsd(m.costEfficiency.estimatedSavingsUsd)} saved (${formatNumber(m.costEfficiency.savingsPercent)}%)`,
    percent: (m) => m.costEfficiency.savingsPercent,
    partialCheck: (raw) => raw.costEfficiency != null && typeof (raw.costEfficiency as Record<string, unknown>).savingsPercent === "number",
  },
  {
    key: "energyEfficiency",
    label: "Energy",
    format: (m) =>
      `${formatNumber(m.energyEfficiency.netSavingsKwh, 4)} kWh net savings`,
    percent: (m) =>
      Math.min(
        100,
        (m.energyEfficiency.netSavingsKwh /
          Math.max(m.energyEfficiency.estimatedCloudKwh, 0.0001)) *
          100,
      ),
    partialCheck: (raw) => raw.energyEfficiency != null && typeof (raw.energyEfficiency as Record<string, unknown>).netSavingsKwh === "number",
  },
  {
    key: "carbonIntensity",
    label: "Carbon",
    format: (m) =>
      `${formatNumber(m.carbonIntensity.netReductionGrams, 2)} g CO₂e reduced`,
    percent: (m) =>
      Math.min(
        100,
        (m.carbonIntensity.netReductionGrams /
          Math.max(m.carbonIntensity.estimatedCloudCo2eGrams, 0.01)) *
          100,
      ),
    partialCheck: (raw) => raw.carbonIntensity != null && typeof (raw.carbonIntensity as Record<string, unknown>).netReductionGrams === "number",
  },
  {
    key: "waterEfficiency",
    label: "Water",
    format: (m) =>
      `${formatNumber(m.waterEfficiency.reductionMl, 2)} mL cooling water saved`,
    percent: (m) =>
      Math.min(
        100,
        (m.waterEfficiency.reductionMl /
          Math.max(m.waterEfficiency.estimatedCloudWaterMl, 0.01)) *
          100,
      ),
    partialCheck: (raw) => raw.waterEfficiency != null && typeof (raw.waterEfficiency as Record<string, unknown>).reductionMl === "number",
  },
  {
    key: "privacyEfficiency",
    label: "Privacy",
    format: (m) =>
      `${m.privacyEfficiency.piiFieldsDetected} PII fields detected · local: ${m.privacyEfficiency.sensitiveDataKeptLocal ? "yes" : "no"}`,
    percent: (m) =>
      m.privacyEfficiency.piiFieldsDetected > 0 ? 100 : 0,
    partialCheck: (raw) => raw.privacyEfficiency != null && typeof (raw.privacyEfficiency as Record<string, unknown>).piiFieldsDetected === "number",
  },
  {
    key: "networkEfficiency",
    label: "Network",
    format: (m) =>
      `${formatNumber(m.networkEfficiency.reducedPayloadBytes, 0)} bytes reducible`,
    percent: (m) =>
      Math.min(
        100,
        (m.networkEfficiency.reducedPayloadBytes /
          Math.max(m.networkEfficiency.payloadSizeBytes, 1)) *
          100,
      ),
    partialCheck: (raw) => raw.networkEfficiency != null && typeof (raw.networkEfficiency as Record<string, unknown>).reducedPayloadBytes === "number",
  },
  {
    key: "qualityPreservation",
    label: "Quality",
    format: (m) =>
      `${formatNumber(m.qualityPreservation.informationRetentionPercent)}% retention · ${formatNumber(m.qualityPreservation.citationIntegrityPercent)}% citations`,
    percent: (m) => m.qualityPreservation.informationRetentionPercent,
    partialCheck: (raw) => raw.qualityPreservation != null && typeof (raw.qualityPreservation as Record<string, unknown>).informationRetentionPercent === "number",
  },
  {
    key: "resilience",
    label: "Resilience",
    format: (m) =>
      `Local: ${m.resilience.localRoutable ? "✓" : "✗"} · Offline: ${m.resilience.offlineCapable ? "✓" : "✗"} · Fallback: ${m.resilience.fallbackAvailable ? "✓" : "✗"}`,
    percent: (m) => {
      let score = 0;
      if (m.resilience.localRoutable) score += 33;
      if (m.resilience.offlineCapable) score += 33;
      if (m.resilience.fallbackAvailable) score += 34;
      return score;
    },
    partialCheck: (raw) => raw.resilience != null && typeof (raw.resilience as Record<string, unknown>).localRoutable === "boolean",
  },
];

export function EfficiencyScorecard({
  efficiency,
  isStreaming = false,
}: {
  efficiency?: unknown;
  isStreaming?: boolean;
}) {
  const full = parseEfficiencyMetrics(efficiency);
  const raw = (efficiency ?? {}) as Record<string, unknown>;

  const hasAnyDimension = dimensions.some((d) => d.partialCheck(raw));
  if (!full && !hasAnyDimension) return null;

  const availableCount = dimensions.filter((d) => d.partialCheck(raw)).length;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Offlyn efficiency scorecard (9 dimensions)
        </p>
        {isStreaming && (
          <span className="flex items-center gap-1.5 text-[10px] text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            {availableCount}/9 loaded
          </span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dimensions.map(({ key, label, format, percent, partialCheck }) => {
          const isAvailable = full ? true : partialCheck(raw);

          if (!isAvailable) {
            return (
              <div key={key} className="space-y-1.5 opacity-40">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">—</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-0 rounded-full bg-accent/30" />
                </div>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  Waiting for data…
                </p>
              </div>
            );
          }

          if (full) {
            const pct = percent?.(full) ?? 0;
            const safePct = Number.isFinite(pct) ? pct : 0;
            return (
              <div key={key} className="space-y-1.5 animate-in fade-in duration-500">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="text-muted-foreground">
                    {Math.round(safePct)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, safePct))}%` }}
                  />
                </div>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {format(full)}
                </p>
              </div>
            );
          }

          const dimData = raw[key] as Record<string, unknown> | undefined;
          return (
            <div key={key} className={cn("space-y-1.5 animate-in fade-in duration-500")}>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">{label}</span>
                <span className="flex items-center gap-1 text-accent">
                  <span className="h-1 w-1 animate-pulse rounded-full bg-accent" />
                  live
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-accent/60" />
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {dimData ? "Processing…" : "Waiting…"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
