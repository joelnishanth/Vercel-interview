import { modelOutputSchema, type AuditResult } from "@/lib/audit-schemas";
import { enrichAuditResult } from "@/lib/compute-efficiency";

export class AuditApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfter?: string,
  ) {
    super(message);
    this.name = "AuditApiError";
  }
}

/**
 * Non-streaming audit call for eval suite.
 * The API returns a ModelOutput (slim: findings + summary).
 * We enrich it client-side to produce a full AuditResult with efficiency metrics.
 */
export async function runAudit(context: string): Promise<AuditResult> {
  const res = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context }),
  });

  if (!res.ok) {
    const retryAfter = res.headers.get("retry-after") ?? undefined;
    let message = `Audit failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new AuditApiError(message, res.status, retryAfter);
  }

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid audit response — could not parse JSON");
  }

  const validated = modelOutputSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `Audit response failed validation: ${validated.error.issues[0]?.message ?? "unknown"}`,
    );
  }

  return enrichAuditResult(context, validated.data) as AuditResult;
}
