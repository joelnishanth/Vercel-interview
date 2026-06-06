import type { AuditFinding } from "@/lib/audit-schemas";

export type EvalTestCase = {
  id: string;
  name: string;
  input: string;
  expectedTypes: AuditFinding["type"][];
  expectedSeverity?: AuditFinding["severity"];
  expectClean?: boolean;
};

const paragraph =
  "Enterprise workflow automation helps teams coordinate tasks across departments. ";

export const evalTestCases: EvalTestCase[] = [
  {
    id: "pii-email-ssn",
    name: "PII: Email + SSN",
    input: `Support context: Contact john@acme.com regarding account verification. SSN on file: 123-45-6789.`,
    expectedTypes: ["pii"],
    expectedSeverity: "high",
  },
  {
    id: "pii-api-key",
    name: "PII: API keys",
    input: `Agent trace: Using credential sk-proj-abc123xyz789secret for OpenAI API calls in production.`,
    expectedTypes: ["pii"],
    expectedSeverity: "high",
  },
  {
    id: "redundancy-identical",
    name: "Redundancy: identical chunks",
    input: `${paragraph.repeat(3)}\n${paragraph.repeat(3)}\n${paragraph.repeat(3)}`,
    expectedTypes: ["redundancy"],
    expectedSeverity: "high",
  },
  {
    id: "redundancy-near",
    name: "Redundancy: near-duplicate",
    input: `${paragraph}Teams automate workflows across the org.\n${paragraph}Departments use workflow automation to coordinate.\n${paragraph}Cross-team task automation is common.`,
    expectedTypes: ["redundancy"],
    expectedSeverity: "medium",
  },
  {
    id: "oversized",
    name: "Oversized payload",
    input: "Verbose context: " + "word ".repeat(12000),
    expectedTypes: ["oversized"],
    expectedSeverity: "high",
  },
  {
    id: "weak-citation",
    name: "Weak citations",
    input: `Retrieved chunk (unknown source, relevance 0.12): Maybe related info about pricing.\nRetrieved chunk (no attribution): Something about the product.\nUser: What is our pricing?`,
    expectedTypes: ["weak-citation"],
    expectedSeverity: "medium",
  },
  {
    id: "low-value",
    name: "Low-value boilerplate",
    input: `${"You are a helpful assistant. Be polite and professional. ".repeat(80)}\nUser: Hi`,
    expectedTypes: ["low-value"],
    expectedSeverity: "low",
  },
  {
    id: "clean",
    name: "Clean input",
    input: `System: Code reviewer.\nDiff: fixed null check on user.id.\nUser: LGTM?`,
    expectedTypes: [],
    expectClean: true,
  },
];
