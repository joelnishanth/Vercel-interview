"use client";

import type { AuditResult } from "@/lib/audit-schemas";
import type { EvalTestCase } from "@/data/eval-test-cases";
import { runAudit, AuditApiError } from "@/lib/audit-client";

// ── Design decision: lightweight eval rubric ───────────────────────────
// Instead of relying on an LLM-as-judge (expensive, non-deterministic),
// we use a simple rubric: did the model find the expected finding types
// with the expected severity? This gives us pass/partial/fail/error states
// that are reproducible and fast to run.
export type EvalResult = {
  testCase: EvalTestCase;
  // Four terminal states: pass (all expected types + severity match),
  // partial (some types found or severity mismatch), fail (wrong types),
  // error (API/network failure). Plus pending/running for UI.
  status: "pending" | "running" | "pass" | "partial" | "fail" | "error";
  actualTypes: string[];
  actualSeverity?: string;
  overallRisk?: string;
  durationMs?: number;
  error?: string;
  reason?: string;
  result?: AuditResult;
};

// ── Design decision: set-based type matching with partial credit ───────
// Exact match on finding types = pass. Some matched = partial.
// Severity mismatch alone = partial (not fail) because the model
// found the right issue, just ranked it differently.
// This avoids penalizing the model for reasonable judgment calls.
function scoreResult(
  testCase: EvalTestCase,
  result: AuditResult,
): { status: EvalResult["status"]; reason: string } {
  const actualTypes = result.findings.map((f) => f.type);
  const uniqueActual = [...new Set(actualTypes)];

  if (testCase.expectClean) {
    if (result.findings.length === 0 || result.summary.overallRisk === "clean") {
      return { status: "pass", reason: "Correctly identified as clean" };
    }
    return {
      status: "fail",
      reason: `Expected no findings but LLM returned ${result.findings.length} finding(s): ${uniqueActual.join(", ")}`,
    };
  }

  const expected = testCase.expectedTypes;
  const matched = expected.filter((t) => actualTypes.includes(t));
  const missing = expected.filter((t) => !actualTypes.includes(t));
  const extra = uniqueActual.filter((t) => !expected.includes(t));

  if (matched.length === expected.length) {
    if (testCase.expectedSeverity) {
      const sevMatch = result.findings.some(
        (f) =>
          expected.includes(f.type) && f.severity === testCase.expectedSeverity,
      );
      if (sevMatch) {
        return { status: "pass", reason: `Found ${expected.join(", ")} with ${testCase.expectedSeverity} severity` };
      }
      const actualSev = result.findings.find((f) => expected.includes(f.type))?.severity;
      return {
        status: "partial",
        reason: `Found ${expected.join(", ")} but severity was "${actualSev}" instead of "${testCase.expectedSeverity}"`,
      };
    }
    return { status: "pass", reason: `Found all expected types: ${expected.join(", ")}` };
  }

  if (matched.length > 0) {
    const parts: string[] = [];
    if (missing.length > 0) parts.push(`missing: ${missing.join(", ")}`);
    if (extra.length > 0) parts.push(`unexpected: ${extra.join(", ")}`);
    return {
      status: "partial",
      reason: `Found ${matched.join(", ")} but ${parts.join("; ")}`,
    };
  }

  return {
    status: "fail",
    reason: `Expected ${expected.join(", ")} but LLM returned ${uniqueActual.length > 0 ? uniqueActual.join(", ") : "no findings"}`,
  };
}

// ── Design decision: non-streaming eval path ──────────────────────────
// Eval uses the non-streaming audit-client.ts (full request/response),
// not the streaming useObject hook. This simplifies scoring — we wait
// for the complete result before comparing against expected findings.
// Sequential execution (not parallel) avoids provider rate limits.
export async function runEvalCase(testCase: EvalTestCase): Promise<EvalResult> {
  const start = performance.now();
  try {
    const result = await runAudit(testCase.input);
    const durationMs = Math.round(performance.now() - start);
    const { status, reason } = scoreResult(testCase, result);
    return {
      testCase,
      status,
      reason,
      actualTypes: result.findings.map((f) => f.type),
      actualSeverity: result.findings[0]?.severity,
      overallRisk: result.summary.overallRisk,
      durationMs,
      result,
    };
  } catch (err) {
    return {
      testCase,
      status: "error",
      actualTypes: [],
      durationMs: Math.round(performance.now() - start),
      error:
        err instanceof AuditApiError
          ? `${err.message} (${err.status})`
          : err instanceof Error
            ? err.message
            : "Unknown error",
      reason:
        err instanceof AuditApiError
          ? `API error ${err.status}: ${err.message}`
          : err instanceof Error
            ? err.message
            : "Unknown error",
    };
  }
}
