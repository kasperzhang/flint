"use client";

import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { useSessionStore } from "@/stores/session-store";
import { PlaygroundChat } from "@/components/playground/PlaygroundChat";
import { ToolCallLog } from "@/components/playground/ToolCallLog";
import { KnowledgeSummary } from "@/components/playground/KnowledgeSummary";
import { PromptPreview } from "@/components/playground/ScaffoldPromptPreview";
import Link from "next/link";

export default function PlaygroundPage() {
  const [playgroundMessages, setPlaygroundMessages] = useState<UIMessage[]>([]);

  // Reset store on mount — playground has no DB session
  useEffect(() => {
    useSessionStore.getState().resetSession();
  }, []);

  const handleMessagesChange = useCallback((messages: UIMessage[]) => {
    setPlaygroundMessages(messages);
  }, []);

  const handleReset = () => {
    useSessionStore.getState().resetSession();
    useSessionStore.getState().clearToolCallLog();
    setPlaygroundMessages([]);
    // Force re-mount of PlaygroundChat by toggling key
    setResetKey((k) => k + 1);
  };

  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="h-dvh flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Flint
          </Link>
          <span className="text-foreground/20">/</span>
          <Link href="/playground" className="text-sm font-medium text-foreground/70 hover:text-foreground">
            Playground
          </Link>
          <span className="text-foreground/20">/</span>
          <h1 className="text-sm font-medium">Mentor</h1>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1 text-xs rounded-md border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/20 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* Column 1: Chat */}
        <div className="w-[400px] shrink-0 border-r border-foreground/10">
          <PlaygroundChat key={resetKey} onMessagesChange={handleMessagesChange} />
        </div>

        {/* Column 2: AI Brain */}
        <div className="flex-1 flex flex-col border-r border-foreground/10 min-w-0">
          <div className="flex-1 min-h-0">
            <KnowledgeSummary messages={playgroundMessages} />
          </div>
          <div className="flex-1 min-h-0 border-t border-foreground/10">
            <ToolCallLog />
          </div>
        </div>

        {/* Column 3: Prompt Preview */}
        <div className="flex-1 min-w-0">
          <PromptPreview messages={playgroundMessages} />
        </div>
      </div>
    </div>
  );
}
