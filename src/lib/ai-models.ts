import { ollama } from "ollama-ai-provider-v2";

const isLocal = process.env.NODE_ENV === "development";

const LOCAL_MODEL = "llama3.2";
const GATEWAY_AUDIT_MODEL = "google/gemini-2.5-flash";
const GATEWAY_CHAT_MODEL = "google/gemini-2.5-flash";

/** Ollama locally, AI Gateway (Gemini) in production */
export function getAuditModel() {
  return isLocal ? ollama(LOCAL_MODEL) : GATEWAY_AUDIT_MODEL;
}

/** Ollama locally, AI Gateway (Gemini) in production */
export function getChatModel() {
  return isLocal ? ollama(LOCAL_MODEL) : GATEWAY_CHAT_MODEL;
}

export function formatGatewayErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (isLocal) {
    if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      return "Ollama is not running. Start it with: ollama serve";
    }
    if (message.includes("model") && message.includes("not found")) {
      return `Model not found. Pull it with: ollama pull ${LOCAL_MODEL}`;
    }
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
