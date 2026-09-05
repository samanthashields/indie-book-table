# One look, one set of rules: unify The Table with Book Cycles

Two things to fix: the "This area is for the Book Cycles team" wall you keep hitting, and the borrowed look of everything that came over from the Indie Table.

## 1. Access

What's true today: the admin area only opens for accounts marked as admins. Of the demo logins, only `admin@bookcycles.test` is an admin — `author@bookcycles.test` and `collab@bookcycles.test` are not, so they see that message. Your own account is an admin.

Changes:
- Make the wall honest and useful: show which account is signed in, what it can do, and a link back to the workshop plus a "switch account" action — instead of a dead end.
- While your account is still being checked, keep showing "Checking your access…" rather than briefly flashing the wall.
- Add an admin badge in the sidebar so it's obvious when you're on an account that has the admin area.
- Everything else (The Table, Journal, Mission, submitting a book, My Submissions) stays open to any signed-in author — I'll walk each page signed in as the author demo to confirm nothing else is walled off, and fix anything that is.

If you were hitting the wall while signed in as the admin demo, that's a real bug and the walk-through will surface it; the fix then is to make the role check re-run once your session is fully loaded.

## 2. One design across the whole product

The Table, the Journal, the Mission page, the submission form and the admin panels each picked up flyer-style habits from the old project: tiny all-caps labels, heavy outlined boxes, hand-drawn ribbons and pill buttons that don't match the workshop screens.

- **Public pages** (The Table archive, an issue, a book, an author shelf, the Journal, Mission): rebuild them on the same cards, headings, buttons and spacing as the workshop — serif headings, normal-case labels, soft rounded cards, the standard button styles. Keep the palette (amber, leaf, teal, paper, ink blue, cocoa) as accents only.
- **Admin panels** (Dashboard, Submissions, Issues, Journal & copy, People, Templates, Activity): move to the shared page heading, cards, tables, form fields, buttons and status pills used elsewhere in the workshop, so the tabs stop looking like a different tool.
- **Submission form**: same step indicator, field styling and buttons as the Create Book Cycle flow.
- **Public header/footer**: match the workshop's header — same logo lockup, type scale and spacing.
- **The flip-book flyer stays as-is.** It's meant to look like a printed flyer; that's the one place the playful treatment belongs. It keeps its own styling but gets the workshop's buttons for Back/Next and the tear-off strip.

## 3. Check

Walk the whole product on desktop and mobile, signed in as both the author demo and the admin demo, and compare each screen against the workshop pages for type, colour and spacing.

## Technical notes

- Replace bespoke classes in `src/components/site/**` (excluding `flyer/`), `src/routes/table.*`, `journal.*`, `mission.tsx`, `src/components/submit/`, and `src/routes/_authenticated/admin.*` with the shared shadcn primitives (`Card`, `Button`, `Input`, `Table`, `Badge`) and `PageHeading` / `StatusPill`.
- Remove one-off `text-[0.6rem]`, `uppercase tracking-[…]`, `panel-outline-thin` and inline hex usage outside the flyer; keep semantic tokens.
- No schema or data changes.
