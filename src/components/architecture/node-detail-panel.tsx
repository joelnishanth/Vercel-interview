"use client";

import { motion } from "framer-motion";
import type { ArchitectureNode } from "@/data/architecture-nodes";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const typeStyles: Record<ArchitectureNode["type"], string> = {
  server: "bg-green-500/10 text-green-600 border-green-500/30",
  client: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  api: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  external: "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

export function NodeDetailPanel({
  node,
  onClose,
}: {
  node: ArchitectureNode | null;
  onClose: () => void;
}) {
  if (!node) return null;

  return (
    <Card className="relative overflow-hidden py-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px]", typeStyles[node.type])}>
              {node.type}
            </Badge>
            <CardTitle className="text-lg">{node.label}</CardTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {node.description}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Files */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Files
            </p>
            <div className="space-y-1">
              {node.implementationFiles.map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-1.5 rounded-md bg-secondary/50 px-2 py-1"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 text-muted-foreground">
                    <path d="M2 1h5l3 3v7H2V1z" fill="none" stroke="currentColor" strokeWidth="1" />
                    <path d="M7 1v3h3" fill="none" stroke="currentColor" strokeWidth="1" />
                  </svg>
                  <span className="font-mono text-[11px] text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Vercel Feature */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Vercel Feature
            </p>
            <div className="rounded-md border border-accent/20 bg-accent/5 px-3 py-2">
              <p className="text-sm font-medium text-foreground">{node.vercelFeature}</p>
            </div>
          </motion.div>
        </div>

        {/* Code snippet */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Implementation
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-secondary/30 p-3 font-mono text-xs leading-relaxed text-foreground">
            {node.codeSnippet}
          </pre>
        </motion.div>
      </CardContent>
    </Card>
  );
}
