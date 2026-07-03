"use client";

import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/stores/session-store";

export function ScaffoldPanel() {
  const isGenerating = useSessionStore((s) => s.isGeneratingScaffold);

  // srcDoc is the HTML that the iframe renders. It only updates when a genuinely
  // new scaffold is set (from generation or session restore), NOT from user edits
  // inside the iframe. This prevents the iframe from reloading and losing focus.
  const [srcDoc, setSrcDoc] = useState<string | null>(
    () => useSessionStore.getState().currentScaffold
  );
  const isUserEditRef = useRef(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Listen for user edits from inside the iframe
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "scaffold-update") {
        isUserEditRef.current = true;
        useSessionStore.getState().setCurrentScaffold(e.data.html);

        // Debounced persist to DB (2s after last edit)
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          const sessionId = useSessionStore.getState().sessionId;
          if (!sessionId) return;
          fetch(`/api/sessions/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scaffold: e.data.html }),
          }).catch(() => {});
        }, 2000);
      }
    };
    window.addEventListener("message", handleMessage);

    // Subscribe to store changes to detect new scaffolds vs user edits
    const unsub = useSessionStore.subscribe((state) => {
      const scaffold = state.currentScaffold;
      if (isUserEditRef.current) {
        // User edit — don't update srcDoc, just reset the flag
        isUserEditRef.current = false;
        return;
      }
      // New scaffold from generation or session restore — update srcDoc
      setSrcDoc(scaffold);
    });

    return () => {
      window.removeEventListener("message", handleMessage);
      unsub();
    };
  }, []);

  if (isGenerating) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-ink-3">
            Generating scaffold…
          </p>
        </div>
      </div>
    );
  }

  if (!srcDoc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface p-8">
        <div className="max-w-md w-full text-center">
          <div className="rounded-[var(--r-lg)] border border-dashed border-border-strong bg-surface-raised px-8 py-12 space-y-3">
            <p className="text-[20px] font-bold tracking-[-0.02em] text-ink">
              The working plane
            </p>
            <p className="text-[14px] leading-relaxed text-ink-2">
              As you think out loud with Flint, a scaffold — any structure that
              fits your problem — is proposed and generated here for you to fill in.
            </p>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-[12.5px] text-ink-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            Flint can read this, but it can never write here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="flex-1 w-full border-0"
        title="Thinking Scaffold"
      />
    </div>
  );
}
