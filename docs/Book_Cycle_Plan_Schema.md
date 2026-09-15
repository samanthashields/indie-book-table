# Book Cycle Plan Schema (`plan_schema`)

The output contract for the **Book Coach AI — Plan Generation mode**. When the create flow finishes gathering answers, the AI emits one object conforming to this schema; the app instantiates a live Book Cycle from it through the standard create pipeline. This is the shared contract referenced by three documents:

- **Book Coach AI — System Prompt** → Plan Generation mode outputs `{{plan_schema}}` (this).
- **Create Book Cycle Conversation Spec** → §14 requires generation output to conform to this.
- **Book Cycles Adaptation Prompt** → the app builds the cycle by instantiating this.

Two things follow: the formal JSON Schema (what engineering validates against), and a filled example (what the AI should emit).

## Design rules baked into the schema

- The **six phases are fixed** (`phase.key` is an enum). The AI tailors milestones inside them; it never invents the phase set. The cycle **starts at the phase matching `manuscript_status`** (`starts_here: true`); earlier phases may be omitted or pre-completed.
- Every milestone has exactly **one requirement**, of the four V1 types.
- `owner.kind` may be **`unassigned`** — this is how a recommended *hire* is represented when the author hasn't named a collaborator yet.
- `provision` (`diy` / `hire` / `n/a`) captures the budget-driven recommendation for production jobs.
- `due_date` is **back-planned from `target_launch_date`**; `depends_on` is **advisory only** (no hard sequencing — matches the "no enforced dependencies" decision).
- `warnings[]` carries author-facing flags (e.g., a launch date too tight for the work, or a lead-time-sensitive milestone like illustration, ARC team formation, or IngramSpark↔KDP scheduling), surfaced in the preview.
- **Conditional milestones are a Plan Generation-time behavior, not a schema field.** Pen asks during intake (e.g., "do you already have an author website?") and simply omits the milestone from the emitted plan when it isn't needed — the same way `starts_here` already governs which phases appear. No `conditional_on` field; a milestone the schema doesn't include never existed for this cycle.
- `book.target_launch_date_confirmed` (default `false`) tracks whether the launch date is still a placeholder or has been firmed up. `target_launch_date` stays required either way (the timeline formula needs *a* date to compute ranges); this flag just tracks whether Pen should keep re-confirming it in ongoing coaching or treat it as locked. *Approved 2026-09-15 — see [Codebase_Audit_And_Reconciliation_Decisions.md](./Codebase_Audit_And_Reconciliation_Decisions.md).*
- `book.trim_size` is the print trim size / manuscript template the author picks as an early Setup Task (e.g. a specific KDP template) — a bridge field on the `book` object ahead of the full Setup Tasks concept being built, matching the column that already exists on Book Details in code. Lets the Production-phase "interior formatting" milestone reference a decision already made instead of re-asking. *Approved 2026-09-15 — see [Codebase_Audit_And_Reconciliation_Decisions.md](./Codebase_Audit_And_Reconciliation_Decisions.md).*
- Reflection prompts are **author-only**.
- A grill-session gap analysis of one author's real production process surfaced these fields, plus others deliberately **not** added: a first-class "repeat per chapter" milestone feature (§4 of that doc leaves it unresolved), and a fifth Requirement Type for decision-point milestones (ISBN, trim size use the existing `complete_activity_outside` type instead — see the Functionality Spec § 6).

