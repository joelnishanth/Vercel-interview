import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, streamText } from "ai";
import { chatSystemPrompt } from "@/lib/chat-context";
import { getChatModel, formatGatewayErrorMessage } from "@/lib/ai-models";

export const maxDuration = 120;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return Response.json({ error: "messages required" }, { status: 400 });
    }

    const result = streamText({
      model: getChatModel(),
      system: chatSystemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[chat]", error);
    return Response.json(
      { error: formatGatewayErrorMessage(error) },
      { status: 503 },
    );
  }
}
