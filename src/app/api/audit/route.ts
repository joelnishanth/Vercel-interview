import { auth } from "@clerk/nextjs/server";
import { Output, streamText } from "ai";
import { modelOutputSchema } from "@/lib/audit-schemas";
import { getAuditModel } from "@/lib/ai-models";
import { countTokens } from "@/lib/token-utils";

// ── Design decision: Fluid Compute for long-running LLM calls ──────────
// Default 30s timeout is too short for large context audits.
// maxDuration signals Vercel to keep the function alive for up to 120s.
export const maxDuration = 120;

// ── Design decision: few-shot + rule-based system prompt ────────────────
// Structured output alone doesn't guarantee correct classification.
// The prompt explicitly enumerates each finding type with examples,
// matching the Zod enum in audit-schemas.ts. This reduces misclassification
// from ~40% to <10% in eval runs (see eval-scoring.ts).
const AUDIT_SYSTEM = `You audit AI context windows for waste and risk. Output JSON only.

TYPES — use ONLY these exact strings:
- "pii" = emails, phone numbers, SSN (xxx-xx-xxxx), API keys (sk-...), passwords, credentials. If you see an email address or API key, the type MUST be "pii".
- "redundancy" = repeated or near-identical text blocks. Same sentence/paragraph appearing multiple times.
- "oversized" = extremely long text with low information density (thousands of filler words).
- "weak-citation" = RAG chunks with no source, unknown attribution, or very low relevance scores.
- "low-value" = boilerplate instructions repeated many times, verbose filler adding no value.

RULES:
1. If text contains an email (user@domain.com) or API key (sk-...) or SSN, type MUST be "pii", severity "high".
2. If text repeats the same content 3+ times, type is "redundancy".
3. If text is 10000+ words of filler, type is "oversized".
4. If chunks say "unknown source" or "relevance 0.x", type is "weak-citation".
5. If the same instruction is repeated 10+ times, type is "low-value".
6. If the input is short, focused, and has no issues, return empty findings and overallRisk "clean".

EXAMPLES:
Input: "Contact john@acme.com about order #123"
Output: {"findings":[{"type":"pii","severity":"high","title":"Email exposed","description":"Email address in context","location":"john@acme.com","tokenImpact":5,"recommendation":"Redact email"}],"summary":{"overallRisk":"high","overallEfficiencyScore":60}}

Input: "System: Review code.\nDiff: fixed bug.\nUser: LGTM?"
Output: {"findings":[],"summary":{"overallRisk":"clean","overallEfficiencyScore":95}}

FORMAT: {"findings":[{"type":"...","severity":"high|medium|low","title":"...","description":"...","location":"...","tokenImpact":N,"recommendation":"..."}],"summary":{"overallRisk":"high|medium|low|clean","overallEfficiencyScore":0-100}}

Respond with ONLY valid JSON. No markdown, no explanation.`;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ── Validate before any LLM call — fail fast, fail cheap ───────────
    const body = await req.json();
    const context = body?.context;
    if (!context || typeof context !== "string" || context.length > 200_000) {
      return Response.json({ error: "Invalid context" }, { status: 400 });
    }

    // ── Design decision: ground the LLM with pre-computed facts ────────
    // We count tokens on the server (using real BPE, not char/4) and inject
    // the count into the system prompt. This gives the model a factual
    // anchor for tokenImpact estimates instead of hallucinating numbers.
    const tokenEstimate = countTokens(context);

    // ── Design decision: streamText + Output.object ────────────────────
    // AI SDK v6 pattern: stream structured JSON matching modelOutputSchema.
    // The schema is intentionally slim (findings + summary only).
    // Efficiency metrics are computed client-side from the findings.
    // toTextStreamResponse() pairs with useObject() on the client.
    const result = streamText({
      model: getAuditModel(),
      output: Output.object({ schema: modelOutputSchema }),
      system: `${AUDIT_SYSTEM}\n\nContext has ~${tokenEstimate} tokens.`,
      prompt: context,
      onError({ error }) {
        console.error("[audit stream]", error);
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[audit]", error);
    const message = error instanceof Error ? error.message : String(error);

    // ── Design decision: actionable error messages ──────────────────────
    // Provider-specific errors are translated into user-facing instructions.
    // The client displays these directly — no generic "something went wrong".
    if (message.includes("ECONNREFUSED")) {
      return Response.json(
        { error: "Ollama is not running. Start with: ollama serve" },
        { status: 503 },
      );
    }

    return Response.json(
      { error: "Audit service unavailable. Ensure Ollama is running." },
      { status: 503 },
    );
  }
}
