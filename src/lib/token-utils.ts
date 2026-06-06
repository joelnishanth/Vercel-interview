/** Rough token estimate: ~4 chars per token */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Claude Sonnet via AI Gateway — ~$3/M input tokens (approximate) */
const INPUT_COST_PER_TOKEN = 3 / 1_000_000;

export function estimateCost(tokens: number): number {
  return tokens * INPUT_COST_PER_TOKEN;
}

/** Cloud GPU inference ~0.001 kWh per 1K tokens */
export function estimateEnergyKwh(tokens: number): number {
  return (tokens / 1000) * 0.001;
}

/** US grid average ~400 gCO2e/kWh */
const GRID_CARBON_G_PER_KWH = 400;

export function estimateCarbonGrams(kwh: number): number {
  return kwh * GRID_CARBON_G_PER_KWH;
}

/** Datacenter cooling ~1.8 mL/kWh */
const WATER_ML_PER_KWH = 1.8;

export function estimateWaterMl(kwh: number): number {
  return kwh * WATER_ML_PER_KWH;
}

export function estimatePayloadBytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function formatUsd(value: number): string {
  if (value < 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}
