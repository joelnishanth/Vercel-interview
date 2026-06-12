"use client";

import { useMemo, useState } from "react";
import { demoScenarios, defaultScenarioId } from "@/data/demo-scenarios";
import { useAudit } from "@/hooks/use-audit";
import { AuditResults } from "@/components/demo/audit-results";
import { EfficiencyScorecard } from "@/components/demo/efficiency-scorecard";
import { CostSummary } from "@/components/demo/cost-summary";
import { PipelineProgress } from "@/components/demo/pipeline-progress";
import { enrichAuditResult } from "@/lib/compute-efficiency";

export function MiniAudit() {
  const scenario =
    demoScenarios.find((s) => s.id === defaultScenarioId) ?? demoScenarios[0];
  const [started, setStarted] = useState(false);
  const { result, isComplete, runAudit, isLoading, error, streamError } =
    useAudit();

  const enrichedResult = useMemo(() => {
    if (!result?.findings?.length) return undefined;
    return enrichAuditResult(scenario.context, result);
  }, [result, scenario.context]);

  const handleRun = () => {
    setStarted(true);
    runAudit(scenario.context);
  };

  return (
    <div className="space-y-4 rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Live mini-audit
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sample scenario:{" "}
            <span className="font-medium text-foreground">{scenario.label}</span>
          </p>
        </div>
        {!started && (
          <button
            type="button"
            onClick={handleRun}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
          >
            Run sample audit
          </button>
        )}
      </div>

      {(error || streamError) && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error?.message ?? streamError}
        </p>
      )}

      {started && (
        <>
          <PipelineProgress
            isLoading={isLoading}
            hasPartialResult={Boolean(result?.findings?.length)}
          />
          <AuditResults result={result} isLoading={isLoading} />
          {isComplete && enrichedResult && (
            <>
              <EfficiencyScorecard efficiency={enrichedResult.efficiency} />
              <CostSummary
                efficiency={enrichedResult.efficiency}
                overallScore={enrichedResult.summary?.overallEfficiencyScore}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
