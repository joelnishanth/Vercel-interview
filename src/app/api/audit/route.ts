import { APICallError, gateway, Output, streamText } from "ai";
import { auditRequestSchema, auditResultSchema } from "@/lib/audit-schemas";
import {
  estimateCarbonGrams,
  estimateCost,
  estimateEnergyKwh,
  estimateTokens,
  estimateWaterMl,
} from "@/lib/token-utils";

export const maxDuration = 60;

const AUDIT_SYSTEM = `You are a context window auditor for AI agents, aligned with the Offlyn.ai resource efficiency framework (https://github.com/offlyn-ai).

Analyze the provided context window BEFORE it would be sent to a cloud LLM. Identify waste, risk, and optimization opportunities.

Finding types (use exactly these):
- pii: emails, SSN, phone, API keys, credentials, internal URLs
- redundancy: duplicate or near-duplicate chunks, repeated tool outputs
- oversized: context approaching limits, segments with poor value density
- weak-citation: low-relevance RAG chunks, missing sources, stale references
- low-value: boilerplate, filler, verbose system prompt noise

For each finding provide: type, severity (high/medium/low), title, description, location (quote snippet), tokenImpact (estimated tokens wasted), recommendation.

Efficiency metrics — estimate all 9 Offlyn dimensions realistically based on the context:
1. tokenEfficiency: cloudTokensAvoided, reductionPercent
2. costEfficiency: estimatedCostUsd, estimatedSavingsUsd, savingsPercent
3. energyEfficiency: estimatedCloudKwh, estimatedLocalKwh, netSavingsKwh
4. carbonIntensity: estimatedCloudCo2eGrams, estimatedLocalCo2eGrams, netReductionGrams
5. waterEfficiency: estimatedCloudWaterMl, reductionMl
6. privacyEfficiency: piiFieldsDetected, piiFieldsRedacted, sensitiveDataKeptLocal
7. networkEfficiency: payloadSizeBytes, reducedPayloadBytes, transferAvoided
8. qualityPreservation: informationRetentionPercent, citationIntegrityPercent
9. resilience: localRoutable, offlineCapable, fallbackAvailable

Summary: totalTokens, wastedTokens, overallRisk (high/medium/low/clean), overallEfficiencyScore (0-100).

If context is clean and minimal, return empty findings array and overallRisk "clean".
Be precise and conservative with estimates.`;

function gatewayErrorResponse(error: unknown): Response {
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 402) {
      return Response.json(
        { error: "AI Gateway budget limit reached. Please try again later." },
        { status: 402 },
      );
    }
    if (error.statusCode === 429) {
      const retryAfter = error.responseHeaders?.["retry-after"];
      return Response.json(
        { error: "Rate limited. Please slow down.", retryAfter },
        {
          status: 429,
          headers: retryAfter ? { "Retry-After": String(retryAfter) } : {},
        },
      );
    }
  }
  console.error("[audit]", error);
  return Response.json(
    { error: "Audit service unavailable. Check AI Gateway configuration." },
    { status: 503 },
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = auditRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const { context } = parsed.data;
    const tokenEstimate = estimateTokens(context);
    const costEstimate = estimateCost(tokenEstimate);
    const kwh = estimateEnergyKwh(tokenEstimate);
    const co2 = estimateCarbonGrams(kwh);
    const water = estimateWaterMl(kwh);

    const result = streamText({
      model: gateway("anthropic/claude-sonnet-4.5"),
      output: Output.object({ schema: auditResultSchema }),
      system: `${AUDIT_SYSTEM}

Pre-computed baselines for this context:
- Estimated tokens: ${tokenEstimate}
- Estimated cloud cost (input): $${costEstimate.toFixed(6)}
- Estimated energy: ${kwh.toFixed(6)} kWh
- Estimated carbon: ${co2.toFixed(4)} gCO2e
- Estimated water: ${water.toFixed(4)} mL
- Payload bytes: ${new TextEncoder().encode(context).length}`,
      prompt: context,
      providerOptions: {
        gateway: {
          order: ["anthropic"],
          models: ["openai/gpt-5.4"],
          tags: ["feature:token-audit"],
        },
      },
      onError({ error }) {
        console.error("[audit stream]", error);
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return gatewayErrorResponse(error);
  }
}
