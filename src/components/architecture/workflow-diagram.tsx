"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type WorkflowStep = {
  id: string;
  label: string;
  directive: string;
  description: string;
  retryBehavior: string;
  code: string;
  icon: string;
  color: string;
  features: string[];
};

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "trigger",
    label: "Trigger",
    directive: 'start(batchAuditWorkflow, [docIds])',
    description:
      "CI/CD webhook, cron job, or API call fires the workflow with a batch of document IDs.",
    retryBehavior: "Workflow is idempotent — safe to retry the trigger if delivery fails.",
    code: `import { start } from "workflow/api";

export async function POST(req: Request) {
  const { docIds } = await req.json();
  const run = await start(batchAuditWorkflow, [docIds]);
  return Response.json({ runId: run.runId });
}`,
    icon: "1",
    color: "#f59e0b",
    features: ["Workflows and Steps"],
  },
  {
    id: "parse",
    label: "Parse & Tokenize",
    directive: '"use step"',
    description:
      "Fetches each document from Blob storage, extracts text (PDF to plaintext), and counts real BPE tokens with gpt-tokenizer.",
    retryBehavior: "Automatic retry on network failure. Result is cached — if the workflow restarts, this step skips.",
    code: `async function parseAndTokenize(docId: string) {
  "use step";
  const blob = await fetchFromBlob(docId);
  const text = await extractText(blob);
  const tokens = countTokens(text);
  return { text, tokens };
}`,
    icon: "2",
    color: "#3b82f6",
    features: ["Workflows and Steps", "Streams", "Skew Protection"],
  },
  {
    id: "llm-audit",
    label: "LLM Audit",
    directive: '"use step"',
    description:
      "Sends context to AI Gateway → Gemini 2.5 Flash for structured finding analysis. Each document is an independent step — one failure doesn't block others.",
    retryBehavior: "RetryableError on 429 rate limits (retryAfter: '30s'). FatalError on invalid schema output after 3 attempts.",
    code: `async function auditWithLLM(text: string, tokens: number) {
  "use step";
  const result = await streamText({
    model: gateway("google/gemini-2.5-flash"),
    output: Output.object({ schema: modelOutputSchema }),
    prompt: buildAuditPrompt(text, tokens),
  });
  return result.object;
}`,
    icon: "3",
    color: "#a855f7",
    features: ["Workflows and Steps", "Observability", "Skew Protection"],
  },
  {
    id: "compute",
    label: "Compute Metrics",
    directive: '"use step"',
    description:
      "Runs the deterministic Offlyn efficiency engine — 9 dimensions (cost, carbon, water, privacy, etc.) computed from findings + token counts. No LLM involved.",
    retryBehavior: "Pure computation — no external calls. Fails only on code bugs (FatalError).",
    code: `async function computeEfficiency(
  findings: Finding[], tokens: number
) {
  "use step";
  return computeEfficiencyFromFindings(findings, tokens);
}`,
    icon: "4",
    color: "#22c55e",
    features: ["Workflows and Steps"],
  },
  {
    id: "store",
    label: "Store Results",
    directive: '"use step"',
    description:
      "Persists the enriched audit result to Vercel Postgres — findings, efficiency metrics, and summary all in one row per document.",
    retryBehavior: "Automatic retry on transient DB errors. Idempotent upsert prevents duplicates.",
    code: `async function storeResult(
  docId: string, result: AuditResult
) {
  "use step";
  await db.auditResults.upsert({
    where: { docId },
    create: { docId, ...result },
    update: { ...result },
  });
}`,
    icon: "5",
    color: "#06b6d4",
    features: ["Workflows and Steps", "Usage-Based Pricing"],
  },
  {
    id: "alert",
    label: "Alert on PII",
    directive: '"use step"',
    description:
      "If any finding has type 'pii' with severity 'high', fires a webhook to Slack/PagerDuty and flags the document for compliance review.",
    retryBehavior: "RetryableError on webhook delivery failure. Alert is logged even if delivery fails.",
    code: `async function alertIfPII(
  docId: string, findings: Finding[]
) {
  "use step";
  const pii = findings.filter(
    f => f.type === "pii" && f.severity === "high"
  );
  if (pii.length > 0) {
    await sendWebhook("slack", {
      text: \`PII detected in \${docId}\`,
      findings: pii,
    });
  }
}`,
    icon: "6",
    color: "#ef4444",
    features: ["Workflows and Steps", "Observability"],
  },
  {
    id: "approval",
    label: "Compliance Hold",
    directive: "createHook() + sleep()",
    description:
      "If PII was found, the workflow pauses and waits for a compliance officer to approve before the context can be forwarded to a production LLM. Optional timeout with sleep().",
    retryBehavior: "Workflow suspends — no compute cost during wait. Resumes on resumeHook() call.",
    code: `// In workflow orchestrator
const hook = createHook<{ approved: boolean }>({
  token: \`compliance-\${docId}\`,
});
const decision = await hook;

if (!decision.approved) {
  throw new FatalError("Compliance rejected");
}`,
    icon: "7",
    color: "#ec4899",
    features: ["Sleep and Hooks", "Observability"],
  },
];

