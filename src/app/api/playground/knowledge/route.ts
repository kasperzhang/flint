import { generateText, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const conversationContext = messages
    .map((m) => {
      const text = m.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
      return `${m.role}: ${text}`;
    })
    .join("\n");

  const result = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    system: `You are an analytical observer summarizing what an AI thinking mentor (Flint) has learned from a conversation. Provide a concise structured summary with these sections:

**Problem Understanding** — What's the core question or challenge?
**Key Details** — Constraints, stakeholders, context surfaced so far
**Thinking Pattern** — Is the user comparing options, tracing root causes, or exploring a space?
**Assumptions Surfaced** — What implicit assumptions have been identified?
**Readiness for Scaffold** — How close is the conversation to needing a thinking scaffold?

Keep each section to 1-2 sentences. If a section has no data yet, write "Not yet identified."`,
    prompt: `Analyze this conversation between a user and Flint:\n\n${conversationContext}`,
    maxOutputTokens: 500,
  });

  return Response.json({ summary: result.text });
}
