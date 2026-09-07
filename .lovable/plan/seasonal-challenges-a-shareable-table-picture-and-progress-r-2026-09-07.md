# Seasonal challenges, a shareable table picture, and progress rings

Three additions that build on My Table and My Books.

## 1. Seasonal challenges you set yourself

A new **Challenges** section on My Table showing the challenges running this month:

- Each challenge shows its name, a short line of encouragement, a progress bar (for example "1 of 2 cycles finished"), the dates it runs between, and the decoration it unlocks.
- When you hit the goal, the challenge card flips to "Complete", confetti fires once, and the decoration is added to your table for good.
- Completed challenges move to a quiet "Earned this year" strip below.

You create the challenges from a new **Admin > Challenges** page: name, description, the month it runs, what counts (cycles finished, books published, milestones completed, or a book accepted into an issue), how many are needed, and which decoration it unlocks. You can turn one off without deleting it.

Decorations are a fixed set of illustrated objects that appear on the writing table — a brass lamp, a stack of read books, a cup of tea, a potted plant, a typewriter, a cat, a framed award, fairy lights. Each decoration sits in a set spot on the desk so the scene always looks right, and hovering one says which challenge earned it.

## 2. Share a picture of your table

A **Share** button above the table with two choices:

- **Download picture** — saves a clean image of your table: the desk scene, your decorations, your published book covers, your name and the count of books published, with a small "The Indie Book Table" mark in the corner. Sized for posting (1200 x 630).
- **Get a link** — makes that same picture available at a public web address you can paste anywhere. The page shows the picture, your author name, and a link back to the site. You can refresh the link (making a new picture from your latest table) or remove it entirely from the same menu.

Only the picture is shared — no account details, and nothing is public until you press the button.

## 3. Progress ring on each book card

On My Books, the flat progress bar on each card becomes a circular ring around the phase mark, showing the percentage of the current cycle's steps completed, coloured by the phase you're in. Under it: the phase name and "4 of 11 steps". The list view keeps its bar (a ring would crowd the row) but gains the same phase label. Books without a cycle show no ring.

## Technical notes

- **Data**: new `challenges` table (title, blurb, month, metric, target, decoration_key, active) — admin-managed, readable by all signed-in users. New `challenge_completions` (user_id, challenge_id, completed_at, decoration_key) with RLS scoped to `auth.uid()`; a row is written by a server function that re-counts the metric server-side, so completion can't be faked from the browser. New `table_shares` (user_id, slug, image_path, created_at) with a public read policy on the slug.
- **Metrics** reuse existing data: cycles finished = `books.status = 'complete'`; books published = `books.shelf_status = 'published'`; milestones completed = `milestones.status = 'Complete'` within the month; featured = `catalog_issue_selections` joined via `catalog_books`. Counting is scoped to the challenge's month.
- **Decorations**: one generated PNG per decoration with transparent background in `src/assets/decorations/`, positioned absolutely over the existing desk image in `author-table.tsx` via a small `DECORATION_SLOTS` map (percentage coordinates + z-order).
- **Image export**: `html-to-image` (`toPng`) against a dedicated off-screen `ShareCard` component at fixed 1200x630 using design tokens — not a screenshot of the live page. Book covers are fetched as blobs and inlined first so signed URLs don't break the render. Download uses a blob anchor.
- **Public link**: the PNG is uploaded to a new public `table-shares` bucket via a `createServerFn` with `requireSupabaseAuth`; a public SSR route `src/routes/shelf.$slug.tsx` loads the row through a public server fn and renders the image with `og:image` / `twitter:image` set to the absolute bucket URL. Regenerating overwrites the same path; removing deletes the row and the object.
- **Progress ring**: new `src/components/progress-ring.tsx` (SVG circle, `stroke-dasharray`, `currentColor` so `phaseStyle(...).dot` colours it, reduced-motion-safe). Wired into the grid card in `src/routes/_authenticated/index.tsx`; `BookSummary` gains `stepsDone` / `stepsTotal` / `phaseKey` derived in `summarize()` in `src/lib/book-db.ts` from milestones already loaded there — no extra queries.
- **New route** `src/routes/_authenticated/admin.challenges.tsx` plus a nav entry alongside the other admin pages; `src/lib/challenges.ts` holds the shared types, hooks and metric definitions.
