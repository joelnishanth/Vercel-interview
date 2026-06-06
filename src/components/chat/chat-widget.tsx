"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { cn } from "@/lib/utils";

const suggestions = [
  "Why use AI Gateway instead of direct provider keys?",
  "How does Fluid Compute benefit this workload?",
  "Explain the 9 Offlyn efficiency dimensions.",
  "What is the evaluation rubric on /eval?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[min(480px,70vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Implementation Q&A
              </p>
              <p className="text-xs text-muted-foreground">
                Ask about architecture & decisions
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Suggested questions:
                </p>
                {suggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage({ text: q })}
                    className="block w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-left text-xs text-foreground hover:bg-secondary"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-8 bg-accent/10 text-foreground"
                    : "mr-4 bg-secondary text-foreground",
                )}
              >
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <span key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </span>
                  ) : null,
                )}
              </div>
            ))}
            {error && (
              <p className="text-xs text-red-500">{error.message}</p>
            )}
          </div>

          <form
            className="border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim() || isStreaming) return;
              sendMessage({ text: input });
              setInput("");
            }}
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this implementation..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105"
        aria-label="Open implementation chat"
      >
        {open ? "↓" : "?"}
      </button>
    </>
  );
}
