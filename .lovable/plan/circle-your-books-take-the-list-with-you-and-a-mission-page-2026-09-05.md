# Circle your books, take the list with you, and a Mission page

Bring back the reader-facing parts of the Indie Table that never made the move: circling books while reading the flyer, a tear-off list you can keep, and the "why we exist" page.

## 1. Circling books in the flyer

- Every book on a flyer page (listing rows and spotlight features) gets a circle button. Circling draws the hand-drawn ring on the cover, just like the original.
- Circled books collect in a tear-off strip pinned to the bottom of the flyer: a count, the titles, and a "Clear list" button.
- The list lives in the reader's browser for the visit — no reader accounts, nothing stored on our side unless they choose to send it.

## 2. The free-subscription nudge

- The first time someone taps to circle a book, a coupon-style pop-up appears: "Want to take your list with you?" with an email field and two checkboxes (monthly catalog, journal posts).
- Subscribing unlocks circling and is remembered in that browser. Reading the flyer is never gated.
- "Keep browsing" closes it and leaves the flyer fully readable.
- This reuses the subscribe handling that already exists in this project.

## 3. Take the list with you

The tear-off strip gets two ways to keep the list:

- **Copy / print** — always available: a clean printable order slip with title, author, and prices, plus a one-tap copy of the list.
- **Email it to me** — sends the circled list to the subscriber's own address, at most once every few minutes per address (a small send log guards against abuse).

Emailing requires a sending domain to be connected to the project first; none is set up yet. If you'd rather not connect a domain right now, we build the copy/print slip only and add the email button later — the button simply won't appear until email is on.

## 4. Mission page

- A new public page at `/mission` with a headline, mission statement, and the hand-written taglines, all editable.
- Linked from the public header and footer next to The Table and Journal.
- The wording lives with the rest of the site copy so it can be edited in the admin "Journal & copy" tab.

## 5. Small related pieces

- Book cards on the ordinary (non-flyer) issue pages get the same circle behaviour, so the list follows the reader across both views.
- Icon/format legend already exists in the flyer; the circle action is added to it so readers know what the ring means.

## Technical notes

- New `useWishlist` hook (browser storage, per-visit list of book ids) and a `useWishlistGate` hook (`localStorage` flag set after a successful subscribe), mirroring the original `wishlist-gate.ts`.
- `WishlistBar`, `SubscribeGateModal`, and a `circled` / `onToggleCircle` prop threaded through `listing-row.tsx`, `spotlight-feature.tsx`, `flyer-reader.tsx`, and `catalog-book-card.tsx`; styling uses our palette tokens (amber, clay, cocoa, paper), not the old `fair-*` tokens.
- Existing `subscribeEmail` server function in `src/lib/catalog.functions.ts` powers the gate — no schema change needed for subscribing.
- Send-to-self: new server function that validates the email is a known subscriber, rate-limits against the existing `catalog_wishlist_send_log` table (which is already in the database and currently unused), writes a log row, and sends a React Email template. Requires `email_domain--scaffold_transactional_email_templates` after a domain is verified. A migration adds the `service_role` grant if missing.
- Mission copy: migration seeding `mission.headline`, `mission.body`, `mission.taglines` into `catalog_site_content`, plus those keys in the admin copy editor; new `src/routes/mission.tsx` loading site copy through the existing `getSiteCopy` server function, with its own head metadata.
