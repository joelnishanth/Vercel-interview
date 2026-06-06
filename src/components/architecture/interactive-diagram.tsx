"use client";

import { useState } from "react";
import {
  architectureConnections,
  architectureNodes,
  type ArchitectureNode,
} from "@/data/architecture-nodes";
import { NodeDetailPanel } from "./node-detail-panel";

const typeColors: Record<ArchitectureNode["type"], string> = {
  server: "#22c55e",
  client: "#3b82f6",
  api: "#a855f7",
  external: "#f97316",
};

export function InteractiveDiagram() {
  const [selected, setSelected] = useState<ArchitectureNode | null>(null);

  const nodeMap = Object.fromEntries(
    architectureNodes.map((n) => [n.id, n]),
  ) as Record<string, ArchitectureNode>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-x-auto rounded-xl border border-border bg-card/30 p-4">
        <svg
          viewBox="0 0 760 340"
          className="h-auto w-full min-w-[600px]"
          role="img"
          aria-label="Architecture diagram"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" className="text-accent" />
            </marker>
          </defs>

          {architectureConnections.map(([from, to], i) => {
            const a = nodeMap[from];
            const b = nodeMap[to];
            if (!a || !b) return null;
            return (
              <g key={`${from}-${to}`}>
                <line
                  x1={a.x + 60}
                  y1={a.y + 20}
                  x2={b.x + 10}
                  y2={b.y + 20}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="text-border"
                  markerEnd="url(#arrow)"
                />
                <circle r="3" fill="currentColor" className="text-accent">
                  <animateMotion
                    dur={`${2 + (i % 3)}s`}
                    repeatCount="indefinite"
                    path={`M${a.x + 60},${a.y + 20} L${b.x + 10},${b.y + 20}`}
                  />
                </circle>
              </g>
            );
          })}

          {architectureNodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => setSelected(node)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelected(node);
              }}
            >
              <rect
                width="120"
                height="40"
                rx="8"
                fill="var(--card)"
                stroke={typeColors[node.type]}
                strokeWidth={selected?.id === node.id ? 3 : 1.5}
              />
              <text
                x="60"
                y="24"
                textAnchor="middle"
                className="fill-foreground text-[11px] font-medium"
                style={{ fontSize: 11 }}
              >
                {node.label.length > 16
                  ? node.label.slice(0, 14) + "…"
                  : node.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          {(
            [
              ["server", "Server"],
              ["client", "Client"],
              ["api", "API Route"],
              ["external", "External"],
            ] as const
          ).map(([type, label]) => (
            <span key={type} className="flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: typeColors[type] }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <NodeDetailPanel node={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
