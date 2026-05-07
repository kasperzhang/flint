"use client";

import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { useSessionStore } from "@/stores/session-store";
import { getMentorSystemPrompt } from "@/lib/ai/prompts";

interface PromptPreviewProps {
  messages: UIMessage[];
}

export function PromptPreview({ messages }: PromptPreviewProps) {
  const phase = useSessionStore((s) => s.phase);
  const customMentorPrompt = useSessionStore((s) => s.customMentorPrompt);
  const knowledgeSummary = useSessionStore((s) => s.knowledgeSummary);

  const [finalPrompt, setFinalPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const defaultMentorPrompt = getMentorSystemPrompt(phase);

  // Local editing state — initialized from store or defaults
  const [mentorText, setMentorText] = useState(
    customMentorPrompt ?? defaultMentorPrompt
  );

  // When phase changes, update mentor prompt if user hasn't customized it
  useEffect(() => {
    if (!customMentorPrompt) {
      setMentorText(defaultMentorPrompt);
    }
  }, [defaultMentorPrompt, customMentorPrompt]);

  const mentorDirty = mentorText !== defaultMentorPrompt;

  const handleMentorSave = () => {
    useSessionStore.getState().setCustomMentorPrompt(mentorText);
  };

  const handleMentorReset = () => {
    setMentorText(defaultMentorPrompt);
    useSessionStore.getState().setCustomMentorPrompt(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-foreground/10">
        <h3 className="text-xs font-medium text-foreground/50">
          Prompt Preview
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Mentor System Prompt */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-medium text-foreground/50">
              Mentor System Prompt
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 text-foreground/40">
                {phase}
              </span>
              {customMentorPrompt && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600">
                  custom
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {mentorDirty && (
                <button
                  onClick={handleMentorSave}
                  className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 transition-colors"
                >
                  Apply
                </button>
              )}
              {customMentorPrompt && (
                <button
                  onClick={handleMentorReset}
                  className="text-[10px] px-2 py-0.5 rounded bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <textarea
            value={mentorText}
            onChange={(e) => setMentorText(e.target.value)}
            className="text-[11px] font-mono bg-foreground/[0.03] rounded-lg p-3 whitespace-pre-wrap text-foreground/70 leading-relaxed border border-foreground/5 focus:border-foreground/20 focus:outline-none resize-y min-h-[200px]"
            rows={16}
          />
        </div>

        {/* Generate Final Scaffold Prompt */}
        <div className="flex flex-col gap-2 pt-2 border-t border-foreground/10">
          <div className="text-[11px] font-medium text-foreground/50">
            Final Scaffold Prompt
          </div>
          <button
            disabled={!knowledgeSummary || messages.length === 0}
            onClick={() => {
              const conversationContext = messages
                .map((m) => {
                  const text = m.parts
                    ?.filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
                    .map((p) => p.text)
                    .join("") || "[no text]";
                  return `${m.role === "user" ? "User" : "Assistant"}: ${text}`;
                })
                .join("\n\n");

              const proposal = useSessionStore.getState().scaffoldProposal;
              const typeLabel = proposal?.type ?? "thinking";
              const title = proposal?.title ?? "Untitled";
              const description = proposal?.description ?? "";

              setFinalPrompt(`Generate a "${typeLabel}" scaffold as a beautiful, self-contained HTML page.\n\nTitle: ${title}\nWhy this scaffold: ${description}\n\nHere's what the user discussed with Flint:\n${conversationContext}\n\nRemember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`);
              setCopied(false);
            }}
            className="px-3 py-1.5 text-xs rounded-md bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed self-start"
          >
            Generate Final Scaffold Prompt
          </button>

          {finalPrompt && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-foreground/40">Final prompt (user message sent to scaffold API)</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(finalPrompt).then(() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    });
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre className="text-[11px] font-mono bg-foreground/[0.03] rounded-lg p-3 whitespace-pre-wrap text-foreground/60 leading-relaxed border border-foreground/5 max-h-[400px] overflow-y-auto">
                {finalPrompt}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
