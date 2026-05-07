"use client";

import { useEffect, useState, useCallback } from "react";

interface Session {
  id: string;
  title: string;
  phase: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionSidebarProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionSidebar({
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onClose,
}: SessionSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      // No DB — that's fine
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions, currentSessionId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (id === currentSessionId) {
        onNewChat();
      }
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-background border-r border-foreground/10 z-50 transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-foreground/10">
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full text-sm py-2 px-3 rounded-lg border border-foreground/10 hover:bg-foreground/5 transition-colors"
            >
              + New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sessions.length === 0 && (
              <p className="text-xs text-foreground/30 text-center py-8">
                No conversations yet
              </p>
            )}
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm group flex items-center justify-between transition-colors ${
                  session.id === currentSessionId
                    ? "bg-foreground/10"
                    : "hover:bg-foreground/5"
                }`}
              >
                <span className="truncate">{session.title}</span>
                <span
                  onClick={(e) => handleDelete(e, session.id)}
                  className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-foreground/40 shrink-0 ml-2"
                >
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
