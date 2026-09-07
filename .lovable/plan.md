# Celebrating finished books: confetti and the Author's Table

Give authors a real moment of reward when a book cycle ends in a published book, and a place they can visit to see everything they've finished.

## 1. Confetti at the finish line

When an author ends a book cycle and answers "Yes" to "Was this book published?", a burst of confetti plays over a short congratulations panel before the app moves on to the reflection page. The panel names the book, says how many books they've now published, and offers two buttons: "See my table" and "Go to reflection".

If the cycle ended without publishing, no confetti — instead a warm, quiet message that the work still counts, with a link to the reflection.

Confetti respects the "reduce motion" setting on the device: those users get the congratulations panel without the animation.

## 2. The Author's Table

A new page, "My Table", in the left menu. It shows an illustrated writing table — desk surface, lamp, notebook — with every published book laid out on it as its cover (a nice fallback cover when there's no image). Hovering or tapping a book shows its title and the month it was published.

- Empty state: a bare table with a gentle line about the first book that will land here, plus a button to start a book cycle.
- The table grows: books stack in rows and the desk scene scales so five or fifty books both look right.
- Below the table: a short summary line — books published, book cycles completed, and the current year's count.

A small "See my table" link also appears on My Books once at least one book is published.

## 3. Milestones and badges (the other gamification ideas)

A row of earned badges sits under the table. Each is quiet and honest — earned by doing the real work, not by logging in:

- First Book Published
- Finished a Cycle (completed a cycle, published or not)
- Shelf of Three / Shelf of Ten (3 and 10 published)
- On Time (published on or before the target date)
- Featured at The Table (a book accepted into an issue)
- Steady Hand (all milestones in a phase completed)

Badges show locked as faded outlines with a one-line hint on how to earn them, so there's always a visible next goal. Earning one shows a small toast at the moment it happens.

Other ideas worth considering later (not in this build): a per-cycle progress ring on My Books, a streak of weeks with a completed milestone, and a shareable image of the table.

## Technical notes

- **Confetti**: add `canvas-confetti` (small, no native deps). Fire from `src/components/end-cycle-dialog.tsx` after the successful `updateBook` mutation, only when `completed && published === true`. Replace the immediate `navigate` with an in-dialog success state; navigation happens on button press. Gate the animation on `window.matchMedia("(prefers-reduced-motion: reduce)")`.
- **Data**: no schema changes needed for the table itself — published books are `books.shelf_status = 'published'` with `cover_url`; completed cycles are `books.status = 'complete'`; publication month comes from `reflections.completed_at` (fall back to `books.updated_at`), and `target_publication_date` powers the "On Time" badge. "Featured at The Table" reads existing `catalog_issue_selections` joined through `catalog_books`.
- **New route**: `src/routes/_authenticated/table.mine.tsx` at `/my-table` (avoids the public `/table` routes), with its own `head()` metadata. Add a "My Table" nav item with the `Trophy` icon in `src/components/app-shell.tsx`.
- **New lib**: `src/lib/achievements.ts` — a `useAchievements()` hook deriving published books, counts, and earned/locked badges from the existing `useBooks()` query plus one query for reflections and one for catalog selections. Pure derivation, no new tables.
- **New components**: `src/components/achievements/author-table.tsx` (the desk scene; CSS/SVG desk plus `BookCover` for each spine/cover, using existing design tokens — no hardcoded colors) and `src/components/achievements/badge-grid.tsx`.
- **Badge toasts**: earned badge ids are cached in `localStorage`; on load, any newly earned id that isn't cached fires a `sonner` toast and is added. Keeps it stateless server-side.
- One desk-scene background illustration will be generated as an image asset in the project's warm paper palette.
