"use client";

import { useEffect, useRef, useState } from "react";
import { useSessionStore, type ToolCallEntry } from "@/stores/session-store";

const TOOL_COLORS: Record<string, string> = {
  setPhase: "bg-blue-500/15 text-blue-600",
  suggestFollowUps: "bg-emerald-500/15 text-emerald-600",
  proposeScaffold: "bg-amber-500/15 text-amber-600",
};

function ToolCallItem({ entry }: { entry: ToolCallEntry }) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const colorClass = TOOL_COLORS[entry.toolName] ?? "bg-foreground/10 text-foreground/70";

  return (
    <div className="border-b border-foreground/5 last:border-b-0 py-2 px-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left"
      >
        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${colorClass}`}>
          {entry.toolName}
        </span>
        <span className="text-[11px] text-foreground/30 ml-auto">{time}</span>
        <span className="text-[10px] text-foreground/30">{expanded ? "▼" : "▶"}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-1">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-foreground/30 mb-0.5">Input</div>
            <pre className="text-[11px] font-mono bg-foreground/[0.03] rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/70">
              {JSON.stringify(entry.input, null, 2)}
            </pre>
          </div>
          {entry.output && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-foreground/30 mb-0.5">Output</div>
              <pre className="text-[11px] font-mono bg-foreground/[0.03] rounded p-2 overflow-x-auto whitespace-pre-wrap text-foreground/70">
                {JSON.stringify(entry.output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ToolCallLog() {
  const toolCallLog = useSessionStore((s) => s.toolCallLog);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [toolCallLog.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-foreground/10">
        <h3 className="text-xs font-medium text-foreground/50">Tool Call Log</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {toolCallLog.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-foreground/30">
            No tool calls yet
          </div>
        ) : (
          toolCallLog.map((entry) => (
            <ToolCallItem key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
