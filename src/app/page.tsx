import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";
import { PlatformFeatures } from "@/components/platform-features";
import { MiniAudit } from "@/components/landing/mini-audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Offlyn Token Audit MCP",
  description:
    "Pre-inference context audit for AI agents — cut token spend, catch PII, and measure resource efficiency across 9 Offlyn dimensions.",
};

export default function Home() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <header className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium text-accent">MCP Server</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Offlyn Token Audit MCP
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Context audit layer for AI agents — inspect every token before cloud
            inference.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Enterprise AI teams waste 40–60% of tokens on redundant context,
            leak PII to cloud LLMs, and lack visibility into the full resource
            footprint of AI workflows. Token Audit MCP analyzes prompts, RAG
            chunks, tool outputs, and documents{" "}
            <em>before</em> expensive inference — with metrics aligned to the{" "}
            <a
              href="https://github.com/offlyn-ai"
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Offlyn.ai
            </a>{" "}
            efficiency framework and Green Software Foundation SCI for AI.
          </p>
        </header>

        <MiniAudit />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/demo",
              title: "Try it live",
              desc: "Paste text or upload files. Stream real audit results and 9-dimension scorecard.",
            },
            {
              href: "/architecture",
              title: "How it works",
              desc: "Interactive diagram — click nodes for code, files, and Vercel features.",
            },
            {
              href: "/eval",
              title: "Proof it works",
              desc: "8-case evaluation suite with pass/fail rubric against live API.",
            },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="group block">
              <Card className="h-full border-border bg-card/50 transition-all hover:border-accent/40 hover:shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base group-hover:text-accent">
                    {card.title} →
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <PlatformFeatures page="home" />
        <SiteFooter />
      </main>
    </>
  );
}
