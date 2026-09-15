# The Indie Table — project brief for AI coding assistants

Read this at the start of every session. It keeps Claude Code and Cursor consistent with the product's structure and the specs. If code and this brief conflict, stop and flag it rather than guessing.

## Naming — currently inconsistent, needs reconciling

The locked brand is **The Indie Table**. The live app currently shows **"The Indie Book Table"** in the header and some copy (a leftover from an earlier working name). Don't silently "fix" this in either direction — flag it to Sam and confirm which is canonical before changing header/copy text.

## Product

**The Indie Table** is a B2C SaaS product for self-published (indie) authors. Built in Lovable, synced to GitHub (`main` is the source of truth). Three surfaces under one brand and one account:

- **Author's Workshop** — private, authed. The author's home and expandable container. Holds **Book Cycles** (the guided, phased book-production tool) and **Book listing profiles** (per-book public listings the author manages here). Built to add more author tools later.
- **The Table** — public. A browsable catalog of indie books and author profiles; authors submit books to be listed. Ships as a monthly **flyer/issue** (see Flyer system below).
- **The Blog** / **Journal** — public. Articles and publishing education; the SEO/discovery layer.

## Vocabulary (use these exact terms in code, copy, and comments)

- **The Indie Table** — the product/brand (see naming note above)
- **Author's Workshop** — the private authed home
- **Book Cycles** — the phased production tool inside the Workshop
- **Pen** (full name Penny) — the AI book coach
- **The Table** — the public catalog
- **Book listing profiles** — per-book listings, managed in the Workshop, published to The Table
- **The Journal / Blog** — public content

Do not reintroduce retired working names ("Book Coach AI", "Indie Author AI") or Torsh/coaching-tool branding.

## Object model — DO NOT CHANGE without explicit sign-off

`Book Cycle → Phase → Milestone → Requirement`. Each Milestone has exactly **one** Requirement (1:1).

- **Six fixed phases (identity, count, and order are locked):** `writing_development`, `editing`, `production`, `pre_launch`, `launch`, `post_launch_growth`. These `phase.key` values, their formula weights, and their default milestone content are fixed — never add, remove, or invent a phase. What *is* author-editable, as a presentation layer only: a phase's **display name** (rename), its **display order** (reorder in the UI), and whether it's **hidden**. Hiding a phase never deletes its data or removes it from the timeline math — only what's shown changes.
- **Phase types:** `loop` (feedback-driven) or `sprint` (checklist-driven). Production runs **parallel tracks** (text/design/publishing).
- **Four requirement types:** `request_a_service`, `attach_a_file`, `complete_activity_outside`, `approve_a_deliverable`.
- **Milestone owner.kind:** `author` | `collaborator` | `unassigned`.
- **Needs Follow-Up:** `behind_pace`, `no_progress`, `launch_approaching`, `on_track`.
- Never flatten the hierarchy into a flat task list; never promote requirement-level actions to cycle-level objects.

## The Table's flyer system

Each monthly issue is authored as an ordered sequence of **blocks** (Cover, Section banner, Featured/hero, Grid, Series fan-out, Founding/featured author, Personality/activity) via the Admin → Issues → Flyer layout builder — not a single repeating card template. Keep book pricing/links/badges as shared structured data across blocks; only layout choice and hook copy are block-specific.

## Design system — reuse, don't reinvent

- One design system across all surfaces. Build from existing tokens/components; add to the system before using something new — no one-off colors, fonts, or card styles.
- Avoid generic AI-design tells: identical rounded-card shadows, ALL-CAPS eyebrow labels, a "→" on every button, the warm-cream+terracotta cliché.
- The arc is private manuscript → public book: the Workshop is quiet/focused; The Table is brighter/celebratory — same system, not two looks.
- Copy: sentence case. Pen's voice is plain, warm, encouraging, one clear next step. CTAs say what happens ("List on The Indie Table", "Mark complete", "Approve cover").
- Mobile + desktop responsive, visible keyboard focus, respect reduced-motion — **except** the Admin authoring workspace, which is fine designed desktop-first (internal tool).

## Architecture / tech notes

- **Stack:** TanStack Start (SSR React) on Vite, wrapped via `@lovable.dev/vite-tanstack-config`. Server functions live in `src/lib/*.functions.ts` (e.g. `catalog.functions.ts`, `table-share.functions.ts`) using `createServerFn()`. Server entry is `src/server.ts`.
- **`vite.config.ts` is intentionally minimal on top of the Lovable wrapper** — it (1) loads `.env` into `process.env` for server code, (2) points TanStack Start at `src/server.ts`, (3) pins `entities` for React Email SSR, and (4) proxies `/__l5e` asset requests (see below). Do not add TanStack/React/Tailwind/Nitro plugins here — the wrapper already registers them.
- **Local-dev image proxy:** images uploaded via Lovable's own asset system resolve at `/__l5e/assets-v1/...` — a path that only exists on Lovable's host. `vite.config.ts`'s `server.proxy` forwards `/__l5e` to `process.env.LOVABLE_PREVIEW_URL`, which must be set in your local `.env` (see `.env.example`). If images 404 locally, check that var is set and matches a live Lovable preview/publish URL, then restart `npm run dev` (Vite only reads config at startup).
- **Known follow-up:** several `createServerFn().inputValidator()` calls are deprecated in favor of `.validator()` — not urgent, but worth cleaning up in `catalog.functions.ts` / `table-share.functions.ts` when touching those files.
- **Longer-term fix, not urgent:** assets still served from `/__l5e/...` depend on Lovable's hosting indefinitely. Migrate real files into `src/assets/` (or equivalent) and import them locally instead, starting with the logo in `src/components/site/public-shell.tsx`.
- **Lovable ⇄ GitHub two-way sync** runs on `main`. GitHub is the source of truth.
- **Public vs protected routing:** The Table, Journal, and public author/book profiles are SEO-indexable public routes; the entire Author's Workshop is auth-protected.
- **The publish → list handoff:** finishing a Book Cycle creates a Book listing profile (private, in the Workshop), which publishes to a public book detail page on The Table, pre-filled from the book's metadata bundle.

## Working agreements (for you, the assistant)

- Make small, focused commits; push to `main`; let Lovable sync.
- Don't edit the same file simultaneously in Lovable and locally — do real work in the editor; use Lovable for scaffolding, preview, and publish.
- Ask before schema/data-model changes, DB migrations, touching the object model, or changing design tokens.
- Preserve existing functionality — change styling/structure, not behavior, unless explicitly asked.
- Keep Pen's boundaries in any AI-coach code: guides and recommends, never guarantees sales/rankings, general-information-only on legal/tax/contracts.

## Cursor note

Cursor reads `.cursor/rules`. Mirror this brief there — `.cursor/rules/project.mdc` with the same content and `alwaysApply: true` in its frontmatter — so both cockpits share one source of instructions.