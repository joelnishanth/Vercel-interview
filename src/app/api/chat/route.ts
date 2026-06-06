import { APICallError, convertToModelMessages, gateway, streamText } from "ai";
import { chatSystemPrompt } from "@/lib/chat-context";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return Response.json({ error: "messages required" }, { status: 400 });
    }

    const result = streamText({
      model: gateway("anthropic/claude-sonnet-4.5"),
      system: chatSystemPrompt,
      messages: await convertToModelMessages(messages),
      providerOptions: {
        gateway: {
          models: ["openai/gpt-5.4"],
          tags: ["feature:implementation-chat"],
        },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (APICallError.isInstance(error)) {
      if (error.statusCode === 402) {
        return Response.json(
          { error: "AI Gateway budget limit reached." },
          { status: 402 },
        );
      }
      if (error.statusCode === 429) {
        return Response.json({ error: "Rate limited." }, { status: 429 });
      }
    }
    console.error("[chat]", error);
    return Response.json({ error: "Chat unavailable." }, { status: 503 });
  }
}
