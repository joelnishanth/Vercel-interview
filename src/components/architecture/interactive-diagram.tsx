"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  architectureNodes,
  type ArchitectureNode,
} from "@/data/architecture-nodes";
import { NodeDetailPanel } from "./node-detail-panel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeStyles: Record<
  ArchitectureNode["type"],
  { border: string; bg: string; dot: string; glow: string }
> = {
  server: {
    border: "border-green-500/50",
    bg: "bg-green-500/5",
    dot: "bg-green-500",
    glow: "shadow-green-500/20",
  },
  client: {
    border: "border-blue-500/50",
    bg: "bg-blue-500/5",
    dot: "bg-blue-500",
    glow: "shadow-blue-500/20",
  },
  api: {
    border: "border-purple-500/50",
    bg: "bg-purple-500/5",
    dot: "bg-purple-500",
    glow: "shadow-purple-500/20",
  },
  external: {
    border: "border-orange-500/50",
    bg: "bg-orange-500/5",
    dot: "bg-orange-500",
    glow: "shadow-orange-500/20",
  },
};

const badgeVariants: Record<ArchitectureNode["type"], string> = {
  server: "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20",
  client: "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20",
  api: "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20",
  external: "bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20",
};

const nodeMap = Object.fromEntries(
  architectureNodes.map((n) => [n.id, n]),
) as Record<string, ArchitectureNode>;

const mainFlow = ["intake", "audit-api", "ai-sdk", "gateway", "providers", "ui"];
const secondaryFlows = [
  { label: "Chat path", ids: ["chat", "gateway"], icon: "💬" },
  { label: "Eval path", ids: ["eval", "audit-api"], icon: "🧪" },
];

function PulsingDot({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <motion.span
        className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", color)}
        animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", color)} />
    </span>
  );
}

function AnimatedArrow({ delay = 0 }: { delay?: number }) {
  return (
    <div className="flex shrink-0 items-center px-1">
      <div className="relative flex items-center">
        <div className="h-px w-8 bg-border sm:w-12" />
        <motion.div
          className="absolute left-0 h-1 w-3 rounded-full bg-accent"
          animate={{ x: [0, 28, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeInOut" }}
        />
        <svg width="8" height="10" viewBox="0 0 8 10" className="shrink-0 text-border">
          <path d="M0 0 L8 5 L0 10 Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

function FlowNode({
  node,
  isSelected,
  onSelect,
  index,
}: {
  node: ArchitectureNode;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const styles = typeStyles[node.type];

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 transition-shadow",
        styles.border,
        styles.bg,
        isSelected && `ring-2 ring-accent ring-offset-2 ring-offset-background shadow-lg ${styles.glow}`,
      )}
    >
      <div className="absolute -top-1 -right-1">
        <PulsingDot color={styles.dot} delay={index * 0.3} />
      </div>
      <span className="text-xs font-semibold text-foreground whitespace-nowrap">
        {node.label}
      </span>
      <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", badgeVariants[node.type])}>
        {node.type}
      </Badge>
    </motion.button>
  );
}

function DataPacket({ flowIndex }: { flowIndex: number }) {
  return (
    <motion.div
      className="absolute top-1/2 left-0 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px] shadow-accent/60"
      initial={{ x: 0, opacity: 0 }}
      animate={{
        x: ["0%", "100%"],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: flowIndex * 0.8,
        ease: "linear",
      }}
    />
  );
}

function StreamingReturn() {
  const [dots, setDots] = useState(3);
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d % 5) + 1), 400);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="mt-1 flex items-center gap-2 pl-2"
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 w-1 rounded-full bg-accent"
            animate={{ opacity: i < dots ? 1 : 0.15 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
      <span className="text-[10px] text-accent/70 font-mono">
        streaming response → UI
      </span>
    </motion.div>
  );
}

export function InteractiveDiagram() {
  const [selected, setSelected] = useState<ArchitectureNode | null>(null);

  const toggle = (node: ArchitectureNode) =>
    setSelected((s) => (s?.id === node.id ? null : node));

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 space-y-5"
      >
        {/* Main audit pipeline */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-accent"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Audit Pipeline
            </span>
            <span className="text-[10px] text-muted-foreground/60">— click any node for details</span>
          </div>

          <div className="relative overflow-x-auto pb-2">
            <div className="flex items-center gap-0 min-w-max">
              {mainFlow.map((id, i) => {
                const node = nodeMap[id];
                if (!node) return null;
                return (
                  <div key={id} className="flex items-center">
                    <FlowNode
                      node={node}
                      isSelected={selected?.id === id}
                      onSelect={() => toggle(node)}
                      index={i}
                    />
                    {i < mainFlow.length - 1 && <AnimatedArrow delay={i * 0.15} />}
                  </div>
                );
              })}
            </div>
            <StreamingReturn />
          </div>
        </div>

        {/* Secondary flows */}
        <div className="grid gap-3 sm:grid-cols-2">
          {secondaryFlows.map((flow, flowIdx) => (
            <motion.div
              key={flow.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + flowIdx * 0.15 }}
              className="rounded-lg border border-dashed border-border/60 bg-secondary/30 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{flow.icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {flow.label}
                </span>
              </div>
              <div className="flex items-center gap-0">
                {flow.ids.map((id, i) => {
                  const node = nodeMap[id];
                  if (!node) return null;
                  return (
                    <div key={id} className="flex items-center">
                      <FlowNode
                        node={node}
                        isSelected={selected?.id === id}
                        onSelect={() => toggle(node)}
                        index={mainFlow.length + flowIdx * 2 + i}
                      />
                      {i < flow.ids.length - 1 && <AnimatedArrow delay={0.8 + flowIdx * 0.2} />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-4 border-t border-border/50 pt-3"
        >
          {(
            [
              ["server", "Server"],
              ["client", "Client"],
              ["api", "API Route"],
              ["external", "External"],
            ] as const
          ).map(([type, label]) => (
            <span key={type} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={cn("h-2 w-2 rounded-full", typeStyles[type].dot)} />
              {label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Animated detail panel */}
      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <NodeDetailPanel node={selected} onClose={() => setSelected(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-dashed border-border/50 p-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Click any node above to explore its implementation
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
