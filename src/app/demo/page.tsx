import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";
import { PlatformFeatures } from "@/components/platform-features";
import { DemoWorkspace } from "@/components/demo/demo-workspace";
import { MiniEval } from "@/components/demo/mini-eval";

export const metadata: Metadata = {
  title: "Live Demo | Offlyn Token Audit MCP",
  description: "Run a real context audit with text paste or file upload.",
};

export default function DemoPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Live Audit Demo
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            Submit real context via text paste or file upload. The LLM identifies
            findings (waste, PII, weak citations) via AI SDK — efficiency metrics
            are computed deterministically using the Offlyn methodology.
          </p>
        </header>
        <DemoWorkspace />
        <MiniEval />
        <PlatformFeatures page="demo" />
        <SiteFooter />
      </main>
    </>
  );
}
