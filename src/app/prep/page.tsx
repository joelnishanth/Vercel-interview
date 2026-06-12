import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";
import { AuditFlowDiagram } from "@/components/prep/audit-flow-diagram";

export const metadata: Metadata = {
  title: "Interview Prep | Offlyn Token Audit MCP",
  description: "Track B interview prep notes and talking points.",
};

const ALLOWED_EMAIL = "joelnishanthreddy@gmail.com";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-lg font-bold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-secondary/50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 font-medium text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function PrepPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!user || email !== ALLOWED_EMAIL) {
    redirect("/demo");
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <header className="mb-4 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-accent">
              Track B: AI Cloud
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Interview Prep
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            Talking points, architecture decisions, and Q&amp;A for the 45-minute
            SA interview presentation.
          </p>
        </header>

        {/* Overview */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Project
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            Offlyn Token Audit MCP
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            A pre-inference audit layer for AI agents — inspects every token before
            cloud inference. The LLM identifies qualitative findings (waste, PII, weak citations),
            then efficiency metrics are computed deterministically using the Offlyn methodology.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2.5 py-1">Next.js 16</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">AI SDK v6</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">Ollama (Local LLM)</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">gpt-tokenizer</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">Clerk Auth</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">Zod Structured Output</span>
            <span className="rounded-full bg-secondary px-2.5 py-1">Fluid Compute</span>
          </div>
        </div>

        {/* Audit Flow Diagram */}
        <Section title="Audit Flow & Vercel Components">
          <p className="mb-2 text-sm text-muted-foreground">
            Interactive diagram showing the complete audit request lifecycle.
            Click any node to see which Vercel feature powers it and
            implementation details.
          </p>
          <AuditFlowDiagram />
        </Section>

        {/* 1. Problem Framing */}
        <Section title="1. Problem Framing">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">The Problem:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Enterprise AI teams waste 40–60% of tokens on redundant context</li>
              <li>PII (emails, SSNs, API keys) leaks to cloud LLMs with no guard</li>
              <li>No visibility into cost, energy, or carbon footprint per-request</li>
              <li>RAG pipelines retrieve near-duplicate chunks that inflate spend</li>
            </ul>
            <p className="font-medium text-foreground">Target Audience:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Enterprise AI/ML teams running agentic workflows with RAG</li>
              <li>Security/compliance teams worried about PII in cloud inference</li>
              <li>FinOps teams trying to control AI spend</li>
            </ul>
            <p className="font-medium text-foreground">Picture of Success:</p>
            <p>
              Before sending context to an LLM, teams run it through Token Audit to
              see what&apos;s wasteful, estimate savings, and prove compliance.
            </p>
          </div>
        </Section>

        {/* 2. Architectural Judgment */}
        <Section title="2. Architectural Judgment">
          <p className="mb-4 text-sm text-muted-foreground">
            Key tech choices and why:
          </p>
          <Table
            headers={["Choice", "Why"]}
            rows={[
              ["Next.js 16 App Router", "Server Components for static shell, client islands for interactivity"],
              ["AI SDK v6 + Output.object", "Type-safe streaming structured output with Zod validation"],
              ["Ollama (local llama3.2)", "Zero cloud dependency for inference — runs entirely on-device, proving the local-first thesis"],
              ["Slim model schema", "LLM only generates findings + risk level; 9-dimension metrics computed deterministically — 60% less output tokens"],
              ["gpt-tokenizer", "Real BPE token counts (not heuristic char/4), runs client-side and server-side"],
              ["Deterministic efficiency engine", "Cost, carbon, water computed from constants aligned with Offlyn methodology — no LLM hallucination on numbers"],
              ["Clerk auth", "Invite-only signup, protected routes via proxy middleware"],
              ["Zod schemas", "Runtime validation for API input AND LLM output"],
            ]}
          />
          <p className="mt-6 mb-3 text-sm font-medium text-foreground">
            Key Trade-offs:
          </p>
          <Table
            headers={["Decision", "Trade-off"]}
            rows={[
              ["Slim model output (findings only)", "Faster inference + no hallucinated numbers, but efficiency metrics lose LLM nuance — acceptable because Offlyn methodology is formula-based"],
              ["Local Ollama vs Cloud Gateway", "Slower inference but zero API cost, proves local-first architecture, PII never leaves device"],
              ["Streaming UI", "Better UX but more complex state management (useObject + enrichAuditResult client-side)"],
              ["Client-side history (localStorage)", "No server DB needed, but doesn't sync across devices"],
              ["Deterministic metrics over LLM estimates", "Reproducible + verifiable but requires maintaining Offlyn constants manually"],
            ]}
          />
        </Section>

        {/* 3. The 9-Dimension Efficiency Schema */}
        <Section title="3. The 9-Dimension Efficiency Schema">
          <p className="mb-4 text-sm text-muted-foreground">
            The LLM identifies qualitative findings (what&apos;s wrong and how many tokens each wastes via <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">tokenImpact</code>).
            All quantitative metrics are computed <span className="font-medium text-foreground">deterministically</span> in{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">computeEfficiencyFromFindings()</code>{" "}
            using constants from the <a href="https://github.com/offlyn-ai/offlyn-token-savings-audit" className="text-accent underline">Offlyn Token Savings Audit</a> methodology.
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Shared inputs:</span>{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">totalTokens</code> (real count via gpt-tokenizer) and{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">wastedTokens</code> (sum of finding.tokenImpact, capped at totalTokens).
          </p>
          <Table
            headers={["Dimension", "Formula / Method", "Constants"]}
            rows={[
              [
                "1. Token Efficiency",
                "cloudTokensAvoided = wastedTokens; reductionPercent = wasted / total × 100",
                "Pure ratio — no external constants",
              ],
              [
                "2. Cost Efficiency",
                "estimatedCostUsd = totalTokens / 1M × rate; savings = wastedTokens / 1M × rate",
                "$2.50/M input tokens (Offlyn cloud-first baseline)",
              ],
              [
                "3. Energy Efficiency",
                "cloudKwh = tokens / 1K × rate; localKwh = 5W × inference time",
                "0.001 kWh per 1K cloud tokens; 5W local incremental (Offlyn)",
              ],
              [
                "4. Carbon Intensity",
                "cloudCo2 = tokens / 1K × 0.50; localCo2 = localKwh × 400",
                "0.50 gCO2e per 1K cloud tokens (Offlyn SCI-AI midpoint); 400 g/kWh US grid avg",
              ],
              [
                "5. Water Efficiency",
                "cloudWater = tokens / 1K × 2.28; saved = wastedTokens / 1K × 2.28",
                "2.28 mL per 1K tokens (0.147L per 64,450 tokens — Offlyn verified)",
              ],
              [
                "6. Privacy",
                "max(LLM pii findings, regex scan matches)",
                "Regex: emails, sk-* keys, SSNs, phone numbers; sensitiveDataKeptLocal = true when local",
              ],
              [
                "7. Network Efficiency",
                "payloadBytes = UTF-8 length; reduced = bytes × reductionPercent / 100",
                "Direct measurement, no estimation",
              ],
              [
                "8. Quality Preservation",
                "retention = 100 − reduction% × 0.1; citation = 70% if weak-citation found",
                "Conservative: removing waste preserves ~99% of useful info",
              ],
              [
                "9. Resilience",
                "localRoutable = true, offlineCapable = false, fallbackAvailable = true",
                "Hardcoded from architecture — Ollama is on-device",
              ],
            ]}
          />
          <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground">
              Cross-Check Against Offlyn README
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Carbon:</span> 64,450 tokens → 32.23 gCO2e (Offlyn says 32.2g) ✓
              </li>
              <li>
                <span className="font-medium text-foreground">Water:</span> 64,450 tokens → 0.147 L (Offlyn says 0.147L) ✓
              </li>
              <li>
                <span className="font-medium text-foreground">Cost:</span> 64,450 tokens → $0.16 LLM input (Offlyn total $0.53 includes $0.36 transcription + embedding) ✓
              </li>
            </ul>
          </div>
        </Section>

        {/* 4. Production Thinking */}
        <Section title="4. Production Thinking">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground">
                Security
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Clerk middleware protects all routes</li>
                <li>Every API route checks auth() before processing</li>
                <li>The audit itself catches PII before cloud exposure</li>
                <li>Invite-only signup (no public registration)</li>
                <li>Local inference (Ollama) — context never leaves the device</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground">
                Reliability
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Zod validates input before LLM call, output after</li>
                <li>Slim model schema — model only generates findings, not numbers</li>
                <li>Deterministic efficiency computation — no LLM hallucination on metrics</li>
                <li>wastedTokens capped at totalTokens (prevents &gt;100% reduction)</li>
                <li>Partial streaming with completedResult guard</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground">
                Failure Modes
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Ollama not running → clear &quot;start with: ollama serve&quot; message</li>
                <li>Model not pulled → &quot;pull with: ollama pull llama3.2&quot; message</li>
                <li>Invalid LLM output → Zod safeParse, null fallback, enrichment still works from partial findings</li>
                <li>LLM overestimates tokenImpact → capped at totalTokens deterministically</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground">
                Observability
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Structured error logging: [audit stream], [chat]</li>
                <li>gpt-tokenizer for real token counts (not estimates)</li>
                <li>Live annotated text shows findings highlighted in the source context</li>
                <li>Efficiency scorecard streams live as findings arrive</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* 5. Business Value */}
        <Section title="5. Business Value — Vercel Choices → Outcomes">
          <p className="mb-4 text-sm text-muted-foreground">
            Each Vercel platform choice maps to a specific outcome for a specific audience:
          </p>
          <Table
            headers={["Vercel Feature", "Business Outcome", "Audience"]}
            rows={[
              [
                "AI SDK v6 (streamText + Output.object)",
                "Live streaming findings with Zod type safety — users see results instantly, not after a 15s wait",
                "End Users / UX",
              ],
              [
                "AI SDK Provider Abstraction",
                "Swap Ollama → AI Gateway in one line — no vendor lock-in, test locally then deploy to cloud",
                "Engineering",
              ],
              [
                "Fluid Compute (Active CPU pricing)",
                "LLM calls are I/O-bound (5-15s wait). Only billed for ~200ms of actual CPU, not the full duration",
                "FinOps",
              ],
              [
                "Vercel Functions (maxDuration: 120s)",
                "Long LLM inference calls complete without timeouts — critical for large context audits",
                "Engineering / Reliability",
              ],
              [
                "Next.js Server Components",
                "Zero client JS for page shells — fast LCP, SEO-friendly, lower bandwidth for enterprise dashboards",
                "Performance / SEO",
              ],
              [
                "Next.js Client Components + useObject",
                "Progressive UI: scorecard, annotator, and cost cards all update live as the LLM streams",
                "End Users / UX",
              ],
              [
                "Proxy Middleware (Clerk auth)",
                "Auth enforced before any route executes — PII never reaches an unauthenticated request",
                "Security / Compliance",
              ],
              [
                "next/font (Geist)",
                "Fonts inlined at build — zero CLS, no layout shift on load",
                "Performance (Core Web Vitals)",
              ],
              [
                "Vercel Workflow (production roadmap)",
                "Durable batch audits: audit 500 docs in CI/CD with per-step retries and crash recovery",
                "Enterprise / DevOps",
              ],
            ]}
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-accent">
                The SA Pitch
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                &quot;With <span className="font-medium text-foreground">AI SDK</span> you get type-safe structured output and one-line model swaps.
                With <span className="font-medium text-foreground">Fluid Compute</span> you pay for 200ms of CPU, not 15 seconds of wall clock.
                With <span className="font-medium text-foreground">Workflow</span> you scale to batch pipelines with crash recovery.
                That&apos;s the Vercel AI stack — from prototype to production.&quot;
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground">
                ROI Talking Points
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>If 40% of tokens are waste → 40% savings on inference cost</li>
                <li>Fluid Compute → ~80% savings on function billing for I/O-bound LLM calls</li>
                <li>Provider abstraction → zero migration cost when switching models</li>
                <li>Workflow → batch 10K audits/month with usage-based pricing, no idle infra</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* 6. Demo Flow */}
        <Section title="6. Presentation Flow (15–20 min)">
          <div className="space-y-4">
            {[
              {
                time: "2 min",
                title: "Homepage",
                points: [
                  "Explain the problem: token waste, PII leaks, no visibility",
                  "Show 'Run sample audit' → real API call, real results streaming in",
                ],
              },
              {
                time: "5 min",
                title: "Demo Page (/demo)",
                points: [
                  "Pick a scenario (e.g. 'PII in support ticket' or 'RAG duplicates')",
                  "Run audit → show streaming findings + live annotated text highlighting waste in the source",
                  "Explain how efficiency scorecard updates live as findings stream in (deterministic computation)",
                  "Show cost/carbon/water summary — explain 'per 1K requests' scaling for small values",
                  "Run the inline eval panel → show 8 test cases, explain expected vs actual, demonstrate pass rate",
                ],
              },
              {
                time: "5 min",
                title: "Architecture Page (/architecture)",
                points: [
                  "Click nodes → show code snippets and Vercel features powering each",
                  "Explain the split: LLM does qualitative analysis, deterministic engine computes metrics",
                  "Show the interactive schema diagram → 9 efficiency dimensions explained",
                ],
              },
              {
                time: "3 min",
                title: "Eval (inline or /eval page)",
                points: [
                  "Already ran inline eval on demo page — or visit /eval for full details",
                  "Explain: test set (8 inputs with known issues) + rubric (pass/partial/fail) + regression check",
                  "Show how swapping models would change pass rate — this is the 'lightweight evaluation approach'",
                ],
              },
              {
                time: "5 min",
                title: "Code Walkthrough (if time)",
                points: [
                  "src/lib/audit-schemas.ts — modelOutputSchema (slim) vs auditResultSchema (full enriched)",
                  "src/app/api/audit/route.ts — streamText + Output.object with slim schema",
                  "src/lib/compute-efficiency.ts — deterministic 9-dimension computation with Offlyn constants",
                  "src/lib/ai-models.ts — Ollama provider setup, one-line model swap",
                  "src/hooks/use-audit.ts — streaming state + client-side enrichment",
                ],
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-lg border border-border p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                    {step.time}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {step.title}
                  </span>
                </div>
                <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                  {step.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* 7. Platform Understanding */}
        <Section title="7. Platform Understanding">
          <Table
            headers={["Feature", "Where", "Why"]}
            rows={[
              ["AI SDK v6", "/api/audit, /api/chat", "Structured output + streaming with Ollama provider"],
              ["Ollama (via AI SDK)", "All LLM calls", "Local inference — zero cloud dependency, PII stays on-device"],
              ["Fluid Compute", "API routes", "Active CPU pricing (don't pay while waiting on LLM)"],
              ["Server Components", "Page shells", "Zero client JS for static content"],
              ["Client Components", "Interactive islands", "Audit results, schema diagram, live annotated text, flow viz"],
              ["gpt-tokenizer", "Client + server", "Real BPE token counts — same tokenizer as GPT models"],
              ["next/font", "Global layout", "Geist fonts inlined — no CLS"],
              ["Proxy (middleware)", "Auth layer", "Clerk protects all routes"],
            ]}
          />
          <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground">
              What I chose NOT to use (and why)
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">AI Gateway</span> — Using local Ollama instead; Gateway would add latency + cost for a demo that proves local-first architecture
              </li>
              <li>
                <span className="font-medium text-foreground">Edge Functions</span> — Node.js runtime is fine; don&apos;t need edge latency for LLM calls
              </li>
              <li>
                <span className="font-medium text-foreground">ISR</span> — Pages are either fully static or fully dynamic; no revalidation needed
              </li>
              <li>
                <span className="font-medium text-foreground">Database (Postgres)</span> — localStorage sufficient for demo; would add for production
              </li>
              <li>
                <span className="font-medium text-foreground">Vercel KV/Blob</span> — No caching layer needed for this use case
              </li>
              <li>
                <span className="font-medium text-foreground">Vercel Workflow</span> — Single-request audit doesn&apos;t need durable steps; would add for batch/enterprise (see section 10)
              </li>
            </ul>
          </div>
        </Section>

        {/* 8. Eval Approach */}
        <Section title="8. Evaluation Approach (Track B Requirement)">
          <div className="mb-6 rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground">
              How It Works
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The eval tests whether the <span className="font-medium text-foreground">LLM correctly identifies known issues</span> in
              curated inputs. It reuses the exact same{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground">/api/audit</code>{" "}
              endpoint (AI SDK + Ollama) that the demo uses — the only difference is we know what the answer should be.
            </p>
          </div>

          <p className="mb-2 text-sm font-medium text-foreground">Data Flow:</p>
          <div className="mb-6 space-y-2">
            {[
              { label: "1. Test cases (ground truth)", desc: "8 inputs where we intentionally planted issues — emails, SSNs, duplicated paragraphs, etc. We define the expected finding type and severity for each." },
              { label: "2. Each input → /api/audit", desc: "The same API route, same AI SDK call, same Ollama model. The LLM analyzes the input and returns findings as structured JSON." },
              { label: "3. Zod validates + enrich", desc: "Response is validated against modelOutputSchema, then enriched with deterministic efficiency metrics via computeEfficiencyFromFindings()." },
              { label: "4. Rubric scores the output", desc: "scoreResult() compares actual finding types/severity to expected. If the LLM said 'weak-citation' when the input had an email address, that's a fail." },
              { label: "5. Failure reason explains why", desc: "Each non-pass result gets a human-readable reason: 'Expected pii but LLM returned weak-citation' — so you can see exactly where the model went wrong." },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border p-3">
                <p className="text-xs font-medium text-foreground">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="mb-3 text-sm font-medium text-foreground">Test Cases:</p>
          <Table
            headers={["Test Case", "Input (what we planted)", "Expected LLM Finding"]}
            rows={[
              ["PII: Email + SSN", "john@acme.com + SSN 123-45-6789", "pii (high)"],
              ["PII: API keys", "sk-proj-abc123... credential", "pii (high)"],
              ["Redundancy: identical", "Same paragraph repeated 9×", "redundancy (high)"],
              ["Redundancy: near-duplicate", "Reworded versions of same idea", "redundancy (medium)"],
              ["Oversized payload", "12,000+ words of filler", "oversized (high)"],
              ["Weak citations", "RAG chunks: 'unknown source, relevance 0.12'", "weak-citation (medium)"],
              ["Low-value boilerplate", "System prompt repeated 80×", "low-value (low)"],
              ["Clean input", "3-line code review (no issues)", "No findings (clean)"],
            ]}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
              <p className="text-xs font-medium text-green-600 dark:text-green-400">Pass</p>
              <p className="mt-1 text-[11px] text-muted-foreground">All expected types found AND severity matches</p>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Partial</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Types found but severity wrong, or only some types matched</p>
            </div>
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">Fail</p>
              <p className="mt-1 text-[11px] text-muted-foreground">LLM returned wrong types entirely (e.g. &quot;weak-citation&quot; for an email)</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground">
              Why This Matters
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Regression check:</span>{" "}
                Swap models (llama3.2 → llama3.1:8b) and rerun — if pass rate drops, the new model is worse
              </li>
              <li>
                <span className="font-medium text-foreground">Prompt tuning:</span>{" "}
                Change the system prompt and rerun — if PII detection breaks, the prompt change was bad
              </li>
              <li>
                <span className="font-medium text-foreground">Hallucination guard:</span>{" "}
                The &quot;clean&quot; test catches false positives — if the LLM reports issues in clean text, it&apos;s hallucinating
              </li>
            </ul>
          </div>
        </Section>

        {/* 9. Q&A */}
        <Section title="9. Potential Q&A">
          <div className="space-y-4">
            {[
              {
                q: "Why Ollama instead of a cloud model?",
                a: "Local inference proves the local-first thesis — context never leaves the device. Zero API cost for demos. Model is swappable via one line in src/lib/ai-models.ts (AI SDK abstracts the provider).",
              },
              {
                q: "Why not have the LLM compute efficiency metrics directly?",
                a: "Tested it — small models hallucinate numbers (returning 0 for cost/carbon/water). By splitting qualitative analysis (LLM) from quantitative computation (deterministic), we get reproducible metrics aligned with the Offlyn methodology. Also cuts model output by ~60%, making inference faster.",
              },
              {
                q: "How did you verify the carbon/water/cost calculations?",
                a: "Cross-checked against the Offlyn Token Savings Audit README: 64,450 tokens → 32.2 gCO2e ✓, 0.147L water ✓. Ran automated verification with multiple scenarios to ensure wastedTokens is capped, percentages never exceed 100%, and cost scales linearly.",
              },
              {
                q: "What's the slim schema vs full schema design?",
                a: "The model generates modelOutputSchema (findings array + overallRisk + score). The client enriches it via enrichAuditResult() which computes all 9 efficiency dimensions deterministically. The full auditResultSchema (with efficiency metrics) is used for display and history storage.",
              },
              {
                q: "How would you scale this for production?",
                a: "Switch to Vercel AI Gateway for cloud models (one-line change), add Vercel Postgres for audit history, batch audits for CI/CD integration, webhooks for PII alerts, fine-tune a smaller model on the audit task.",
              },
              {
                q: "Why streaming instead of waiting for full response?",
                a: "Better UX — users see findings appear in real-time, and the efficiency scorecard updates live as each finding streams in. Deterministic computation means metrics are accurate even with partial data — no waiting for the full response.",
              },
              {
                q: "How does Fluid Compute help here?",
                a: "LLM inference is I/O-bound — the function waits 5–15 seconds for the model. With Active CPU pricing, you only pay for CPU time during request parsing and response processing, not the idle wait.",
              },
              {
                q: "Why gpt-tokenizer instead of estimating tokens?",
                a: "Heuristics like chars/4 can be off by 20–40%. gpt-tokenizer uses real BPE encoding (same as GPT models), runs in <1ms client-side, and gives exact token counts. This matters because cost, carbon, and water all derive from token counts.",
              },
              {
                q: "What would you change for an enterprise customer?",
                a: "Add SSO (SAML), team-level audit history in Postgres, webhook alerts for high-severity PII findings, Vercel Workflow for durable batch audits (see section 10 below), SLA-backed model routing via AI Gateway, and rolling releases for gradual rollout.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-lg border border-border p-4"
              >
                <p className="text-sm font-medium text-foreground">{item.q}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 10. Vercel Workflow */}
        <Section title="10. Vercel Workflow (Production Roadmap)">
          <div className="mb-6 rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground">
              Why Not In The Demo
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The current audit is a <span className="font-medium text-foreground">single request → single response</span> flow.
              It doesn&apos;t need crash recovery or multi-step orchestration. But for enterprise batch audits —
              processing hundreds of documents in a CI/CD pipeline — Vercel Workflow is the right tool.
            </p>
          </div>

          <p className="mb-4 text-sm font-medium text-foreground">Workflow Features → Audit Use Case:</p>

          <div className="space-y-3">
            {[
              {
                feature: "Workflows and Steps",
                directive: '"use workflow" + "use step"',
                description: "Write durable functions where each step is independently retryable and crash-safe. If the LLM call fails mid-stream, only that step retries — not the entire pipeline.",
                mapping: "Step 1: Parse/tokenize document → Step 2: Call LLM for findings → Step 3: Compute efficiency metrics → Step 4: Store to Postgres → Step 5: Send webhook alert if PII found",
              },
              {
                feature: "Sleep and Hooks",
                directive: "sleep() + waitForEvent()",
                description: "Pause a workflow for minutes to months, or wait for an external event (like human approval) before continuing.",
                mapping: "Schedule nightly batch audits across all team documents. Pause after PII detection and wait for a compliance officer to approve before the context is sent to a cloud LLM.",
              },
              {
                feature: "Observability",
                directive: "Built-in run tracing",
                description: "Track runs in real time, trace failures to specific steps, and analyze performance across the pipeline.",
                mapping: "Dashboard showing: which documents failed audit, which step failed (LLM timeout vs. schema validation), average latency per step, PII detection rate across the org.",
              },
              {
                feature: "Streams",
                directive: "Managed data persistence",
                description: "Stream data in and out of workflows with managed persistence — no need to manually serialize state between steps.",
                mapping: "Stream a large PDF (50+ pages) through the tokenizer, chunk it, and audit each chunk as a separate step. Intermediate results persist automatically if the function recycles.",
              },
              {
                feature: "Skew Protection",
                directive: "Version-safe execution",
                description: "Protect long-running workflows from version skew when you deploy a new version mid-execution.",
                mapping: "A batch audit of 500 documents takes 30 minutes. If you deploy a prompt change halfway through, Skew Protection ensures the in-flight batch completes with the original prompt version.",
              },
              {
                feature: "Usage-Based Pricing",
                directive: "Events + Data Written + Data Retained",
                description: "Pay only for events processed, data written, and data retained — no idle compute costs.",
                mapping: "Enterprise customer runs 10K audits/month. Pay per audit event, per finding stored, per month of retention. No cost for idle time between batch runs.",
              },
            ].map((item) => (
              <div key={item.feature} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.feature}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-accent">{item.directive}</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
                <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-accent">
                    Maps to audit flow
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.mapping}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card/50 p-5">
            <p className="mb-3 text-sm font-bold text-foreground">
              What the Batch Audit Pipeline Would Look Like
            </p>
            <div className="relative space-y-0">
              {[
                { step: 1, title: "Trigger", detail: "CI/CD webhook or scheduled cron fires a workflow event with document IDs" },
                { step: 2, title: "use step: Fetch Documents", detail: "Pull documents from Blob storage or external API — retries on network failure" },
                { step: 3, title: "use step: Tokenize + Chunk", detail: "gpt-tokenizer splits large docs into auditable chunks — state persisted between steps" },
                { step: 4, title: "use step: LLM Audit (per chunk)", detail: "AI SDK → AI Gateway → cloud model — each chunk is a separate retryable step" },
                { step: 5, title: "use step: Compute Metrics", detail: "Deterministic efficiency engine runs on all findings — crash-safe" },
                { step: 6, title: "use step: Store + Alert", detail: "Save to Vercel Postgres, send webhook if PII detected, notify Slack" },
                { step: 7, title: "sleep (optional)", detail: "Wait for compliance approval before forwarding context to production LLM" },
              ].map((item, i) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-[10px] font-bold text-accent">
                      {item.step}
                    </div>
                    {i < 6 && <div className="h-full w-px bg-border" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-semibold text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <SiteFooter />
      </main>
    </>
  );
}
