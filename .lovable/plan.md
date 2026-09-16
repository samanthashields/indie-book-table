# Community list in the admin panel

Add a "Community list" screen to the admin area so you can see everyone who has signed up, and give you a clean way to get that list into a proper newsletter tool.

## What you'll get

A new **Community list** tab in Admin, next to People, showing:

- Every signup: email, which lists they opted into (community/catalog, blog), and the date they joined
- A count at the top (total, and how many joined in the last 30 days)
- Search by email
- Sort newest first
- Remove a signup (for cleanup or an unsubscribe request by email)
- **Download CSV** — the whole list, or just the current search, ready to import anywhere

Right now there is 1 signup in the list, so the screen will be sparse until more come in.

## About sending emails to the list

This is the one part I can't build the way it sounds. Lovable's built-in email is for one-to-one messages triggered by a person's own action — a confirmation, a password reset, a status update. It deliberately does not support newsletters or any email sent to a list, because mixing campaign mail into the same sending domain damages delivery for your sign-in and notification emails.

So instead of a "send to everyone" button, the plan gives you:

1. **The CSV export above**, which imports directly into a newsletter service (Mailchimp, Kit/ConvertKit, Beehiiv, Buttondown all take this format). You write and send formatted campaigns there, with templates, scheduling, and unsubscribe handled for you.
2. **A welcome email on signup** (optional — say the word and I'll include it): a single branded email sent to each new subscriber the moment they join, confirming they're on the list. That one is a direct response to their action, so it's fine to send from here, and it makes the signup feel finished instead of silent.

If you'd rather wire the app directly to a newsletter service later, that's a separate piece of work and I can do it once you've picked one.

## Technical notes

- New route `src/routes/_authenticated/admin.subscribers.tsx`, registered in the tabs list in `admin.tsx`.
- New `src/lib/admin-subscribers.functions.ts` with `listSubscribers` and `deleteSubscriber` server functions, both using `requireSupabaseAuth` plus the same `assertAdmin` role check used in `admin-people.functions.ts`, and the admin client for reads/deletes on `catalog_subscribers`.
- CSV is generated client-side from the already-loaded rows — no extra endpoint.
- No schema change: `catalog_subscribers` already holds email, both opt-in flags, and `subscribed_at`. Its existing policies stay as they are; access is gated in the server functions.
- UI built from existing admin patterns (card, table, input, button) — no new components or tokens.