const ORCHESTRATOR_CODE = `export async function batchAuditWorkflow(docIds: string[]) {
  "use workflow";

  const results = [];
  for (const docId of docIds) {
    const { text, tokens } = await parseAndTokenize(docId);
    const findings = await auditWithLLM(text, tokens);
    const metrics = await computeEfficiency(findings, tokens);
    const result = { findings, metrics };

    await storeResult(docId, result);
    await alertIfPII(docId, findings);

    results.push({ docId, result });
  }
  return results;
}`;

const WORKFLOW_FEATURES = [
  {
    title: "Workflows and Steps",
    directive: '"use workflow" + "use step"',
    description:
      "Write durable functions where each step is independently retryable and crash-safe.",
    auditMapping:
      "Parse, LLM audit, compute metrics, store, and alert are each a separate step. If the LLM call fails, only that step retries — not the entire pipeline.",
  },
  {
    title: "Sleep and Hooks",
    directive: "sleep() + createHook()",
    description:
      "Pause a workflow for minutes to months, or wait for an external event before continuing.",
    auditMapping:
      "After PII detection, the workflow pauses via createHook() and waits for a compliance officer to approve before context reaches a production LLM.",
  },
  {
    title: "Observability",
    directive: "Built-in run tracing",
    description:
      "Track runs in real time, trace failures to specific steps, and analyze performance across the pipeline.",
    auditMapping:
      "Dashboard shows which documents failed audit, which step failed (LLM timeout vs. schema validation), average latency per step, and PII detection rate.",
  },
  {
    title: "Streams",
    directive: "getWritable()",
    description:
      "Stream data in and out of workflows with managed persistence — no manual state serialization between steps.",
    auditMapping:
      "Stream a 50+ page PDF through the tokenizer, chunk it, and audit each chunk as a separate step. Intermediate results persist automatically if the function recycles.",
  },
  {
    title: "Skew Protection",
    directive: "Version-safe execution",
    description:
      "Protect long-running workflows from version skew when you deploy a new version mid-execution.",
    auditMapping:
      "A batch audit of 500 documents takes 30 minutes. If a prompt change deploys halfway through, Skew Protection ensures the in-flight batch completes with the original prompt.",
  },
  {
    title: "Usage-Based Pricing",
    directive: "Events + Data Written + Retained",
    description:
      "Pay only for events processed, data written, and data retained — no idle compute costs.",
    auditMapping:
      "Enterprise runs 10K audits/month. Pay per audit event, per finding stored, per month of retention. Zero cost for idle time between batch runs.",
  },
];

