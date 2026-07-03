"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";
import { ChatContainer } from "./chat/ChatContainer";
import { ScaffoldPanel } from "./scaffold/ScaffoldPanel";
import type { UIMessage } from "ai";

interface SessionViewProps {
  sessionId: string;
}

export function SessionView({ sessionId }: SessionViewProps) {
  const router = useRouter();
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  useEffect(() => {
    // Initialize store with this session
    const store = useSessionStore.getState();
    store.resetSession();
    store.setSessionId(sessionId);

    // Load existing session data
    async function loadSession() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) {
          const session = await res.json();
          // Set phase directly — bypass validateTransition since we're restoring, not transitioning
          useSessionStore.setState({ phase: session.phase ?? "problem" });
          if (session.currentScaffold) {
            useSessionStore.getState().setCurrentScaffold(session.currentScaffold);
            // Scaffold already generated — don't show the old proposal card
          } else if (session.scaffoldProposal) {
            useSessionStore.getState().setScaffoldProposal(session.scaffoldProposal);
          }
          if (session.messages?.length) {
            const restored: UIMessage[] = session.messages.map(
              (m: { id: string; role: string; content: string }) => ({
                id: m.id,
                role: m.role as "user" | "assistant",
                parts: [{ type: "text" as const, text: m.content }],
              })
            );
            setInitialMessages(restored);
          }
        }
      } catch {
        // no DB
      }
      setLoaded(true);
    }
    loadSession();
  }, [sessionId]);

  if (!loaded) {
    return (
      <div className="h-dvh flex items-center justify-center font-mono text-[13px] text-ink-3">
        Loading…
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-canvas">
      {/* Window chrome */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface-raised shrink-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 font-mono text-[12px] text-ink-3 hover:text-ink transition-colors duration-[var(--dur-fast)]"
        >
          <span aria-hidden>&larr;</span> Projects
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setChatCollapsed(!chatCollapsed)}
          className="rounded-[var(--r-xs)] border border-border px-2.5 py-1 text-[12px] text-ink-2 hover:text-ink hover:border-border-strong transition-colors duration-[var(--dur-fast)]"
        >
          {chatCollapsed ? "Show Chat" : "Hide Chat"}
        </button>
      </header>

      {/* Split pane */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Scaffold area (the working plane) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border bg-surface">
          <ScaffoldPanel />
        </div>

        {/* Right: Chat sidebar — kept mounted to preserve state */}
        <div
          className={`w-[420px] shrink-0 flex flex-col min-h-0 bg-chat-tint ${
            chatCollapsed ? "hidden" : ""
          }`}
        >
          <ChatContainer initialMessages={initialMessages} />
        </div>
      </div>
    </div>
  );
}
