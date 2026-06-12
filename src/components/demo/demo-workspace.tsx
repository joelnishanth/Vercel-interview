"use client";

import { useCallback, useMemo, useState } from "react";
import { demoScenarios } from "@/data/demo-scenarios";
import { useAudit } from "@/hooks/use-audit";
import { useAuditHistory } from "@/hooks/use-audit-history";
import { AuditInput } from "@/components/demo/audit-input";
import { AuditResults } from "@/components/demo/audit-results";
import { AuditHistory } from "@/components/demo/audit-history";
import { LiveRequestFlow } from "@/components/demo/live-request-flow";
import { LiveAnnotatedText } from "@/components/demo/live-annotated-text";
import { EfficiencyScorecard } from "@/components/demo/efficiency-scorecard";
import { CostSummary } from "@/components/demo/cost-summary";
import { countTokens } from "@/lib/token-utils";
import { enrichAuditResult } from "@/lib/compute-efficiency";
import type { AuditResult, ModelOutput } from "@/lib/audit-schemas";

export function DemoWorkspace() {
  const [context, setContext] = useState(demoScenarios[0].context);
  const [mode, setMode] = useState<"text" | "files">("text");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null,
  );
  const [submittedContext, setSubmittedContext] = useState<string>("");

  const { history, save, remove, clear } = useAuditHistory();

  const { result, streamingResult, isComplete, runAudit, isLoading, error, streamError, stop } = useAudit({
    onComplete: (submittedCtx, finished: ModelOutput) => {
      const enriched = enrichAuditResult(submittedCtx, finished) as AuditResult;
      save(submittedCtx, enriched);
      setSelectedHistoryId(null);
    },
  });

  const selectedHistory = useMemo(
    () => history.find((entry) => entry.id === selectedHistoryId),
    [history, selectedHistoryId],
  );

  const viewingPast = selectedHistory != null && !isLoading;

  const displayResult = selectedHistory
    ? selectedHistory.result
    : result;

  const liveResult = viewingPast
    ? selectedHistory?.result
    : (streamingResult ?? result);

  const handleRun = useCallback(() => {
    setSelectedHistoryId(null);
    setSubmittedContext(context);
    runAudit(context);
  }, [context, runAudit]);

  const handleSelectHistory = useCallback((id: string) => {
    setSelectedHistoryId(id);
  }, []);

  const handleRemoveHistory = useCallback(
    (id: string) => {
      remove(id);
      if (selectedHistoryId === id) {
        setSelectedHistoryId(null);
      }
    },
    [remove, selectedHistoryId],
  );

  const handleClearHistory = useCallback(() => {
    clear();
    setSelectedHistoryId(null);
  }, [clear]);

  const activeFindings = useMemo(() => {
    const src = viewingPast ? selectedHistory?.result : (streamingResult ?? result);
    return src?.findings ?? [];
  }, [viewingPast, selectedHistory, streamingResult, result]);

  const activeContext = viewingPast
    ? selectedHistory?.context ?? submittedContext
    : submittedContext;

  const tokenCount = useMemo(
    () => (activeContext ? countTokens(activeContext) : 0),
    [activeContext],
  );

  const enrichedLiveResult = useMemo((): Partial<AuditResult> | undefined => {
    if (!liveResult) return undefined;
    if (!activeContext) return { findings: liveResult.findings ?? [] };
    const findings = liveResult.findings ?? [];
    if (findings.length === 0) return { findings: [] };
    return enrichAuditResult(activeContext, liveResult);
  }, [liveResult, activeContext]);

  const showAnnotator = (isLoading || isComplete || viewingPast) && activeContext.length > 0;

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <AuditInput
            context={context}
            onContextChange={setContext}
            onRun={handleRun}
            onFileReady={(text) => {
              setSelectedHistoryId(null);
              setSubmittedContext(text);
              runAudit(text);
            }}
            isLoading={isLoading}
            mode={mode}
            onModeChange={setMode}
          />
          {(error || streamError) && (
            <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
              {error?.message ?? streamError}
            </p>
          )}
          {isLoading && (
            <button
              type="button"
              onClick={stop}
              className="mt-2 text-xs text-muted-foreground underline"
            >
              Stop audit
            </button>
          )}
        </div>

        <div className="space-y-4">
          {viewingPast && (
            <p className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
              Viewing saved audit from{" "}
              {new Date(selectedHistory.createdAt).toLocaleString()}. Run a new
              audit to refresh live results.
            </p>
          )}
          <LiveRequestFlow
            isLoading={isLoading}
            isComplete={isComplete || viewingPast}
            result={viewingPast ? selectedHistory.result : streamingResult ?? result}
          />
          <AuditResults
            result={displayResult}
            isLoading={isLoading && !viewingPast}
          />
          <EfficiencyScorecard
            efficiency={enrichedLiveResult?.efficiency}
            isStreaming={isLoading && !viewingPast}
          />
          <CostSummary
            efficiency={enrichedLiveResult?.efficiency}
            overallScore={enrichedLiveResult?.summary?.overallEfficiencyScore}
            isStreaming={isLoading && !viewingPast}
          />
        </div>
      </div>

      {showAnnotator && (
        <div className="mt-8">
          <LiveAnnotatedText
            context={activeContext}
            findings={activeFindings}
            isLoading={isLoading}
            tokenCount={tokenCount}
          />
        </div>
      )}

      <AuditHistory
        history={history}
        selectedId={selectedHistoryId}
        onSelect={handleSelectHistory}
        onRemove={handleRemoveHistory}
        onClear={handleClearHistory}
      />
    </div>
  );
};
