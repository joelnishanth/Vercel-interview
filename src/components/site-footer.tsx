export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border pt-8 text-center">
      <p className="text-sm text-muted-foreground">
        Built by{" "}
        <a
          href="https://offlyn.ai"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Offlyn.ai
        </a>{" "}
        ·{" "}
        <a
          href="https://github.com/offlyn-ai"
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>{" "}
        · Deployed on Vercel
      </p>
    </footer>
  );
}
