# Book Cycles — Group 4 Schema Migration Spec

**Status: ready to paste into Lovable.** Written for `docs/Codebase_Audit_And_Reconciliation_Decisions.md`'s Group 4 ("designed but not built"). Covers every schema change Group 4 needs, plus the two approved Plan Schema fields, in one consolidated pass — per the decision not to send these to Lovable one at a time. Code work (wiring these into the app) is Chunk 2, sequenced separately, after this lands and `src/integrations/supabase/types.ts` regenerates and syncs back.

**How to use this:** paste the SQL block below into Lovable's chat (or wherever it accepts schema-change instructions) and let it apply the migration. Once it syncs back to this repo (a new file appears under `supabase/migrations/`, and `src/integrations/supabase/types.ts` regenerates), Chunk 2 can start.

## Shape decisions made before finalizing this spec

- **Phase keys, requirement types**: renamed/re-encoded to match the docs' locked spelling, both as a data backfill and a going-forward `CHECK` constraint — the live DB currently uses short forms (`writing`, `prelaunch`, `growth`) and human-readable requirement strings, neither of which the docs ever specified.
- **Owner restructure**: links milestone ownership to the real `collaborators` table (`owner_collaborator_id`) instead of inventing a second parallel role enum, since `collaborators.role` already exists. The existing free-text `owner` column stays as a legacy display fallback, not dropped.
- **Setup Tasks**: a dedicated `book_setup_tasks` table, mirroring Milestones' shape (a trackable step with a status) rather than a bespoke JSON structure — deliberately avoiding introducing a second pattern for "trackable step" right after the audit's core finding was too many disagreeing shapes for the same concept. **It tracks completion state only** — `key`, `label`, `status`, `position`, `completed_at`. The actual values those steps capture (budget, formats, trim_size, `target_launch_date_confirmed`) stay exactly where they already are, as columns on `books` — this table doesn't duplicate them.
- **Resources**: a dedicated `resources` table, because a milestone-scoped jsonb column can't represent a book-level-only resource (no milestone row to live on), and the Functionality Spec requires both. `kind` matches the `resource` shape already defined in the Plan Schema (`file` / `link` / `manuscript_link`), not redesigned here. `milestone_notes` is untouched — Resources (attached material) and Notes (freeform commentary) stay separate concepts, same as the original spec draws them.
- **`depends_on`**: stores real milestone UUIDs, not the AI's local plan-time handles (e.g. `m_edit_copyedit`). The Plan Schema already specified this ("the app assigns real primary keys on instantiation") — this finishes that, rather than introducing something new. **Requires a Chunk 2 code step**: at instantiation, build a map from each local id to the real row id it becomes, then rewrite every milestone's `depends_on` array through that map before insert. Stays advisory only (no FK) — a `depends_on` entry pointing at a since-deleted milestone should just not render in the UI, not error.
- **Completeness pass**: cross-checked against every Group 4 item. `budget` and `manuscript_status` already have real homes (`books.budget` column; `books.metadata.manuscriptStatus` jsonb) — their Group 2 bugs are persistence bugs in code, not schema gaps, so no migration needed for either. Needs Follow-Up, the three-`warnings`-concepts reconciliation, the duplicate reflection flow, and the Phase Editor UI constraint are all pure code work (Chunk 2) — no schema required. Template content (Chunk 3) needs no schema change either; the `templates` table is already a flexible enough shape.

## The migration

