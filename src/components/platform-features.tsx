import { platformFeaturesByPage, type PlatformPage } from "@/data/platform-features";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlatformFeatures({ page }: { page: PlatformPage }) {
  const features = platformFeaturesByPage[page];

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          Powered by Vercel
        </p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">
          Platform features on this page
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {features.map((feature) => (
          <Card
            key={feature.name}
            className="border-border bg-card/50 shadow-sm backdrop-blur-sm"
          >
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-medium text-foreground">
                  {feature.name}
                </CardTitle>
                <span className="shrink-0 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {feature.category}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-4 pt-0">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              {feature.docsUrl && (
                <a
                  href={feature.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-accent hover:underline"
                >
                  Documentation →
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
