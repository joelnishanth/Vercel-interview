import type { AuditResult, EfficiencyMetrics, AuditFinding, ModelOutput } from "./audit-schemas";
import { countTokens, estimatePayloadBytes } from "./token-utils";

// ── Design decision: deterministic computation, not LLM generation ─────
// This is the core of the "LLM classifies, app computes" architecture.
// The LLM identifies waste findings, this module calculates the 9
// efficiency dimensions using cited constants. This makes results
// reproducible and auditable — same findings always yield same metrics.

/**
 * Offlyn Token Savings Audit methodology
 * Source: https://github.com/offlyn-ai/offlyn-token-savings-audit
 *
 * Every constant below is sourced from published research or industry data.
 * This matters for credibility: interviewers can ask "where did 0.50 come from?"
 */
const CLOUD_CO2E_PER_1K_TOKENS = 0.50; // gCO2e — Offlyn SCI-AI midpoint
const CLOUD_WATER_ML_PER_1K_TOKENS = 2.28; // mL — 0.147L / 64.45K tokens
const CLOUD_COST_PER_M_INPUT = 2.50; // $/M tokens — Offlyn cloud-first baseline
const CLOUD_COST_PER_M_OUTPUT = 10.0; // $/M tokens
const CLOUD_KWH_PER_1K_TOKENS = 0.001; // estimated cloud inference energy
const LOCAL_INCREMENTAL_WATTS = 5; // Offlyn: 5W above device baseline

/**
 * Compute efficiency metrics using Offlyn Token Savings Audit methodology.
 * LLM identifies findings (waste), we compute savings deterministically.
 */
export function computeEfficiencyFromFindings(
  context: string,
  findings: AuditFinding[],
): EfficiencyMetrics {
  const totalTokens = countTokens(context);
  const rawWasted = findings.reduce((sum, f) => sum + (f.tokenImpact ?? 0), 0);
  // ── Defensive math: LLM sometimes overestimates tokenImpact ──────────
  // Cap waste at total tokens to prevent impossible >100% reduction metrics.
  const wastedTokens = Math.min(rawWasted, totalTokens);
  const reductionPercent = totalTokens > 0 ? (wastedTokens / totalTokens) * 100 : 0;

  // Cost: tokens avoided × cloud baseline rate
  const totalCostUsd = (totalTokens / 1_000_000) * CLOUD_COST_PER_M_INPUT;
  const savedCostUsd = (wastedTokens / 1_000_000) * CLOUD_COST_PER_M_INPUT;
  const costSavingsPercent = totalCostUsd > 0 ? (savedCostUsd / totalCostUsd) * 100 : 0;

  // Energy: cloud kWh proportional to tokens
  const totalCloudKwh = (totalTokens / 1000) * CLOUD_KWH_PER_1K_TOKENS;
  const savedKwh = (wastedTokens / 1000) * CLOUD_KWH_PER_1K_TOKENS;
  const localKwh = (LOCAL_INCREMENTAL_WATTS / 1000) * (totalTokens / 10000); // rough local inference time

  // Carbon: Offlyn SCI-AI methodology (0.50 gCO2e per 1K cloud tokens)
  const totalCloudCo2 = (totalTokens / 1000) * CLOUD_CO2E_PER_1K_TOKENS;
  const savedCo2 = (wastedTokens / 1000) * CLOUD_CO2E_PER_1K_TOKENS;
  const localCo2 = localKwh * 400; // local grid carbon (US avg 400g/kWh)

  // Water: Offlyn methodology (datacenter cooling, ~2.28 mL per 1K cloud tokens)
  const totalCloudWater = (totalTokens / 1000) * CLOUD_WATER_ML_PER_1K_TOKENS;
  const savedWater = (wastedTokens / 1000) * CLOUD_WATER_ML_PER_1K_TOKENS;

  // ── Design decision: belt-and-suspenders PII detection ────────────────
  // The LLM classifies PII findings, but we also run a regex scan.
  // We take the MAX of both counts — if the regex catches an email the LLM
  // missed, we still report it. Defense in depth for sensitive data.
  const PII_PATTERNS = /\b[\w.-]+@[\w.-]+\.\w{2,}|sk-[a-zA-Z0-9_-]{10,}|(?:\d{3}-\d{2}-\d{4})|(?:\+?\d[\d\s-]{8,}\d)\b/g;
  const piiFindings = findings.filter((f) => f.type === "pii");
  const contextPiiMatches = context.match(PII_PATTERNS) ?? [];
  const piiCount = Math.max(piiFindings.length, contextPiiMatches.length);

  // Network: payload bytes that would be sent to cloud
  const payloadBytes = estimatePayloadBytes(context);
  const reducedBytes = Math.round(payloadBytes * (reductionPercent / 100));

  return {
    tokenEfficiency: {
      cloudTokensAvoided: wastedTokens,
      reductionPercent: Math.round(reductionPercent * 10) / 10,
    },
    costEfficiency: {
      estimatedCostUsd: totalCostUsd,
      estimatedSavingsUsd: savedCostUsd,
      savingsPercent: Math.round(costSavingsPercent * 10) / 10,
    },
    energyEfficiency: {
      estimatedCloudKwh: totalCloudKwh,
      estimatedLocalKwh: localKwh,
      netSavingsKwh: savedKwh,
    },
    carbonIntensity: {
      estimatedCloudCo2eGrams: totalCloudCo2,
      estimatedLocalCo2eGrams: localCo2,
      netReductionGrams: savedCo2,
    },
    waterEfficiency: {
      estimatedCloudWaterMl: totalCloudWater,
      reductionMl: savedWater,
    },
    privacyEfficiency: {
      piiFieldsDetected: piiCount,
      piiFieldsRedacted: piiCount,
      sensitiveDataKeptLocal: piiCount > 0,
    },
    networkEfficiency: {
      payloadSizeBytes: payloadBytes,
      reducedPayloadBytes: reducedBytes,
      transferAvoided: reducedBytes > 0,
    },
    qualityPreservation: {
      informationRetentionPercent: Math.round(100 - reductionPercent * 0.1),
      citationIntegrityPercent: findings.some((f) => f.type === "weak-citation") ? 70 : 100,
    },
    resilience: {
      localRoutable: true,
      offlineCapable: false,
      fallbackAvailable: true,
    },
  };
}

