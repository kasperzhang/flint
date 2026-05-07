"use client";

import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { useSessionStore } from "@/stores/session-store";
import { SCAFFOLD_HTML_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { ToolCallLog } from "./ToolCallLog";
import type { SetupData } from "./ScaffoldSetup";

interface ScaffoldDebugPanelProps {
  messages: UIMessage[];
  setupData: SetupData | null;
}

export function ScaffoldDebugPanel({
  messages,
  setupData,
}: ScaffoldDebugPanelProps) {
  const customScaffoldPrompt = useSessionStore((s) => s.customScaffoldPrompt);

  const defaultPrompt = SCAFFOLD_HTML_SYSTEM_PROMPT;

  const [scaffoldText, setScaffoldText] = useState(
    customScaffoldPrompt ?? defaultPrompt
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!customScaffoldPrompt) {
      setScaffoldText(defaultPrompt);
    }
  }, [defaultPrompt, customScaffoldPrompt]);

  const dirty = scaffoldText !== defaultPrompt;

  const handleSave = () => {
    useSessionStore.getState().setCustomScaffoldPrompt(scaffoldText);
  };

  const handleReset = () => {
    setScaffoldText(defaultPrompt);
    useSessionStore.getState().setCustomScaffoldPrompt(null);
  };

  // Build the generation prompt that would be sent to /api/scaffold
  const generationPrompt = setupData
    ? buildGenerationPrompt(setupData, messages)
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Scaffold System Prompt */}
        <div className="px-3 py-2 border-b border-foreground/10">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] font-medium text-foreground/50">
              Scaffold System Prompt
              {customScaffoldPrompt && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600">
                  custom
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {dirty && (
                <button
                  onClick={handleSave}
                  className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 transition-colors"
                >
                  Apply
                </button>
              )}
              {customScaffoldPrompt && (
                <button
                  onClick={handleReset}
                  className="text-[10px] px-2 py-0.5 rounded bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <textarea
            value={scaffoldText}
            onChange={(e) => setScaffoldText(e.target.value)}
            className="w-full text-[11px] font-mono bg-foreground/[0.03] rounded-lg p-3 whitespace-pre-wrap text-foreground/70 leading-relaxed border border-foreground/5 focus:border-foreground/20 focus:outline-none resize-y min-h-[120px]"
            rows={10}
          />
        </div>

        {/* Generation Prompt */}
        {generationPrompt && (
          <div className="px-3 py-2 border-b border-foreground/10">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[11px] font-medium text-foreground/50">
                Generation Prompt
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generationPrompt).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="text-[11px] font-mono bg-foreground/[0.03] rounded-lg p-3 whitespace-pre-wrap text-foreground/60 leading-relaxed border border-foreground/5 max-h-[200px] overflow-y-auto">
              {generationPrompt}
            </pre>
          </div>
        )}
      </div>

      {/* Tool Call Log */}
      <div className="h-[280px] shrink-0 border-t border-foreground/10">
        <ToolCallLog />
      </div>
    </div>
  );
}

function buildGenerationPrompt(
  setupData: SetupData,
  messages: UIMessage[]
): string {
  const conversationContext =
    messages.length > 0
      ? messages
          .map((m) => {
            const text =
              m.parts
                ?.filter(
                  (p): p is Extract<typeof p, { type: "text" }> =>
                    p.type === "text"
                )
                .map((p) => p.text)
                .join("") || "[no text]";
            return `${m.role === "user" ? "User" : "Assistant"}: ${text}`;
          })
          .join("\n\n")
      : "";

  let prompt = `Generate a "${setupData.type}" scaffold as a beautiful, self-contained HTML page.\n\nTitle: ${setupData.title}\nWhy this scaffold: ${setupData.description}\n\nProblem context: ${setupData.problemContext}`;

  if (conversationContext) {
    prompt += `\n\nDiscussion so far:\n${conversationContext}`;
  }

  prompt +=
    "\n\nRemember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.";

  return prompt;
}
