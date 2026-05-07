# Flint — How It Works

Flint is an AI thinking mentor. It doesn't give you answers. It helps you think through your own problems by asking precise questions, identifying how you're thinking, and generating a custom thinking tool — a scaffold — that matches your specific cognitive pattern. Then it watches you work and comments on what it sees.

This document explains the logic behind each piece of the system and why it's built the way it is.

---

## The Core Idea

Most AI products try to answer your question. Flint does the opposite. It treats you as someone who already has the answer somewhere in their thinking — you just haven't found it yet.

The approach is Socratic: Flint asks questions, mirrors your language back to you, identifies the shape of your thinking, and then gives you a structure to fill in yourself. The thinking happens in your hands, not the AI's.

This creates a fundamentally different outcome. Instead of getting an answer you might not trust, you get a tool you built your own understanding with. The scaffold (a decision matrix, a root cause analysis, a mind map — whatever fits) becomes evidence of your own thinking process.

---

## The Four Phases

Every Flint conversation moves through four phases. The phase machine is the backbone of the entire product — it prevents the conversation from becoming aimless chat and ensures the user actually reaches a useful thinking outcome.

### Phase 1: Define Problem

The user arrives with something on their mind. Maybe it's a vague feeling ("I need to make a career decision"), maybe it's specific ("our deploys keep failing"). Either way, Flint's job in this phase is to help them articulate it clearly.

Flint mirrors their language back: "So what I'm hearing is..." It asks Who / What / Why / When / Where questions to surface hidden assumptions. The user often doesn't realize what they're really asking about until they hear it reflected back.

**Why this phase exists:** People skip straight to solutions. They say "should I take job A or job B?" without examining what they actually value. This phase forces the real problem to surface before any structure is imposed on it.

**What triggers the next phase:** When the problem is clearly stated with enough context, Flint moves forward. Not the user — the AI decides when there's enough substance to work with.

### Phase 2: Clarify Thinking

Now Flint shifts from "what's the problem?" to "how are you thinking about it?" This is the metacognitive layer — Flint identifies the user's cognitive pattern.

Are they comparing options? That points toward a matrix. Are they tracing a chain of causes? That's a root cause analysis. Are they exploring an open space of ideas? That's a mind map. The structure should match the way they're already thinking, not impose an arbitrary framework.

Flint explains why it's asking each question: "I'm asking this because it seems like you're weighing trade-offs, and I want to understand what dimensions matter to you." This transparency builds trust and helps the user see their own patterns.

**Why this phase exists:** If you jump straight from problem to scaffold, you get a generic template. The clarify phase ensures the scaffold is shaped by the user's actual thinking, not a best guess.

**What triggers the next phase:** When Flint can name the thinking pattern and map it to a specific structure.

### Phase 3: Propose Scaffold

Flint proposes a thinking scaffold: a type (like "decision-matrix" or "5-whys + ishikawa"), a title specific to the user's problem, and a description of why this particular structure fits their thinking pattern.

This proposal appears as a card in the interface. The user sees what Flint is suggesting and why. They can ask follow-up questions, push back, or accept it.

**Why the user must click "Generate":** The scaffold is not generated automatically. The user has to explicitly confirm. This is a deliberate checkpoint — it ensures the user agrees with the direction before spending AI compute on generation. It also gives them a moment to consider whether the proposed structure actually matches how they think.

**What triggers the next phase:** Proposing a scaffold immediately moves to the discussion phase. The scaffold card stays visible until the user clicks Generate or Reject.

### Phase 4: Discussion

Once the scaffold is generated, the user works with it — filling in fields, weighing options, tracing causes. Flint watches what they're doing (it can see the scaffold's content) and comments on patterns it notices.

Maybe one column in a decision matrix is consistently empty — that suggests the user hasn't thought about that dimension. Maybe all the pros are on one side of a pro/con list — that's a sign the decision might already be made. Flint points these things out and asks deepening questions.

If the scaffold isn't working, the conversation can circle back to propose a different one.

