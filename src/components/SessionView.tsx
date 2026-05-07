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
      <div className="h-dvh flex items-center justify-center text-foreground/40 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-foreground/10 shrink-0">
        <button
          onClick={() => router.push("/")}
          className="text-foreground/50 hover:text-foreground transition-colors text-sm"
        >
          &larr; Projects
        </button>
        <div className="w-px h-4 bg-foreground/10" />
        <h1 className="text-sm font-medium">Flint</h1>
        <div className="flex-1" />
        <button
          onClick={() => setChatCollapsed(!chatCollapsed)}
          className="text-xs px-2.5 py-1 rounded-md border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/20 transition-colors"
        >
          {chatCollapsed ? "Show Chat" : "Hide Chat"}
        </button>
      </header>

      {/* Split pane */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Scaffold area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-foreground/10">
          <ScaffoldPanel />
        </div>

        {/* Right: Chat sidebar — kept mounted to preserve state */}
        <div
          className={`w-[420px] shrink-0 flex flex-col min-h-0 bg-background ${
            chatCollapsed ? "hidden" : ""
          }`}
        >
          <ChatContainer initialMessages={initialMessages} />
        </div>
      </div>
    </div>
  );
}