## JSON Schema (Draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://bookcycles.app/schemas/book-cycle-plan.v1.json",
  "title": "Book Cycle Plan",
  "type": "object",
  "required": ["schema_version", "source", "book", "phases", "reflection_prompts"],
  "additionalProperties": false,
  "properties": {
    "schema_version": { "const": "1.0" },
    "source": { "enum": ["scratch", "template"] },
    "template_id": { "type": ["string", "null"], "description": "Set when source = template." },
    "book": { "$ref": "#/$defs/book" },
    "phases": { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/phase" } },
    "reflection_prompts": { "type": "array", "items": { "$ref": "#/$defs/reflection_prompt" } },
    "warnings": { "type": "array", "items": { "type": "string" } }
  },
  "$defs": {
    "book": {
      "type": "object",
      "required": ["working_title", "genre", "formats", "publishing_path", "primary_audience", "target_launch_date"],
      "additionalProperties": false,
      "properties": {
        "working_title": { "type": "string" },
        "title_is_suggested": { "type": "boolean", "default": false },
        "description": { "type": ["string", "null"] },
        "genre": { "type": "string" },
        "formats": { "type": "array", "minItems": 1, "items": { "enum": ["ebook", "paperback", "hardcover", "audiobook"] } },
        "publishing_path": { "enum": ["self", "hybrid", "small_press", "traditional"] },
        "primary_audience": { "type": "string" },
        "manuscript_status": { "enum": ["drafting", "first_draft_done", "edited"] },
        "target_launch_date": { "type": "string", "format": "date" },
        "target_launch_date_confirmed": { "type": "boolean", "default": false, "description": "false = tentative/placeholder; flips true when the author firms it up in Pre-Launch." },
        "trim_size": { "type": ["string", "null"], "description": "Manuscript/print template selected as an early Setup Task, applied later by the Production interior-formatting milestone." },
        "budget": { "type": ["number", "null"], "minimum": 0 },
        "goals": { "type": "array", "items": { "type": "string" } },
        "comparable_titles": { "type": "array", "items": { "type": "string" } },
        "series": { "type": "boolean", "default": false }
      }
    },
    "phase": {
      "type": "object",
      "required": ["key", "name", "order", "type", "milestones"],
      "additionalProperties": false,
      "properties": {
        "key": { "enum": ["writing_development", "editing", "production", "pre_launch", "launch", "post_launch_growth"] },
        "name": { "type": "string" },
        "order": { "type": "integer", "minimum": 1 },
        "type": { "enum": ["loop", "sprint"] },
        "starts_here": { "type": "boolean", "default": false },
        "tracks": { "type": "array", "items": { "type": "string" } },
        "milestones": { "type": "array", "items": { "$ref": "#/$defs/milestone" } }
      }
    },
    "milestone": {
      "type": "object",
      "required": ["id", "name", "owner", "requirement", "status"],
      "additionalProperties": false,
      "properties": {
        "id": { "type": "string", "description": "Unique within the plan, e.g. m_edit_copyedit." },
        "name": { "type": "string" },
        "description": { "type": ["string", "null"] },
        "track": { "type": ["string", "null"] },
        "owner": { "$ref": "#/$defs/owner" },
        "provision": { "enum": ["diy", "hire", "n/a"], "default": "n/a" },
        "requirement": { "$ref": "#/$defs/requirement" },
        "due_date": { "type": ["string", "null"], "format": "date" },
        "approval_required": { "type": "boolean", "default": false },
        "status": { "enum": ["in_progress", "completed", "blocked", "on_hold"], "default": "in_progress" },
        "depends_on": { "type": "array", "items": { "type": "string" } },
        "resources": { "type": "array", "items": { "$ref": "#/$defs/resource" } }
      }
    },
    "owner": {
      "type": "object",
      "required": ["kind"],
      "additionalProperties": false,
      "properties": {
        "kind": { "enum": ["author", "collaborator", "unassigned"] },
        "collaborator_role": {
          "enum": ["co_author", "developmental_editor", "copyeditor", "proofreader",
                   "cover_designer", "formatter", "illustrator", "marketing",
                   "beta_reader", "arc_reader", "coach"]
        }
      },
      "allOf": [
        { "if": { "properties": { "kind": { "const": "collaborator" } } },
          "then": { "required": ["collaborator_role"] } }
      ]
    },
    "requirement": {
      "type": "object",
      "required": ["type"],
      "additionalProperties": false,
      "properties": {
        "type": { "enum": ["request_a_service", "attach_a_file", "complete_activity_outside", "approve_a_deliverable"] },
        "brief": { "type": ["string", "null"], "description": "For request_a_service." },
        "instructions": { "type": ["string", "null"], "description": "For complete_activity_outside." },
        "auto_complete_on": { "enum": ["file_uploaded", "preorder_link_validated", "approval_granted", "none"], "default": "none" }
      }
    },
    "resource": {
      "type": "object",
      "required": ["kind", "label"],
      "additionalProperties": false,
      "properties": {
        "kind": { "enum": ["file", "link", "manuscript_link"] },
        "label": { "type": "string" },
        "url": { "type": ["string", "null"] }
      }
    },
    "reflection_prompt": {
      "type": "object",
      "required": ["audience", "prompt"],
      "additionalProperties": false,
      "properties": {
        "audience": { "const": "author" },
        "prompt": { "type": "string" },
        "response_type": { "enum": ["yes_no_notes", "free_text"], "default": "free_text" },
        "conditional_on": { "type": ["string", "null"] }
      }
    }
  }
}
```

## Example output (abridged — a self-published children's picture book)

Shows the features that matter: the plan starts at Writing (`starts_here`), Production runs **parallel tracks** with the illustration and cover as **hires** (one `unassigned`), formatting DIY, an ISBN decision-plus-purchase pair as outside activities, an **approval-required** cover milestone, a **conditional** author-website milestone, a linked draft manuscript, back-planned due dates, a tentative (unconfirmed) launch date, and **warnings** for two lead-time-sensitive milestones (illustration; ARC team). Milestones are trimmed to representative ones per phase.

```json
{
  "schema_version": "1.0",
  "source": "scratch",
  "template_id": null,
  "book": {
    "working_title": "The Lantern Fox",
    "title_is_suggested": false,
    "description": "A bedtime picture book about a fox who lights the way home.",
    "genre": "Children's Picture Book",
    "formats": ["hardcover", "ebook"],
    "publishing_path": "self",
    "primary_audience": "Picture Books (Ages 3-8)",
    "manuscript_status": "drafting",
    "target_launch_date": "2027-06-01",
    "target_launch_date_confirmed": false,
    "trim_size": null,
    "budget": 4000,
    "goals": ["Read-aloud favorite that builds my author brand for school visits"],
    "comparable_titles": ["The Wonderful Things You Will Be", "Ada Twist, Scientist"],
    "series": false
  },
  "phases": [
    {
      "key": "writing_development", "name": "Writing & Development", "order": 1,
      "type": "loop", "starts_here": true,
      "milestones": [
        {
          "id": "m_write_finish_manuscript", "name": "Finish the manuscript",
          "owner": { "kind": "author" },
          "requirement": { "type": "attach_a_file", "auto_complete_on": "file_uploaded" },
          "due_date": "2026-11-15", "status": "in_progress",
          "resources": [ { "kind": "manuscript_link", "label": "Working draft", "url": null } ]
        },
        {
          "id": "m_write_beta_readers", "name": "Beta-reader round",
          "owner": { "kind": "collaborator", "collaborator_role": "beta_reader" },
          "requirement": { "type": "request_a_service", "brief": "Read for pacing and read-aloud rhythm." },
          "due_date": "2026-12-15", "status": "in_progress"
        },
        {
          "id": "m_write_front_back_matter", "name": "Draft front/back matter content",
          "owner": { "kind": "author" },
          "requirement": { "type": "attach_a_file", "auto_complete_on": "file_uploaded" },
          "due_date": "2027-01-10", "status": "in_progress"
        },
        {
          "id": "m_write_website", "name": "Create an author website",
          "owner": { "kind": "author" }, "provision": "diy",
          "requirement": { "type": "complete_activity_outside", "instructions": "Stand up a simple site with a sign-up form." },
          "due_date": "2027-01-15", "status": "in_progress"
        }
      ]
    },
    {
      "key": "editing", "name": "Editing", "order": 2, "type": "loop",
      "milestones": [
        {
          "id": "m_edit_copyedit", "name": "Copyedit",
          "owner": { "kind": "unassigned" }, "provision": "hire",
          "requirement": { "type": "request_a_service", "brief": "Copyedit ~800 words; children's picture book conventions." },
          "due_date": "2027-01-31", "approval_required": true, "status": "in_progress"
        }
      ]
    },
    {
      "key": "production", "name": "Production", "order": 3, "type": "sprint",
      "tracks": ["text", "design", "publishing"],
      "milestones": [
        {
          "id": "m_prod_illustration", "name": "Illustrations",
          "track": "design", "owner": { "kind": "unassigned" }, "provision": "hire",
          "requirement": { "type": "request_a_service", "brief": "12 spreads; commit early — longest lead time." },
          "due_date": "2027-03-15", "approval_required": true, "status": "in_progress",
          "depends_on": ["m_edit_copyedit"]
        },
        {
          "id": "m_prod_cover", "name": "Cover design",
          "track": "design", "owner": { "kind": "collaborator", "collaborator_role": "cover_designer" },
          "provision": "hire",
          "requirement": { "type": "approve_a_deliverable", "auto_complete_on": "approval_granted" },
          "due_date": "2027-03-31", "approval_required": true, "status": "in_progress"
        },
        {
          "id": "m_prod_format", "name": "Interior layout (print + ebook)",
          "track": "text", "owner": { "kind": "author" }, "provision": "diy",
          "requirement": { "type": "attach_a_file", "auto_complete_on": "file_uploaded" },
          "due_date": "2027-04-15", "status": "in_progress",
          "depends_on": ["m_prod_illustration"]
        },
        {
          "id": "m_prod_isbn_decision", "name": "ISBN decision: free vs. purchased",
          "track": "publishing", "owner": { "kind": "author" },
          "requirement": { "type": "complete_activity_outside", "instructions": "Free (KDP-assigned) vs. purchased (Bowker, portable across vendors): weigh before any file embeds one — switching later means redoing every file it touches." },
          "due_date": "2027-03-20", "status": "in_progress"
        },
        {
          "id": "m_prod_isbn_purchase", "name": "ISBN purchase & quantity",
          "track": "publishing", "owner": { "kind": "author" },
          "requirement": { "type": "complete_activity_outside", "instructions": "One ISBN per print format (paperback, hardcover). KDP ebooks get a free ASIN automatically and don't need one." },
          "due_date": "2027-04-01", "status": "in_progress",
          "depends_on": ["m_prod_isbn_decision"]
        },
        {
          "id": "m_prod_proof_copies", "name": "Order & verify proof copies",
          "track": "publishing", "owner": { "kind": "author" },
          "requirement": { "type": "complete_activity_outside", "instructions": "Order from both KDP and IngramSpark; check print quality, binding, and trim feel before publishing." },
          "due_date": "2027-04-20", "status": "in_progress"
        }
      ]
    },
    {
      "key": "pre_launch", "name": "Pre-Launch", "order": 4, "type": "sprint",
      "milestones": [
        {
          "id": "m_pre_arc_team", "name": "Build & activate the ARC team",
          "owner": { "kind": "author" },
          "requirement": { "type": "complete_activity_outside", "instructions": "Recruit and onboard early readers ahead of launch; Pen explains what an ARC team is and why timing matters for first-timers." },
          "due_date": "2027-04-10", "status": "in_progress"
        },
        {
          "id": "m_pre_preorder", "name": "Set up ebook preorder",
          "owner": { "kind": "author" },
          "requirement": { "type": "complete_activity_outside", "instructions": "Upload to KDP; validate the preorder link.", "auto_complete_on": "preorder_link_validated" },
          "due_date": "2027-04-30", "status": "in_progress"
        }
      ]
    },
    {
      "key": "launch", "name": "Launch", "order": 5, "type": "sprint",
      "milestones": [
        {
          "id": "m_launch_announce", "name": "Launch announcement to email list",
          "owner": { "kind": "author" },
          "requirement": { "type": "complete_activity_outside", "instructions": "Send launch-day campaign." },
          "due_date": "2027-06-01", "status": "in_progress"
        }
      ]
    },
    {
      "key": "post_launch_growth", "name": "Post-Launch & Growth", "order": 6, "type": "loop",
      "milestones": [
        {
          "id": "m_post_school_visits", "name": "Book school read-aloud visits",
          "owner": { "kind": "author" },
          "requirement": { "type": "complete_activity_outside", "instructions": "Reach out to local schools/libraries." },
          "due_date": null, "status": "in_progress"
        }
      ]
    }
  ],
  "reflection_prompts": [
    { "audience": "author", "prompt": "Did The Lantern Fox achieve its goals?", "response_type": "yes_no_notes" },
    { "audience": "author", "prompt": "Was it published on or before your target date?", "response_type": "yes_no_notes", "conditional_on": "Did The Lantern Fox achieve its goals? = No" },
    { "audience": "author", "prompt": "What are the next steps for The Lantern Fox to be successful?", "response_type": "free_text" }
  ],
  "warnings": [
    "Illustration is the longest lead item for a picture book — the schedule assumes you commission it right after the copyedit. Slipping it will move the launch date.",
    "Build the ARC team as early as possible in Pre-Launch — recruiting and onboarding readers takes longer than it looks, and a late start shrinks how many reviews land by launch.",
    "Your target launch date is still tentative — Pen will check in as Pre-Launch approaches to help firm it up."
  ]
}
```

## Integration notes

- **System prompt:** replace the `{{plan_schema}}` placeholder in the Book Coach AI system prompt with this schema, and instruct the model to return **only** a JSON object conforming to it (no prose) in Plan Generation mode.
- **Validation:** the create pipeline should validate the emitted object against the schema before instantiating, and reject/repair on failure (a retry with the validation error fed back to the model works well).
- **Template branch:** when `source: "template"`, the same schema is emitted, pre-filled from the template with the author's edits applied; set `template_id`.
- **IDs:** `milestone.id` values are the AI's own handles for `depends_on`. The app assigns real primary keys on instantiation.

## Open items to confirm with engineering

- **Dates & timezone:** `due_date` uses calendar dates (`YYYY-MM-DD`); confirm the back-planning service and the author's timezone handling.
- **Genre → milestone library:** the AI needs a per-genre catalog of candidate milestones to draw from (esp. the children's illustration track and print-vs-ebook differences), **plus genre-specific beta-survey templates and genre-specific illustration-density guidance** (folded in from the gap analysis, § 4). That catalog is the template schema this depends on.
- **Budget → provision thresholds:** where the DIY-vs-hire recommendation logic lives (in the model's reasoning vs. a rules service the model is told about); for cover/illustration work this now also factors interior illustration density, not just genre.
- **Repeat-per-chapter milestones:** unresolved — whether to add a first-class schema construct (a milestone that expands into one instance per chapter) versus documenting it in `description` as done here. Affects revision, deep-revision, and copyedit milestones.
- **Versioning:** `schema_version` is `"1.0"`; decide the migration path when V2 adds fields (e.g., audiobook production milestones, marketplace hiring, and — if the repeat-per-chapter question above resolves toward a schema construct — a `milestone.repeat` field).
