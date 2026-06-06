import type { Metadata } from "next";
import { NavBar } from "@/components/nav-bar";
import { SiteFooter } from "@/components/site-footer";
import { PlatformFeatures } from "@/components/platform-features";
import { InteractiveDiagram } from "@/components/architecture/interactive-diagram";

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
            Implementation Architecture
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            Click any node to see what it does, which files implement it, and
            which Vercel platform feature powers it. Animated connections show
            data flow from intake through AI Gateway to results.
          </p>
        </header>
        <InteractiveDiagram />
        <PlatformFeatures page="architecture" />
        <SiteFooter />
      </main>
    </>
  );
}
