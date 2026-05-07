"use client";

import { type Phase, PHASES, PHASE_LABELS } from "@/lib/phase-machine";

interface PhaseIndicatorProps {
  currentPhase: Phase;
}

export function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const currentIndex = PHASES.indexOf(currentPhase);

  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {PHASES.map((phase, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;

        return (
          <div key={phase} className="flex items-center gap-1 flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`h-1.5 w-full rounded-full transition-colors ${
                  isActive
                    ? "bg-foreground"
                    : isCompleted
                      ? "bg-foreground/40"
                      : "bg-foreground/10"
                }`}
              />
              <span
                className={`text-[10px] mt-1 transition-colors ${
                  isActive
                    ? "text-foreground font-medium"
                    : "text-foreground/40"
                }`}
              >
                {PHASE_LABELS[phase]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
