"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { auditResultSchema, type AuditResult } from "@/lib/audit-schemas";

export function useAudit() {
  const { object, submit, isLoading, error, stop, clear } = useObject({
    api: "/api/audit",
    schema: auditResultSchema,
  });

  const runAudit = (context: string) => {
    if (!context.trim()) return;
    submit({ context });
  };

  return {
    result: object as Partial<AuditResult> | undefined,
    runAudit,
    isLoading,
    error,
    stop,
    clear,
  };
}
