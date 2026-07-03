"use client";

import type { ScaffoldProposal } from "@/lib/ai/schemas";

interface ProposalCardProps {
  proposal: ScaffoldProposal;
  onConfirm: () => void;
  onReject: () => void;
  isGenerating: boolean;
  disableGenerate?: boolean;
}

export function ProposalCard({
  proposal,
  onConfirm,
  onReject,
  isGenerating,
  disableGenerate,
}: ProposalCardProps) {
  return (
    <div className="mx-4 mb-3 space-y-3 rounded-[var(--r-md)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
      <div className="space-y-1.5">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-accent">
          Suggested Scaffold
        </p>
        <p className="text-[15px] font-bold tracking-[-0.02em] text-ink">
          {proposal.title}
        </p>
        <p className="font-mono text-[11px] text-ink-3">{proposal.type}</p>
      </div>
      <p className="text-[13px] leading-relaxed text-ink-2">
        {proposal.description}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={isGenerating || disableGenerate}
          className="flex-1 rounded-[var(--r-sm)] bg-accent py-2 text-[13px] font-semibold text-white transition-opacity duration-[var(--dur-fast)] hover:opacity-90 disabled:opacity-50"
        >
          {isGenerating ? "Generating…" : disableGenerate ? "Generate Scaffold (use Final Prompt instead)" : "Generate Scaffold"}
        </button>
        <button
          onClick={onReject}
          disabled={isGenerating}
          className="rounded-[var(--r-sm)] border border-border px-4 py-2 text-[13px] font-medium text-ink-2 transition-colors duration-[var(--dur-fast)] hover:border-border-strong hover:bg-surface-sunken disabled:opacity-50"
        >
          Not what I need
        </button>
      </div>
    </div>
  );
}
