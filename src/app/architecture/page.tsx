import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";
import { PlatformFeatures } from "@/components/platform-features";
import { AuditFlowDiagram } from "@/components/prep/audit-flow-diagram";
import { SchemaDiagram } from "@/components/architecture/schema-diagram";
import { WorkflowDiagram } from "@/components/architecture/workflow-diagram";

export const metadata: Metadata = {
  title: "Architecture | Offlyn Token Audit MCP",
  description: "Interactive architecture diagram of the Token Audit implementation.",
};

export default function ArchitecturePage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <header className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Architecture
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            How context flows from input through the audit pipeline to
            structured results. Click any node to see details.
          </p>
        </header>

        <div className="space-y-8">
          <AuditFlowDiagram />
          <SchemaDiagram />
          <WorkflowDiagram />
        </div>

        <PlatformFeatures page="architecture" />
        <SiteFooter />
      </main>
    </>
  );
}
