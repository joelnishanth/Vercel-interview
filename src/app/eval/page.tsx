import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";
import { PlatformFeatures } from "@/components/platform-features";
import { EvalRunner } from "@/components/eval/eval-runner";

export const metadata: Metadata = {
  title: "Evaluation Suite | Offlyn Token Audit MCP",
  description: "8-case test suite with pass/fail rubric against the live audit API.",
};

export default function EvalPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Evaluation Suite
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            Lightweight evaluation approach for Track B: 8 test cases with
            expected finding types run against the live /api/audit endpoint.
            Compare expected vs actual, score pass/partial/fail, and aggregate
            efficiency metrics.
          </p>
        </header>
        <EvalRunner />
        <PlatformFeatures page="eval" />
        <SiteFooter />
      </main>
    </>
  );
}
