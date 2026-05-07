import { z } from "zod";

// Tool parameter schemas
export const setPhaseSchema = z.object({
  phase: z.enum(["problem", "clarify", "propose", "discussion"]),
  reason: z.string().describe("Brief explanation for why the phase is changing"),
});

export const proposeScaffoldSchema = z.object({
  type: z.string().describe("The scaffold structure type (e.g. 'decision-matrix', 'mind-map', '5-whys', 'ishikawa', 't-chart', 'scamper', or any structure that fits)"),
  title: z.string().describe("A short title for the scaffold"),
  description: z.string().describe("Why this scaffold fits the user's thinking pattern"),
});

export const suggestFollowUpsSchema = z.object({
  suggestions: z
    .array(z.string())
    .min(2)
    .max(3)
    .describe("2-3 follow-up prompts the user could explore"),
});

export type ScaffoldProposal = z.infer<typeof proposeScaffoldSchema>;
