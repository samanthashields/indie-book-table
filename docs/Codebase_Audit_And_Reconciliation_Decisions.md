# Codebase Audit & Reconciliation Decisions

**What this is:** the result of auditing the real `indie-book-table` codebase against the four canonical specs, plus every decision made on the drift found. Written so this survives independent of any chat session — read this before assuming the specs describe the app exactly as it exists today.

## Audit findings (11 areas)

Three schema-shaped things coexisted with no single source of truth going in: hardcoded sample data (`book-data.ts`), the live Supabase schema (`book-db.ts`), and the AI plan-generation output shape (`book-plan-schema.ts`/`book-plan.functions.ts`). They disagreed with each other, not just with the docs.

1. **Phase keys** — code used short ids (`writing`, `prelaunch`, `growth`, etc.) instead of the docs' full names. The Phase Editor also let authors freely add/remove phases — nothing enforced "six fixed phases."
2. **Requirement types** — right count, wrong encoding: code stored human-readable strings ("Request a Service") instead of the docs' snake_case.
3. **Milestone shape** — three different shapes across UI/DB/AI-generated code, none matching the Plan Schema. `track`, `provision`, `depends_on` don't exist anywhere. DB has unused `resources`/`instructions` columns. Status enum differs from the docs too.
4. **Owner** — a free-text string edited via a plain text input, not a `{kind, collaborator_role}` object. No `unassigned` value exists.
5. **Phase Timeline Formula** — **matches well**, the most faithfully-built part of the system. Gaps: `list_building_start_by` doesn't exist yet; "no floor when drafting from scratch" isn't implemented; `manuscript_status` isn't always collected and silently defaults to "drafting."
6. **Setup Tasks** — the concept doesn't exist in code at all. Budget and formats are captured in the Pen conversation and then **discarded** — never persisted.
7. **`starts_here` / phase omission** — doesn't exist; every phase gets created regardless of manuscript status.
8. **Naming** — confirms `CLAUDE.md`'s flag, plus more: the ongoing Pen chat correctly says "Pen," but the create-flow/plan-generation surface (including the live AI system prompt) still says "Book Coach"/"Book Coach AI" throughout. "The Indie Book Table" is dominant in code; two spots still say "The Indie Table."
9. **Create-flow conversation** — structure **matches well**. System-prompt content is missing: no illustration-density nudge, no proactive ISBN framing, no ARC/email-list coaching, no "AI is not the author" boundary language.
10. **Templates** — only 2 of 4 named templates exist; Fiction Novel and Memoir are merged into one generic "Longform" template; no Nonfiction/How-To at all. Milestone content per template is 1–2 generic items per phase, nowhere near the 48-item catalog.
11. **Other systemic gaps** — Needs Follow-Up is essentially absent (only a per-phase pacing indicator exists). Two different, overlapping Post-Launch Reflection question flows write into the same field. Resources has a dead DB column; the real UI uses a separate `milestone_notes` table. Parallel tracks and `depends_on` are fully unimplemented. Three unreconciled `warnings`-ish concepts exist with no connection to each other. `provision` (diy/hire) is AI-generated free text folded into the description, never structured. `formats` and distribution channels have no persistence path at all.

## Decisions

