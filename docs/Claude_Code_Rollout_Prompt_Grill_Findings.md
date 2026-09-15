# Rollout Prompt — Phase 2 (for Claude Code)

**Status:** Phase 1 is done — the codebase was audited against the four canonical specs, and every point of drift was resolved. Full detail lives in `docs/Codebase_Audit_And_Reconciliation_Decisions.md`; read that file first, alongside `CLAUDE.md` and the rest of `docs/`.

**How to use this:** if this is the *same* Claude Code session that ran the audit, just paste this in to continue. If it's a fresh session, it'll pick up full context from the docs above — nothing here depends on chat history surviving.

---

Three things before writing any more code:

## 0. Confirm the two pending approvals

`docs/Codebase_Audit_And_Reconciliation_Decisions.md` lists two schema fields awaiting a yes/no (`book.target_launch_date_confirmed`, `book.trim_size` — both recommended approve) and one open question (a possible 5th Requirement Type — recommended no, not yet). Check with me on these before writing them if you haven't already; don't assume "recommended" means "approved."

## 1. Build the real template content

Only 2 of 4 named templates exist today, and "Longform" incorrectly merges Fiction Novel and Memoir into one generic template with 1–2 milestones per phase. Fix this:

- Split "Longform" into separate **Fiction Novel** and **Memoir** templates.
- Add the missing **Nonfiction/How-To** template.
- Build out the full milestone catalog from `docs/Book_Cycles_Gap_Analysis_Grill_Session.md` §1 into the Fiction Novel template specifically (that's the one the gap analysis was grilled against) — Setup Tasks, all six phases, correctly placed per the corrections in that doc's §2.
- Use whatever the real milestone/phase/requirement shape turns out to be once Group 4's structural work (below) is underway — don't build 48 milestones against a shape that's about to change out from under you. Sequence this after item 2 if the shapes aren't stable yet.

## 2. Group 4 — the structural build

From the audit, in whatever order makes sense given real dependencies between them (call out dependencies as you find them):

- Structured milestone fields: `track`, `provision`, `depends_on`.
- A structured `owner` shape (`{kind, collaborator_role}`, including `unassigned`) replacing the free-text field.
- The Setup Tasks concept (currently just flat columns on Book Details).
- `starts_here` and phase-omission logic driven by `manuscript_status`.
- The Needs Follow-Up signal (`behind_pace`, `no_progress`, `launch_approaching`, `on_track`) — currently just a per-phase pacing indicator, no cycle-level signal.
- A real Resources object, replacing the dead DB column and the ad hoc `milestone_notes` table.
- Parallel tracks (text/design/publishing) for Production.
- Reconcile the three disconnected `warnings` concepts (AI-generated pitfalls, the timeline formula's `TimelineResult.warnings`, the plan schema's `warnings[]`) into one.
- Fix the two Group 2 bugs (persist `budget`/`formats`; ensure `manuscript_status` is always collected) and the duplicate Post-Launch Reflection flow, if not already done.
- Constrain the Phase Editor to display-name/order/hidden only, per the Group 3 decision — remove its ability to add/remove phase records.

## 3. Update Pen's system prompt

Add, per the audit's item 9 and the gap analysis §3:

- Illustration-density-informed DIY/hire nudge (not genre alone).
- Proactive ISBN framing — free vs. purchased, raised before the author embeds anything in files.
- ARC team coaching (what/why/how) and building an email list from zero (concrete tactics).
- Explicit "AI is a feedback and thinking partner, never the author" boundary language for any revision/copyedit milestone.
- Periodic pub-date re-confirmation as an ongoing-coaching behavior.

This needs to land in **two places**: `docs/Book_Coach_AI_System_Prompt.md`, and the live system prompt text in the create-flow code (`book-plan-schema.ts` and wherever the ongoing-coaching prompt lives) — the audit found these have already drifted from each other once (Pen vs. "Book Coach"), don't let it happen again.

## 4. Finish the doc updates

Three of the four canonical specs were already updated in Phase 1. Still outstanding:

- `docs/Book_Coach_AI_Create_Flow_Conversation_Spec.md` — rename "Book Coach AI" to Pen throughout (per Group 1), and reflect any field changes from item 0 above.
- Cross-check the three specs that *were* already updated against the Group 1–3 decisions above, in case anything written before those decisions needs a second pass.

## Constraints

- Everything from the original rollout prompt's constraints still applies: don't touch the locked object model beyond what's explicitly decided above, ask before further schema changes, small focused commits, branch + PR (not direct to `main`), preserve existing functionality.
- This is a big pass — open a PR when the first real chunk is ready rather than holding everything in one branch.