```sql
-- 1. Phase key rename (data + constraint)
UPDATE phases SET key = CASE key
  WHEN 'writing' THEN 'writing_development'
  WHEN 'prelaunch' THEN 'pre_launch'
  WHEN 'growth' THEN 'post_launch_growth'
  ELSE key END;
ALTER TABLE phases ADD CONSTRAINT phases_key_check CHECK (key IN
  ('writing_development','editing','production','pre_launch','launch','post_launch_growth'));

-- 2. Requirement type re-encoding (data + constraint)
UPDATE milestones SET requirement_type = CASE requirement_type
  WHEN 'Request a Service' THEN 'request_a_service'
  WHEN 'Attach a File' THEN 'attach_a_file'
  WHEN 'Complete an Activity Outside the Platform' THEN 'complete_activity_outside'
  WHEN 'Approve a Deliverable' THEN 'approve_a_deliverable'
  ELSE requirement_type END;
ALTER TABLE milestones ADD CONSTRAINT milestones_requirement_type_check CHECK (requirement_type IN
  ('request_a_service','attach_a_file','complete_activity_outside','approve_a_deliverable'));

-- 3. Milestone structural fields
ALTER TABLE milestones ADD COLUMN track text NULL;
ALTER TABLE milestones ADD COLUMN provision text NULL CHECK (provision IN ('diy','hire','n/a'));
ALTER TABLE milestones ADD COLUMN depends_on jsonb NOT NULL DEFAULT '[]';
  -- advisory only, array of real milestone ids within the same book (see note above on the
  -- instantiation-time id-mapping step this needs); no FK/trigger enforcement

-- 4. Owner restructure (keep existing `owner` text column as legacy display fallback, don't drop)
ALTER TABLE milestones ADD COLUMN owner_kind text NOT NULL DEFAULT 'author'
  CHECK (owner_kind IN ('author','collaborator','unassigned'));
ALTER TABLE milestones ADD COLUMN owner_collaborator_id uuid NULL REFERENCES collaborators(id) ON DELETE SET NULL;
  -- links to the real collaborators table instead of a parallel role enum

-- 5. Approved Plan Schema field
ALTER TABLE books ADD COLUMN target_launch_date_confirmed boolean NOT NULL DEFAULT false;
-- books.trim_size already exists — no change needed

-- 6. Group 2 bug fix: formats has no column today
ALTER TABLE books ADD COLUMN formats text[] NOT NULL DEFAULT '{}'
  CHECK (formats <@ ARRAY['ebook','paperback','hardcover','audiobook']::text[]);

-- 7. starts_here + parallel tracks
ALTER TABLE phases ADD COLUMN starts_here boolean NOT NULL DEFAULT false;
ALTER TABLE phases ADD COLUMN tracks jsonb NULL;  -- e.g. ["text","design","publishing"], Production only

-- 8. Group 3: phase hide/show (display-layer only, per CLAUDE.md's phase-editability decision)
ALTER TABLE phases ADD COLUMN hidden boolean NOT NULL DEFAULT false;

-- 9. Setup Tasks — tracks completion state only; the values those steps capture stay on `books`
CREATE TABLE book_setup_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  description text NULL,
  status text NOT NULL DEFAULT 'pending',
  position int NOT NULL DEFAULT 0,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- RLS: mirror milestones' is_book_member(book_id) policy pattern

-- 10. Resources — kind matches the Plan Schema's existing resource shape (file/link/manuscript_link)
CREATE TABLE resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  milestone_id uuid NULL REFERENCES milestones(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('file','link','manuscript_link')),
  label text NOT NULL,
  url text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- milestone_id NULL = book-level resource; RLS mirrors milestones' pattern.
-- Coexists with milestone_notes (freeform commentary) — not a replacement for it.
-- The existing (dead) milestones.resources jsonb column is left as-is, unused; not dropped this pass.
```

**Not included, deliberately:** distribution channels (no persistence path today, not explicitly in scope per Group 4's list — flag separately if wanted); a 5th Requirement Type (kept as decided: no); `milestone.conditional_on` (kept as decided: no, Plan Generation-time behavior only); a `genre` enum/CHECK on the `templates` table (it's shared by admin-authored and author-authored templates, and constraining it would break freeform author templates).

## After this syncs back

1. Diff the regenerated `src/integrations/supabase/types.ts` against this spec to confirm every column/constraint landed as written.
2. Spot-check `phases`/`milestones` rows in the Supabase dashboard to confirm the data `UPDATE`s applied correctly (not just the constraints).
3. Let Claude Code know it's synced — Chunk 2 (the sequenced code-wiring PRs) picks up from there.
