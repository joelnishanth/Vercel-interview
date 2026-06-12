export type ArchitectureNodeType =
  | "server"
  | "client"
  | "api"
  | "external";

export type ArchitectureNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  type: ArchitectureNodeType;
  description: string;
  implementationFiles: string[];
  vercelFeature: string;
  codeSnippet: string;
};

export const architectureNodes: ArchitectureNode[] = [
  {
    id: "intake",
    label: "Context Intake",
    x: 80,
    y: 40,
    type: "client",
    description:
      "Users paste text or upload files (.txt, .md, .json, .pdf). Real token count computed client-side via gpt-tokenizer. Token/cost preview shows before audit.",
    implementationFiles: [
      "src/components/demo/audit-input.tsx",
      "src/components/demo/file-drop-zone.tsx",
    ],
    vercelFeature: "Vercel: Next.js App Router (Client Component)",
    codeSnippet: `import { countTokens } from '@/lib/token-utils';
// gpt-tokenizer (third-party) for real BPE token count
const tokens = countTokens(context);`,
  },
  {
    id: "audit-api",
    label: "/api/audit",
    x: 280,
    y: 120,
    type: "api",
    description:
      "Route Handler validates input with Zod, counts tokens, calls streamText with Output.object for structured results.",
    implementationFiles: ["src/app/api/audit/route.ts", "src/lib/audit-schemas.ts"],
    vercelFeature: "Vercel: Functions + Fluid Compute (Active CPU pricing)",
    codeSnippet: `const result = streamText({
  model: getAuditModel(), // ollama('llama3.2')
  output: Output.object({ schema: modelOutputSchema }),
  prompt: context,
});`,
  },
  {
    id: "ai-sdk",
    label: "AI SDK v6",
    x: 480,
    y: 40,
    type: "server",
    description:
      "streamText streams structured JSON via Output.object. Client consumes with experimental_useObject for progressive UI updates. Zod schema enforces output shape.",
    implementationFiles: ["src/lib/audit-schemas.ts", "src/hooks/use-audit.ts"],
    vercelFeature: "Vercel: AI SDK (streamText, Output.object, useObject)",
    codeSnippet: `output: Output.object({ schema: modelOutputSchema })
// Vercel AI SDK — works with any provider`,
  },
  {
    id: "ollama",
    label: "Ollama (Local)",
    x: 480,
    y: 200,
    type: "external",
    description:
      "Local LLM inference via Ollama. Zero cloud calls, no rate limits. Plugs into Vercel AI SDK via provider interface — swappable to AI Gateway for production.",
    implementationFiles: ["src/lib/ai-models.ts"],
    vercelFeature: "Not Vercel — third-party (connects via AI SDK provider)",
    codeSnippet: `import { ollama } from 'ollama-ai-provider-v2';
// Third-party provider, uses Vercel AI SDK interface
export function getAuditModel() {
  return ollama('llama3.2');
}`,
  },
  {
    id: "compute",
    label: "Efficiency Engine",
    x: 680,
    y: 120,
    type: "server",
    description:
      "Deterministic post-processing: takes LLM findings + tokenImpact, computes all 9 efficiency dimensions using Offlyn methodology constants. Never relies on LLM for math.",
    implementationFiles: ["src/lib/compute-efficiency.ts", "src/lib/token-utils.ts"],
    vercelFeature: "Not Vercel — application code (deterministic computation)",
    codeSnippet: `const efficiency = computeEfficiencyFromFindings(
  context, findings
);
// App code — Offlyn constants for cost/carbon/water`,
  },
  {
    id: "ui",
    label: "Live Annotator",
    x: 280,
    y: 280,
    type: "client",
    description:
      "Highlights findings in source text as they stream in. Color-coded by type (PII=red, redundancy=amber). Updates in real-time with each new finding from AI SDK stream.",
    implementationFiles: [
      "src/components/demo/live-annotated-text.tsx",
      "src/components/demo/efficiency-scorecard.tsx",
    ],
    vercelFeature: "Vercel: Next.js Client Component + AI SDK useObject",
    codeSnippet: `<LiveAnnotatedText
  context={activeContext}
  findings={activeFindings} // driven by AI SDK stream
  isLoading={isLoading}
/>`,
  },
  {
    id: "scorecard",
    label: "Live Scorecard",
    x: 80,
    y: 200,
    type: "client",
    description:
      "9-dimension efficiency scorecard + cost summary cards update live during streaming. Computed deterministically from findings via enrichAuditResult().",
    implementationFiles: [
      "src/components/demo/efficiency-scorecard.tsx",
      "src/components/demo/cost-summary.tsx",
    ],
    vercelFeature: "Vercel: Next.js Client Component",
    codeSnippet: `const enriched = enrichAuditResult(context, liveResult);
<EfficiencyScorecard efficiency={enriched.efficiency} />`,
  },
  {
    id: "eval",
    label: "Eval Runner",
    x: 680,
    y: 280,
    type: "client",
    description:
      "Runs 8 test cases against /api/audit (which uses Vercel Functions + AI SDK), compares expected vs actual findings, scores pass/partial/fail with failure reasons.",
    implementationFiles: [
      "src/components/eval/eval-runner.tsx",
      "src/data/eval-test-cases.ts",
      "src/lib/eval-scoring.ts",
    ],
    vercelFeature: "Not Vercel — application code (uses Vercel Functions + AI SDK indirectly)",
    codeSnippet: `for (const testCase of evalTestCases) {
  const result = await runAudit(testCase.input);
  const { status, reason } = scoreResult(testCase, result);
}`,
  },
];

export const architectureConnections: [string, string][] = [
  ["intake", "audit-api"],
  ["audit-api", "ai-sdk"],
  ["ai-sdk", "ollama"],
  ["audit-api", "compute"],
  ["compute", "ui"],
  ["audit-api", "ui"],
  ["ui", "scorecard"],
  ["eval", "audit-api"],
];
