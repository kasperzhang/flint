"use client";

import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import { useSessionStore } from "@/stores/session-store";

interface KnowledgeSummaryProps {
  messages: UIMessage[];
}

export function KnowledgeSummary({ messages }: KnowledgeSummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastLengthRef = useRef(0);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const messagesLength = messages.length;
  const lastRole = messagesLength > 0 ? messages[messagesLength - 1].role : null;

  useEffect(() => {
    // Only fetch when messages length changes and last message is from assistant
    if (
      messagesLength === lastLengthRef.current ||
      messagesLength === 0 ||
      lastRole !== "assistant"
    ) {
      lastLengthRef.current = messagesLength;
      return;
    }

    lastLengthRef.current = messagesLength;

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);

    // Delay to let streaming content settle before sending to API
    const timer = setTimeout(() => {
      fetch("/api/playground/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesRef.current }),
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          if (!controller.signal.aborted) {
            setSummary(data.summary);
            useSessionStore.getState().setKnowledgeSummary(data.summary);
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Knowledge summary fetch failed:", err);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, 2000);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [messagesLength, lastRole]);

  function renderSummary(text: string) {
    return text.split("\n").map((line, i) => {
      const boldMatch = line.match(/^\*\*(.+?)\*\*(.*)$/);
      if (boldMatch) {
        return (
          <p key={i} className="mb-1">
            <strong className="text-foreground/80">{boldMatch[1]}</strong>
            <span className="text-foreground/60">{boldMatch[2]}</span>
          </p>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="text-foreground/60 mb-1">
          {line}
        </p>
      );
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-foreground/10">
        <h3 className="text-xs font-medium text-foreground/50">Knowledge Summary</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {isLoading ? (
          <div className="flex items-center gap-2 py-4">
            <div className="w-3 h-3 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
            <span className="text-xs text-foreground/40">Analyzing conversation...</span>
          </div>
        ) : summary ? (
          <div className="text-xs leading-relaxed">{renderSummary(summary)}</div>
        ) : (
          <div className="py-8 text-center text-xs text-foreground/30">
            Chat with Flint to see what the AI understands
          </div>
        )}
      </div>
    </div>
  );
}
