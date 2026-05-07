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
    <div className="mx-4 mb-3 border border-foreground/10 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-foreground/40 uppercase tracking-wide">
            Suggested Scaffold
          </p>
          <p className="text-sm font-medium">{proposal.title}</p>
          <p className="text-xs text-foreground/50">
            {proposal.type}
          </p>
        </div>
      </div>
      <p className="text-sm text-foreground/60">{proposal.description}</p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={isGenerating || disableGenerate}
          className="flex-1 text-sm py-2 rounded-lg bg-foreground text-background hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : disableGenerate ? "Generate Scaffold (use Final Prompt instead)" : "Generate Scaffold"}
        </button>
        <button
          onClick={onReject}
          disabled={isGenerating}
          className="text-sm px-4 py-2 rounded-lg border border-foreground/10 text-foreground/50 hover:text-foreground/70 hover:border-foreground/20 transition-colors disabled:opacity-50"
        >
          Not what I need
        </button>
      </div>
    </div>
  );
}
