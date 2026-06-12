import { z } from "zod";

// ── Design decision: Zod as the single source of truth ──────────────────
// Every schema here is used for three purposes:
//   1. LLM output validation (structured output via AI SDK)
//   2. Runtime type inference (z.infer removes duplication)
//   3. Persistence validation (localStorage, API boundaries)
// This prevents drift between what the model generates, what the app computes,
// and what we store. One schema change propagates everywhere.

export const auditFindingSchema = z.object({
  // Closed enum — the LLM can ONLY output these types.
  // This constrains the model and makes eval scoring deterministic.
  type: z.enum([
    "pii",
    "redundancy",
    "oversized",
    "weak-citation",
    "low-value",
  ]),
  severity: z.enum(["high", "medium", "low"]),
  title: z.string(),
  description: z.string(),
  // `location` is a verbatim excerpt from the input — used downstream
  // by live-annotated-text.tsx to highlight the exact span in the UI.
  location: z.string(),
  tokenImpact: z.number(),
  recommendation: z.string(),
});

// ── Design decision: 9 efficiency dimensions, computed NOT generated ────
// The LLM never sees this schema. Efficiency metrics are computed
// deterministically in compute-efficiency.ts from the findings above.
// Why? LLMs are good at classification, bad at arithmetic.
export const efficiencyMetricsSchema = z.object({
  tokenEfficiency: z.object({
    cloudTokensAvoided: z.number(),
    reductionPercent: z.number(),
  }),
  costEfficiency: z.object({
    estimatedCostUsd: z.number(),
    estimatedSavingsUsd: z.number(),
    savingsPercent: z.number(),
  }),
  energyEfficiency: z.object({
    estimatedCloudKwh: z.number(),
    estimatedLocalKwh: z.number(),
    netSavingsKwh: z.number(),
  }),
  carbonIntensity: z.object({
    estimatedCloudCo2eGrams: z.number(),
    estimatedLocalCo2eGrams: z.number(),
    netReductionGrams: z.number(),
  }),
  waterEfficiency: z.object({
    estimatedCloudWaterMl: z.number(),
    reductionMl: z.number(),
  }),
  privacyEfficiency: z.object({
    piiFieldsDetected: z.number(),
    piiFieldsRedacted: z.number(),
    sensitiveDataKeptLocal: z.boolean(),
  }),
  networkEfficiency: z.object({
    payloadSizeBytes: z.number(),
    reducedPayloadBytes: z.number(),
    transferAvoided: z.boolean(),
  }),
  qualityPreservation: z.object({
    informationRetentionPercent: z.number(),
    citationIntegrityPercent: z.number(),
  }),
  resilience: z.object({
    localRoutable: z.boolean(),
    offlineCapable: z.boolean(),
    fallbackAvailable: z.boolean(),
  }),
});

export const auditResultSchema = z.object({
  findings: z.array(auditFindingSchema),
  efficiency: efficiencyMetricsSchema,
  summary: z.object({
    totalTokens: z.number(),
    wastedTokens: z.number(),
    overallRisk: z.enum(["high", "medium", "low", "clean"]),
    overallEfficiencyScore: z.number(),
  }),
});

// ── Design decision: slim model output vs full audit result ─────────────
// The LLM generates ONLY findings + summary (modelOutputSchema).
// The full AuditResult includes efficiency — computed by enrichAuditResult().
// This keeps the LLM contract minimal: classify waste, don't do math.
// Smaller schema = fewer hallucinated fields = more reliable streaming.
export const modelOutputSchema = z.object({
  findings: z.array(auditFindingSchema),
  summary: z.object({
    overallRisk: z.enum(["high", "medium", "low", "clean"]),
    overallEfficiencyScore: z.number(),
  }),
});

export type ModelOutput = z.infer<typeof modelOutputSchema>;

export const auditRequestSchema = z.object({
  context: z.string().min(1).max(200_000),
});

export type AuditFinding = z.infer<typeof auditFindingSchema>;
export type EfficiencyMetrics = z.infer<typeof efficiencyMetricsSchema>;
export type AuditResult = z.infer<typeof auditResultSchema>;

// ── Design decision: safeParse at every boundary ───────────────────────
// Never trust data crossing a boundary (API response, localStorage, stream).
// These helpers return null instead of throwing, so callers can gracefully
// degrade rather than crash the UI mid-stream.
export function parseEfficiencyMetrics(
  value: unknown,
): EfficiencyMetrics | null {
  const parsed = efficiencyMetricsSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function parseAuditResult(value: unknown): AuditResult | null {
  const parsed = auditResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
