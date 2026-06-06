"use client";

import type { ArchitectureNode } from "@/data/architecture-nodes";
import { cn } from "@/lib/utils";

const typeStyles: Record<ArchitectureNode["type"], string> = {
  server: "border-green-500/40 bg-green-500/10",
  client: "border-blue-500/40 bg-blue-500/10",
  api: "border-purple-500/40 bg-purple-500/10",
  external: "border-orange-500/40 bg-orange-500/10",
};

export function NodeDetailPanel({
  node,
  onClose,
}: {
  node: ArchitectureNode | null;
  onClose: () => void;
}) {
  if (!node) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Click a node to see implementation details, code, and Vercel features.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/80 p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <span
            className={cn(
              "inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase",
              typeStyles[node.type],
            )}
          >
            {node.type}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            {node.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {node.description}
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Files
          </p>
          <ul className="mt-1 space-y-0.5">
            {node.implementationFiles.map((f) => (
              <li key={f} className="font-mono text-xs text-foreground">
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Vercel feature
          </p>
          <p className="mt-1 text-sm text-foreground">{node.vercelFeature}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            Code
          </p>
          <pre className="mt-1 overflow-x-auto rounded-lg bg-secondary/50 p-3 font-mono text-xs text-foreground">
            {node.codeSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
