"use client";

import { type Phase, PHASES } from "@/lib/phase-machine";

interface PhaseIndicatorProps {
  currentPhase: Phase;
}

// Short, single-word labels for the pill row (the guide's own naming).
// Full labels live in PHASE_LABELS for use elsewhere.
const PILL_LABELS: Record<Phase, string> = {
  problem: "Problem",
  clarify: "Clarify",
  propose: "Propose",
  discussion: "Discussion",
};

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASES.indexOf(currentPhase);

  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {PHASES.map((phase, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;

        return (
          <span
            key={phase}
            className={`flex-1 whitespace-nowrap rounded-[var(--r-pill)] border px-2 py-[5px] text-center text-[11px] font-semibold transition-colors duration-[var(--dur-fast)] ${
              isActive
                ? "border-accent bg-accent text-white"
                : isCompleted
                  ? "border-border-strong bg-transparent text-ink-2"
                  : "border-border bg-transparent text-ink-3"
            }`}
          >
            {PILL_LABELS[phase]}
          </span>
        );
      })}
    </div>
  );
}
