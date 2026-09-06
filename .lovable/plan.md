# My Submissions — polish the tracking hub

A "My Submissions" page already exists (sidebar → My Submissions, at `/submissions`) and shows every book you've sent to The Table with its status, spotlight badge, removal notes, and the issues it was featured in. This plan tightens it into the tracking hub you described and connects it visibly to your My Books library.

## What stays

- The submission wizard (`/submit`) and its six-step flow.
- Each book card on My Submissions: status pill (Submitted / Under review / Added to the database / Removed), spotlight badge, hook, removal reason, "Featured in …" line, Edit details and View at The Table actions.

## Changes

1. **My Books ↔ Submissions link (both directions).**
   - On My Books, any book already sent to The Table shows a small status chip (e.g. "At The Table · Under review") that links straight to My Submissions.
   - The kebab action "Send to The Table" becomes "View submission" once a book has been submitted, so you can't accidentally submit the same book twice.
   - On My Submissions, a book linked to your library gets a "Open in My Books" shortcut.

2. **Clearer tracking on My Submissions.**
   - Each card shows the date submitted and a simple timeline line: Submitted → Under review → In the database → Featured in an issue (current step highlighted).
   - Selections in unpublished (draft) issues show as "Picked for an upcoming issue" instead of being invisible until publish day.

3. **Empty state** already points to the wizard; keep it, plus a secondary link to pick a book from My Books first.

## Technical notes

- No database changes needed: `catalog_books.book_cycle_id` already links a submission to its My Books row, and the existing RLS policies cover the reads.
- `src/lib/catalog-submit.ts`: extend the submissions query to include draft-issue selections (already selected; just rendered differently).
- `src/routes/_authenticated/index.tsx` (My Books): fetch this user's submissions and join on `book_cycle_id` for the chip/kebab swap.
- `src/routes/_authenticated/submissions.tsx`: timeline line, "Open in My Books" action, updated selection wording.
