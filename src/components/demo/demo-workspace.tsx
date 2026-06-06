"use client";

import { useState } from "react";
import { demoScenarios } from "@/data/demo-scenarios";
import { useAudit } from "@/hooks/use-audit";
import { AuditInput } from "@/components/demo/audit-input";
import { AuditResults } from "@/components/demo/audit-results";
import { PipelineProgress } from "@/components/demo/pipeline-progress";
import { EfficiencyScorecard } from "@/components/demo/efficiency-scorecard";
import { CostSummary } from "@/components/demo/cost-summary";

export function DemoWorkspace() {
  const [context, setContext] = useState(demoScenarios[0].context);
  const [mode, setMode] = useState<"text" | "files">("text");
  const { result, runAudit, isLoading, error, stop } = useAudit();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <AuditInput
          context={context}
          onContextChange={setContext}
          onRun={() => runAudit(context)}
          isLoading={isLoading}
          mode={mode}
          onModeChange={setMode}
        />
        {error && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error.message}
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
        <PipelineProgress
          isLoading={isLoading}
          hasPartialResult={Boolean(result?.findings?.length || result?.efficiency)}
        />
        <AuditResults result={result} isLoading={isLoading} />
        <EfficiencyScorecard efficiency={result?.efficiency} />
        <CostSummary
          efficiency={result?.efficiency}
          overallScore={result?.summary?.overallEfficiencyScore}
        />
      </div>
    </div>
  );
}
