# Pen: your own quick buttons, follow-ups, and step checklists

Three connected changes to make Pen feel like your coach and turn its advice into real work you can tick off.

## 1. A Pen settings page for quick buttons

A new **Pen settings** page (reachable from the Pen sidebar and a small gear in the chat header).

- Buttons are managed **per area**: Overview, My Books, Book cycle, Milestone, Submissions, New book. You pick an area with a tab, then edit that area's buttons.
- Each button has a short label (what you see) and the message it sends to Pen.
- Add, rename, edit the message, delete, drag to reorder.
- Every area starts with the three buttons Pen has today. A "Restore this area's defaults" link puts them back.
- Show/hide toggle per button, so you can quiet one without deleting it.
- Changes appear immediately in every Pen chat for that area.

## 2. Follow-up prompts after each reply

After Pen finishes a reply, up to three short follow-up chips appear beneath it, drawn from what you were just talking about and from your real plan — for example "Where's the draft at?", "What's my budget for this?", "Is my launch date still realistic?".

- Tapping a chip sends it as your next message.
- Chips only appear under the most recent reply and disappear once you send something.
- Pen only suggests follow-ups it can actually help with; it never invents a date, book or milestone that isn't yours.

## 3. Turn Pen's next steps into a milestone checklist

When a reply contains a list of next steps, a **"Add these as a checklist"** button appears under it.

- A small panel opens with each step as an editable line: change the wording, remove a step, add one of your own.
- The milestone is preselected — the one Pen cited, or the one you're on — and you can switch it to any open milestone on your shelf.
- Each saved item keeps the reference Pen cited (a milestone, a book, or a help article) as a small chip, so you can jump straight to it later.

On the milestone page a new **Checklist** section shows those items: tick them off, rename, reorder by dragging, delete, and add your own items by hand. A small "3 of 5 done" count sits at the top of the section.

## Technical notes

**New tables** (both with grants + RLS scoped to the owner):

- `pen_quick_actions` — `user_id`, `section`, `label`, `prompt`, `position`, `hidden`, timestamps. Defaults stay in code (`penQuickActions`) and are used whenever a user has no rows for that area; saving writes the full set for that area so ordering is explicit.
- `milestone_checklist_items` — `milestone_id` (FK), `book_id` (FK, for RLS + linking), `label`, `done`, `position`, `ref_kind` (`milestone` | `book` | `article` | null), `ref_book_id`, `ref_milestone_id`, `ref_slug`, `ref_label`, `created_by`, timestamps. RLS reuses `public.is_book_member(book_id)`.

**Files**

- `src/lib/pen-quick-actions.ts` — hooks (`usePenQuickActions`, `useSavePenQuickActions`, `useResetPenQuickActions`) merging DB rows with the built-in defaults per section.
- `src/components/pen/pen-quick-actions.tsx` — reads from the hook rather than the hard-coded arrays; the defaults move into an exported `PEN_DEFAULT_ACTIONS` map keyed by section.
- `src/routes/_authenticated/pen.settings.tsx` — the settings page, one tab per section, drag reorder via existing dnd usage in the codebase (or up/down buttons if no dnd dependency exists yet).
- `src/lib/pen.server.ts` — `penInstructions` gains a follow-up contract: after the optional `References:` line, emit up to three `[[ask|short question]]` tokens using only real context; and a "steps" contract so numbered next steps are easy to split.
- `src/components/pen/pen-references.tsx` — `parsePenMessage` also strips and returns `followUps: string[]` and `steps: string[]` (numbered/bulleted lines from the reply body, kept in the visible text).
- `src/components/pen/pen-chat.tsx` — renders follow-up chips under the last assistant message, plus the "Add these as a checklist" affordance when `steps.length > 1`.
- `src/components/pen/pen-checklist-dialog.tsx` — editable step list + milestone picker (open milestones from `useBooks`/`useBookTree`), writes rows.
- `src/lib/milestone-checklist.ts` — hooks for list/add/update/reorder/toggle/delete.
- `src/components/milestone-body.tsx` — new Checklist section with progress count and reference chips reusing `PenReferenceChips` styling.

Follow-ups and steps are parsed from the same stream Pen already returns, so there is no second AI call and no extra cost per message.
