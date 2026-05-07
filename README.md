# Flint — Standing in the Loop of Thought

> *A flint does nothing on its own. A spark only appears when a human hand strikes it against steel.*

Flint is an AI thinking mentor that preserves human cognitive agency. Instead of answering questions directly, Flint guides users through their own reasoning by generating customized cognitive scaffolds — decision matrices, mind maps, 5 Whys frameworks — as interactive structures the user must fill in themselves.

This project is the software prototype developed for Kasper Zhang's MDes thesis at OCAD University (2026): *"Flint: Standing in the Loop of Thought — Exploring Human Agency in the Age of AI."*

## The Problem

Linear chat interfaces promote **automation bias**: users delegate reasoning to AI and become passive supervisors rather than active thinkers. When AI structures your thoughts for you, the productive struggle required for deep understanding disappears.

## The Approach

Flint shifts the interaction model from passive reception to active co-thinking:

- **AI as mentor, not author** — Flint asks Socratic questions and proposes scaffolds, but cannot write on the canvas
- **Generative UI** — the interface restructures itself dynamically based on the user's reasoning needs
- **Productive struggle** — blank frameworks prompt genuine cognitive effort; the user remains the architect of their own thought process

## Tech Stack

- **Framework:** Next.js 15 + React 19 (App Router)
- **Styling:** Tailwind CSS v4
- **State:** Zustand v5 (phase, scaffold proposals, suggestions)
- **AI:** Vercel AI SDK v4 + Anthropic Claude (`claude-sonnet-4-6`) — streaming chat + structured scaffold generation
- **Database:** Drizzle ORM + PostgreSQL
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/flint.git
cd flint
npm install
```

### Environment Setup

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://localhost:5432/flint
ANTHROPIC_API_KEY=sk-ant-...
```

### Database Setup

```bash
createdb flint
npm run db:push
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

Flint runs a four-phase conversation loop:

1. **Problem** — user describes what they're working through
2. **Clarify** — Flint asks Socratic questions to understand the reasoning context
3. **Propose** — Flint proposes a scaffold type suited to the problem (user must click "Generate")
4. **Discussion** — user fills in the scaffold; Flint continues as a thinking partner

The AI configures the environment but cannot populate it. Thinking remains the user's responsibility.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── mentor/      # Streaming mentor chat with phase/scaffold tools
│   │   └── scaffold/    # Structured scaffold generation
│   ├── session/         # Session-based chat UI
│   └── playground/      # Scaffold testing playground
├── components/
│   └── chat/            # ChatContainer and UI components
├── lib/
│   ├── ai/prompts.ts    # Mentor + scaffold system prompts
│   ├── db/schema.ts     # Sessions + messages schema
│   └── phase-machine.ts # Phase transition state machine
└── stores/
    └── session-store.ts # Zustand store: phase, proposals, scaffolds
```

## Research Context

This prototype is the third of three design iterations explored in the thesis:

| Version | Name | Approach | Limitation |
|---|---|---|---|
| V1 | The Conversationalist | System-prompted chat | Double bind of control |
| V2 | The Transparent Box | Visualized chain of thought | Burden of structure |
| V3 | The Co-Thinking Canvas | Generative spatial scaffolds | Current version |

The thesis argues that transitioning from linear to spatial interfaces can restore human agency, positioning AI as a co-thinker rather than a replacement for human creativity.

---

*MDes Thesis — OCAD University, Digital Futures, Toronto 2026*  
*Kasper Zhang*