**Why this phase exists:** The scaffold alone isn't the point. The thinking that happens inside it is. Flint's commentary during this phase helps the user see blind spots and patterns they wouldn't notice on their own.

---

## The Phase Machine

The four phases aren't just labels — they're enforced. A state machine validates every transition:

- **Problem** can stay in problem or move to clarify
- **Clarify** can stay in clarify or move to propose
- **Propose** must move to discussion
- **Discussion** can go back to propose (for a different scaffold)

Invalid transitions are silently ignored. If the AI hallucinates and tries to jump from problem straight to discussion, the system blocks it. This keeps the conversation on a productive path even when the underlying language model misbehaves.

The validation happens in two places: on the server (where the phase is persisted to the database) and on the client (where the UI state is managed). Belt and suspenders.

---

## How the Mentor AI Works

Flint's mentor is Claude with a carefully designed system prompt that changes based on the current phase. The prompt establishes five core rules:

1. **Never give direct answers.** No solutions, no opinions, no recommendations.
2. **One question at a time.** Never stack multiple questions — it dilutes focus.
3. **Keep responses short.** 2-4 sentences before the question. Flint is concise by design.
4. **Always suggest follow-ups.** After each response, Flint offers 2-3 clickable prompts the user could explore next. This prevents dead ends.
5. **Mirror the user's language.** Use their words, not generic coaching language. This makes the user feel heard and keeps the conversation grounded in their specific problem.

### The Three Tools

The mentor AI has three tools it can call during conversation. These are the only actions it can take beyond generating text:

**setPhase** — Moves the conversation to the next phase when thinking has progressed enough. The AI decides when, based on its judgment of the conversation. The reason is logged so the decision is traceable.

**proposeScaffold** — Proposes a thinking structure. The type is freeform — the AI isn't limited to a predefined list. It can propose "decision-matrix", "5-whys + ishikawa", "mind-map", or any label that describes a useful thinking structure. This goes with a title and description that are specific to the user's problem.

**suggestFollowUps** — Offers 2-3 follow-up prompts. These appear as clickable chips below the chat. They give the user concrete options when they're not sure what to say next, which reduces friction and keeps the conversation moving.

---

## How Scaffolds Are Generated

When the user clicks "Generate Scaffold," the system builds a prompt from three pieces:

1. **The proposal** — type, title, and description from the mentor's recommendation
2. **The full conversation** — every message exchanged between the user and Flint
3. **Instructions** — make all labels, headers, and placeholders specific to the user's problem; leave all input fields empty

This prompt is sent to Claude along with a scaffold system prompt that instructs it to generate a complete, self-contained HTML page. The page includes:

- Clean, modern design with cards, whitespace, and an accent color
- Interactive input fields (textareas, inputs) with problem-specific placeholders
- No external dependencies — no CDN links, no fonts, no images
- A script that syncs user edits back to the parent application

The result is a standalone HTML page that looks like a polished web app, rendered inside an iframe.

**Why HTML instead of a component library?** Three reasons. First, it keeps scaffolds simple — they're just HTML, CSS, and a tiny script. No build step, no dependencies. Second, it makes them inspectable — you can view source and see exactly what was generated. Third, it makes them infinitely flexible — the AI can generate any visual structure, not just what a component library supports.

**Why an iframe?** Security and isolation. The generated HTML runs in a sandboxed iframe. It can't access the parent page's state, storage, or network. The only communication channel is a `postMessage` that sends updated HTML back when the user edits fields. This means even if the generated HTML contained something unexpected, it can't affect the rest of the application.

---

## How Scaffold Edits Sync Back

Every scaffold includes a small script at the bottom. When the user types in any input field, the script waits 500ms (debounce), then snapshots the entire page's HTML — including the user's entries — and sends it to the parent app via `postMessage`.

The parent app receives this updated HTML and stores it. This means the scaffold is always a live snapshot of the user's work. If they close the browser and come back, their entries are still there.

This is intentionally simple. No complex state management, no field-by-field sync. Just: the user types, the HTML updates, the parent saves it. It works because the scaffold is the source of truth for its own content.

---

## State Management

Flint uses a Zustand store (a lightweight state container) to track everything that matters during a session:

