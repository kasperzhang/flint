"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import type { UIMessage } from "ai";
import Link from "next/link";
import { useSessionStore } from "@/stores/session-store";
import { ScaffoldPlaygroundChat } from "@/components/playground/ScaffoldPlaygroundChat";
import { ScaffoldPanel } from "@/components/scaffold/ScaffoldPanel";
import { SCAFFOLD_HTML_SYSTEM_PROMPT } from "@/lib/ai/prompts";

interface Template {
  label: string;
  prompt: string;
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    label: "Decision Matrix",
    prompt: `Generate a "decision-matrix" scaffold as a beautiful, self-contained HTML page.

Title: Career Decision Matrix
Why this scaffold: Compare multiple job offers across dimensions that matter most — compensation, growth potential, team culture, work-life balance, and technical challenge.

Problem context: I have three job offers and I'm struggling to decide. Each has different strengths — one pays significantly more, another has better growth opportunities with a clear path to senior roles, and the third has an incredible team culture but lower compensation.

Remember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`,
  },
  {
    label: "5 Whys",
    prompt: `Generate a "5-whys" scaffold as a beautiful, self-contained HTML page.

Title: Deploy Pipeline Root Cause Analysis
Why this scaffold: Trace the root cause of recurring deployment failures by asking "why" iteratively until the fundamental issue surfaces.

Problem context: Our CI/CD pipeline has failed 4 times in the past two weeks. Each time it's a different surface-level error — flaky tests, timeout issues, dependency conflicts — but there might be a deeper systemic problem we're not seeing.

Remember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`,
  },
  {
    label: "Pro/Con List",
    prompt: `Generate a "pro-con-list" scaffold as a beautiful, self-contained HTML page.

Title: Startup vs Employment
Why this scaffold: Weigh the trade-offs between leaving a stable job to pursue a startup idea versus staying employed and building the idea on the side.

Problem context: I've been working on a SaaS idea nights and weekends for 6 months. It's getting traction — 50 beta users, 3 paying customers. My day job pays well but I'm not passionate about it. I have about 12 months of savings.

Remember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`,
  },
  {
    label: "Eisenhower Matrix",
    prompt: `Generate a "eisenhower-matrix" scaffold as a beautiful, self-contained HTML page.

Title: Q2 Project Prioritization
Why this scaffold: Categorize tasks and projects by urgency and importance to focus energy on what truly matters and delegate or eliminate the rest.

Problem context: Our engineering team has 12 projects on the roadmap for Q2 but only capacity for about 6. We need to ruthlessly prioritize — some are urgent client requests, some are important infrastructure work, and some are nice-to-haves that keep getting carried over.

Remember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`,
  },
  {
    label: "Mind Map",
    prompt: `Generate a "mind-map" scaffold as a beautiful, self-contained HTML page.

Title: Mobile App Feature Exploration
Why this scaffold: Explore and organize feature ideas for a new mobile app by branching out from core concepts to discover connections and priorities.

Problem context: I'm planning a habit-tracking app but the scope keeps growing. I need to map out all the feature ideas — daily tracking, social accountability, gamification, analytics, integrations — and figure out what belongs in the MVP versus later releases.

Remember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`,
  },
  {
    label: "SWOT Analysis",
    prompt: `Generate a "swot-analysis" scaffold as a beautiful, self-contained HTML page.

Title: Product Launch SWOT Analysis
Why this scaffold: Map out Strengths, Weaknesses, Opportunities, and Threats in a 2×2 grid to build a clear strategic picture before committing to a product launch.

Problem context: We're considering launching a new developer tool into a crowded market. Our team has deep domain expertise and an early community of 200 developers, but limited marketing budget and only 3 engineers. Competitors are well-funded but their products are overly complex. The market is growing fast with increasing demand for simpler solutions.

Remember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`,
  },
  {
    label: "Cause & Effect",
    prompt: `Generate a "fishbone-diagram" scaffold as a beautiful, self-contained HTML page.

Title: User Churn Root Cause Analysis
Why this scaffold: Organize potential causes of a problem into categories (People, Process, Technology, Environment, etc.) using an Ishikawa/fishbone structure to systematically identify what's driving the issue.

Problem context: Our SaaS product's monthly churn rate jumped from 3% to 7% over the last quarter. Exit surveys mention "too complicated," "not enough integrations," and "poor onboarding," but we suspect there are deeper causes across engineering, product, and support that we haven't mapped out yet.

Remember: make all labels, headers, and placeholders specific to THEIR problem. Leave all input fields empty for the user to fill in. Output ONLY the raw HTML.`,
  },
  {
    label: "Priority Board",
    prompt: `Generate a "kanban-priority-board" scaffold as a beautiful, self-contained HTML page with DRAG AND DROP functionality.

Title: Sprint Planning Priority Board
Why this scaffold: A 3-column kanban board (Must Have / Nice to Have / Backlog) where items can be dragged between columns to visually prioritize work items for the next sprint.

Problem context: Our team has 15 tickets to triage for the next 2-week sprint. We can realistically ship about 8. I need to sort them into Must Have (critical path, blockers, committed deadlines), Nice to Have (would improve velocity or UX but not blocking), and Backlog (punt to next sprint). Some items: auth token refresh bug, dashboard redesign, API rate limiting, onboarding email flow, unit test coverage, search performance fix, docs update, mobile responsive fixes.

IMPORTANT REQUIREMENTS:
- Each column (Must Have, Nice to Have, Backlog) must be a DROP ZONE that accepts dragged items
- Pre-populate 8-10 cards with the ticket names listed above — place them all in the "Backlog" column initially so the user can drag them into the right priority column
- Each card must be draggable with a visible drag handle (⠿ icon)
- Cards should have a contenteditable text area so users can rename or add notes
- Show a visual indicator (highlighted border or gap) when dragging over a column
- Dropping a card into a column moves it there permanently
- After each drop, call syncToParent() to persist the new arrangement
- Style: clean cards with subtle shadow, columns with light distinct background tints

Remember: make all labels specific to THEIR problem. Output ONLY the raw HTML.`,
  },
  {
    label: "Tier Ranking",
    prompt: `Generate a "tier-ranking" scaffold as a beautiful, self-contained HTML page with DRAG AND DROP functionality.

Title: Technology Stack Evaluation
Why this scaffold: A tier-list ranking board (S / A / B / C / Unranked) where items can be dragged between tiers to evaluate and rank technology choices by fit and preference.

Problem context: We're evaluating our tech stack for a new microservices project. Options to rank: Rust, Go, TypeScript/Node, Python, Java, Kotlin. Dimensions to consider: team expertise, ecosystem maturity, performance needs, hiring pipeline, and maintenance burden. We need to sort these into tiers from S-tier (strong pick) down to C-tier (poor fit for us).

IMPORTANT REQUIREMENTS:
- 5 horizontal tier rows: S (best), A, B, C, Unranked
- Each tier row is a DROP ZONE — items can be dragged between any tiers
- Pre-populate 6 cards with the technology names listed above — place them all in "Unranked" initially
- Each card must be draggable (the entire card is the drag handle)
- Cards should display inline horizontally within each tier row (flex-wrap)
- Show a visual highlight on the tier row when a card is dragged over it
- Each tier label should have a distinct subtle color (S=gold, A=green, B=blue, C=gray)
- After each drop, call syncToParent() to persist the arrangement
- Cards should have a small contenteditable label so users can add notes below the name

Remember: make all labels specific to THEIR problem. Output ONLY the raw HTML.`,
  },
];