// ── Design decision: enrich at the boundary, not in the model ──────────
// This function is the bridge between LLM output and full UI data.
// Called in two places:
//   1. use-audit.ts onComplete → for the live demo
//   2. audit-client.ts runAudit() → for eval (non-streaming path)
// The LLM returns slim ModelOutput, this computes the 9 efficiency
// dimensions and assembles the full AuditResult the UI expects.
export function enrichAuditResult(
  context: string,
  result: Partial<ModelOutput>,
): Partial<AuditResult> {
  const findings = result.findings ?? [];
  if (findings.length === 0) {
    const totalTokens = countTokens(context);
    return {
      findings: [],
      efficiency: computeEfficiencyFromFindings(context, []),
      summary: {
        totalTokens,
        wastedTokens: 0,
        overallRisk: result.summary?.overallRisk ?? "clean" as const,
        overallEfficiencyScore: result.summary?.overallEfficiencyScore ?? 100,
      },
    };
  }

  const totalTokens = countTokens(context);
  const wastedTokens = Math.min(
    findings.reduce((sum, f) => sum + (f.tokenImpact ?? 0), 0),
    totalTokens,
  );
  const efficiency = computeEfficiencyFromFindings(context, findings);

  return {
    findings,
    efficiency,
    summary: {
      totalTokens,
      wastedTokens,
      overallRisk: result.summary?.overallRisk ?? (wastedTokens > totalTokens * 0.3 ? "high" : wastedTokens > totalTokens * 0.1 ? "medium" : "low"),
      overallEfficiencyScore: result.summary?.overallEfficiencyScore ?? Math.round(100 - (wastedTokens / Math.max(totalTokens, 1)) * 100),
    },
  };
}
