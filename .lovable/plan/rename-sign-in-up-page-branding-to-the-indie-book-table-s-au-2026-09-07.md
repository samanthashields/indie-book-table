# Rename sign-in/up page branding to "The Indie Book Table's Author's Workshop"

## Goal
Replace the "Book Cycles" brand name on the `/auth` page with the user's requested name: **The Indie Book Table's Author's Workshop**.

## Changes
- Update `src/routes/auth.tsx`:
  - `<title>` and `og:title` from `Sign in — Book Cycles` to `Sign in — The Indie Book Table's Author's Workshop`.
  - Desktop sidebar logo link text from `Book Cycles` to `The Indie Book Table's Author's Workshop`.
  - Mobile header logo link text from `Book Cycles` to `The Indie Book Table's Author's Workshop`.
  - Add layout safeguards (`truncate`, `max-w`, or smaller font clamp) so the longer name doesn't wrap or overflow in the mobile header.

## Out of scope (unless requested)
- Other occurrences of "Book Cycles" elsewhere in the app.
- Email templates or backend copy.

## Verification
- Typecheck passes.
- Preview `/auth` on desktop and mobile widths to confirm the new brand text renders cleanly.
