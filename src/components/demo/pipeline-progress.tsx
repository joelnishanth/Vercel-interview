"use client";

const STAGES = [
  { id: "ingest", label: "Ingest" },
  { id: "analyze", label: "Analyze" },
  { id: "score", label: "Score" },
  { id: "recommend", label: "Recommend" },
] as const;

export function PipelineProgress({
  isLoading,
  hasPartialResult,
}: {
  isLoading: boolean;
  hasPartialResult: boolean;
}) {
  if (!isLoading && !hasPartialResult) return null;

  const activeIndex = isLoading
    ? hasPartialResult
      ? 2
      : 1
    : 3;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Audit pipeline
      </p>
      <div className="flex items-center gap-2">
        {STAGES.map((stage, i) => (
          <div key={stage.id} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i <= activeIndex
                  ? "bg-accent text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-xs sm:inline ${
                i <= activeIndex ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {stage.label}
            </span>
            {i < STAGES.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${
                  i < activeIndex ? "bg-accent" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {isLoading
          ? "Streaming structured output from AI Gateway…"
          : "Audit complete"}
      </p>
    </div>
  );
}
