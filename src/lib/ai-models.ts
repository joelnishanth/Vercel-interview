import { ollama } from "ollama-ai-provider-v2";

/** Local Ollama model for audit — runs entirely on-device */
export const AUDIT_MODEL = "llama3.2";

/** Local Ollama model for chat */
export const CHAT_MODEL = "llama3.2";

/** Create the Ollama model instance for audit */
export function getAuditModel() {
  return ollama(AUDIT_MODEL);
}

/** Create the Ollama model instance for chat */
export function getChatModel() {
  return ollama(CHAT_MODEL);
}

export function formatGatewayErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
    return "Ollama is not running. Start it with: ollama serve";
  }

  if (message.includes("model") && message.includes("not found")) {
    return `Model not found. Pull it with: ollama pull ${AUDIT_MODEL}`;
  }

  if (
    message.includes("rate_limit") ||
    message.includes("Rate limited") ||
    message.includes("rate-limited")
  ) {
    return "Rate limit reached. Wait a moment and try again.";
  }

  return message;
}