- **Phase** — where the conversation is
- **Scaffold proposal** — what the AI suggested (type, title, description)
- **Suggestions** — the clickable follow-up prompts
- **Current scaffold** — the generated HTML
- **Generation status** — whether a scaffold is currently being generated

There's one important rule in how this store is used: **never capture state in a closure.** Whenever the code needs the current state, it calls `getState()` at that exact moment. This prevents a common bug where a callback captures an old value of the state and uses stale data. It's a small discipline that prevents an entire class of subtle bugs.

---

## Persistence

Every session is saved to a PostgreSQL database:

- **Sessions** store the phase, scaffold proposal, generated scaffold HTML, and timestamps
- **Messages** store every message in the conversation, along with any tool calls the AI made

When a user returns to an existing session, the system loads all of this and reconstructs the exact state: messages are replayed into the chat, the phase is restored, the scaffold is re-rendered in the iframe. The user picks up exactly where they left off.

**What if there's no database?** The app still works. Every database operation is wrapped in a try/catch. Without a database, sessions get a local ID, nothing is persisted, and the home page shows an empty state. This is intentional — it makes local development frictionless and means the app never crashes because of a missing database connection.

---

## The User Journey, End to End

1. User opens Flint and creates a new project
2. A session is created in the database, and the user lands on a split-pane view: scaffold area on the left, chat on the right
3. User types their problem. Flint asks a clarifying question and suggests follow-ups
4. Through 3-6 exchanges, the problem becomes clear. Flint moves to the clarify phase
5. Flint identifies how the user is thinking — comparing, tracing, exploring — and moves to propose
6. A proposal card appears in the chat: scaffold type, title, and why it fits
7. User clicks "Generate Scaffold." Claude generates a custom HTML page
8. The scaffold appears in the left panel. User starts filling it in
9. Flint sees the scaffold content and comments on patterns: empty sections, lopsided weights, dominant options
10. The conversation continues until the user has clarity. Everything is saved

---

## The Playground

Flint includes a development playground with two modes:

**Mentor Playground** — A three-column layout for testing the Socratic conversation. Left column is the chat, middle column shows a knowledge summary (what the AI understands about the conversation so far), right column shows a log of every tool call the AI made. You can override the system prompt to test different approaches.

**Scaffold Playground** — Lets you test scaffold generation directly, bypassing the mentor conversation. You paste a prompt (or click a template), generate a scaffold, and then discuss it with Flint. This is useful for iterating on the scaffold system prompt or testing how different prompt structures affect the output quality.

Both playgrounds exist because the product has two AI systems that need separate tuning: the mentor (conversation quality) and the scaffold generator (visual output quality). Being able to test each one independently makes iteration much faster.

---

## Why This Architecture

**The phase machine prevents aimless conversation.** Without structure, an AI conversation can wander forever. The four phases give the conversation a clear trajectory: understand the problem, understand the thinking, propose a tool, use the tool. Every session produces a tangible artifact.

**The proposal checkpoint prevents wasted work.** Scaffold generation is expensive (time and tokens). Requiring the user to explicitly confirm before generating ensures alignment between what the AI suggested and what the user actually wants.

**Scaffolds are plain HTML because simplicity wins.** No canvas library, no complex rendering pipeline. The AI generates HTML, the browser renders it in an iframe. This means any thinking structure is possible — the AI isn't constrained by a component library's vocabulary. A decision matrix, a fishbone diagram, a flowchart, a hybrid of multiple structures — all just HTML.

**The store uses `getState()` because closures lie.** In a React app with streaming AI responses and async operations, captured state goes stale fast. Calling `getState()` at the moment you need it guarantees fresh data. This is a small choice that prevents a large class of bugs.

**Persistence is optional because development matters.** Most AI apps require database setup before you can run them locally. Flint works without one. This lowers the barrier to contribution and testing.

**The system is transparent because trust matters.** The playground shows every tool call, every phase transition reason, every piece of the AI's decision-making. When you're building a thinking tool, you need to trust it. Transparency is how you build that trust.
