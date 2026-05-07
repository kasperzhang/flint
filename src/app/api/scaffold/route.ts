import { generateText, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SCAFFOLD_HTML_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { db, sessions } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    type,
    title,
    description,
    messages,
    sessionId,
    customSystemPrompt,
    rawPrompt,
  }: {
    type: string;
    title: string;
    description: string;
    messages: UIMessage[];
    sessionId?: string;
    customSystemPrompt?: string;
    rawPrompt?: string;
  } = body;

  let prompt: string;

  if (rawPrompt) {
    // Direct prompt mode — used by scaffold playground
    prompt = rawPrompt;
  } else {
    // Structured mode — build from type/title/description/messages
    const conversationContext = messages
      .map((m) => {
        const text = m.parts
          ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("");
        return `${m.role}: ${text}`;
      })
      .join("\n");

    prompt = `Generate a "${type}" scaffold as a beautiful, self-contained HTML page.

Title: ${title}
Why this scaffold: ${description}

Here's what the user discussed with Flint:
${conversationContext}

Remember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`;
  }

  const result = await generateText({
    model: anthropic("claude-opus-4-6"),
    system: customSystemPrompt || SCAFFOLD_HTML_SYSTEM_PROMPT,
    prompt,
  });

  // Strip markdown fences if present
  let html = result.text.trim();
  if (html.startsWith("```")) {
    html = html.replace(/^```(?:html)?\n?/, "").replace(/\n?```$/, "");
  }

  // Persist scaffold to DB
  if (db && sessionId) {
    try {
      await db
        .update(sessions)
        .set({ currentScaffold: html, scaffoldProposal: null, phase: "discussion", updatedAt: new Date() })
        .where(eq(sessions.id, sessionId));
    } catch (e) {
      console.error("Failed to persist scaffold:", e);
    }
  }

  return Response.json({ html });
}
