# Connect PostHog analytics to the site

Track pageviews and visitors across the site with PostHog, so you can see how many people visit, which pages they look at, and (later) build funnels and feature flags from the same tool.

Note: we don't need the `npx @posthog/wizard` command — Lovable has a built-in PostHog connector that supplies your project token directly, so setup is simpler and keeps keys out of the code.

## What you'll get

- PostHog connected to the project (one-time approval card where you pick your PostHog project/region).
- Every page view across the whole site tracked automatically — the coming-soon page, The Table, Journal, and the Workshop.
- Anonymous visitors only — nothing is sent until PostHog is initialized, and no email/name is attached automatically. Signed-in users can be identified later if you want per-user journeys (optional follow-up).
- A place to add custom event tracking later (e.g. "joined mailing list", "started a Book Cycle") — this plan wires in the first one: **mailing list signup** on the coming-soon page.

## Steps

1. **Connect PostHog** via Lovable's connector (an approval card appears for you to pick or create the connection). This provides the project token and region (US/EU) to the app automatically.
2. **Install `posthog-js`** and create a small analytics module (`src/lib/posthog.ts`) that initializes PostHog once in the browser, using the connector-provided token and region. If the token isn't linked yet (e.g. local dev), analytics silently turns itself off — no errors.
3. **Initialize in `src/routes/__root.tsx`** and hook into router navigation so every page view is captured, including client-side route changes (single-page app navigation doesn't reload the page, so this explicit hook matters).
4. **Track the mailing-list signup** on `/unlock` as a custom event so you can measure coming-soon page → signup conversion.
5. **Verify** in the browser: pageviews appear in PostHog's live events, the gate still works, no console errors.
6. **Publish** so tracking goes live on indiebooktable.com.

## Technical details

- Env vars from the connector: `VITE_LOVABLE_CONNECTOR_POSTHOG_API_KEY` and `VITE_LOVABLE_CONNECTOR_POSTHOG_REGION` (browser-safe project token, not a personal API key). Events go directly to PostHog's ingest host (`eu.i.posthog.com` or `us.i.posthog.com`) — no gateway in the loop.
- Init is browser-only (guarded against SSR) and uses `capture_pageview: false` + manual capture on router `onResolved` so SPA navigations are counted once each.
- No cookies/consent banner changes included; PostHog's default cookie-based anonymous ID is used. If you want a consent banner for EU visitors, that's an easy follow-up.
- No changes to the password gate, design, or any existing behavior.
