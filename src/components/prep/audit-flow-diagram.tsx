"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface FlowNode {
  id: string;
  label: string;
  description: string;
  vercelFeature: string;
  details: string[];
  x: number;
  y: number;
  color: string;
  category: "client" | "platform" | "infra" | "external";
}

const FLOW_NODES: FlowNode[] = [
  {
    id: "browser",
    label: "Browser Input",
    description: "User submits text or PDF for audit",
    vercelFeature: "Next.js App Router",
    details: [
      "Vercel: Next.js Client Component with App Router",
      "Vercel: experimental_useObject (AI SDK React hook)",
      "App code: DemoWorkspace, useAudit() hook",
    ],
    x: 100,
    y: 10,
    color: "#3b82f6",
    category: "client",
  },
  {
    id: "tokenizer",
    label: "gpt-tokenizer",
    description: "Real BPE token count (o200k_base encoding)",
    vercelFeature: "Third-party package",
    details: [
      "NOT a Vercel component — npm package (gpt-tokenizer)",
      "Provides exact BPE token counts matching OpenAI tiktoken",
      "Runs client-side for instant preview, server-side for baselines",
    ],
    x: 100,
    y: 85,
    color: "#64748b",
    category: "external",
  },
  {
    id: "api-route",
    label: "/api/audit",
    description: "Validates input, computes baselines, dispatches to LLM",
    vercelFeature: "Vercel Functions + Fluid Compute",
    details: [
      "Vercel: Serverless Function with Fluid Compute runtime",
      "Vercel: Active CPU pricing — only pay during compute, not I/O wait",
      "App code: Zod validation, token counting, cost baselines",
    ],
    x: 100,
    y: 160,
    color: "#a855f7",
    category: "platform",
  },
  {
    id: "ai-sdk",
    label: "AI SDK v6",
    description: "Provider-agnostic structured streaming",
    vercelFeature: "Vercel AI SDK",
    details: [
      "Vercel: streamText() for streaming LLM responses",
      "Vercel: Output.object() for Zod-validated structured output",
      "Vercel: Provider abstraction — swap Ollama ↔ AI Gateway in one line",
    ],
    x: 100,
    y: 235,
    color: "#a855f7",
    category: "platform",
  },
  {
    id: "ollama",
    label: "Ollama (Local)",
    description: "On-device inference — zero cloud, zero cost",
    vercelFeature: "Third-party provider",
    details: [
      "NOT a Vercel component — local Ollama runtime",
      "Plugs into Vercel AI SDK via ollama-ai-provider-v2",
      "Swappable to Vercel AI Gateway for production (one-line change)",
    ],
    x: 100,
    y: 310,
    color: "#64748b",
    category: "external",
  },
  {
    id: "compute",
    label: "Efficiency Engine",
    description: "Deterministic metrics from findings + tokenizer",
    vercelFeature: "Application code",
    details: [
      "NOT a Vercel component — custom application logic",
      "Computes 9 Offlyn dimensions from LLM findings deterministically",
      "Uses gpt-tokenizer for real token counts, Offlyn constants for pricing",
    ],
    x: 100,
    y: 385,
    color: "#64748b",
    category: "external",
  },
  {
    id: "results",
    label: "Live Results UI",
    description: "Annotator + Scorecard update together in real-time",
    vercelFeature: "Next.js Client Components",
    details: [
      "Vercel: Next.js Client Components for interactive UI",
      "Vercel: experimental_useObject drives progressive rendering",
      "App code: LiveAnnotatedText, EfficiencyScorecard, CostSummary",
    ],
    x: 100,
    y: 460,
    color: "#3b82f6",
    category: "client",
  },
  {
    id: "eval-tests",
    label: "Eval Test Set",
    description: "8 curated inputs with known issues — the ground truth",
    vercelFeature: "Application code",
    details: [
      "NOT a Vercel component — hand-crafted test data",
      "8 inputs with known PII, redundancy, oversized, etc.",
      "Each defines expectedTypes and expectedSeverity",
    ],
    x: 380,
    y: 160,
    color: "#64748b",
    category: "external",
  },
  {
    id: "eval-runner",
    label: "Eval Runner",
    description: "Sends each test case through /api/audit and collects results",
    vercelFeature: "Vercel AI SDK + Functions",
    details: [
      "Vercel: Calls /api/audit (Vercel Function + AI SDK + Fluid Compute)",
      "Vercel: Response validated via AI SDK Output.object schema",
      "App code: enrichAuditResult() computes efficiency metrics",
    ],
    x: 380,
    y: 235,
    color: "#a855f7",
    category: "platform",
  },
  {
    id: "eval-scorer",
    label: "Rubric Scorer",
    description: "Compares LLM output to expected findings → pass/partial/fail",
    vercelFeature: "Application code",
    details: [
      "NOT a Vercel component — custom scoring logic",
      "Pass: all expected types + severity match",
      "Partial: some types found or severity mismatch",
      "Fail: LLM returned wrong types; generates failure reason",
    ],
    x: 380,
    y: 310,
    color: "#64748b",
    category: "external",
  },
];

