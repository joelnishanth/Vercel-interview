import { auditResultSchema, type AuditResult } from "@/lib/audit-schemas";

// ── Design decision: client-side persistence with validation ───────────
// Audit history lives in localStorage (no backend needed for the demo).
// But we don't trust stored data blindly — every load re-validates
// through the Zod schema. This handles schema evolution: if we add a
// field to AuditResult, old entries that fail validation are silently
// dropped instead of crashing the UI.

export type StoredAudit = {
  id: string;
  createdAt: string;
  context: string;
  contextPreview: string;
  contextLength: number;
  result: AuditResult;
};

const STORAGE_PREFIX = "offlyn-audit-history";
// ── Bounded storage: cap at 20 to prevent localStorage quota issues ────
const MAX_ENTRIES = 20;

// ── Design decision: per-user storage keys ─────────────────────────────
// Clerk userId scopes history so multiple users on the same device
// don't see each other's audits. Falls back to "anonymous" pre-auth.
export function historyStorageKey(userId: string | null | undefined): string {
  return `${STORAGE_PREFIX}:${userId ?? "anonymous"}`;
}

export function loadAuditHistory(userId: string | null | undefined): StoredAudit[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(historyStorageKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        const record = entry as StoredAudit;
        const validated = auditResultSchema.safeParse(record.result);
        if (!validated.success) return null;
        return {
          ...record,
          context: record.context ?? "",
          result: validated.data,
        };
      })
      .filter((entry): entry is StoredAudit => entry !== null);
  } catch {
    return [];
  }
}

// ── Design decision: validate on write too, not just read ──────────────
// If enrichAuditResult produces an invalid shape (e.g. during streaming),
// we refuse to persist it rather than storing garbage. The function
// returns the existing history unchanged — no silent data corruption.
export function saveAuditHistory(
  userId: string | null | undefined,
  context: string,
  result: AuditResult,
): StoredAudit[] {
  const validated = auditResultSchema.safeParse(result);
  if (!validated.success) {
    return loadAuditHistory(userId);
  }

  const entry: StoredAudit = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    context,
    contextPreview: context.trim().slice(0, 120),
    contextLength: context.length,
    result: validated.data,
  };

  const next = [entry, ...loadAuditHistory(userId)].slice(0, MAX_ENTRIES);

  if (typeof window !== "undefined") {
    localStorage.setItem(historyStorageKey(userId), JSON.stringify(next));
  }

  return next;
}

export function removeAuditFromHistory(
  userId: string | null | undefined,
  id: string,
): StoredAudit[] {
  const next = loadAuditHistory(userId).filter((entry) => entry.id !== id);

  if (typeof window !== "undefined") {
    localStorage.setItem(historyStorageKey(userId), JSON.stringify(next));
  }

  return next;
}

export function clearAuditHistory(userId: string | null | undefined): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(historyStorageKey(userId));
  }
}
