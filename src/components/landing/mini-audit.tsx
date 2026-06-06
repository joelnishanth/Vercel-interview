"use client";

import { useEffect } from "react";
import { demoScenarios, defaultScenarioId } from "@/data/demo-scenarios";
import { useAudit } from "@/hooks/use-audit";
import { AuditResults } from "@/components/demo/audit-results";
import { EfficiencyScorecard } from "@/components/demo/efficiency-scorecard";
import { CostSummary } from "@/components/demo/cost-summary";
import { PipelineProgress } from "@/components/demo/pipeline-progress";

export function MiniAudit() {
  const scenario =
    demoScenarios.find((s) => s.id === defaultScenarioId) ?? demoScenarios[0];
  const { result, runAudit, isLoading, error } = useAudit();

  useEffect(() => {
    runAudit(scenario.context);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 rounded-xl border border-accent/20 bg-accent/[0.03] p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          Live mini-audit
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Running real audit on scenario:{" "}
          <span className="font-medium text-foreground">{scenario.label}</span>
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {error.message}. Set AI_GATEWAY_API_KEY in .env.local to enable live
          audits.
        </p>
      )}

      <PipelineProgress
        isLoading={isLoading}
        hasPartialResult={Boolean(result?.findings?.length)}
      />
      <AuditResults result={result} isLoading={isLoading} />
      <EfficiencyScorecard efficiency={result?.efficiency} />
      <CostSummary
        efficiency={result?.efficiency}
        overallScore={result?.summary?.overallEfficiencyScore}
      />
    </div>
  );
}
