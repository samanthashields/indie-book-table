# Publish privately behind a "coming soon" password gate

Publish The Indie Book Table to your custom domain, but keep it behind a shared password screen until launch. Anyone who visits sees a branded "we're building this for indie authors — back soon" page; only people you give the password to can enter.

## 1. Coming-soon password screen

- A single unlock page, styled with the existing design system and falcon logo:
  - Headline and short message: we're building a new experience for indie authors and will be back soon.
  - One password field and an Enter button; wrong passwords show a gentle "incorrect password" note.
- Once unlocked, the visitor stays unlocked across pages and refreshes (secure encrypted cookie, 7-day expiry).
- Optional "Lock" affordance not needed — the gate can simply be removed at launch.

## 2. Site-wide gate

- Every page (The Table, Journal, Workshop, sign-in, everything) requires the unlock first.
- The password is checked on the server only — it never ships to the browser — and stored as a server-only secret, not in code.
- Add a `noindex` tag while gated so search engines don't list the site pre-launch.

## 3. Pre-publish fix: /auth hydration error

- The preview is currently logging a React hydration mismatch on the sign-in page. Diagnose and fix before publishing so the published site is clean.

## 4. Publish

- Publish the site; it will serve at your connected custom domains (www.indiebooktable.com) behind the gate.
- Database/backend is already live; this publishes the frontend.

## What I need from you at build time

- The password you want visitors to use (I'll store it as a secure secret — you can change it later).

## At launch (later, one small step)

- Remove the gate page and `noindex`, republish — the site is instantly public.
