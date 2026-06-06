"use client";

import { demoScenarios } from "@/data/demo-scenarios";
import { cn } from "@/lib/utils";
import { FileDropZone } from "./file-drop-zone";
import { TokenPreview } from "./token-preview";

type AuditInputProps = {
  context: string;
  onContextChange: (value: string) => void;
  onRun: () => void;
  isLoading: boolean;
  mode: "text" | "files";
  onModeChange: (mode: "text" | "files") => void;
};

export function AuditInput({
  context,
  onContextChange,
  onRun,
  isLoading,
  mode,
  onModeChange,
}: AuditInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["text", "files"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              mode === m
                ? "bg-accent text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "text" ? "Text" : "File upload"}
          </button>
        ))}
      </div>

      {mode === "text" ? (
        <>
          <div className="flex flex-wrap gap-2">
            {demoScenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onContextChange(scenario.context)}
                className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground hover:border-accent/40 hover:bg-accent/5"
                title={scenario.description}
              >
                {scenario.label}
              </button>
            ))}
          </div>
          <textarea
            value={context}
            onChange={(e) => onContextChange(e.target.value)}
            placeholder="Paste prompts, RAG chunks, agent traces, or tool outputs…"
            rows={12}
            className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-accent/30"
          />
        </>
      ) : (
        <FileDropZone
          onContextChange={(text) =>
            onContextChange(context ? `${context}\n\n${text}` : text)
          }
        />
      )}

      <TokenPreview text={context} />

      <button
        type="button"
        onClick={onRun}
        disabled={isLoading || !context.trim()}
        className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Auditing via AI Gateway…" : "Run Audit"}
      </button>
    </div>
  );
}
