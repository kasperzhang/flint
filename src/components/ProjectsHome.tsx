"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Session {
  id: string;
  title: string;
  phase: string;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

const PHASE_LABELS: Record<string, string> = {
  problem: "Define Problem",
  clarify: "Clarify Thinking",
  propose: "Propose Scaffold",
  discussion: "Discussion",
};

const PHASE_DOT_COLOR: Record<string, string> = {
  problem: "bg-amber-400",
  clarify: "bg-sky-400",
  propose: "bg-violet-400",
  discussion: "bg-emerald-400",
};

function relativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

export function ProjectsHome() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      // no DB
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleNewProject = async () => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const session = await res.json();
        router.push(`/session/${session.id}`);
      }
    } catch {
      const id = crypto.randomUUID();
      router.push(`/session/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, title: trimmed } : s))
        );
      }
    } catch {
      // ignore
    }
  };

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !currentStarred }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, starred: !currentStarred } : s))
        );
      }
    } catch {
      // ignore
    }
  };

  const starredSessions = sessions.filter((s) => s.starred);
  const recentSessions = sessions.filter((s) => !s.starred);

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header>
        <div className="max-w-[1120px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2L3 11l7 11 4-7-2-5 6-4L8 2z" fill="currentColor" className="text-foreground" />
              <path d="M12 15l4-7-6 2 2 5z" fill="currentColor" className="text-foreground" opacity="0.45" />
            </svg>
            <span className="text-[17px] font-semibold tracking-tight">Flint</span>
          </div>
          <div className="flex items-center gap-2">
            <PlaygroundMenu />
            <button
              onClick={handleNewProject}
              className="flex items-center gap-1.5 h-9 px-4 text-[13px] font-medium rounded-lg bg-foreground text-background hover:opacity-85 transition-opacity"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1120px] mx-auto px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex items-center gap-2 text-foreground/30 text-sm">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20" />
                <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Loading...
            </div>
          </div>
        ) : (
          <>
            {/* Starred projects */}
            {starredSessions.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-medium tracking-tight mb-5">
                  Starred projects
                </h2>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {starredSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onOpen={() => router.push(`/session/${session.id}`)}
                      onDelete={() => handleDelete(session.id)}
                      onRename={(title) => handleRename(session.id, title)}
                      onToggleStar={() => handleToggleStar(session.id, session.starred)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recent projects */}
            <section>
              <h2 className="text-lg font-medium tracking-tight mb-5">
                {sessions.length > 0 ? "Recent projects" : "Get started"}
              </h2>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Create new card */}
                <button
                  onClick={handleNewProject}
                  className="group flex flex-col items-center justify-center rounded-xl border border-dashed border-foreground/[0.12] hover:border-foreground/20 transition-all hover:shadow-md min-h-[120px] cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground/25 group-hover:text-foreground/40 transition-colors">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  <span className="text-[13px] text-foreground/30 group-hover:text-foreground/50 mt-2 transition-colors">
                    New project
                  </span>
                </button>

                {/* Non-starred session cards */}
                {recentSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onOpen={() => router.push(`/session/${session.id}`)}
                    onDelete={() => handleDelete(session.id)}
                    onRename={(title) => handleRename(session.id, title)}
                    onToggleStar={() => handleToggleStar(session.id, session.starred)}
                  />
                ))}
              </div>
            </section>

            {sessions.length === 0 && (
              <p className="text-center text-foreground/30 text-sm mt-16">
                Start a new project to think through a problem with Socratic dialogue.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

/* ─── Session Card ─── */

function SessionCard({
  session,
  onOpen,
  onDelete,
  onRename,
  onToggleStar,
}: {
  session: Session;
  onOpen: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
  onToggleStar: () => void;
}) {
  const dotColor = PHASE_DOT_COLOR[session.phase] ?? PHASE_DOT_COLOR.problem;
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(session.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming]);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== session.title) {
      onRename(trimmed);
    } else {
      setRenameValue(session.title);
    }
    setRenaming(false);
  };

  return (
    <div
      onClick={() => { if (!renaming) onOpen(); }}
      className="group text-left relative flex flex-col justify-between rounded-xl border border-foreground/[0.08] hover:border-foreground/[0.12] transition-all hover:shadow-md min-h-[120px] cursor-pointer p-5"
    >
      {/* Top row: title + menu */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {renaming ? (
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setRenameValue(session.title);
                  setRenaming(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-[15px] font-medium leading-snug bg-transparent border-b border-foreground/20 focus:border-foreground/50 outline-none py-0.5 w-full"
            />
          ) : (
            <h3 className="text-[15px] font-medium leading-snug line-clamp-2">
              {session.title}
            </h3>
          )}
        </div>

        {/* 3-dot menu */}
        <div ref={menuRef} className="relative shrink-0 -mt-1 -mr-1">
          <span
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
            className="flex items-center justify-center w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 hover:bg-foreground/[0.06] transition-all cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className="text-foreground/40">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </span>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-foreground/10 bg-background shadow-lg py-1 z-50">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onToggleStar();
                }}
                className="block px-3.5 py-2 text-[13px] text-foreground/70 hover:bg-foreground/[0.04] transition-colors cursor-pointer"
              >
                {session.starred ? "Unstar" : "Star"}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setRenaming(true);
                  setRenameValue(session.title);
                }}
                className="block px-3.5 py-2 text-[13px] text-foreground/70 hover:bg-foreground/[0.04] transition-colors cursor-pointer"
              >
                Rename
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete();
                }}
                className="block px-3.5 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              >
                Delete
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: dot + phase + time + star */}
      <div className="flex items-center gap-2 mt-4">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
        <span className="text-[12px] text-foreground/40">
          {PHASE_LABELS[session.phase] ?? session.phase}
        </span>
        <span className="text-foreground/15">·</span>
        <span className="text-[12px] text-foreground/30">
          {relativeTime(session.updatedAt)}
        </span>
        {session.starred && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400 ml-auto shrink-0">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )}
      </div>
    </div>
  );
}

/* ─── Playground Menu ─── */

function PlaygroundMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-9 px-3 text-[13px] text-foreground/50 hover:text-foreground rounded-lg hover:bg-foreground/[0.04] transition-colors"
      >
        Playground
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-foreground/10 bg-background shadow-lg py-1.5 z-50">
          <Link
            href="/playground"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-foreground/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600 dark:text-sky-400">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-medium">Mentor</div>
              <div className="text-[11px] text-foreground/40">Conversation flow</div>
            </div>
          </Link>
          <Link
            href="/playground/scaffold"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-foreground/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600 dark:text-violet-400">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
            <div>
              <div className="text-[13px] font-medium">Scaffold</div>
              <div className="text-[11px] text-foreground/40">Generate &amp; test scaffolds</div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