export default function ScaffoldPlaygroundPage() {
  const [promptText, setPromptText] = useState("");
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [scaffoldMessages, setScaffoldMessages] = useState<UIMessage[]>([]);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Scaffold system prompt editing
  const customScaffoldPrompt = useSessionStore((s) => s.customScaffoldPrompt);
  const [scaffoldSystemText, setScaffoldSystemText] = useState(
    customScaffoldPrompt ?? SCAFFOLD_HTML_SYSTEM_PROMPT
  );
  const scaffoldSystemDirty = scaffoldSystemText !== SCAFFOLD_HTML_SYSTEM_PROMPT;

  const handleScaffoldSystemSave = () => {
    useSessionStore.getState().setCustomScaffoldPrompt(scaffoldSystemText);
  };

  const handleScaffoldSystemReset = () => {
    setScaffoldSystemText(SCAFFOLD_HTML_SYSTEM_PROMPT);
    useSessionStore.getState().setCustomScaffoldPrompt(null);
  };

  // Reset store and set discussion phase on mount
  useEffect(() => {
    useSessionStore.getState().resetSession();
    useSessionStore.setState({ phase: "discussion" });
  }, []);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    const store = useSessionStore.getState();
    store.setIsGeneratingScaffold(true);

    try {
      const res = await fetch("/api/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawPrompt: prompt,
          sessionId: null,
          customSystemPrompt:
            useSessionStore.getState().customScaffoldPrompt || undefined,
        }),
      });

      if (res.ok) {
        const { html } = await res.json();
        useSessionStore.getState().setCurrentScaffold(html);
        setActivePrompt(prompt);
        setChatKey((k) => k + 1);
      }
    } catch (e) {
      console.error("Failed to generate scaffold:", e);
    } finally {
      useSessionStore.getState().setIsGeneratingScaffold(false);
    }
  }, []);

  const handleMessagesChange = useCallback((messages: UIMessage[]) => {
    setScaffoldMessages(messages);
  }, []);

  const isGenerating = useSessionStore((s) => s.isGeneratingScaffold);

  return (
    <div className="h-dvh flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            Flint
          </Link>
          <span className="text-foreground/20">/</span>
          <Link
            href="/playground"
            className="text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            Playground
          </Link>
          <span className="text-foreground/20">/</span>
          <h1 className="text-sm font-medium">Scaffold</h1>
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex flex-1 min-h-0">
        {/* Column 1: Discussion chat */}
        <div className="w-[400px] shrink-0 border-r border-foreground/10 flex flex-col">
          <div className="flex-1 min-h-0">
            {activePrompt ? (
              <ScaffoldPlaygroundChat
                key={chatKey}
                scaffoldContext={activePrompt}
                onMessagesChange={handleMessagesChange}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-foreground/30">
                <div className="text-center space-y-2 px-6">
                  <p className="text-sm font-medium text-foreground/40">
                    Discussion
                  </p>
                  <p className="text-xs">
                    Generate a scaffold to start discussing it with Flint.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Scaffold iframe */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScaffoldPanel />
        </div>

        {/* Column 3: Scaffold System Prompt + Scaffold Prompt */}
        <div className="w-[380px] shrink-0 border-l border-foreground/10 flex flex-col">
          <div className="px-3 py-2 border-b border-foreground/10">
            <h3 className="text-xs font-medium text-foreground/50">
              Prompt Preview
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            {/* Scaffold System Prompt */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-foreground/50">
                  Scaffold System Prompt
                  {customScaffoldPrompt && (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600">
                      custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {scaffoldSystemDirty && (
                    <button
                      onClick={handleScaffoldSystemSave}
                      className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                  {customScaffoldPrompt && (
                    <button
                      onClick={handleScaffoldSystemReset}
                      className="text-[10px] px-2 py-0.5 rounded bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={scaffoldSystemText}
                onChange={(e) => setScaffoldSystemText(e.target.value)}
                className="text-[11px] font-mono bg-foreground/[0.03] rounded-lg p-3 whitespace-pre-wrap text-foreground/70 leading-relaxed border border-foreground/5 focus:border-foreground/20 focus:outline-none resize-y min-h-[200px]"
                rows={12}
              />
            </div>

            {/* Scaffold Prompt */}
            <div className="flex flex-col gap-1 pt-2 border-t border-foreground/10">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-medium text-foreground/50">
                  Scaffold Prompt
                </div>
                {activePrompt && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleGenerate(activePrompt)}
                      disabled={isGenerating}
                      className="text-[10px] px-2 py-0.5 rounded bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors disabled:opacity-30"
                    >
                      {isGenerating ? "..." : "Regenerate"}
                    </button>
                    <button
                      onClick={() => {
                        setPromptText(activePrompt);
                        setActivePrompt(null);
                      }}
                      className="text-[10px] px-2 py-0.5 rounded bg-foreground/5 text-foreground/40 hover:text-foreground/60 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {!activePrompt ? (
                <div className="space-y-2.5">
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Write a scaffold prompt or click a template below..."
                    rows={6}
                    className="w-full text-xs px-2.5 py-2 rounded-md border border-foreground/10 bg-foreground/[0.02] placeholder:text-foreground/25 focus:border-foreground/20 focus:outline-none resize-none leading-relaxed"
                  />
                  <button
                    onClick={() => handleGenerate(promptText)}
                    disabled={isGenerating || !promptText.trim()}
                    className="w-full text-xs py-1.5 rounded-md bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-30"
                  >
                    {isGenerating ? "Generating..." : "Generate Scaffold"}
                  </button>
                  <div className="pt-1">
                    <div className="text-[10px] text-foreground/30 mb-1.5">
                      Templates{" "}
                      <span className="text-foreground/20">· drag to reorder</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {templates.map((t, index) => (
                        <button
                          key={t.label}
                          draggable={!isGenerating}
                          onDragStart={() => {
                            dragItem.current = index;
                          }}
                          onDragEnter={() => {
                            dragOverItem.current = index;
                            setDragOverIndex(index);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => {
                            if (
                              dragItem.current !== null &&
                              dragOverItem.current !== null &&
                              dragItem.current !== dragOverItem.current
                            ) {
                              setTemplates((prev) => {
                                const next = [...prev];
                                const [removed] = next.splice(dragItem.current!, 1);
                                next.splice(dragOverItem.current!, 0, removed);
                                return next;
                              });
                            }
                            dragItem.current = null;
                            dragOverItem.current = null;
                            setDragOverIndex(null);
                          }}
                          onClick={() => {
                            setPromptText(t.prompt);
                          }}
                          disabled={isGenerating}
                          className={`text-[11px] px-2.5 py-1 rounded-full border text-foreground/50 transition-colors disabled:opacity-30 cursor-grab active:cursor-grabbing ${
                            dragOverIndex === index
                              ? "border-foreground/30 bg-foreground/[0.04]"
                              : "border-foreground/10 hover:border-foreground/25 hover:text-foreground/70"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <pre className="text-[11px] font-mono bg-foreground/[0.03] rounded-lg p-3 whitespace-pre-wrap text-foreground/60 leading-relaxed border border-foreground/5 max-h-[300px] overflow-y-auto">
                  {activePrompt}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
