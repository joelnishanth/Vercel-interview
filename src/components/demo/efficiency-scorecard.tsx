"use client";

import type { EfficiencyMetrics } from "@/lib/audit-schemas";
import { formatNumber, formatUsd } from "@/lib/token-utils";

const dimensions: {
  key: keyof EfficiencyMetrics;
  label: string;
  format: (m: EfficiencyMetrics) => string;
  percent?: (m: EfficiencyMetrics) => number;
}[] = [
  {
    key: "tokenEfficiency",
    label: "Token",
    format: (m) =>
      `${formatNumber(m.tokenEfficiency.cloudTokensAvoided, 0)} avoided (${formatNumber(m.tokenEfficiency.reductionPercent)}%)`,
    percent: (m) => m.tokenEfficiency.reductionPercent,
  },
  {
    key: "costEfficiency",
    label: "Cost",
    format: (m) =>
      `${formatUsd(m.costEfficiency.estimatedSavingsUsd)} saved (${formatNumber(m.costEfficiency.savingsPercent)}%)`,
    percent: (m) => m.costEfficiency.savingsPercent,
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
  },
  {
    key: "privacyEfficiency",
    label: "Privacy",
    format: (m) =>
      `${m.privacyEfficiency.piiFieldsDetected} PII fields detected · local: ${m.privacyEfficiency.sensitiveDataKeptLocal ? "yes" : "no"}`,
    percent: (m) =>
      m.privacyEfficiency.piiFieldsDetected > 0 ? 100 : 0,
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
  },
  {
    key: "qualityPreservation",
    label: "Quality",
    format: (m) =>
      `${formatNumber(m.qualityPreservation.informationRetentionPercent)}% retention · ${formatNumber(m.qualityPreservation.citationIntegrityPercent)}% citations`,
    percent: (m) => m.qualityPreservation.informationRetentionPercent,
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
  },
];

export function EfficiencyScorecard({
  efficiency,
}: {
  efficiency?: Partial<EfficiencyMetrics>;
}) {
  if (!efficiency) return null;

  const full = efficiency as EfficiencyMetrics;
  if (!full.tokenEfficiency) return null;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Offlyn efficiency scorecard (9 dimensions)
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dimensions.map(({ key, label, format, percent }) => {
          const pct = percent?.(full) ?? 0;
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">{label}</span>
                <span className="text-muted-foreground">{Math.round(pct)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                />
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {format(full)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