const CONNECTIONS: [string, string][] = [
  ["browser", "tokenizer"],
  ["tokenizer", "api-route"],
  ["api-route", "ai-sdk"],
  ["ai-sdk", "ollama"],
  ["ollama", "compute"],
  ["compute", "results"],
  ["eval-tests", "eval-runner"],
  ["eval-runner", "eval-scorer"],
];

const CATEGORY_LABELS: Record<FlowNode["category"], string> = {
  client: "Next.js (Vercel)",
  platform: "Vercel Platform",
  infra: "AI Infrastructure",
  external: "App Code / Third-party",
};

const NODE_W = 140;
const NODE_H = 50;

export function AuditFlowDiagram() {
  const [selected, setSelected] = useState<FlowNode | null>(null);

  const nodeMap = Object.fromEntries(FLOW_NODES.map((n) => [n.id, n]));

  return (
    <div className="mt-8 space-y-6">
      <div className="grid gap-6 lg:grid-cols-1">
        {/* Diagram */}
        <div className="overflow-x-auto rounded-xl border border-border bg-card/30 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Interactive Audit Flow — click any node
          </p>
          <svg
            viewBox="0 0 600 530"
            className="h-auto w-full min-w-[480px]"
            role="img"
            aria-label="Audit flow diagram showing request pipeline"
          >
            <defs>
              <marker
                id="prep-arrow"
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
              <marker
                id="prep-arrow-pink"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="#ec4899" fillOpacity="0.5" />
              </marker>
            </defs>

            {/* Column labels */}
            <text x={100 + NODE_W / 2} y={6} textAnchor="middle" className="fill-muted-foreground text-[9px] font-medium" style={{ fontSize: 9 }}>
              AUDIT PIPELINE
            </text>
            <text x={380 + NODE_W / 2} y={156} textAnchor="middle" className="fill-pink-400/70 text-[9px] font-medium" style={{ fontSize: 9 }}>
              EVAL PIPELINE
            </text>

            {/* Vertical connections */}
            {CONNECTIONS.map(([fromId, toId]) => {
              const from = nodeMap[fromId];
              const to = nodeMap[toId];
              if (!from || !to) return null;

              const sameColumn = from.x === to.x;
              const sx = from.x + NODE_W / 2;
              const sy = from.y + NODE_H;
              const ex = to.x + NODE_W / 2;
              const ey = to.y;

              if (sameColumn) {
                return (
                  <g key={`${fromId}-${toId}`}>
                    <line
                      x1={sx} y1={sy + 2} x2={ex} y2={ey - 2}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                      className="text-border"
                      markerEnd="url(#prep-arrow)"
                    />
                    <circle r="3" fill="currentColor" className="text-accent/70">
                      <animateMotion
                        dur={`${2 + Math.random() * 0.8}s`}
                        repeatCount="indefinite"
                        path={`M${sx},${sy + 2} L${ex},${ey - 2}`}
                      />
                    </circle>
                  </g>
                );
              }
              return null;
            })}

            {/* Cross-connection: Eval Runner → /api/audit (dashed horizontal) */}
            <line
              x1={380}
              y1={235 + NODE_H / 2}
              x2={100 + NODE_W + 4}
              y2={160 + NODE_H / 2}
              stroke="#ec4899"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              strokeOpacity="0.4"
              markerEnd="url(#prep-arrow-pink)"
            />
            <text
              x={290}
              y={220}
              textAnchor="middle"
              className="fill-pink-400/60 text-[8px]"
              style={{ fontSize: 8 }}
            >
              reuses /api/audit
            </text>

            {/* Nodes */}
            {FLOW_NODES.map((node) => {
              const isSelected = selected?.id === node.id;
              return (
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
                    width={NODE_W}
                    height={NODE_H}
                    rx="10"
                    fill="var(--card)"
                    stroke={node.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  <text
                    x={NODE_W / 2}
                    y={22}
                    textAnchor="middle"
                    className="fill-foreground text-[11px] font-semibold"
                    style={{ fontSize: 11 }}
                  >
                    {node.label}
                  </text>
                  <text
                    x={NODE_W / 2}
                    y={38}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[8px]"
                    style={{ fontSize: 8 }}
                  >
                    {node.vercelFeature.length > 24
                      ? node.vercelFeature.slice(0, 22) + "…"
                      : node.vercelFeature}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-muted-foreground">
            {(
              Object.entries(CATEGORY_LABELS) as [FlowNode["category"], string][]
            ).map(([cat, label]) => {
              const color = FLOW_NODES.find((n) => n.category === cat)?.color;
              return (
                <span key={cat} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: color }}
                  />
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <div className="rounded-xl border border-border bg-card/50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: selected.color }}
                  />
                  <h3 className="text-sm font-bold text-foreground">
                    {selected.label}
                  </h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close detail panel"
                >
                  ×
                </button>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">
                {selected.description}
              </p>
              <div className="mb-4 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
                  Vercel Feature
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {selected.vercelFeature}
                </p>
              </div>
              <ul className="space-y-1.5">
                {selected.details.map((d) => (
                  <li key={d} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border p-6">
              <p className="text-center text-xs text-muted-foreground">
                Click any node in the diagram to see its details and which
                Vercel feature powers it.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible: Vercel Platform Components */}
      <Collapsible className="rounded-xl border border-border bg-card/50">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors rounded-xl">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">
              Vercel Platform Components
            </h3>
            <span className="text-[10px] text-muted-foreground">6 features</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180">
            <path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "AI SDK v6", usage: "streamText(), Output.object(), experimental_useObject — structured streaming with Zod validation and provider abstraction" },
              { name: "Vercel Functions", usage: "Serverless API routes (/api/audit, /api/chat) with maxDuration: 120s for long LLM calls" },
              { name: "Fluid Compute", usage: "Active CPU pricing — only billed for compute time, not the 5-15s idle wait on LLM inference" },
              { name: "Next.js 16 App Router", usage: "Server Components for static page shells, Client Components for interactive audit UI" },
              { name: "Proxy Middleware", usage: "Clerk auth enforcement on all routes — runs before every request" },
              { name: "next/font", usage: "Geist font family inlined at build — zero CLS from font loading" },
            ].map((item) => (
              <div key={item.name} className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.usage}</p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Collapsible: Request Lifecycle */}
      <Collapsible className="rounded-xl border border-border bg-card/50">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors rounded-xl">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">
              Request Lifecycle
            </h3>
            <span className="text-[10px] text-muted-foreground">8 steps</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180">
            <path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="relative space-y-0 px-4 pb-4">
            {[
              { step: 1, title: "User submits context", detail: "Text or PDF → gpt-tokenizer counts real BPE tokens client-side → POST /api/audit", feature: "Client Component + gpt-tokenizer" },
              { step: 2, title: "Auth Proxy intercepts", detail: "Clerk checks auth() → rejects unauthenticated requests", feature: "Vercel Proxy Middleware" },
              { step: 3, title: "API Route processes", detail: "Zod validates → countTokens() (real BPE) → per-model cost calc → streamText", feature: "Vercel Functions (Fluid Compute)" },
              { step: 4, title: "AI SDK structures the call", detail: "Output.object(modelOutputSchema) wraps prompt → routes to Ollama provider", feature: "AI SDK v6 (provider abstraction)" },
              { step: 5, title: "Ollama runs local inference", detail: "llama3.2 processes on-device → no network, no API key, no rate limit", feature: "ollama-ai-provider-v2" },
              { step: 6, title: "LLM returns findings (slim schema)", detail: "Returns findings[] + overallRisk + score — no efficiency numbers", feature: "modelOutputSchema (Zod validated)" },
              { step: 7, title: "Efficiency Engine computes metrics", detail: "Takes findings.tokenImpact → deterministic cost/energy/carbon/water via Offlyn constants", feature: "computeEfficiencyFromFindings()" },
              { step: 8, title: "Live UI renders progressively", detail: "Annotator highlights source text → scorecard fills per-dimension → cost cards show /1K projections", feature: "LiveAnnotatedText + EfficiencyScorecard" },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", "border border-accent/30 bg-accent/10 text-accent")}>
                    {item.step}
                  </div>
                  {i < 7 && <div className="h-full w-px bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.detail}</p>
                  <span className="mt-1 inline-block rounded bg-secondary px-2 py-0.5 text-[9px] font-medium text-muted-foreground">{item.feature}</span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Collapsible: Eval Pipeline */}
      <Collapsible className="rounded-xl border border-pink-500/20 bg-pink-500/5">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left hover:bg-pink-500/10 transition-colors rounded-xl">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">
              Eval Pipeline
            </h3>
            <span className="text-[10px] text-pink-500/70">Track B Requirement — 5 steps</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180">
            <path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="relative space-y-0 px-4 pb-4">
            {[
              { step: 1, title: "Test cases define ground truth", detail: "8 curated inputs with known issues — expected finding type and severity for each", feature: "evalTestCases" },
              { step: 2, title: "Each input sent to /api/audit", detail: "Same endpoint as the demo — AI SDK + Ollama analyzes each test input", feature: "runAudit()" },
              { step: 3, title: "Response validated and enriched", detail: "Zod validates against modelOutputSchema, then enrichAuditResult() computes metrics", feature: "modelOutputSchema" },
              { step: 4, title: "Rubric scores the output", detail: "Compares actual finding types/severity to expected. Pass / Partial / Fail", feature: "scoreResult()" },
              { step: 5, title: "Failure reason generated", detail: "Human-readable explanation: 'Expected pii but LLM returned weak-citation'", feature: "EvalResult.reason" },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-pink-500/30 bg-pink-500/10 text-[10px] font-bold text-pink-500">
                    {item.step}
                  </div>
                  {i < 4 && <div className="h-full w-px bg-pink-500/20" />}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.detail}</p>
                  <span className="mt-1 inline-block rounded bg-pink-500/10 px-2 py-0.5 text-[9px] font-medium text-pink-500/80">{item.feature}</span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
