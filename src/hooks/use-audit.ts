"use client";

import { useCallback, useRef, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { modelOutputSchema, type ModelOutput } from "@/lib/audit-schemas";
import { formatGatewayErrorMessage } from "@/lib/ai-models";

// ── Design decision: custom hook wrapping AI SDK's useObject ───────────
// useObject streams a typed partial JSON object from the server.
// This hook adds three things the raw hook doesn't provide:
//   1. Separation of "streaming" vs "completed" result states
//   2. Stable callback refs to avoid stale closures in effects
//   3. Error classification (stream error vs finish error vs empty result)
export function useAudit(options?: {
  onComplete?: (context: string, result: ModelOutput) => void;
}) {
  const [streamError, setStreamError] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<ModelOutput | null>(
    null,
  );
  // ── Design decision: refs for callback stability ─────────────────────
  // pendingContextRef holds the input text across the async stream lifecycle.
  // onCompleteRef avoids re-subscribing the effect when the parent re-renders.
  // Without these, stale closures would capture outdated state.
  const pendingContextRef = useRef<string | null>(null);
  const onCompleteRef = useRef(options?.onComplete);
  onCompleteRef.current = options?.onComplete;

  const { object, submit, isLoading, error, stop, clear } = useObject({
    api: "/api/audit",
    schema: modelOutputSchema,
    credentials: "same-origin",
    onError: (err) => {
      setStreamError(formatGatewayErrorMessage(err));
    },
    onFinish: ({ object: finished, error: finishError }) => {
      if (finishError) {
        setCompletedResult(null);
        setStreamError(formatGatewayErrorMessage(finishError));
        return;
      }
      if (!finished) {
        setCompletedResult(null);
        setStreamError(
          "Audit returned no data. Ensure Ollama is running.",
        );
        return;
      }

      setCompletedResult(finished);

      // ── Design decision: queueMicrotask for post-render side effects ──
      // onComplete triggers history save + enrichment in DemoWorkspace.
      // queueMicrotask defers this until after React finishes the current
      // render cycle, preventing setState-during-render warnings.
      const context = pendingContextRef.current;
      if (context) {
        queueMicrotask(() => {
          onCompleteRef.current?.(context, finished);
        });
      }
    },
  });

  const runAudit = useCallback(
    (context: string) => {
      if (!context.trim()) return;
      pendingContextRef.current = context;
      setStreamError(null);
      setCompletedResult(null);
      submit({ context });
    },
    [submit],
  );

  const clearAll = useCallback(() => {
    pendingContextRef.current = null;
    setStreamError(null);
    setCompletedResult(null);
    clear();
  }, [clear]);

  // ── Design decision: dual result accessors ────────────────────────────
  // `result` = completed if available, otherwise the live streaming partial.
  //   Used by most UI components that just want "the best data we have."
  // `streamingResult` = always the raw streaming object (may have partial fields).
  //   Used by components that need to show streaming-specific UX (e.g. skeleton).
  // `completedResult` = null until the stream finishes successfully.
  //   Used to gate one-time side effects like history save.
  return {
    result: (completedResult ?? object) as Partial<ModelOutput> | undefined,
    streamingResult: object as Partial<ModelOutput> | undefined,
    completedResult,
    isComplete: completedResult != null,
    runAudit,
    isLoading,
    error,
    streamError,
    stop,
    clear: clearAll,
  };
}
