import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Presentation | Offlyn Token Audit MCP",
  description:
    "Solutions Architect presentation — problem, solution, architecture, and business value.",
};

function ProblemGraphic() {
  return (
    <div className="relative mx-auto max-w-3xl">
      <svg
        viewBox="0 0 800 320"
        className="w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.08" />
          </pattern>
        </defs>
        <rect width="800" height="320" fill="url(#grid)" />

        {/* Token waste visualization */}
        <rect x="40" y="40" width="200" height="240" rx="12" className="fill-destructive/10 stroke-destructive/40" strokeWidth="1.5" />
        <text x="140" y="70" textAnchor="middle" className="fill-destructive text-[11px] font-semibold">40–60% Token Waste</text>
        {/* Wasted blocks */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={`w${i}`} x={60 + (i % 3) * 60} y={85 + Math.floor(i / 3) * 45} width="50" height="35" rx="4" className="fill-destructive/20 stroke-destructive/30" strokeWidth="1" strokeDasharray="4 2" />
        ))}
        <text x="140" y="200" textAnchor="middle" className="fill-destructive/70 text-[10px]">Duplicate chunks</text>
        <text x="140" y="216" textAnchor="middle" className="fill-destructive/70 text-[10px]">Boilerplate context</text>
        <text x="140" y="232" textAnchor="middle" className="fill-destructive/70 text-[10px]">Stale information</text>
        <text x="140" y="260" textAnchor="middle" className="fill-muted-foreground text-[10px]">Sent to cloud LLM → $$$</text>

        {/* PII exposure */}
        <rect x="300" y="40" width="200" height="240" rx="12" className="fill-orange-500/10 stroke-orange-500/40" strokeWidth="1.5" />
        <text x="400" y="70" textAnchor="middle" className="fill-orange-600 dark:fill-orange-400 text-[11px] font-semibold">PII Leakage</text>
        {/* PII items */}
        <rect x="320" y="85" width="160" height="28" rx="4" className="fill-orange-500/15 stroke-orange-500/25" strokeWidth="1" />
        <text x="400" y="103" textAnchor="middle" className="fill-orange-600 dark:fill-orange-400 text-[10px] font-mono">john@acme.com</text>
        <rect x="320" y="120" width="160" height="28" rx="4" className="fill-orange-500/15 stroke-orange-500/25" strokeWidth="1" />
        <text x="400" y="138" textAnchor="middle" className="fill-orange-600 dark:fill-orange-400 text-[10px] font-mono">SSN: 123-45-6789</text>
        <rect x="320" y="155" width="160" height="28" rx="4" className="fill-orange-500/15 stroke-orange-500/25" strokeWidth="1" />
        <text x="400" y="173" textAnchor="middle" className="fill-orange-600 dark:fill-orange-400 text-[10px] font-mono">sk-proj-abc123...</text>
        {/* Arrow to cloud */}
        <path d="M 400 200 L 400 240" className="stroke-orange-500/50" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowOrange)" />
        <text x="400" y="262" textAnchor="middle" className="fill-muted-foreground text-[10px]">Exposed to 3rd-party models</text>

        {/* No visibility */}
        <rect x="560" y="40" width="200" height="240" rx="12" className="fill-muted/50 stroke-border" strokeWidth="1.5" />
        <text x="660" y="70" textAnchor="middle" className="fill-foreground text-[11px] font-semibold">Zero Observability</text>
        {/* Question marks */}
        <text x="660" y="120" textAnchor="middle" className="fill-muted-foreground text-[32px] font-bold opacity-30">?</text>
        <text x="620" y="160" textAnchor="middle" className="fill-muted-foreground text-[24px] font-bold opacity-20">?</text>
        <text x="700" y="150" textAnchor="middle" className="fill-muted-foreground text-[28px] font-bold opacity-25">?</text>
        <text x="660" y="200" textAnchor="middle" className="fill-muted-foreground text-[10px]">Cost per request?</text>
        <text x="660" y="216" textAnchor="middle" className="fill-muted-foreground text-[10px]">Carbon footprint?</text>
        <text x="660" y="232" textAnchor="middle" className="fill-muted-foreground text-[10px]">Water consumption?</text>
        <text x="660" y="260" textAnchor="middle" className="fill-muted-foreground text-[10px]">No metrics, no control</text>

        <defs>
          <marker id="arrowOrange" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 Z" className="fill-orange-500/50" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function SolutionGraphic() {
  return (
    <div className="relative mx-auto max-w-3xl">
      <svg
        viewBox="0 0 800 280"
        className="w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.05" />
          </pattern>
          <marker id="arrowAccent" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 Z" className="fill-accent" />
          </marker>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 Z" className="fill-green-500" />
          </marker>
        </defs>
        <rect width="800" height="280" fill="url(#grid2)" />

        {/* Input */}
        <rect x="30" y="90" width="140" height="100" rx="10" className="fill-secondary stroke-border" strokeWidth="1.5" />
        <text x="100" y="120" textAnchor="middle" className="fill-foreground text-[11px] font-semibold">Context Input</text>
        <text x="100" y="140" textAnchor="middle" className="fill-muted-foreground text-[9px]">Prompts, RAG chunks,</text>
        <text x="100" y="154" textAnchor="middle" className="fill-muted-foreground text-[9px]">tool outputs, docs</text>
        <text x="100" y="175" textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">~12,000 tokens</text>

        {/* Arrow to audit */}
        <path d="M 170 140 L 220 140" className="stroke-accent" strokeWidth="2" markerEnd="url(#arrowAccent)" />

        {/* Token Audit MCP */}
        <rect x="230" y="50" width="200" height="180" rx="12" className="fill-accent/5 stroke-accent/40" strokeWidth="2" />
        <text x="330" y="80" textAnchor="middle" className="fill-accent text-[12px] font-bold">Token Audit MCP</text>

        {/* Internal steps */}
        <rect x="250" y="95" width="160" height="30" rx="6" className="fill-accent/10 stroke-accent/20" strokeWidth="1" />
        <text x="330" y="114" textAnchor="middle" className="fill-accent text-[10px]">1. Token Count (BPE)</text>

        <rect x="250" y="132" width="160" height="30" rx="6" className="fill-accent/10 stroke-accent/20" strokeWidth="1" />
        <text x="330" y="151" textAnchor="middle" className="fill-accent text-[10px]">2. LLM Analysis (Local)</text>

        <rect x="250" y="169" width="160" height="30" rx="6" className="fill-accent/10 stroke-accent/20" strokeWidth="1" />
        <text x="330" y="188" textAnchor="middle" className="fill-accent text-[10px]">3. Efficiency Metrics (9D)</text>

        {/* Arrow to output */}
        <path d="M 430 140 L 480 140" className="stroke-green-500" strokeWidth="2" markerEnd="url(#arrowGreen)" />

        {/* Clean output */}
        <rect x="490" y="60" width="280" height="160" rx="10" className="fill-green-500/5 stroke-green-500/40" strokeWidth="1.5" />
        <text x="630" y="88" textAnchor="middle" className="fill-green-600 dark:fill-green-400 text-[11px] font-semibold">Audit Results</text>

        <text x="520" y="112" className="fill-foreground text-[10px]">Waste identified: 4,800 tokens (40%)</text>
        <text x="520" y="130" className="fill-foreground text-[10px]">PII detected: 2 instances flagged</text>
        <text x="520" y="148" className="fill-foreground text-[10px]">Cost savings: $0.012/request</text>
        <text x="520" y="166" className="fill-foreground text-[10px]">Carbon avoided: 2.4 gCO2e</text>
        <text x="520" y="184" className="fill-foreground text-[10px]">Water saved: 0.011 mL</text>
        <text x="520" y="202" className="fill-foreground text-[10px]">Quality retention: 99.6%</text>

        {/* Labels */}
        <text x="100" y="250" textAnchor="middle" className="fill-muted-foreground text-[9px]">BEFORE</text>
        <text x="330" y="250" textAnchor="middle" className="fill-accent text-[9px] font-medium">PRE-INFERENCE</text>
        <text x="630" y="250" textAnchor="middle" className="fill-green-600 dark:fill-green-400 text-[9px] font-medium">ACTIONABLE INSIGHTS</text>
      </svg>
    </div>
  );
}


