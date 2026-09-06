# The Table: a real front page, an Issues page, and clearer admin controls

## 1. Reviewing a submission: database and issue, separately

Right now a book under review can only be added to the database as a side effect of picking it for an issue. Instead, an under-review book gets two independent actions:

- **Add to the database** — moves it into the database on its own, ready for any future issue.
- **Select to feature in an issue** — pick the issue and section; if the book isn't in the database yet, adding it to an issue puts it there too.

Both stay available while the book is under review, so an editor can do either, or both.

## 2. Admin > Issues: pick an older issue, and preview it

- A dropdown at the top of the page lists every issue, newest first, with its draft/published state — quicker than scrolling the side list, which stays for browsing.
- A **Preview** button opens the issue exactly as a reader sees it, in a new tab. Draft issues open in preview too (visible to admins only), so an issue can be checked before it is published.

## 3. Issues gets its own page

Everything currently on The Table page — the current issue, the spotlight, and the archive of past issues — moves to a new **Issues** page at `/issues`. Old links to `/table` keep working, and "Issues" is added to the public navigation and the footer.

## 4. The Table becomes an inviting front page

A new landing page at `/table`:

- A warm hero with an editable headline, sub-headline and a hero image, plus a "Read this month's issue" button.
- A picture strip of two or three supporting images.
- Sections built from the site words that aren't on the mission page today — the welcome line, the invitation to submit a book, and a short "how it works" trio — each with its own image slot.
- A teaser card for the current issue linking through to the new Issues page.

All headings, paragraphs and images here are editable by an admin; sensible defaults ship with the page so it never looks empty.

## 5. The mission page gets images and more to customise

Adds an editable hero image, an optional second image between the story and the quotes, and editable labels for the quote block, alongside the existing headline, body and taglines.

## 6. Admin: three separate sections instead of one "Site words"

The single Site words tab is split so each page is edited on its own:

- **Table homepage** — hero words and images, the invitation sections, the picture strip.
- **Mission page** — headline, story, quotes, images.
- **Other site words** — journal and submission copy that doesn't belong to either page.

Each field is labelled in plain English (not raw key names), and image fields have an upload button with a live thumbnail.

## Technical notes

- New public storage bucket `site-images` for hero/section images, so unauthenticated visitors load them without signed URLs. Image fields store the public URL in `catalog_site_content`.
- New copy keys, all defaulted in code: `table.home.hero.title|subtitle|cta|image`, `table.home.strip.image1|2|3`, `table.home.welcome.title|body|image`, `table.home.submit.title|body`, `table.home.steps.1|2|3`, `mission.hero.image`, `mission.mid.image`, `mission.quotes.title`.
- Routes: new `src/routes/issues.index.tsx` (moved content from `table.index.tsx`), rewritten `src/routes/table.index.tsx` as the landing page. `/table/$issueId` and the flyer keep their paths. `PublicShell` nav/footer gains Issues.
- Draft preview: the reader issue fetch gains an admin path (authenticated server function) so `/table/$issueId` renders drafts for admins only; anonymous visitors still get published issues only.
- Admin tabs: `Site words` replaced with `Table homepage`, `Mission page`, `Site words`; new route files under `src/routes/_authenticated/`.
- A small `SiteCopyField` component (text / long text / image upload) shared by the three admin sections.
- Generated placeholder hero art committed under `src/assets/` as the shipped defaults.
