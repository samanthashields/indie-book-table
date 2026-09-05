# Author submissions + monthly lineup editor

Two connected pieces: a way for authors to submit a book to The Table, and a set of editor tools for the team to build each month's lineup.

## 1. Author submission flow

A guided form at `/submit` (sign-in required), reachable from a "Submit to The Table" button on The Table and from a book's page in the Workshop.

Steps:
1. **You** — name shown on the listing, pen name, email, Instagram, website, short bio. Pre-filled from the author's profile and remembered for next time.
2. **The book** — title, genre, audience (adult / new adult / young adult / middle grade / picture book), one-line hook, explicit-content flag.
3. **Credits and AI** — editor(s), illustrator(s), cover designer, plus how much AI helped with writing and with art (none / some / significant).
4. **Cover and buying** — cover image upload, eBook and print price, and any number of "where to buy" links (label + URL).
5. **Extras** — awards or reviews, and tags (award winner, school themed, hidden gem, needs love, spicy, pre-order, boxed item).
6. **Review and send** — a preview of exactly how the listing card will look, then submit.

After sending, the author lands on **My submissions**: every book they've sent with its state (submitted, under review, added to the database, removed), the reason if it was removed, an edit button while it's still in review, and a note when it's been picked for an issue.

When the author starts from a book in the Workshop, title, cover, and blurb come in pre-filled and the two records stay linked.

## 2. Monthly lineup editor (admin)

Three new tabs in the existing Admin area.

**Submissions** — inbox of everything authors sent. Filter by state, open a submission, read every field, and set it to under review, added to the database, or removed with a reason.

**Issues** — the month-by-month list. Create a month, set its display name, choose which one is the live issue, and publish or unpublish. Inside an issue:
- **Lineup**: pick books from the approved pool into categories, drag to reorder, mark one spotlight per category and write its blurb, and see how many slots each category has left against its quota.
- **Quotas**: how many books each category should hold this month.
- **Look**: cover headline, tagline, cover image, and a background colour or image per category page.
- **Publish**: publishing makes the issue public on The Table and notifies the featured authors.

**Site copy** — edit the headline and intro text that show on The Table and Journal pages, plus the Journal post editor (write, save as draft, publish).

## Technical notes

- New route files: `src/routes/_authenticated/submit.tsx` (wizard) and `submissions.tsx` (author's list); admin tabs `admin.submissions.tsx`, `admin.issues.tsx`, `admin.issues.$issueId.tsx`, `admin.copy.tsx`, `admin.posts.tsx`, added to the tab list in `admin.tsx`.
- Data goes through the browser Supabase client under existing RLS (matching the current admin pages) into `catalog_authors`, `catalog_books`, `catalog_purchase_links`, `catalog_issues`, `catalog_issue_selections`, `catalog_issue_quotas`, `catalog_issue_themes`, `catalog_issue_page_themes`, `catalog_posts`, `catalog_site_content`. No new tables needed.
- Two small policy additions expected: authors need insert/select on their own `catalog_authors` row via the client, and cover uploads need a public `catalog-covers` storage bucket with owner-write / public-read policies.
- Shared form logic in `src/lib/submission-schema.ts` (Zod) and step components under `src/components/submit/`; admin curation helpers in `src/lib/curation.ts`.
- Publishing an issue writes `published_at` on selections and inserts rows into `notifications` for each featured author with a linked account.
- Styling reuses `PublicShell`, `CatalogBookCard`, and the existing admin tab layout — no new design tokens.