function StepNode({
  step,
  index,
  isActive,
  isComplete,
  onClick,
  isSelected,
}: {
  step: WorkflowStep;
  index: number;
  isActive: boolean;
  isComplete: boolean;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <div className="flex gap-3">
      {/* Vertical line + step indicator */}
      <div className="flex flex-col items-center">
        <motion.button
          type="button"
          onClick={onClick}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-base transition-all",
            isSelected
              ? "border-accent bg-accent/20 shadow-lg shadow-accent/20"
              : isComplete
                ? "border-green-500/50 bg-green-500/10"
                : isActive
                  ? "border-current bg-current/10"
                  : "border-border bg-card",
          )}
          style={
            isActive && !isSelected ? { borderColor: step.color, color: step.color } : undefined
          }
        >
          {isComplete && !isActive ? (
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-green-500">
              <path
                d="M4 8l3 3 5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span className="text-xs font-bold" style={{ color: isActive ? step.color : undefined }}>{step.icon}</span>
          )}
          {isActive && (
            <motion.span
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: step.color }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>
        {index < WORKFLOW_STEPS.length - 1 && (
          <div className="relative w-px flex-1 min-h-4 bg-border">
            {isComplete && (
              <motion.div
                className="absolute inset-0 bg-green-500/50"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                style={{ transformOrigin: "top" }}
              />
            )}
          </div>
        )}
      </div>

      {/* Step content */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.08 }}
        className={cn("flex-1 pb-5", index === WORKFLOW_STEPS.length - 1 && "pb-0")}
      >
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "w-full rounded-lg border p-3 text-left transition-all",
            isSelected
              ? "border-accent bg-accent/5 ring-1 ring-accent/30"
              : "border-border bg-card/50 hover:border-accent/30 hover:bg-card/80",
          )}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-foreground">{step.label}</span>
            <Badge
              variant="outline"
              className="font-mono text-[9px] px-1.5 py-0"
              style={{
                borderColor: `${step.color}40`,
                color: step.color,
                backgroundColor: `${step.color}08`,
              }}
            >
              {step.directive}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {step.description}
          </p>
          {step.features.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {step.features.map((f) => (
                <span
                  key={f}
                  className="rounded border border-accent/25 bg-accent/8 px-1.5 py-0 text-[8px] font-medium text-accent"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </button>
      </motion.div>
    </div>
  );
}

function SimulationControls({
  activeStep,
  isRunning,
  onStart,
  onReset,
}: {
  activeStep: number;
  isRunning: boolean;
  onStart: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {!isRunning && activeStep === -1 && (
        <motion.button
          type="button"
          onClick={onStart}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 1l8 5-8 5V1z" fill="currentColor" />
          </svg>
          Simulate workflow run
        </motion.button>
      )}
      {(isRunning || activeStep >= 0) && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {isRunning && (
              <motion.div
                className="h-2 w-2 rounded-full bg-green-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            <span className="text-[11px] font-medium text-muted-foreground">
              {isRunning
                ? `Step ${activeStep + 1}/${WORKFLOW_STEPS.length}: ${WORKFLOW_STEPS[activeStep]?.label}`
                : "Workflow complete"}
            </span>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-border px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-secondary"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export function WorkflowDiagram() {
  const [selected, setSelected] = useState<WorkflowStep | null>(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || activeStep < 0) return;
    if (activeStep >= WORKFLOW_STEPS.length) {
      setIsRunning(false);
      return;
    }
    const timer = setTimeout(
      () => setActiveStep((s) => s + 1),
      activeStep === 6 ? 2500 : 1200, // compliance hold is slower
    );
    return () => clearTimeout(timer);
  }, [activeStep, isRunning]);

  const startSimulation = () => {
    setActiveStep(0);
    setIsRunning(true);
    setSelected(null);
  };

  const resetSimulation = () => {
    setActiveStep(-1);
    setIsRunning(false);
  };

  return (
    <Card className="overflow-hidden py-0">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-accent"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h2 className="text-sm font-semibold text-foreground">
                Vercel Workflow — Batch Audit Pipeline
              </h2>
              <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-600 bg-amber-500/5">
                Production Roadmap
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Durable, crash-safe orchestration for enterprise batch audits
              using{" "}
              <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[10px]">
                &quot;use workflow&quot;
              </code>{" "}
              +{" "}
              <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[10px]">
                &quot;use step&quot;
              </code>
            </p>
          </div>
          <SimulationControls
            activeStep={activeStep}
            isRunning={isRunning}
            onStart={startSimulation}
            onReset={resetSimulation}
          />
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
        {/* Left: step flow */}
        <div className="border-r border-border p-5">
          <div className="space-y-0">
            {WORKFLOW_STEPS.map((step, i) => (
              <StepNode
                key={step.id}
                step={step}
                index={i}
                isActive={isRunning && activeStep === i}
                isComplete={activeStep > i}
                isSelected={selected?.id === step.id}
                onClick={() => setSelected(selected?.id === step.id ? null : step)}
              />
            ))}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: selected.color }}
                      >
                        {selected.icon}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">
                        {selected.label}
                      </h3>
                    </div>
                    <Badge
                      variant="outline"
                      className="mt-1 font-mono text-[10px]"
                      style={{
                        borderColor: `${selected.color}40`,
                        color: selected.color,
                      }}
                    >
                      {selected.directive}
                    </Badge>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  {selected.description}
                </p>

                {/* Retry behavior */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                    Retry & Recovery
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {selected.retryBehavior}
                  </p>
                </div>

                {/* Code */}
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Implementation
                  </p>
                  <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/30 p-3 font-mono text-[11px] leading-relaxed text-foreground">
                    {selected.code}
                  </pre>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="orchestrator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      Workflow Orchestrator
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The top-level{" "}
                    <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[10px]">
                      &quot;use workflow&quot;
                    </code>{" "}
                    function orchestrates all steps. Each step is independently
                    retryable and crash-safe.
                  </p>
                </div>

                <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/30 p-3 font-mono text-[11px] leading-relaxed text-foreground">
                  {ORCHESTRATOR_CODE}
                </pre>

                {/* Workflow benefits */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      title: "Crash Recovery",
                      desc: "If the function recycles mid-batch, completed steps replay from cache — no duplicate work.",
                    },
                    {
                      title: "Per-Step Retry",
                      desc: "LLM rate-limited? Only the audit step retries. Parsing and metrics are already cached.",
                    },
                    {
                      title: "Observability",
                      desc: "Trace each step's latency, see which documents failed and why, all from the Vercel dashboard.",
                    },
                    {
                      title: "Usage-Based",
                      desc: "Pay per event + data stored. No idle compute between batch runs.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-lg border border-border bg-card/50 p-3"
                    >
                      <span className="text-[11px] font-semibold text-foreground">
                        {item.title}
                      </span>
                      <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-center text-[11px] text-muted-foreground">
                  Click any step on the left to see its implementation details
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Workflow Features — collapsible */}
      <Collapsible className="border-t border-border">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Workflow Features
            </span>
            <div className="flex gap-1">
              {WORKFLOW_FEATURES.map((f) => (
                <span
                  key={f.title}
                  className="rounded border border-accent/20 bg-accent/5 px-1.5 py-0 text-[8px] font-medium text-accent"
                >
                  {f.title}
                </span>
              ))}
            </div>
          </div>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className="shrink-0 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180"
          >
            <path d="M3 5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid gap-2 px-5 pb-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORKFLOW_FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-lg border border-accent/20 bg-accent/5 p-2.5"
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-foreground">
                    {feat.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[7px] px-1 py-0 border-accent/30 text-accent"
                  >
                    {feat.directive}
                  </Badge>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {feat.auditMapping}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Current vs Production footer */}
      <div className="border-t border-border px-5 py-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="mt-0.5 shrink-0 text-[9px]">
              Current
            </Badge>
            <p className="text-[11px] text-muted-foreground">
              Single request, single response. Client calls{" "}
              <code className="font-mono text-[10px]">/api/audit</code>,
              streams one result back.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="mt-0.5 shrink-0 bg-accent text-accent-foreground text-[9px]">
              Workflow
            </Badge>
            <p className="text-[11px] text-muted-foreground">
              Durable batch pipeline. 500 docs in CI/CD with per-step retries,
              compliance holds, and crash recovery.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
