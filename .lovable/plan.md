# The flyer becomes a block-built magazine (steps 1 and 2)

Turning the flyer from one repeating card template into a set of distinct layout blocks, plus the brand and design fixes that go with it. The admin block builder comes after you have seen this working.

## What changes for a reader

- Every issue in the flyer — old and new — is rendered through the new block system, so nothing is left on the old template.
- Sections no longer look identical: each one gets its own accent colour from the existing palette and one of three banner shapes (rounded, torn/wavy edge, angled ribbon).
- Real cover art does the visual work. The grey placeholder is gone; a book with no cover yet gets a clean titled panel instead.
- Badges become stickers: small, slightly rotated, with a soft shadow, sitting on the corner of the cover instead of as text pills under the title.
- A spotlight pick gets a full hero page: large cover, title, author, one hook line, one or two stickers on the cover.
- Grids can mix card sizes — one larger card beside two or three standard ones — instead of always being an even grid.
- An author with several books in one section can be shown as a fanned-out set of covers with a shared heading.
- A featured-author page: round photo, name and a short blurb.
- Circling books, prices, retailer links and page turning all keep working exactly as they do now, on phone and desktop, including keyboard arrows and alt text on covers.

## Brand fix

"The Indie Book Table" becomes **The Indie Table** everywhere it appears: site header, the sign-in page, the shared writing-table page and its page title, and the share card.

## How existing issues get converted

Rather than asking you to rebuild past issues by hand, each issue's existing content is translated into blocks automatically when it renders:

- Issue cover → cover block, with a new banner shape.
- Each section → section banner block with its own accent, followed by a grid block.
- A section's spotlight pick → hero block instead of a grid card.
- A section with a single book → hero block, so it never reads as a lonely grid.
- Two or more books by one author in a section → fan-out block.

August 2026 lands on the layout in your brief through these rules. The one block with no existing data — the closing "notes from the team" page — is added with the admin builder in the next step, since there is nowhere to type it today.

## Technical notes

- New `src/lib/flyer-blocks.ts`: a `FlyerBlock` union (cover, section banner, hero, grid, fan-out, author spotlight, personality) plus a `buildBlocks(issue)` deriver from `CatalogIssue`. No schema change in this step; the block-picker step later persists an explicit block list and falls back to the deriver.
- Extend `src/lib/flyer-theme.ts` with a `BannerShape` type (`rounded | torn | ribbon`) and per-section accent assignment; keep every value a token-based class, no raw hex.
- New components under `src/components/site/flyer/blocks/`: `section-banner.tsx`, `hero-block.tsx`, `grid-block.tsx`, `fan-out-block.tsx`, `author-block.tsx`. `category-ribbon.tsx` folds into `section-banner.tsx`.
- New `src/components/site/flyer/sticker.tsx` replacing inline `TagChips` on cards (legend keeps the existing chips).
- `listing-row.tsx` gains a `size` prop (`standard | large`) for mixed grids and drops the placeholder branch in favour of the titled empty state.
- `flyer-reader.tsx` swaps its `FlyerPageSpec` list for `buildBlocks(...)` and renders per block type; wishlist, gate modal, swipe and keyboard handling stay as-is.
- Banner shapes via CSS clip-path utilities added to `src/styles.css` alongside the existing poster utilities.
