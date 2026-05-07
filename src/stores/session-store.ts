import { create } from "zustand";
import { type Phase, INITIAL_PHASE, validateTransition } from "@/lib/phase-machine";
import type { ScaffoldProposal } from "@/lib/ai/schemas";

export interface ToolCallEntry {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  timestamp: number;
}

interface SessionState {
  sessionId: string | null;
  phase: Phase;
  scaffoldProposal: ScaffoldProposal | null;
  suggestions: string[];
  currentScaffold: string | null;
  isGeneratingScaffold: boolean;
  toolCallLog: ToolCallEntry[];
  customMentorPrompt: string | null;
  customScaffoldPrompt: string | null;
  knowledgeSummary: string;
  confidenceLevel: number;
}

interface SessionActions {
  setSessionId: (id: string | null) => void;
  setPhase: (phase: Phase) => void;
  setScaffoldProposal: (proposal: ScaffoldProposal | null) => void;
  setSuggestions: (suggestions: string[]) => void;
  setCurrentScaffold: (scaffold: string | null) => void;
  setIsGeneratingScaffold: (generating: boolean) => void;
  pushToolCall: (entry: ToolCallEntry) => void;
  clearToolCallLog: () => void;
  setCustomMentorPrompt: (prompt: string | null) => void;
  setCustomScaffoldPrompt: (prompt: string | null) => void;
  setKnowledgeSummary: (summary: string) => void;
  setConfidenceLevel: (level: number) => void;
  resetSession: () => void;
}

const initialState: SessionState = {
  sessionId: null,
  phase: INITIAL_PHASE,
  scaffoldProposal: null,
  suggestions: [],
  currentScaffold: null,
  isGeneratingScaffold: false,
  toolCallLog: [],
  customMentorPrompt: null,
  customScaffoldPrompt: null,
  knowledgeSummary: "",
  confidenceLevel: 3,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  (set, get) => ({
    ...initialState,

    setSessionId: (id) => set({ sessionId: id }),

    setPhase: (phase) => {
      const currentPhase = get().phase;
      if (validateTransition(currentPhase, phase)) {
        set({ phase });
      }
    },

    setScaffoldProposal: (proposal) => set({ scaffoldProposal: proposal }),

    setSuggestions: (suggestions) => set({ suggestions }),

    setCurrentScaffold: (scaffold) => set({ currentScaffold: scaffold }),

    setIsGeneratingScaffold: (generating) =>
      set({ isGeneratingScaffold: generating }),

    pushToolCall: (entry) =>
      set((state) => ({ toolCallLog: [...state.toolCallLog, entry] })),

    clearToolCallLog: () => set({ toolCallLog: [] }),

    setCustomMentorPrompt: (prompt) => set({ customMentorPrompt: prompt }),

    setCustomScaffoldPrompt: (prompt) => set({ customScaffoldPrompt: prompt }),

    setKnowledgeSummary: (summary) => set({ knowledgeSummary: summary }),

    setConfidenceLevel: (level) => set({ confidenceLevel: level }),

    resetSession: () => set({ ...initialState }),
  })
);
