import type { UIMessage } from "ai";
import type { ScaffoldProposal } from "./schemas";
import { SCAFFOLD_HTML_SYSTEM_PROMPT } from "./prompts";

export function composeScaffoldPrompt(
  messages: UIMessage[],
  proposal: ScaffoldProposal | null
): { system: string; user: string } {
  const system = SCAFFOLD_HTML_SYSTEM_PROMPT;

  if (!proposal) {
    return { system, user: "[No scaffold proposed yet]" };
  }

  const conversationContext = messages
    .map((m) => {
      const text = m.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
      return `${m.role}: ${text}`;
    })
    .join("\n");

  const user = `Generate a "${proposal.type}" scaffold as a beautiful, self-contained HTML page.

Title: ${proposal.title}
Why this scaffold: ${proposal.description}

Here's what the user discussed with Flint:
${conversationContext}

Remember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`;

  return { system, user };
}
