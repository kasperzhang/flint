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
      <div className="flex-1 flex items-center justify-center text-foreground/40">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">What are you thinking about?</p>
          <p className="text-sm">
            Describe a problem or decision you&apos;re working through.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((message) => {
        const text = getTextContent(message);

        // Skip tool-only assistant messages with no text
        if (message.role === "assistant" && !text.trim()) {
          return null;
        }

        return (
          <div key={message.id} className="flex gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                message.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-foreground/10 text-foreground"
              }`}
            >
              {message.role === "user" ? "Y" : "F"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/40 mb-1">
                {message.role === "user" ? "You" : "Flint"}
              </p>
              <div className="text-sm leading-relaxed prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}
      {isLoading && (
        <div className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs shrink-0">
            F
          </div>
          <div className="flex items-center gap-1 pt-1">
            <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
