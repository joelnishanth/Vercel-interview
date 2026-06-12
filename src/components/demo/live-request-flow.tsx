"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuditResult, ModelOutput } from "@/lib/audit-schemas";
import { cn } from "@/lib/utils";

const NODES = [
  { id: "input", label: "User Input", shortLabel: "Input" },
  { id: "auth", label: "Auth Proxy", shortLabel: "Auth" },
  { id: "audit-api", label: "/api/audit", shortLabel: "API" },
  { id: "ai-sdk", label: "AI SDK", shortLabel: "SDK" },
  { id: "gateway", label: "AI SDK", shortLabel: "SDK→" },
  { id: "llm", label: "Ollama (Local)", shortLabel: "Ollama" },
  { id: "results", label: "Results UI", shortLabel: "Results" },
] as const;

type Stage =
  | "idle"
  | "auth"
  | "api"
  | "gateway"
  | "streaming"
  | "scoring"
  | "complete";

const STAGE_ACTIVE_INDEX: Record<Exclude<Stage, "idle">, number> = {
  auth: 1,
  api: 2,
  gateway: 4,
  streaming: 5,
  scoring: 6,
  complete: 6,
};

const STAGE_STATUS: Record<Stage, string> = {
  idle: "Submit context to start a live audit request.",
  auth: "Authenticating via Clerk proxy…",
  api: "Validating input and calling streamText…",
  gateway: "Routing request through AI Gateway…",
  streaming: "Streaming structured findings…",
  scoring: "Computing Offlyn efficiency metrics…",
  complete: "Audit complete — results rendered.",
};

const NODE_WIDTH = 88;
const NODE_HEIGHT = 36;
const NODE_GAP = 16;
const PADDING_X = 12;
const SVG_HEIGHT = 100;

function deriveStage(
  isLoading: boolean,
  isComplete: boolean,
  result: Partial<AuditResult> | Partial<ModelOutput> | undefined,
  elapsedMs: number,
): Stage {
  if (!isLoading && !result && !isComplete) return "idle";
  if (isComplete) return "complete";
  if (!isLoading && result) return "scoring";

  if (result?.summary?.overallRisk) return "scoring";
  if (result?.findings?.length) return "streaming";

  if (elapsedMs < 350) return "auth";
  if (elapsedMs < 700) return "api";
  return "gateway";
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function nodeX(index: number): number {
  return PADDING_X + index * (NODE_WIDTH + NODE_GAP);
}

function nodeCenter(index: number): { x: number; y: number } {
  return {
    x: nodeX(index) + NODE_WIDTH / 2,
    y: SVG_HEIGHT / 2,
  };
}

export function LiveRequestFlow({
  isLoading,
  isComplete = false,
  result,
}: {
  isLoading: boolean;
  isComplete?: boolean;
  result?: Partial<AuditResult> | Partial<ModelOutput>;
}) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null);

  const hasActivity = isLoading || Boolean(result);

  useEffect(() => {
    if (isLoading && runStartedAt === null) {
      setRunStartedAt(Date.now());
      setElapsedMs(0);
    }
    if (!isLoading && !result) {
      setRunStartedAt(null);
      setElapsedMs(0);
    }
  }, [isLoading, result, runStartedAt]);

  useEffect(() => {
    if (!isLoading) return;

    const interval = window.setInterval(() => {
      if (runStartedAt !== null) {
        setElapsedMs(Date.now() - runStartedAt);
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, [isLoading, runStartedAt]);

  const stage = deriveStage(isLoading, isComplete, result, elapsedMs);
  const activeIndex =
    stage === "idle" ? -1 : STAGE_ACTIVE_INDEX[stage];
  const svgWidth =
    PADDING_X * 2 + NODES.length * NODE_WIDTH + (NODES.length - 1) * NODE_GAP;

  const connections = useMemo(
    () =>
      NODES.slice(0, -1).map((_, i) => {
        const from = nodeCenter(i);
        const to = nodeCenter(i + 1);
        return {
          key: `${NODES[i].id}-${NODES[i + 1].id}`,
          x1: from.x + NODE_WIDTH / 2 - 4,
          y1: from.y,
          x2: to.x - NODE_WIDTH / 2 + 4,
          y2: to.y,
          path: `M${from.x + NODE_WIDTH / 2 - 4},${from.y} L${to.x - NODE_WIDTH / 2 + 4},${to.y}`,
          completed: stage === "complete" || i < activeIndex,
          active: i === activeIndex - 1 || (stage !== "idle" && i === activeIndex),
        };
      }),
    [activeIndex, stage],
  );

  if (!hasActivity) return null;

  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Live request flow
        </p>
        {runStartedAt !== null && (
          <span className="font-mono text-[10px] text-muted-foreground">
            {formatElapsed(elapsedMs)}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${SVG_HEIGHT}`}
          className="h-auto w-full min-w-[520px]"
          role="img"
          aria-label="Live audit request flow"
        >
          <defs>
            <marker
              id="flow-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path
                d="M0,0 L6,3 L0,6 Z"
                fill="currentColor"
                className="text-accent"
              />
            </marker>
          </defs>

          {connections.map((conn) => (
            <g key={conn.key}>
              <line
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke="currentColor"
                strokeWidth={conn.completed ? 2 : 1.5}
                strokeDasharray={conn.completed ? undefined : "4 4"}
                className={cn(
                  conn.completed
                    ? "text-accent"
                    : conn.active
                      ? "text-accent/60"
                      : "text-border",
                )}
                markerEnd="url(#flow-arrow)"
              />
              {conn.active && isLoading && (
                <circle r="4" fill="currentColor" className="text-accent">
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    path={conn.path}
                  />
                </circle>
              )}
            </g>
          ))}

          {NODES.map((node, i) => {
            const x = nodeX(i);
            const y = (SVG_HEIGHT - NODE_HEIGHT) / 2;
            const isComplete =
              stage === "complete" || (activeIndex >= 0 && i < activeIndex);
            const isActive = i === activeIndex;
            const isPending = activeIndex >= 0 && i > activeIndex;

            return (
              <g key={node.id} transform={`translate(${x}, ${y})`}>
                <rect
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx="8"
                  fill="var(--card)"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={cn(
                    isComplete && "text-accent",
                    isActive && "text-accent animate-pulse",
                    isPending && "text-border",
                    !isComplete && !isActive && !isPending && "text-border",
                  )}
                />
                <text
                  x={NODE_WIDTH / 2}
                  y={NODE_HEIGHT / 2 + 4}
                  textAnchor="middle"
                  className={cn(
                    "fill-foreground text-[9px] font-medium",
                    isPending && "fill-muted-foreground",
                  )}
                  style={{ fontSize: 9 }}
                >
                  {node.shortLabel}
                </text>
                {isComplete && (
                  <text
                    x={NODE_WIDTH - 8}
                    y={10}
                    textAnchor="middle"
                    className="fill-accent text-[8px] font-bold"
                    style={{ fontSize: 8 }}
                  >
                    ✓
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">{STAGE_STATUS[stage]}</p>

      {stage === "complete" && result?.summary?.overallRisk && (
        <div className="mt-3 flex flex-wrap gap-3 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs">
          <span>
            <span className="text-muted-foreground">Findings: </span>
            <span className="font-medium text-foreground">
              {result.findings?.length ?? 0}
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">Risk: </span>
            <span className="font-medium capitalize text-foreground">
              {result.summary.overallRisk ?? "—"}
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">Score: </span>
            <span className="font-medium text-accent">
              {result.summary.overallEfficiencyScore ?? "—"}/100
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
