"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SchemaField = {
  name: string;
  type: string;
  description: string;
};

type SchemaBlock = {
  id: string;
  label: string;
  color: string;
  fields: SchemaField[];
};

const FINDING_BLOCK: SchemaBlock = {
  id: "finding",
  label: "AuditFinding",
  color: "#f97316",
  fields: [
    { name: "type", type: 'enum("pii" | "redundancy" | "oversized" | …)', description: "Category of the issue detected in the context window" },
    { name: "severity", type: 'enum("high" | "medium" | "low")', description: "How urgent this finding is for the user to address" },
    { name: "title", type: "string", description: "Short human-readable label for the finding" },
    { name: "description", type: "string", description: "Detailed explanation of what was found and why it matters" },
    { name: "location", type: "string", description: "Quoted snippet from the context showing where the issue is" },
    { name: "tokenImpact", type: "number", description: "Estimated tokens wasted or at risk from this finding" },
    { name: "recommendation", type: "string", description: "Actionable fix the user should apply before sending to LLM" },
  ],
};

const EFFICIENCY_BLOCKS: SchemaBlock[] = [
  { id: "tokenEfficiency", label: "Token", color: "#22c55e", fields: [
    { name: "cloudTokensAvoided", type: "number", description: "Tokens that can be trimmed before sending to cloud" },
    { name: "reductionPercent", type: "number", description: "Percentage reduction vs. raw context" },
  ]},
  { id: "costEfficiency", label: "Cost", color: "#3b82f6", fields: [
    { name: "estimatedCostUsd", type: "number", description: "Estimated cost if sent as-is" },
    { name: "estimatedSavingsUsd", type: "number", description: "Dollar savings from trimming" },
    { name: "savingsPercent", type: "number", description: "Percentage cost reduction" },
  ]},
  { id: "energyEfficiency", label: "Energy", color: "#a855f7", fields: [
    { name: "estimatedCloudKwh", type: "number", description: "Energy to process full context in cloud" },
    { name: "estimatedLocalKwh", type: "number", description: "Energy if processed locally" },
    { name: "netSavingsKwh", type: "number", description: "Net energy saved" },
  ]},
  { id: "carbonIntensity", label: "Carbon", color: "#14b8a6", fields: [
    { name: "estimatedCloudCo2eGrams", type: "number", description: "CO₂e from cloud inference" },
    { name: "estimatedLocalCo2eGrams", type: "number", description: "CO₂e from local inference" },
    { name: "netReductionGrams", type: "number", description: "Net carbon reduction" },
  ]},
  { id: "waterEfficiency", label: "Water", color: "#06b6d4", fields: [
    { name: "estimatedCloudWaterMl", type: "number", description: "Datacenter cooling water for cloud run" },
    { name: "reductionMl", type: "number", description: "Water saved by optimizing" },
  ]},
  { id: "privacyEfficiency", label: "Privacy", color: "#ec4899", fields: [
    { name: "piiFieldsDetected", type: "number", description: "Count of PII fields found" },
    { name: "piiFieldsRedacted", type: "number", description: "Count of PII fields redacted" },
    { name: "sensitiveDataKeptLocal", type: "boolean", description: "Whether sensitive data stays on-device" },
  ]},
  { id: "networkEfficiency", label: "Network", color: "#f59e0b", fields: [
    { name: "payloadSizeBytes", type: "number", description: "Total payload size in bytes" },
    { name: "reducedPayloadBytes", type: "number", description: "Bytes reducible by trimming" },
    { name: "transferAvoided", type: "boolean", description: "Whether the transfer can be avoided entirely" },
  ]},
  { id: "qualityPreservation", label: "Quality", color: "#8b5cf6", fields: [
    { name: "informationRetentionPercent", type: "number", description: "How much useful info is kept after trimming" },
    { name: "citationIntegrityPercent", type: "number", description: "Citation accuracy preservation" },
  ]},
  { id: "resilience", label: "Resilience", color: "#64748b", fields: [
    { name: "localRoutable", type: "boolean", description: "Can be processed by a local model" },
    { name: "offlineCapable", type: "boolean", description: "Works without internet" },
    { name: "fallbackAvailable", type: "boolean", description: "Alternative model path exists" },
  ]},
];

