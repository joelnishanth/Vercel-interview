export type PlatformFeature = {
  name: string;
  category: string;
  description: string;
  docsUrl?: string;
};

export type PlatformPage = "home" | "demo" | "architecture" | "eval";

export const platformFeaturesByPage: Record<PlatformPage, PlatformFeature[]> = {
  home: [
    {
      name: "Static Generation",
      category: "Rendering",
      description:
        "Product copy prerendered at build time for instant LCP. The live mini-audit is a client island that streams from the API.",
      docsUrl: "https://nextjs.org/docs/app/building-your-application/rendering",
    },
    {
      name: "Server Components",
      category: "Rendering",
      description:
        "Page shell ships zero client JS. Only the mini-audit island hydrates for interactivity.",
      docsUrl: "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
    },
    {
      name: "next/font",
      category: "Performance",
      description: "Geist fonts inlined at build time — no layout shift from web font loading.",
      docsUrl: "https://nextjs.org/docs/app/building-your-application/optimizing/fonts",
    },
    {
      name: "AI SDK streamText",
      category: "AI",
      description:
        "Mini-audit calls /api/audit with streaming structured output for real findings on page load.",
      docsUrl: "https://ai-sdk.dev/docs",
    },
  ],
  demo: [
    {
      name: "AI SDK Output.object",
      category: "AI",
      description:
        "Audit API returns type-safe structured JSON via Zod schema — findings plus 9 Offlyn efficiency dimensions.",
      docsUrl: "https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data",
    },
    {
      name: "Vercel AI Gateway",
      category: "AI",
      description:
        "gateway() routes to Claude Sonnet 4.5 with GPT-5.4 fallback and feature:token-audit cost tags.",
      docsUrl: "https://vercel.com/docs/ai-gateway",
    },
    {
      name: "Route Handlers",
      category: "Compute",
      description: "POST /api/audit and /api/parse-pdf run as serverless functions on Fluid Compute.",
      docsUrl: "https://nextjs.org/docs/app/building-your-application/routing/route-handlers",
    },
    {
      name: "Fluid Compute",
      category: "Compute",
      description:
        "Active CPU pricing — pay for compute during processing, not wall-clock time waiting on LLM responses.",
      docsUrl: "https://vercel.com/docs/fluid-compute",
    },
    {
      name: "experimental_useObject",
      category: "AI",
      description: "Client hook streams partial audit results progressively into the UI.",
      docsUrl: "https://ai-sdk.dev/docs",
    },
  ],
  architecture: [
    {
      name: "Client Components",
      category: "Rendering",
      description:
        "Interactive SVG diagram with click state, animated connections, and expandable detail panels.",
      docsUrl: "https://nextjs.org/docs/app/building-your-application/rendering/client-components",
    },
    {
      name: "Server Components",
      category: "Rendering",
      description: "Page shell and PlatformFeatures annotation render on the server with no client JS.",
    },
    {
      name: "next/link",
      category: "Navigation",
      description: "Client-side navigation between pages without full reload.",
    },
  ],
  eval: [
    {
      name: "AI SDK structured output",
      category: "AI",
      description: "Each eval case hits /api/audit and parses structured findings for rubric comparison.",
    },
    {
      name: "AI Gateway cost tags",
      category: "AI",
      description: "Eval runs tagged feature:token-audit for cost attribution in Gateway dashboard.",
      docsUrl: "https://vercel.com/docs/ai-gateway",
    },
    {
      name: "Evaluation rubric",
      category: "Quality",
      description:
        "8-case test set with expected finding types and severity — Track B lightweight evaluation requirement.",
    },
  ],
};
