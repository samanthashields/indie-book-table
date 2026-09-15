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

### Group 1 — spelling & encoding (resolved; code changes to match docs)
- Phase keys: code adopts the docs' spelling (`writing_development`, `pre_launch`, `post_launch_growth`, etc.).
- Requirement types: code stores the docs' snake_case as the source of truth; human-readable labels can be derived for display only.
- Naming: "Book Coach"/"Book Coach AI" → **Pen** everywhere, including the live create-flow system prompt text. Remaining "Indie Table" spots → **"The Indie Book Table."**
- Canonical schema shape: the **live Supabase DB schema is canonical**. Sample data and the AI-generation output shape must conform to it, not the reverse.

### Group 2 — real bugs (resolved; fix regardless of any doc question)
- Persist `budget` and `formats` instead of discarding them after plan generation.
- Ensure `manuscript_status` is actually collected on every cycle-creation path (template and scratch-built).
- Resolve the duplicate Post-Launch Reflection flow into one.

### Group 3 — phase editability (resolved)
The six phase keys, their formula weights, and their default milestone content are **locked** — never added, removed, or invented. What's author-editable is presentation only: **display name** (rename), **display order** (reorder), and **hidden** (a flag). Hiding a phase never deletes its data or removes it from the timeline math — only what's shown changes. The Phase Editor must be constrained to these three operations; it currently allows freely adding/removing phase records, which must stop.

### Group 4 — designed but not built (in progress — see the rollout prompt)
Structured milestone fields (`track`, `provision`, `depends_on`), a structured `owner` shape, the Setup Tasks concept, `starts_here` + phase-omission logic, the Needs Follow-Up signal, a real Resources object (replacing the dead column + ad hoc `milestone_notes`), parallel tracks, reconciling the three disconnected `warnings` concepts into one, the real 48-item milestone catalog inside actual templates (including splitting Longform into Fiction Novel + Memoir, and adding Nonfiction/How-To), and Pen's missing coaching content (illustration-density nudge, proactive ISBN framing, ARC/email-list coaching, explicit AI-boundary language).

### Still open — needs a yes/no before more schema gets written
- **`book.target_launch_date_confirmed` (boolean)** — implements the tentative-vs-firm pub date behavior from the grill session. *Recommended: approve.*
- **`book.trim_size`** — a pragmatic bridge field on Book Details, ahead of the full Setup Tasks concept being built. *Recommended: approve.*
- **A possible 5th Requirement Type**, for decision-point milestones (ISBN free-vs-purchased, etc.) — raised by Claude Code, not part of the original gap analysis. This touches the object model's locked "four requirement types." *Recommended: no, not yet — model these as `complete_activity_outside` with richer instructions and Pen coaching carrying the "this is a real decision" framing, rather than expanding the locked enum. Revisit if more decision-point milestones pile up later.*
- **`milestone.conditional_on`** — already rejected; confirm it's been reverted per the correction sent earlier.
