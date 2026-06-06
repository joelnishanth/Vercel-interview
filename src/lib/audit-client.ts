import type { AuditResult } from "@/lib/audit-schemas";

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
  try {
    return JSON.parse(text) as AuditResult;
  } catch {
    throw new Error("Invalid audit response — could not parse JSON");
  }
}

export async function runAuditStream(
  context: string,
  onPartial: (partial: string) => void,
): Promise<AuditResult> {
  const res = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context }),
  });

  if (!res.ok) {
    throw new AuditApiError(`Audit failed (${res.status})`, res.status);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response stream");

  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    accumulated += chunk;
    onPartial(accumulated);
  }

  return JSON.parse(accumulated) as AuditResult;
}
