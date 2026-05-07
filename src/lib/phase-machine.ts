export type Phase = "problem" | "clarify" | "propose" | "discussion";

export const INITIAL_PHASE: Phase = "problem";

export const PHASE_LABELS: Record<Phase, string> = {
  problem: "Define Problem",
  clarify: "Clarify Thinking",
  propose: "Propose Scaffold",
  discussion: "Discussion",
};

export const PHASES: Phase[] = ["problem", "clarify", "propose", "discussion"];

const ALLOWED_TRANSITIONS: Record<Phase, Phase[]> = {
  problem: ["problem", "clarify"],
  clarify: ["clarify", "propose"],
  propose: ["propose", "clarify", "discussion"],
  discussion: ["clarify", "propose"],
};

export function validateTransition(from: Phase, to: Phase): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
