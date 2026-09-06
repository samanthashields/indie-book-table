# Workshop polish: templates, book status, admin tools, magazine flyer

A batch of fixes and upgrades across the author side and the admin panel.

## 1. Templates: broken buttons

Confirmed cause: the Templates list page is also acting as the parent of its own sub-pages, and it never leaves room for them to appear. So "New template", "Preview" and "Edit" change the address but show nothing. Fix by making the list a proper index page so preview and editor pages render.

## 2. Book status

Add a status choice to the "Add a book" form and to Book Cycle details:
One Day Book Idea, Book Being Written, Ready for Illustrations, Ready to Publish, Published, Blocked / On-Hold. Shown as a chip on My Books cards and rows. Requires a small database change (a new status field on books, defaulting to "One Day Book Idea").

## 3. Back button on every page

Add a shared back control into the page heading used across the app, so every inner page (book cycle, details, milestone, template, submissions, admin tabs, public pages) has a consistent way back.

## 4. Flyer looks like a magazine

- Editorial cover: full-bleed art, masthead, issue line, cover blurbs.
- Category pages get a magazine grid: section header with rule and folio, two/three column listings, drop-capped spotlight feature with pull quote, running header and page folio at the foot of each sheet.
- Richer paper: deeper shadow, subtle gutter shading, refined type scale and spacing.
- The "Turn" corner is pinned to the bottom-right of the sheet itself (it currently sits at the end of the content, so it floats mid-page).

## 5. Admin submissions workflow

Once a submission is marked Under review, the primary button becomes "Select to feature in issue" (opens the issue/section picker and adds it to the database in one step) instead of a separate "Add to the database".

## 6. Site Words becomes its own admin section

Split "Journal & copy" into two tabs: "Journal" and "Site words".

## 7. Journal admin rework

- "All posts" list moves to the top, with an "Add new post" button.
- Post writing moves to its own page (`/admin/journal/new` and `/admin/journal/:id`).
- Cover/inline image upload to the existing covers storage.
- Basic formatting toolbar for the post body (bold, italic, headings, lists, links, quote) with markdown stored and rendered on the public journal pages.

## 8. Admin > People: edit and reset password

Admin can edit display name, pen name and email, and send a password reset (or set a temporary password). Handled by a secure admin-only server action; the current suspend and plan controls stay.

## 9. Rename sidebar title

"Book Cycles" in the left nav becomes "Author's Workshop".

## 10. My Books: grid view

Add a list/grid toggle (remembered per user) with cover-forward cards showing title, author, status chip, progress and the same actions menu.

## Technical notes

- Rename `src/routes/_authenticated/templates.tsx` to `templates.index.tsx` so `/templates/$templateId` and `/templates/mine/$templateId` render.
- Migration: `ALTER TABLE public.books ADD COLUMN shelf_status text NOT NULL DEFAULT 'idea'` with a check constraint for the six values; wired through `book-db.ts`, add/details forms and My Books.
- New `BackLink`/`PageHeading back` prop used across routes.
- Journal: new admin routes plus markdown rendering; images via the existing `catalog-covers` bucket helpers.
- People: `admin.functions.ts` server fn using the admin auth API (role-checked first) for profile edits and password reset links.
- Flyer changes stay in `src/components/site/flyer/*` and `flyer-theme.ts`; `CornerTurn` moves into `FlyerPage`'s sheet container.
