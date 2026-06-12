import { encode } from "gpt-tokenizer";

// ── Design decision: real BPE tokenization, not char/4 heuristic ───────
// Most demos estimate tokens as Math.ceil(text.length / 4). We use the
// actual o200k_base encoding (same as OpenAI tiktoken). This matters
// because cost/energy/carbon calculations downstream multiply by token
// count — a 30% estimation error cascades through every metric.
// Trade-off: gpt-tokenizer adds ~200KB to the bundle, but accuracy
// for an audit tool is non-negotiable.
export function countTokens(text: string): number {
  return encode(text).length;
}

/** @deprecated Use countTokens() for real tokenization */
export function estimateTokens(text: string): number {
  return countTokens(text);
}

/**
 * Tokenize and decode back to get per-token text segments.
 * Useful for visualizing token boundaries.
 */
export interface TokenSegment {
  text: string;
  tokenIndex: number;
  tokenId: number;
}

export function tokenizeWithSegments(text: string): TokenSegment[] {
  const { encode, decode } = require("gpt-tokenizer") as {
    encode: (t: string) => number[];
    decode: (t: number[]) => string;
  };
  const tokens = encode(text);
  return tokens.map((tokenId, i) => ({
    text: decode([tokenId]),
    tokenIndex: i,
    tokenId,
  }));
}

// ── Design decision: per-model pricing table ───────────────────────────
// Enables the token preview to show cost BEFORE any LLM call,
// giving users instant feedback as they type. Pricing is per-M tokens.
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "google/gemini-2.5-flash": { input: 0.15, output: 0.60 },
  "meta/llama-3.1-8b": { input: 0.05, output: 0.08 },
  "openai/gpt-4o": { input: 2.50, output: 10.0 },
  "openai/gpt-4o-mini": { input: 0.15, output: 0.60 },
  "anthropic/claude-sonnet-4": { input: 3.00, output: 15.0 },
};

export function estimateCost(
  tokens: number,
  model = "google/gemini-2.5-flash",
): number {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING["google/gemini-2.5-flash"];
  return (tokens / 1_000_000) * pricing.input;
}

/** Cloud GPU inference ~0.001 kWh per 1K tokens (Llama-65B class) */
export function estimateEnergyKwh(tokens: number): number {
  return (tokens / 1000) * 0.001;
}

/** US grid average ~400 gCO2e/kWh (EPA 2024) */
const GRID_CARBON_G_PER_KWH = 400;

export function estimateCarbonGrams(kwh: number): number {
  return kwh * GRID_CARBON_G_PER_KWH;
}

/** Datacenter cooling ~1.8 mL/kWh (Google Environmental Report 2024) */
const WATER_ML_PER_KWH = 1.8;

export function estimateWaterMl(kwh: number): number {
  return kwh * WATER_ML_PER_KWH;
}

export function estimatePayloadBytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

// ── Design decision: progressive precision for sub-cent values ─────────
// A single audit costs ~$0.000037. Showing "$0.00" is meaningless.
// We scale precision based on magnitude so tiny per-request costs
// are visible, while larger values remain human-readable.
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "$0";
  if (value < 0.0001) return `$${value.toFixed(6)}`;
  if (value < 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
}
