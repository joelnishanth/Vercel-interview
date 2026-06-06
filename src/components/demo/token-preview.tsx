"use client";

import {
  estimateCarbonGrams,
  estimateCost,
  estimateEnergyKwh,
  estimateTokens,
  estimateWaterMl,
  formatNumber,
  formatUsd,
} from "@/lib/token-utils";

export function TokenPreview({ text }: { text: string }) {
  const tokens = estimateTokens(text);
  const cost = estimateCost(tokens);
  const kwh = estimateEnergyKwh(tokens);
  const co2 = estimateCarbonGrams(kwh);
  const water = estimateWaterMl(kwh);

  if (!text.trim()) {
    return (
      <p className="text-xs text-muted-foreground">
        Paste or upload context to see pre-audit estimates.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {[
        { label: "Est. tokens", value: formatNumber(tokens, 0) },
        { label: "Est. cost", value: formatUsd(cost) },
        { label: "Est. CO₂e", value: `${formatNumber(co2, 2)} g` },
        { label: "Est. water", value: `${formatNumber(water, 2)} mL` },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-secondary/30 px-3 py-2"
        >
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="text-sm font-semibold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
