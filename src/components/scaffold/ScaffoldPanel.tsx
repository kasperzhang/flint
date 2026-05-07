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
      <div className="flex-1 flex items-center justify-center text-foreground/40">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-sm">Generating scaffold...</p>
        </div>
      </div>
    );
  }

  if (!srcDoc) {
    return (
      <div className="flex-1 flex items-center justify-center text-foreground/30">
        <div className="text-center space-y-2 max-w-md">
          <div className="text-4xl mb-4">&#9671;</div>
          <p className="text-lg font-medium text-foreground/50">Scaffold Area</p>
          <p className="text-sm">
            As you discuss your thinking with Flint, a thinking scaffold will be
            proposed and generated here — any thinking structure that fits your problem.
          </p>
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
