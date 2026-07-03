# Flint — Design Guide

> *Warm minimalism, one confident spark.*
> A calm, near-monochrome interface where a single warm orange carries all the meaning — active state, system identity, and the data **you** put in.

This guide captures the visual language of Flint's interface. It's intentionally small: a few surfaces, one accent, disciplined type, soft edges. Everything else is restraint.

Files in this folder:
- `flint-design-guide.md` — this document (the spec)
- `tokens.css` — drop-in CSS custom properties
- `preview.html` — a living visual reference (open in a browser)

---

## 1. Principles

1. **Warm minimalism.** Off-white canvas, white working surfaces, warm near-black ink. The palette feels like paper, not a dashboard.
2. **One spark.** Orange (`#f46e1f`) is the *only* color. Spend it on meaning, never decoration: the active phase, Flint's identity, and the values the user has filled in. If everything is orange, nothing is.
3. **Borders are semantic.** A **solid** hairline = something defined. A **dashed** hairline = *empty, awaiting you*. This maps directly to Flint's philosophy: the AI sets up the structure, you fill it in.
4. **Mono is the machine's voice.** System, meta, and identity text (window title, the `FLINT` label, input placeholders) is set in Geist Mono. Human-facing content is Geist Sans. The typeface tells you who's "speaking."
5. **Soft, never harsh.** Low-contrast borders, generous radius, large low-opacity shadows. Nothing has a hard black outline.
6. **Space is a feature.** Generous padding (24–30px inside panels) and breathing room around type. Calm interfaces invite slow thinking — the whole point of Flint.
7. **Content is the source of truth.** The interface gets out of the way so the thinking is the thing you remember.

---

## 2. Color

### Surfaces
| Token | Hex | Use |
|---|---|---|
| `--canvas` | `#f4f2ee` | App background (warm off-white) |
| `--surface` | `#ffffff` | Cards, panels, the working plane |
| `--surface-raised` | `#faf9f6` | Window chrome, subtle raised bars |
| `--surface-sunken` | `#f3f1ec` | Header cells, inset areas |
| `--chat-tint` | `#fcfbf9` | Conversation panel |

### Ink
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#171717` | Primary text, strong titles |
| `--ink-2` | `#52504a` | Body copy, secondary |
| `--ink-3` | `#8c897f` | Muted labels, captions, placeholders |

### Borders
| Token | Hex | Use |
|---|---|---|
| `--border` | `#e6e3db` | Default hairline |
| `--border-strong` | `#d9d5cb` | Hover / emphasis |

### The spark
| Token | Hex | Use |
|---|---|---|
| `--accent` | `#f46e1f` | Primary — active state, identity, filled data |
| `--accent-ink` | `#b4520f` | Accent **text** on a light tint (readable) |
| `--accent-tint` | `#fff6ee` | Accent surface / filled cells |
| `--accent-line` | `#f4c6a0` | Accent border |

**Rule of thumb:** on light tint, use `--accent-ink` for text (not `--accent`, which fails contrast at small sizes). Solid orange (`--accent`) is for fills and active pills, always with white text.

---

## 3. Typography

**Families**
- **Sans — Geist** (primary). Human content, headings, body. `Inter` is a near-identical fallback.
- **Mono — Geist Mono.** The machine's voice: system/meta labels, window titles, placeholders, code-like tags.

**Scale**

| Role | Size | Weight | Tracking | Line-height |
|---|---|---|---|---|
| Display | 40px | 800 | −0.03em | 1.0 |
| H1 | 30–32px | 800 | −0.035em | 1.05 |
| H2 | 22–24px | 700–800 | −0.02em | 1.1 |
| Title | 18–20px | 700 | −0.02em | 1.2 |
| Body L | 17–18px | 400–500 | 0 | 1.6 |
| Body | 15px | 400–500 | 0 | 1.6 |
| Small | 13–14px | 500 | 0 | 1.5 |
| Label / caption | 11–12px | 600 | **+0.1em**, UPPERCASE | 1 |

