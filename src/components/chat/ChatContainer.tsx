"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isToolUIPart,
  getToolOrDynamicToolName,
  type UIMessage,
} from "ai";
import { useCallback, useMemo, useState } from "react";
import { useSessionStore } from "@/stores/session-store";
import { PhaseIndicator } from "./PhaseIndicator";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { SuggestionChips } from "./SuggestionChips";
import { ProposalCard } from "./ProposalCard";
import type { Phase } from "@/lib/phase-machine";

interface ChatContainerProps {
  initialMessages?: UIMessage[];
}

export function ChatContainer({ initialMessages }: ChatContainerProps) {
  const phase = useSessionStore((s) => s.phase);
  const suggestions = useSessionStore((s) => s.suggestions);
  const scaffoldProposal = useSessionStore((s) => s.scaffoldProposal);
  const isGeneratingScaffold = useSessionStore((s) => s.isGeneratingScaffold);
  const confidenceLevel = useSessionStore((s) => s.confidenceLevel);
  const setConfidenceLevel = useSessionStore((s) => s.setConfidenceLevel);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/mentor",
        body: () => ({
          sessionId: useSessionStore.getState().sessionId,
          phase: useSessionStore.getState().phase,
          currentScaffold: useSessionStore.getState().currentScaffold,
          confidenceLevel: useSessionStore.getState().confidenceLevel,
        }),
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: initialMessages,
    onFinish: ({ message }) => {
      if (message.parts) {
        let hasProposal = false;

        for (const part of message.parts) {
          if (!isToolUIPart(part)) continue;
          if (part.state !== "output-available") continue;

          const toolName = getToolOrDynamicToolName(part);
          const output = part.output as Record<string, unknown>;

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

        // If a scaffold was proposed, ensure phase stays at "propose"
        // (the AI may have also called setPhase("discussion") — override it)
        if (hasProposal) {
          useSessionStore.getState().setPhase("propose" as Phase);
        }
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  const createSessionIfNeeded = useCallback(async () => {
    if (useSessionStore.getState().sessionId) return;

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const session = await res.json();
        useSessionStore.getState().setSessionId(session.id);
      }
    } catch {
      // No DB
    }
  }, []);

  const [inputValue, setInputValue] = useState("");

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;

      await createSessionIfNeeded();
      useSessionStore.getState().setSuggestions([]);
      const text = inputValue;
      setInputValue("");
      sendMessage({ text });
    },
    [inputValue, isLoading, createSessionIfNeeded, sendMessage]
  );

  const handleSuggestionSelect = useCallback(
    async (suggestion: string) => {
      if (isLoading) return;
      await createSessionIfNeeded();
      useSessionStore.getState().setSuggestions([]);
      sendMessage({ text: suggestion });
    },
    [isLoading, createSessionIfNeeded, sendMessage]
  );

  const handleRejectScaffold = useCallback(async () => {
    const store = useSessionStore.getState();
    store.setScaffoldProposal(null);
    store.setPhase("clarify" as Phase);
    await createSessionIfNeeded();
    sendMessage({ text: "This scaffold doesn't feel right for my problem. Let's keep exploring how I'm thinking about this." });
  }, [createSessionIfNeeded, sendMessage]);

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
          sessionId: store.sessionId,
        }),
      });

      if (res.ok) {
        const { html } = await res.json();
        useSessionStore.getState().setCurrentScaffold(html);
        useSessionStore.getState().setPhase("discussion" as Phase);
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
      {/* Phase indicator + confidence slider */}
      <div className="px-3 py-2 border-b border-foreground/10">
        <PhaseIndicator currentPhase={phase} />
        {(phase === "problem" || phase === "clarify") && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-foreground/40 select-none">Fast</span>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value))}
              className="h-1 flex-1 accent-foreground/50 cursor-pointer"
            />
            <span className="text-[10px] text-foreground/40 select-none">Thorough</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Proposal Card */}
      {scaffoldProposal && (
        <ProposalCard
          proposal={scaffoldProposal}
          onConfirm={handleConfirmScaffold}
          onReject={handleRejectScaffold}
          isGenerating={isGeneratingScaffold}
        />
      )}

      {/* Suggestions */}
      <SuggestionChips
        suggestions={suggestions}
        onSelect={handleSuggestionSelect}
        disabled={isLoading}
      />

      {/* Input */}
      <ChatInput
        input={inputValue}
        isLoading={isLoading}
        onInputChange={(e) => setInputValue(e.target.value)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
