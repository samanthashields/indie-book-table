# Mobile tidy-up: My Books view, Pen button, template cards, site header name, clickable "What's new"

Six small fixes from the mobile review.

## Changes

1. **My Books — drop the list/grid toggle on mobile**
   - On phone widths the books always show as a simple stacked list; the list/grid switcher only appears on larger screens where both views fit.
   - The remembered view preference still applies on desktop, so nothing changes for big screens.

2. **Pen floating button — icon only**
   - The floating "Ask Pen" pill shrinks to a round icon button (Pen image only), keeping its position at the bottom-right. Saves space on every screen size.
   - The open chat window itself stays as is.

3. **Templates page — smaller images, readable details**
   - Each genre-template card's cover image gets smaller (fixed modest width on desktop, shorter strip on mobile) instead of stretching full height.
   - The details panel changes from the tinted amber/teal background to a plain white card background so the text is easier to read.

4. **Public header name — "The Indie Book Table" everywhere**
   - The top-left header title on the Mission, Journal, and Issues pages changes from "Book Cycles" to "The Indie Book Table", matching the Table pages. (This is a one-line change to the shared public header, so all public pages show the same name.)

5. **Help Center — clickable "What's new" entries**
   - Each item in the "What's new" strip links to the release notes page so tapping one takes you to the full note.

## Technical details

- `src/routes/_authenticated/index.tsx`: hide the view-toggle `div` below `sm:` (`hidden sm:flex`) and force `BookGroup` view to `"list"` on mobile (e.g. `useIsMobile()` from `src/hooks/use-mobile.tsx`).
- `src/components/pen/pen-launcher.tsx`: remove the "Ask Pen" label span, round the button (`rounded-full size-12 grid place-items-center p-0`).
- `src/routes/_authenticated/templates.index.tsx`: image gets `sm:w-[140px] h-40 sm:h-auto object-cover` instead of `min-h-64 h-full`; details panel class becomes `bg-card p-6`.
- `src/components/site/public-shell.tsx`: `siteTitle` becomes constant `"The Indie Book Table"` (remove the pathname branch).
- `src/routes/_authenticated/help.index.tsx`: wrap each "What's new" `li` content in a `Link to="/help/releases"`.
- Verify with `bunx tsgo --noEmit` and a quick 390px preview check of the affected pages.
