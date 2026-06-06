export type DemoScenario = {
  id: string;
  label: string;
  description: string;
  context: string;
};

const duplicateChunk = `Acme Corp was founded in 2019 and provides enterprise SaaS for workflow automation. Their primary product integrates with Slack, Teams, and email. Revenue grew 140% YoY in 2024. The company is headquartered in Austin, TX with 450 employees.`;

export const demoScenarios: DemoScenario[] = [
  {
    id: "rag-duplicates",
    label: "RAG duplicate chunks",
    description: "Three near-identical retrieved passages inflating token count",
    context: `System: You are a research assistant. Answer using the retrieved context below.

Retrieved chunk 1 (score: 0.92):
${duplicateChunk}

Retrieved chunk 2 (score: 0.89):
${duplicateChunk}

Retrieved chunk 3 (score: 0.87):
Acme Corp, established in 2019, delivers enterprise SaaS for workflow automation. Products integrate Slack, Microsoft Teams, and email. 2024 revenue increased 140% year-over-year. HQ: Austin, Texas. ~450 staff.

User: Summarize Acme Corp for an investor brief.`,
  },
  {
    id: "pii-support",
    label: "Customer support + PII",
    description: "Support ticket context with email, SSN, and phone before cloud inference",
    context: `System: You are a customer support agent. Use the ticket context to draft a response.

Ticket #88421 — Priority: High
Customer: John Smith (john.smith@acme.com)
Phone: (512) 555-0142
SSN on file: 123-45-6789
Account ID: ACC-992834

Issue: Customer reports unauthorized charge of $299.99 on card ending 4242.
Internal note: API key sk-proj-abc123xyz789was leaked in a prior support thread.

User: Draft a empathetic response and list compliance steps.`,
  },
  {
    id: "bloated-system",
    label: "Bloated system prompt",
    description: "Verbose system prompt with low-value boilerplate",
    context: `${"You are an extremely helpful, friendly, and professional AI assistant. ".repeat(40)}
Always be polite. Never refuse reasonable requests. Follow all policies carefully.
IMPORTANT: You must always double-check your work and provide comprehensive answers.
${"Remember to be concise but thorough in every response. ".repeat(30)}
Company policy section 1: ... ${"Lorem ipsum dolor sit amet. ".repeat(100)}

User: What is 2+2?`,
  },
  {
    id: "clean-trace",
    label: "Clean agent trace",
    description: "Well-structured minimal context — should pass with few findings",
    context: `System: You are a code reviewer. Review the diff and list issues.

Tool result (grep):
src/auth.ts:42 — missing null check on session.user

Diff:
- if (session.user) {
+ if (session?.user?.id) {

User: Is this fix sufficient?`,
  },
  {
    id: "mixed-issues",
    label: "Mixed issues",
    description: "Duplicates, PII, and low-value tokens combined",
    context: `System: ${"You are a helpful assistant. Be verbose and friendly. ".repeat(25)}

Context block A:
Customer email: sarah.jones@enterprise.io | API Key: sk-live-9f8e7d6c5b4a

Context block B (duplicate):
Customer email: sarah.jones@enterprise.io | API Key: sk-live-9f8e7d6c5b4a

Context block C (near duplicate):
The customer's email is sarah.jones@enterprise.io. Their API key is sk-live-9f8e7d6c5b4a.

${"Please note this is for internal use only. ".repeat(50)}

User: Summarize the customer record.`,
  },
];

export const defaultScenarioId = "pii-support";
