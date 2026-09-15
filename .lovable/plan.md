# Book Cycles — Group 4 schema migration

Apply the pasted Group 4 migration spec as one consolidated migration, plus the platform-required access rules for the two new tables. No app-code changes in this pass (that's Chunk 2, after types regenerate).

## What changes in the database

1. **Phase keys renamed** — existing rows backfilled (`writing` → `writing_development`, `prelaunch` → `pre_launch`, `growth` → `post_launch_growth`) and a constraint locks keys to the six fixed phases.
2. **Requirement types re-encoded** — existing milestone rows backfilled to the locked spellings (`request_a_service`, `attach_a_file`, `complete_activity_outside`, `approve_a_deliverable`) with a matching constraint.
3. **Milestones gain structural fields** — `track`, `provision` (diy/hire/n/a), `depends_on` (advisory list of milestone ids), `owner_kind` (author/collaborator/unassigned, default author), and `owner_collaborator_id` linking to the collaborators table. The existing free-text `owner` column stays as a legacy display fallback.
4. **Books gain two fields** — `target_launch_date_confirmed` (boolean) and `formats` (list limited to ebook/paperback/hardcover/audiobook).
5. **Phases gain three fields** — `starts_here`, `tracks` (parallel text/design/publishing tracks for Production), and `hidden` (display-only hide/show).
6. **New `book_setup_tasks` table** — per-book setup steps (key, label, description, status, position, completion time). Tracks completion state only; the captured values stay on `books`.
7. **New `resources` table** — file/link/manuscript_link items attached to a book, optionally to a specific milestone. `milestone_notes` is untouched; the dead `milestones.resources` column is left in place, unused.

## Access rules for the new tables (required addition to the spec)

The spec leaves RLS as "mirror milestones" with no SQL, and the platform requires grants and policies in the same migration. Both new tables will:

- Grant full access to signed-in users and to service role; no anonymous access.
- Enable row-level security with policies mirroring `milestones`: book authors (and admins) can view and manage everything; assigned collaborators can view their book's rows.

## Deliberately excluded (per the spec)

Distribution channels, a 5th requirement type, `milestone.conditional_on`, a genre constraint on templates, and dropping the legacy `owner` / `milestones.resources` columns.

## Technical notes

- Delivered as a single migration via the database tool; the exact SQL from the spec is used, extended only with the GRANT/ENABLE RLS/CREATE POLICY block for `book_setup_tasks` and `resources`.
- Policies use the existing `is_book_author(book_id)` / `has_role(..., 'admin')` security-definer functions, same as `milestones`.
- After it applies, `src/integrations/supabase/types.ts` regenerates automatically; Chunk 2 code-wiring is a separate, later pass.
- `depends_on` stays advisory (no foreign key); the plan-time id → real id remapping happens in Chunk 2 code at cycle instantiation.

## Verification

- Query `phases` and `milestones` to confirm the data backfills applied (not just the constraints).
- Diff the regenerated types file against the spec to confirm every column/constraint landed.