const SUMMARY_BLOCK: SchemaBlock = {
  id: "summary",
  label: "Summary",
  color: "#ef4444",
  fields: [
    { name: "totalTokens", type: "number", description: "Total tokens in the context window" },
    { name: "wastedTokens", type: "number", description: "Tokens identified as waste" },
    { name: "overallRisk", type: 'enum("high" | "medium" | "low" | "clean")', description: "Aggregate risk level for the context" },
    { name: "overallEfficiencyScore", type: "number", description: "0–100 composite score across all dimensions" },
  ],
};

function DimensionPill({
  block,
  isActive,
  onClick,
  index,
}: {
  block: SchemaBlock;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
        isActive
          ? "border-transparent text-white shadow-md"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
      style={isActive ? { backgroundColor: block.color } : undefined}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: isActive ? "white" : block.color }}
      />
      {block.label}
    </motion.button>
  );
}

function FieldRow({ field, index }: { field: SchemaField; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group flex items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-secondary/30"
    >
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-secondary text-[9px] font-bold text-muted-foreground">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-xs font-semibold text-foreground">
            {field.name}
          </span>
          <Badge variant="secondary" className="font-mono text-[9px] px-1.5 py-0">
            {field.type}
          </Badge>
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          {field.description}
        </p>
      </div>
    </motion.div>
  );
}

export function SchemaDiagram() {
  const [activeDimension, setActiveDimension] = useState<SchemaBlock>(EFFICIENCY_BLOCKS[0]);

  return (
    <Card className="overflow-hidden py-0">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-accent"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h2 className="text-sm font-semibold text-foreground">
            Audit Result Schema
          </h2>
          <Badge variant="outline" className="text-[9px] font-mono">
            auditResultSchema
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Zod-validated structured output — explore all fields the LLM returns
        </p>
      </div>

      <Tabs defaultValue="efficiency" className="w-full">
        <div className="border-b border-border px-5">
          <TabsList className="h-auto gap-1 bg-transparent p-0 py-2">
            <TabsTrigger
              value="findings"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-600"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-orange-500" />
              Findings
            </TabsTrigger>
            <TabsTrigger
              value="efficiency"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
              Efficiency (9D)
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="rounded-md px-3 py-1.5 text-xs data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
              Summary
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Findings tab */}
        <TabsContent value="findings" className="mt-0">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="font-mono text-sm font-semibold text-foreground">
                AuditFinding[]
              </span>
              <Badge variant="secondary" className="text-[9px]">
                {FINDING_BLOCK.fields.length} fields per finding
              </Badge>
            </div>
            <div className="space-y-1">
              {FINDING_BLOCK.fields.map((field, i) => (
                <FieldRow key={field.name} field={field} index={i} />
              ))}
            </div>
          </CardContent>
        </TabsContent>

        {/* Efficiency tab */}
        <TabsContent value="efficiency" className="mt-0">
          <CardContent className="p-5">
            <div className="mb-4">
              <p className="mb-2.5 text-xs text-muted-foreground">
                9 dimensions of context efficiency — select one to see fields
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EFFICIENCY_BLOCKS.map((block, i) => (
                  <DimensionPill
                    key={block.id}
                    block={block}
                    isActive={activeDimension.id === block.id}
                    onClick={() => setActiveDimension(block)}
                    index={i}
                  />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeDimension.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg border border-border bg-secondary/20 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: activeDimension.color }}
                  />
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {activeDimension.label}
                  </span>
                  <Badge variant="secondary" className="text-[9px]">
                    {activeDimension.fields.length} fields
                  </Badge>
                </div>
                <div className="space-y-1">
                  {activeDimension.fields.map((field, i) => (
                    <FieldRow key={field.name} field={field} index={i} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </TabsContent>

        {/* Summary tab */}
        <TabsContent value="summary" className="mt-0">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="font-mono text-sm font-semibold text-foreground">
                Summary
              </span>
              <Badge variant="secondary" className="text-[9px]">
                {SUMMARY_BLOCK.fields.length} fields
              </Badge>
            </div>
            <div className="space-y-1">
              {SUMMARY_BLOCK.fields.map((field, i) => (
                <FieldRow key={field.name} field={field} index={i} />
              ))}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