**Notes**
- Headings tight and heavy (800 / negative tracking) for that confident, modern grotesque feel.
- Labels and system captions are the opposite: small, wide-tracked, uppercase. Often mono.
- Body copy sits at `--ink-2` (#52504a), not full black — softer, more readable in long passages.

---

## 4. Shape, elevation, motion

**Radius**
`--r-xs 8px` (cells, tiny controls) · `--r-sm 12px` (inputs) · `--r-md 16px` (cards, bubbles) · `--r-lg 20px` (windows/panels) · `--r-pill 999px` (tabs, chips).

**Shadows** — soft, large, warm, low-opacity:
- `--shadow-sm` `0 8px 24px -16px rgba(24,18,10,.25)`
- `--shadow-card` `0 30px 56px -32px rgba(24,18,10,.28)`
- `--shadow-window` `0 40px 90px -50px rgba(24,18,10,.45)`

**Motion** — restrained and quick:
- Ease: `cubic-bezier(.16,1,.3,1)`
- Durations: `0.2s` (hover), `0.35s` (default), `0.7s` (entrances)
- Prefer small transforms + opacity. Always honor `prefers-reduced-motion`.
- Reserve any spring/overshoot for a single moment (e.g. a scaffold generating), never everywhere.

---

## 5. Components

### Window chrome
Rounded container `--r-lg`, `--surface`, `--shadow-window`. Top bar in `--surface-raised` with three `#e0ddd4` dots and a **mono** title in `--ink-3`. Split into two panes with a single `--border` divider.

### Scaffold cells (the matrix)
The heart of the aesthetic.
- **Header cell** — `--surface-sunken` bg, `--ink-3` text, 12px, weight 600.
- **Label cell** — `--surface`, left-aligned, `--ink-2`, 13px.
- **Filled cell** — `--accent-tint` bg, `--accent-line` border, `--accent-ink` text, weight 600. *This is the user's thinking, made visible.*
- **Empty cell** — **dashed** `--border`. Signals "you fill this."

### Phase pills (tabs)
Pill (`--r-pill`) segmented indicator.
- Inactive: transparent bg, `--border`, `--ink-3` text.
- **Active**: solid `--accent`, white text, `--accent` border.
- Only one active at a time; it's the clearest use of the spark.

### Message bubble (Flint)
`--surface`, `--border`, radius `16px 16px 16px 4px` (one tight corner = "spoken by"). A tiny **`FLINT`** label above the text: mono, uppercase, `+0.1em`, `--accent`. Body in `--ink`.

### Suggestion chips
Pill, `--surface`, `--border`, `--ink-2`, 12px/500. Hover: border → `--border-strong`, subtle lift. These reduce dead ends — give the user somewhere to go.

### Input bar
`--surface`, `--border`, `--r-sm`, mono placeholder in `--ink-3`. Send button: small square-ish (`--r-xs`), solid `--ink` (#171717), white glyph. Primary actions are **dark**, not orange — orange is saved for state and data.

### Buttons
- **Primary** — solid `--ink`, white text, `--r-sm`. (e.g. Send)
- **Accent** — solid `--accent`, white text. Reserve for the one pivotal action (e.g. *Generate Scaffold*).
- **Ghost** — transparent, `--border`, `--ink-2` text; hover fills `--surface-sunken`.

### The read-only hint
Orange dot (`--accent`) + muted line: *"Flint can read this, but it can never write here."* A small, repeated reminder of the core contract — the AI configures, the human authors.

---

## 6. Generated scaffolds

Scaffolds are produced as self-contained HTML by the model (`SCAFFOLD_HTML_SYSTEM_PROMPT`) and rendered in a sandboxed iframe. They are part of the interface, so they inherit the *same* language — the generation prompt ships the full token block and enforces these rules:

- **Canvas + cards.** Page sits on `--canvas`; content groups into `--surface` cards with a `--border` hairline, `--r-md`/`--r-lg` radius, and `--shadow-sm`.
- **One spark, still.** `--accent` only marks the title/identity and the values the *user* fills in — never decoration inside a generated page either.
- **Dashed = fillable.** Every empty input renders as a **dashed** `--border` frame. When the user types, a `filled` class flips it to `--accent-tint` + `--accent-line` + `--accent-ink`, weight 600 — the user's thinking made visible.
- **Two voices.** Column headers, eyebrows, tags, and placeholders are mono/uppercase `--ink-3`; titles and body are sans.
- **Focus + motion.** Focus ring `0 0 0 3px rgba(244,110,31,.35)`; any drag-and-drop insertion indicator uses `--accent-line`, no new colors.

The result: a freshly generated matrix, fishbone, or T-chart is indistinguishable in feel from the rest of Flint — warm, calm, and unmistakably *awaiting you*.

---

## 7. Do / Don't

**Do**
- Keep the base monochrome; let orange mean *active / identity / your data*.
- Use dashed borders for anything the user is meant to fill.
- Set system/meta text in mono; human content in sans.
- Let panels breathe — 24–30px padding, real whitespace.

**Don't**
- Add a second accent color, or use orange for plain decoration.
- Use hard black 1px borders or heavy drop shadows.
- Fill empty states with placeholder text where a dashed frame says it better.
- Animate everything — pick one moment that deserves motion.

---

## 8. Accessibility

- Body text `--ink-2` on `--surface` ≈ 8:1 — comfortably AA/AAA. Muted `--ink-3` is for non-essential labels only.
- On `--accent-tint`, use `--accent-ink` (`#b4520f`) for text, not `--accent`.
- Visible focus ring: `box-shadow: 0 0 0 3px rgba(244,110,31,.35)` on interactive elements.
- Never rely on color alone: the active phase pill is also filled/bold; filled cells are also bolder.
- Respect `prefers-reduced-motion: reduce` — drop transforms, keep instant states.

---

*Distilled from Flint's own interface. Kasper Zhang — Toronto, 2026.*
