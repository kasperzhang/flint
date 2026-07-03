"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 text-center">
        <div className="space-y-2 max-w-xs">
          <p className="text-[18px] font-bold tracking-[-0.02em] text-ink">
            What are you thinking about?
          </p>
          <p className="text-[14px] text-ink-2 leading-relaxed">
            Describe a problem or decision you&apos;re working through.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
      {messages.map((message) => {
        const text = getTextContent(message);

        // Skip tool-only assistant messages with no text
        if (message.role === "assistant" && !text.trim()) {
          return null;
        }

        const isUser = message.role === "user";

        if (isUser) {
          return (
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-[16px_16px_4px_16px] border border-border bg-surface-sunken px-4 py-2.5">
                <p className="text-[14px] leading-relaxed text-ink whitespace-pre-wrap">
                  {text}
                </p>
              </div>
            </div>
          );
        }

        return (
          <div key={message.id} className="flex justify-start">
            <div className="max-w-[92%] rounded-[16px_16px_16px_4px] border border-border bg-surface px-4 py-3 shadow-[var(--shadow-sm)]">
              <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-accent">
                Flint
              </p>
              <div className="text-[14px] leading-relaxed text-ink prose prose-sm max-w-none prose-p:my-1 prose-p:text-ink prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-strong:text-ink">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}
      {isLoading && (
        <div className="flex justify-start">
          <div className="rounded-[16px_16px_16px_4px] border border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
