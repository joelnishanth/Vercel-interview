"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import type { AuditResult } from "@/lib/audit-schemas";
import {
  clearAuditHistory,
  loadAuditHistory,
  removeAuditFromHistory,
  saveAuditHistory,
  type StoredAudit,
} from "@/lib/audit-history";

export function useAuditHistory() {
  const { userId, isLoaded } = useAuth();
  const [history, setHistory] = useState<StoredAudit[]>([]);

  useEffect(() => {
    if (!isLoaded) return;
    setHistory(loadAuditHistory(userId));
  }, [isLoaded, userId]);

  const save = useCallback(
    (context: string, result: AuditResult) => {
      if (!isLoaded) return;
      setHistory(saveAuditHistory(userId, context, result));
    },
    [isLoaded, userId],
  );

  const remove = useCallback(
    (id: string) => {
      if (!isLoaded) return;
      setHistory(removeAuditFromHistory(userId, id));
    },
    [isLoaded, userId],
  );

  const clear = useCallback(() => {
    if (!isLoaded) return;
    clearAuditHistory(userId);
    setHistory([]);
  }, [isLoaded, userId]);

  return { history, save, remove, clear, isReady: isLoaded };
}
