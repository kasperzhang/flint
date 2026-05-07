"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isToolUIPart,
  getToolOrDynamicToolName,
  type UIMessage,
} from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/stores/session-store";
import { PhaseIndicator } from "@/components/chat/PhaseIndicator";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { ProposalCard } from "@/components/chat/ProposalCard";
import type { Phase } from "@/lib/phase-machine";

interface PlaygroundChatProps {
  onMessagesChange?: (messages: UIMessage[]) => void;
}

export function PlaygroundChat({ onMessagesChange }: PlaygroundChatProps) {
  const phase = useSessionStore((s) => s.phase);
  const suggestions = useSessionStore((s) => s.suggestions);
  const scaffoldProposal = useSessionStore((s) => s.scaffoldProposal);
  const isGeneratingScaffold = useSessionStore((s) => s.isGeneratingScaffold);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/mentor",
        body: () => {
          const state = useSessionStore.getState();
          return {
            sessionId: null,
            phase: state.phase,
            customSystemPrompt: state.customMentorPrompt || undefined,
          };
        },
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onFinish: ({ message }) => {
      if (message.parts) {
        let hasProposal = false;

        for (const part of message.parts) {
          if (!isToolUIPart(part)) continue;
          if (part.state !== "output-available") continue;

          const toolName = getToolOrDynamicToolName(part);
          const output = part.output as Record<string, unknown>;

          // Log tool call to store
          useSessionStore.getState().pushToolCall({
            id: part.toolCallId,
            toolName,
            input: part.input as Record<string, unknown>,
            output,
            timestamp: Date.now(),
          });

          if (toolName === "setPhase" && output?.phase) {
            useSessionStore
              .getState()
              .setPhase(output.phase as Phase);
          } else if (toolName === "proposeScaffold" && output?.type) {
            hasProposal = true;
            useSessionStore.getState().setScaffoldProposal({
              type: output.type as string,
              title: output.title as string,
              description: output.description as string,
            });
          } else if (
            toolName === "suggestFollowUps" &&
            output?.suggestions
          ) {
            useSessionStore
              .getState()
              .setSuggestions(output.suggestions as string[]);
          }
        }

        if (hasProposal) {
          useSessionStore.getState().setPhase("propose" as Phase);
        }
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Notify parent of messages changes
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  const [inputValue, setInputValue] = useState("");

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;

      useSessionStore.getState().setSuggestions([]);
      const text = inputValue;
      setInputValue("");
      sendMessage({ text });
    },
    [inputValue, isLoading, sendMessage]
  );

  const handleSuggestionSelect = useCallback(
    async (suggestion: string) => {
      if (isLoading) return;
      useSessionStore.getState().setSuggestions([]);
      sendMessage({ text: suggestion });
    },
    [isLoading, sendMessage]
  );

  const handleConfirmScaffold = useCallback(async () => {
    const store = useSessionStore.getState();
    const proposal = store.scaffoldProposal;
    if (!proposal) return;

    store.setIsGeneratingScaffold(true);

    try {
      const res = await fetch("/api/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: proposal.type,
          title: proposal.title,
          description: proposal.description,
          messages,
          sessionId: null,
          customSystemPrompt: useSessionStore.getState().customScaffoldPrompt || undefined,
        }),
      });

      if (res.ok) {
        const { html } = await res.json();
        useSessionStore.getState().setCurrentScaffold(html);
      }
    } catch (e) {
      console.error("Failed to generate scaffold:", e);
    } finally {
      useSessionStore.getState().setIsGeneratingScaffold(false);
      useSessionStore.getState().setScaffoldProposal(null);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-foreground/10">
        <PhaseIndicator currentPhase={phase} />
      </div>

      <MessageList messages={messages} isLoading={isLoading} />

      {scaffoldProposal && (
        <ProposalCard
          proposal={scaffoldProposal}
          onConfirm={handleConfirmScaffold}
          onReject={() => {
            useSessionStore.getState().setScaffoldProposal(null);
            useSessionStore.getState().setPhase("clarify" as Phase);
          }}
          isGenerating={isGeneratingScaffold}
          disableGenerate
        />
      )}

      <SuggestionChips
        suggestions={suggestions}
        onSelect={handleSuggestionSelect}
        disabled={isLoading}
      />

      <ChatInput
        input={inputValue}
        isLoading={isLoading}
        onInputChange={(e) => setInputValue(e.target.value)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