### Group 1 — spelling & encoding (decided; partly landed)
- Phase keys: code adopts the docs' spelling (`writing_development`, `pre_launch`, `post_launch_growth`, etc.). **Pending** — needs the phase-key data migration (see `Book_Cycles_Schema_Migration_Spec.md`) plus the Chunk 2 code pass replacing the 6 duplicated literal key arrays.
- Requirement types: code stores the docs' snake_case as the source of truth; human-readable labels can be derived for display only. **Pending** — same migration + Chunk 2 pass.
- Naming: "Book Coach"/"Book Coach AI" → **Pen** everywhere, including the live create-flow system prompt text. Remaining "Indie Table" spots → **"The Indie Book Table."** **Done** (PR #1, merged 2026-09-15) — the naming half of Group 1. "Indie Table" spelling not yet addressed.
- Canonical schema shape: the **live Supabase DB schema is canonical**. Sample data and the AI-generation output shape must conform to it, not the reverse. Standing rule, applies as Chunk 2 touches each shape.

### Group 2 — real bugs (decided; not yet landed)
- Persist `budget` and `formats` instead of discarding them after plan generation. **Pending** — `formats` also needs its schema column (see migration spec); `budget` already has one, this is a pure code fix.
- Ensure `manuscript_status` is actually collected on every cycle-creation path (template and scratch-built). **Pending** — already has a schema home (`books.metadata.manuscriptStatus`), this is a pure code fix.
- Resolve the duplicate Post-Launch Reflection flow into one. **Pending** — pure code merge, no schema needed.

### Group 3 — phase editability (decided; not yet landed)
The six phase keys, their formula weights, and their default milestone content are **locked** — never added, removed, or invented. What's author-editable is presentation only: **display name** (rename), **display order** (reorder), and **hidden** (a flag). Hiding a phase never deletes its data or removes it from the timeline math — only what's shown changes. The Phase Editor must be constrained to these three operations; it currently allows freely adding/removing phase records, which must stop. **Pending** — needs the `phases.hidden` column (see migration spec) plus the Chunk 2 UI constraint.

### Group 4 — designed but not built
Structured milestone fields (`track`, `provision`, `depends_on`), a structured `owner` shape, the Setup Tasks concept, `starts_here` + phase-omission logic, the Needs Follow-Up signal, a real Resources object (replacing the dead column + ad hoc `milestone_notes`), parallel tracks, reconciling the three disconnected `warnings` concepts into one, the real 48-item milestone catalog inside actual templates (including splitting Longform into Fiction Novel + Memoir, and adding Nonfiction/How-To), and Pen's missing coaching content (illustration-density nudge, proactive ISBN framing, ARC/email-list coaching, explicit AI-boundary language).

**Status:** Pen's coaching content is **done** (PR #1). The dead `generateBookPlan()` duplicate is **removed** (PR #1). Every schema piece Group 4 needs (plus Group 1/2/3's schema needs, consolidated into one pass) is now spec'd in `Book_Cycles_Schema_Migration_Spec.md`, **ready to paste into Lovable** — see that doc, and "Shape decisions" below for how Setup Tasks, Resources, and `depends_on` ended up modeled. Everything else (structural code wiring, Needs Follow-Up, warnings reconciliation, real template content) is **pending**, sequenced as Chunk 2/3 after the migration lands and syncs back.

### Resolved 2026-09-15
- **`book.target_launch_date_confirmed` (boolean, default false)** — **approved.** Added to the Plan Schema (`Book_Cycle_Plan_Schema.md`), implements the tentative-vs-firm pub date behavior from the grill session. Still needs wiring into create-flow + the Pre-Launch "firm up the pub date" milestone (tracked under Group 4).
- **`book.trim_size` (string | null)** — **approved.** Added to the Plan Schema as a bridge field ahead of the full Setup Tasks concept, matching the column that already exists on Book Details in code.
- **A possible 5th Requirement Type**, for decision-point milestones (ISBN free-vs-purchased, etc.) — **kept as decided: no, not yet.** Decision-point milestones stay `complete_activity_outside` with richer instructions and Pen coaching carrying the "this is a real decision" framing. Revisit if more decision-point milestones pile up later.
- **`milestone.conditional_on`** — confirmed reverted (see Plan Schema "Design rules": conditional milestones are a Plan Generation-time behavior, not a schema field).

### Group 4 shape decisions, resolved 2026-09-15 (see `Book_Cycles_Schema_Migration_Spec.md` for the full spec)
- **Setup Tasks** — a dedicated `book_setup_tasks` table, mirroring Milestones' shape (a trackable step with a status), tracking **completion state only**. The actual values those steps capture (budget, formats, trim_size, `target_launch_date_confirmed`) stay as columns on `books` — this table doesn't duplicate them.
- **Resources** — a dedicated `resources` table (book-level and milestone-scoped, `kind` matching the Plan Schema's existing `file`/`link`/`manuscript_link` shape), because a milestone-scoped jsonb column can't represent a book-level-only resource. `milestone_notes` stays untouched — Resources and Notes remain separate concepts.
- **`depends_on`** — stores real milestone UUIDs (finishing what the Plan Schema already specified: the app assigns real primary keys on instantiation), not the AI's local plan-time handles. Needs a Chunk 2 code step: map each local id to its real row id at instantiation, then rewrite `depends_on` arrays through that map. Stays advisory only — a reference to a deleted milestone should not render, not error.