export default function PresentationPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        {/* Hero */}
        <header className="mb-12 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-accent">
              Solutions Architect Presentation
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Offlyn Token Audit MCP
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            A pre-inference context audit layer for AI agents — solving the
            $2.5B+ enterprise problem of token waste, PII exposure, and
            invisible resource costs.
          </p>
        </header>

        {/* The Problem */}
        <section className="mb-14">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
            The Problem
          </h2>
          <h3 className="mb-6 text-2xl font-bold text-foreground">
            Enterprise AI is Bleeding Money, Data, and Resources
          </h3>
          <ProblemGraphic />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
              <p className="text-3xl font-bold text-destructive">40–60%</p>
              <p className="mt-2 text-sm font-medium text-foreground">Token Waste</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Redundant context, duplicate RAG chunks, and stale information sent to cloud LLMs every request.
              </p>
            </div>
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">Zero</p>
              <p className="mt-2 text-sm font-medium text-foreground">PII Guardrails</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Emails, SSNs, API keys flow to third-party models with no detection or audit trail.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-5">
              <p className="text-3xl font-bold text-foreground">Blind</p>
              <p className="mt-2 text-sm font-medium text-foreground">Resource Costs</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No per-request visibility into cost, energy, carbon, or water consumption of AI workloads.
              </p>
            </div>
          </div>
        </section>

        {/* The Solution */}
        <section className="mb-14">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
            The Solution
          </h2>
          <h3 className="mb-6 text-2xl font-bold text-foreground">
            Audit Every Token Before It Costs You
          </h3>
          <SolutionGraphic />
          <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-accent">How It Works</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    Context enters the audit pipeline (prompts, RAG chunks, tool outputs)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    Real BPE token counting via gpt-tokenizer (not heuristic char/4)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    Local LLM identifies qualitative findings (waste, PII, weak citations)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    Deterministic engine computes 9-dimension efficiency metrics
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    Actionable results stream in real-time to the client
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-accent">Key Differentiators</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    <span><span className="font-medium text-foreground">Local-first:</span> Context never leaves the device during audit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    <span><span className="font-medium text-foreground">Reproducible:</span> Metrics use Offlyn-verified constants, not LLM estimates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    <span><span className="font-medium text-foreground">Pre-inference:</span> Catches problems before expensive cloud calls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    <span><span className="font-medium text-foreground">Streaming:</span> Results appear in real-time as LLM processes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    <span><span className="font-medium text-foreground">9-Dimension:</span> Token, cost, energy, carbon, water, privacy, network, quality, resilience</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 9 Dimensions Visual */}
        <section className="mb-14">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
            Efficiency Framework
          </h2>
          <h3 className="mb-6 text-2xl font-bold text-foreground">
            9-Dimension Audit Scorecard
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { num: "1", name: "Token Efficiency", desc: "Cloud tokens avoided, reduction %" },
              { num: "2", name: "Cost Efficiency", desc: "$2.50/M tokens baseline savings" },
              { num: "3", name: "Energy Efficiency", desc: "0.001 kWh per 1K cloud tokens" },
              { num: "4", name: "Carbon Intensity", desc: "0.50 gCO2e per 1K tokens (SCI-AI)" },
              { num: "5", name: "Water Efficiency", desc: "2.28 mL per 1K tokens (verified)" },
              { num: "6", name: "Privacy", desc: "PII detection + data locality" },
              { num: "7", name: "Network", desc: "Payload bytes reduced" },
              { num: "8", name: "Quality", desc: "99%+ useful info retention" },
              { num: "9", name: "Resilience", desc: "Local-routable, fallback-ready" },
            ].map((dim) => (
              <div
                key={dim.num}
                className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-accent/40 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent">
                    {dim.num}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{dim.name}</p>
                    <p className="text-[11px] text-muted-foreground">{dim.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground">
              Offlyn Verification
            </p>
            <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <span>64,450 tokens → <span className="font-medium text-foreground">32.2 gCO2e</span></span>
              <span>64,450 tokens → <span className="font-medium text-foreground">0.147 L water</span></span>
              <span>64,450 tokens → <span className="font-medium text-foreground">$0.16 input cost</span></span>
            </div>
          </div>
        </section>


        {/* Architecture Decisions */}
        <section className="mb-14">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
            Architecture Decisions
          </h2>
          <h3 className="mb-6 text-2xl font-bold text-foreground">
            Options Considered
          </h3>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 font-medium text-foreground">Decision</th>
                  <th className="px-4 py-3 font-medium text-foreground">Options Considered</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    decision: "LLM Provider",
                    choice: "Ollama (local)",
                    options: "OpenAI API, Vercel AI Gateway, Anthropic, Ollama",
                  },
                  {
                    decision: "Metric Computation",
                    choice: "Deterministic engine",
                    options: "LLM generates all metrics, hybrid (LLM + formulas), fully deterministic",
                  },
                  {
                    decision: "Framework",
                    choice: "Next.js 16",
                    options: "Next.js, SvelteKit, Nuxt, plain Express",
                  },
                  {
                    decision: "LLM Integration",
                    choice: "AI SDK v6",
                    options: "Raw fetch to Ollama, LangChain, AI SDK",
                  },
                  {
                    decision: "Token Counting",
                    choice: "gpt-tokenizer",
                    options: "chars/4 heuristic, tiktoken (WASM), gpt-tokenizer",
                  },
                  {
                    decision: "Auth",
                    choice: "Clerk",
                    options: "NextAuth, Clerk, custom JWT, no auth",
                  },
                  {
                    decision: "Schema Validation",
                    choice: "Zod",
                    options: "TypeScript types only, Joi, Yup, Zod",
                  },
                  {
                    decision: "Deployment Model",
                    choice: "Fluid Compute",
                    options: "Traditional serverless, Edge Functions, Fluid Compute, always-on container",
                  },
                  {
                    decision: "Data Persistence",
                    choice: "localStorage",
                    options: "Vercel Postgres, Redis, localStorage, no persistence",
                  },
                  {
                    decision: "Streaming UX",
                    choice: "Partial streaming + client enrichment",
                    options: "Wait for full response, stream raw text, stream structured + enrich client-side",
                  },
                ].map((row) => (
                  <tr key={row.decision} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 align-top">
                      <span className="font-mono text-xs text-foreground">{row.choice}</span>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{row.decision}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-muted-foreground">{row.options}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="mb-14">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-accent">
            Impact at Scale
          </h2>
          <h3 className="mb-6 text-2xl font-bold text-foreground">
            What 40% Token Savings Looks Like
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "$12K", label: "Monthly savings", sub: "at 10M requests/mo" },
              { value: "322 kg", label: "CO2e avoided", sub: "per million requests" },
              { value: "14.7 L", label: "Water saved", sub: "per million requests" },
              { value: "99.6%", label: "Quality retained", sub: "removing only waste" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-accent/20 bg-accent/5 p-5 text-center"
              >
                <p className="text-3xl font-bold text-accent">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
