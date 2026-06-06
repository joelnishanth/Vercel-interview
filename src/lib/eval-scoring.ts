"use client";

import type { AuditResult } from "@/lib/audit-schemas";
import type { EvalTestCase } from "@/data/eval-test-cases";
import { runAudit, AuditApiError } from "@/lib/audit-client";

export type EvalResult = {
  testCase: EvalTestCase;
  status: "pending" | "running" | "pass" | "partial" | "fail" | "error";
  actualTypes: string[];
  actualSeverity?: string;
  overallRisk?: string;
  durationMs?: number;
  error?: string;
  result?: AuditResult;
};

function scoreResult(
  testCase: EvalTestCase,
  result: AuditResult,
): EvalResult["status"] {
  const actualTypes = result.findings.map((f) => f.type);

  if (testCase.expectClean) {
    return result.findings.length === 0 || result.summary.overallRisk === "clean"
      ? "pass"
      : "fail";
  }

  const expected = testCase.expectedTypes;
  const matched = expected.filter((t) => actualTypes.includes(t));
  if (matched.length === expected.length) {
    if (testCase.expectedSeverity) {
      const sevMatch = result.findings.some(
        (f) =>
          expected.includes(f.type) && f.severity === testCase.expectedSeverity,
      );
      return sevMatch ? "pass" : "partial";
    }
    return "pass";
  }
  if (matched.length > 0) return "partial";
  return "fail";
}

export async function runEvalCase(testCase: EvalTestCase): Promise<EvalResult> {
  const start = performance.now();
  try {
    const result = await runAudit(testCase.input);
    const durationMs = Math.round(performance.now() - start);
    return {
      testCase,
      status: scoreResult(testCase, result),
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
    };
  }
}
