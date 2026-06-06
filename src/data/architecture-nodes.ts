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
      "Users paste text or upload files (.txt, .md, .json, .pdf). Text files are read client-side; PDFs go through /api/parse-pdf. Token preview shows cost before audit.",
    implementationFiles: [
      "src/components/demo/audit-input.tsx",
      "src/components/demo/file-drop-zone.tsx",
    ],
    vercelFeature: "Client Components — interactivity without shipping JS for static shell",
    codeSnippet: `// Client reads text files via FileReader
const text = await file.text();
setContext(prev => prev + "\\n\\n" + text);`,
  },
  {
    id: "audit-api",
    label: "/api/audit",
    x: 280,
    y: 120,
    type: "api",
    description:
      "Route Handler validates input with Zod, pre-computes token/cost baselines, calls streamText with Output.object for structured audit results.",
    implementationFiles: ["src/app/api/audit/route.ts", "src/lib/audit-schemas.ts"],
    vercelFeature: "Fluid Compute — Active CPU pricing during I/O-bound AI inference",
    codeSnippet: `const result = streamText({
  model: gateway('anthropic/claude-sonnet-4.5'),
  output: Output.object({ schema: auditResultSchema }),
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
      "streamText streams structured JSON via Output.object. Client consumes with experimental_useObject for progressive UI updates.",
    implementationFiles: ["src/lib/audit-schemas.ts", "src/components/demo/audit-results.tsx"],
    vercelFeature: "AI SDK — structured output + streaming",
    codeSnippet: `output: Output.object({ schema: auditResultSchema })`,
  },
  {
    id: "gateway",
    label: "AI Gateway",
    x: 480,
    y: 200,
    type: "external",
    description:
      "Unified routing with provider failover (Anthropic → OpenAI), cost tags for attribution, and observability.",
    implementationFiles: ["src/app/api/audit/route.ts", "src/app/api/chat/route.ts"],
    vercelFeature: "AI Gateway — routing, failover, cost tags",
    codeSnippet: `providerOptions: {
  gateway: {
    order: ['anthropic'],
    models: ['openai/gpt-5.4'],
    tags: ['feature:token-audit'],
  },
}`,
  },
  {
    id: "providers",
    label: "LLM Providers",
    x: 680,
    y: 120,
    type: "external",
    description:
      "Primary: Claude Sonnet 4.5 for nuanced audit reasoning. Fallback: GPT-5.4 if Anthropic unavailable.",
    implementationFiles: ["src/app/api/audit/route.ts"],
    vercelFeature: "AI Gateway model strings — provider/model format",
    codeSnippet: `model: gateway('anthropic/claude-sonnet-4.5')`,
  },
  {
    id: "ui",
    label: "Results UI",
    x: 280,
    y: 280,
    type: "client",
    description:
      "Streaming findings cards, 9-dimension Offlyn efficiency scorecard, pipeline progress, and cost summary — all driven by real API output.",
    implementationFiles: [
      "src/components/demo/audit-results.tsx",
      "src/components/demo/efficiency-scorecard.tsx",
    ],
    vercelFeature: "Streaming UI — progressive render as partial object arrives",
    codeSnippet: `const { object, submit, isLoading } = useObject({
  api: '/api/audit',
  schema: auditResultSchema,
});`,
  },
  {
    id: "chat",
    label: "Chat Widget",
    x: 80,
    y: 200,
    type: "client",
    description:
      "Global useChat widget answers implementation questions via /api/chat with architecture context in system prompt.",
    implementationFiles: [
      "src/components/chat/chat-widget.tsx",
      "src/app/api/chat/route.ts",
    ],
    vercelFeature: "AI SDK useChat + toUIMessageStreamResponse",
    codeSnippet: `useChat({
  transport: new DefaultChatTransport({ api: '/api/chat' }),
});`,
  },
  {
    id: "eval",
    label: "Eval Runner",
    x: 680,
    y: 280,
    type: "client",
    description:
      "Runs 8 test cases against /api/audit, compares expected vs actual findings, scores pass/fail — Track B evaluation requirement.",
    implementationFiles: [
      "src/components/eval/eval-runner.tsx",
      "src/data/eval-test-cases.ts",
    ],
    vercelFeature: "Lightweight eval rubric — test set regression check",
    codeSnippet: `for (const testCase of evalTestCases) {
  const result = await fetch('/api/audit', { ... });
}`,
  },
];

export const architectureConnections: [string, string][] = [
  ["intake", "audit-api"],
  ["audit-api", "ai-sdk"],
  ["ai-sdk", "gateway"],
  ["gateway", "providers"],
  ["audit-api", "ui"],
  ["chat", "gateway"],
  ["eval", "audit-api"],
];
