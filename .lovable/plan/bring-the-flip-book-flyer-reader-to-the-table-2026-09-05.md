# Bring the flip-book flyer reader to The Table

The original Indie Book Showcase rendered each published issue as a page-turning, county-fair-style flyer. We rebuilt issue pages as ordinary web pages; this brings the flyer experience back as the way readers browse an issue on The Table.

## What readers get

- Each published issue on The Table opens as a **flip-book**: a cover page (issue headline, tagline, art), then one page per category, plus a full-page spotlight feature where one is set.
- **Page turning** with corner-turn buttons, page dots/labels, and keyboard arrows; works on mobile with swipe.
- Pages keep the flyer personality: category ribbon headers, price pills, tag chips, icon legend, decorative doodles, and per-page background colour/image from the issue's "Look" settings (already editable in Admin → Issues).
- Books on a flyer page link out to the existing book detail page; the regular category listing pages stay as-is for SEO and deep linking.

## What we bring over (adapted)

From the showcase snapshot, adapted to this project's design tokens and catalog loader:

- `FlyerReader`, `FlyerPage`, `PageTurner`, `PageNav/CornerTurn` — the reader shell and page rendering
- `CategoryRibbon`, `PricePill`, `TagChips`, `IconLegend`, `Doodles`, `SpotlightFeature`, `ListingRow`, `Callout` — flyer page furniture
- `flyer-theme.ts` / `flyer-tags.ts` — per-page theme resolution and tag/icon mapping
- The `flyer-art` image proxy route (`/api/public/flyer-art/$`) so private bucket art renders on public pages

## What we deliberately leave out (per your choice)

- Wishlist circling and the subscribe gate modal
- Mission page, release gate, recovery emails, transactional emails, admin direct book entry

## Where it lives

- New route `src/routes/table.$issueId.flyer.tsx` — the flyer view of an issue
- The issue page on The Table gets a prominent "Read the flyer" entry point, and the flyer links back to the standard pages
- New components under `src/components/site/flyer/` (copying from the snapshot, restyled to our soft editorial palette rather than the original fair-ink theme, keeping the playful flyer feel)
- Admin "Look" tab already stores per-category background colour/image; the flyer reads those via the existing issue theme loader (extended to include page themes if needed)

## Technical notes

- Data comes from the existing `getIssueCatalog` server function; page themes may need `catalog_issue_page_themes` added to the loader select.
- Flyer art storage: create a private `flyer-art` bucket and the read-only proxy route so art URLs are stable and cacheable.
- All reader state (current page) is client-side; no schema changes expected beyond the art bucket.
- Verify: build passes, flyer flips through a seeded issue on desktop and mobile, cover art loads through the proxy, deep links to `/table/:issueId` still work.
