import { streamText, convertToModelMessages, tool, stepCountIs, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { getMentorSystemPrompt } from "@/lib/ai/prompts";
import type { Phase } from "@/lib/phase-machine";
import { db, sessions, messages } from "@/lib/db";
import { eq } from "drizzle-orm";
import { stripScaffoldForContext } from "@/lib/utils/strip-scaffold";

export async function POST(req: Request) {
  const body = await req.json();
  const chatMessages: UIMessage[] = body.messages ?? [];
  const sessionId: string | undefined = body.sessionId;
  const phase: Phase = body.phase ?? "problem";
  const confidenceLevel: number = body.confidenceLevel ?? 3;
  const customSystemPrompt: string | undefined = body.customSystemPrompt;
  const currentScaffold: string | undefined = body.currentScaffold;

  let systemPrompt = customSystemPrompt || getMentorSystemPrompt(phase, confidenceLevel);
  if (currentScaffold) {
    systemPrompt += `\n\n<current_scaffold_html>\n${stripScaffoldForContext(currentScaffold)}\n</current_scaffold_html>`;
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    messages: await convertToModelMessages(chatMessages),
    stopWhen: stepCountIs(3),
    tools: {
      setPhase: tool({
        description:
          "Transition to a new conversation phase when the user's thinking has progressed enough",
        inputSchema: z.object({
          phase: z.enum(["problem", "clarify", "propose", "discussion"]),
          reason: z.string(),
        }),
        execute: async ({ phase: newPhase }) => {
          if (db && sessionId) {
            try {
              await db
                .update(sessions)
                .set({ phase: newPhase, updatedAt: new Date() })
                .where(eq(sessions.id, sessionId));
            } catch (e) {
              console.error("Failed to persist phase:", e);
            }
          }
          return { success: true, phase: newPhase };
        },
      }),
      proposeScaffold: tool({
        description:
          "Propose a thinking scaffold when you've identified the user's cognitive pattern",
        inputSchema: z.object({
          type: z.string().describe("The scaffold structure type (e.g. 'decision-matrix', 'mind-map', '5-whys', 'ishikawa', 't-chart', 'scamper', or any structure that fits)"),
          title: z.string(),
          description: z.string(),
        }),
        execute: async (proposal) => {
          if (db && sessionId) {
            try {
              await db
                .update(sessions)
                .set({ scaffoldProposal: proposal, updatedAt: new Date() })
                .where(eq(sessions.id, sessionId));
            } catch (e) {
              console.error("Failed to persist proposal:", e);
            }
          }
          return { success: true, ...proposal };
        },
      }),
      suggestFollowUps: tool({
        description:
          "Suggest 2-3 possible answers the user might give to your question — written in first person as statements, NOT as more questions. These should be realistic replies the user could click to respond.",
        inputSchema: z.object({
          suggestions: z.array(z.string()).min(2).max(3),
        }),
        execute: async ({ suggestions }) => {
          return { success: true, suggestions };
        },
      }),
    },
    onFinish: async ({ response }) => {
      if (!db || !sessionId) return;

      try {
        // Persist user message (last user message in the array)
        const lastUserMsg = chatMessages.filter((m) => m.role === "user").pop();
        if (lastUserMsg) {
          const textContent = lastUserMsg.parts
            ?.filter(
              (p): p is { type: "text"; text: string } => p.type === "text"
            )
            .map((p) => p.text)
            .join("");
          if (textContent) {
            await db.insert(messages).values({
              sessionId,
              role: "user",
              content: textContent,
            });
          }
        }

        // Persist assistant messages
        for (const msg of response.messages) {
          if (msg.role === "assistant") {
            const contentParts = typeof msg.content === "string"
              ? [{ type: "text" as const, text: msg.content }]
              : msg.content;
            const textParts = contentParts.filter((p) => p.type === "text");
            const toolParts = contentParts.filter(
              (p) => p.type === "tool-call"
            );
            const content = textParts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            if (!content && toolParts.length === 0) continue;

            await db.insert(messages).values({
              sessionId,
              role: "assistant",
              content: content || "[tool call]",
              toolInvocations: toolParts.length > 0 ? toolParts : null,
            });
          }
        }
      } catch (e) {
        console.error("Failed to persist messages:", e);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
