# Make the flyer read like a real flyer: no scrolling to find "Turn"

Today a flyer page can be much taller than the screen, so the Turn corner and the
Back / Next bar sit far below the fold. Long sections get split into shorter pages so
each sheet fits a screen, and the turn controls stay reachable everywhere.

## What changes for the reader

- Long book sections become several shorter numbered pages instead of one very tall one
  ("Cosy Mysteries" becomes "Cosy Mysteries" and "Cosy Mysteries (continued)").
- Each continuation page keeps the same section banner, colour and look, so it still
  reads as one section.
- The page dots and "Page X of Y" count update to match the new page count.
- Same behaviour on phone and desktop, with the phone splitting sooner because less
  fits on a small screen.
- Any page that still runs slightly long keeps a turn control in view rather than only
  at the very bottom.

## How the split works

Each block gets a rough height weight (a hero is tall, a grid row is a few units, a
banner is small). Blocks are packed onto a page until the running weight passes a
budget, then a new page starts. Grid blocks are the main offender, so a grid that is
too long is chopped into several grid blocks of a fixed number of books each before
packing, rather than pushed whole onto its own page.

Two budgets: a smaller one for narrow screens, a larger one for wide screens, chosen
from a viewport check so the split matches what the reader actually sees.

## Technical detail

- `src/lib/flyer-blocks.ts`: add a `paginate(pages, { budget, gridChunk })` pass that
  runs after both `pagesFromStoredBlocks` and the derived `buildPages` path, so saved
  admin layouts and legacy issues both benefit. It splits oversized grid blocks, packs
  blocks by weight, and re-labels overflow pages with a "(continued)" suffix while
  keeping `category` (and therefore page theme) identical.
- Weights live in one small table in that file so they can be tuned in a single place.
- `src/components/site/flyer/flyer-reader.tsx`: pick the budget from a
  `matchMedia('(min-width: 640px)')` value read in an effect (avoids a hydration
  mismatch), pass it into `buildPages`, and keep listing numbers derived from the full
  book list so numbering stays stable across the split.
- Section banners repeat on continuation pages; heroes, fan-outs, author spotlights and
  personality pages are never split.
- `src/components/site/flyer/page-nav.tsx`: when the page count grows past ~12, the dot
  row wraps instead of squeezing; no other change.
- No schema, admin builder or data changes. The admin block builder keeps saving blocks
  exactly as it does now — pagination is a render-time pass only.

## Verification

Playwright against the August 2026 flyer at both 390px and 1280px wide: confirm no page
is taller than the viewport by more than a small margin, that the turn control is
visible without scrolling, and that no console errors appear.
