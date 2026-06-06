import { z } from "zod";

export const auditFindingSchema = z.object({
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
  location: z.string(),
  tokenImpact: z.number(),
  recommendation: z.string(),
});

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

export const auditRequestSchema = z.object({
  context: z.string().min(1).max(200_000),
});

export type AuditFinding = z.infer<typeof auditFindingSchema>;
export type EfficiencyMetrics = z.infer<typeof efficiencyMetricsSchema>;
export type AuditResult = z.infer<typeof auditResultSchema>;
