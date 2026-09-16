# Community list in the admin panel

Add a "Community list" screen to the admin area so you can see everyone who has signed up, export the list, and edit the welcome email new subscribers receive.

## What you'll get

A new **Community list** tab in Admin, next to People, with two parts.

### 1. The list

- Every signup: email, which lists they opted into (community/catalog, blog), and the date they joined
- Counts at the top (total, and how many joined in the last 30 days)
- Search by email, newest first
- Remove a signup (for cleanup or an unsubscribe request by email)
- **Download CSV** — the whole list, or just the current search, ready to import into any newsletter tool

Right now there is 1 signup, so the screen will be sparse until more come in.

### 2. Welcome email you control

Each new subscriber gets one branded welcome email the moment they join. You edit it from the same admin screen:

- Subject line
- Headline
- Body message (a few paragraphs, plain text with line breaks)
- Optional button label and link
- On/off switch, so you can pause it
- **Send test to me** — fires the current draft to your own address so you can see it before saving

Sending is best-effort: if the email fails, the signup is still saved and the visitor still sees "You're on the list."

## About bulk emails to the whole list

The welcome email works because it answers one person's own action. Sending a campaign to everyone on the list is a different thing, and Lovable's email service deliberately doesn't do newsletters or list sends — mixing campaign mail into the same sending domain damages delivery for your sign-in and notification emails.

So for actual updates and announcements, use the CSV export into a newsletter service (Mailchimp, Kit, Beehiiv, Buttondown all import this format), where templates, scheduling, and unsubscribes are handled for you. If you later pick one, I can wire signups to sync into it automatically.

## Technical notes

- New route `src/routes/_authenticated/admin.subscribers.tsx`, added to the tabs list in `admin.tsx`.
- New `src/lib/admin-subscribers.functions.ts`: `listSubscribers`, `deleteSubscriber`, `getWelcomeEmailSettings`, `saveWelcomeEmailSettings`, `sendWelcomeEmailTest` — all behind `requireSupabaseAuth` plus the same `assertAdmin` role check used in `admin-people.functions.ts`, using the admin client for `catalog_subscribers`.
- Welcome-email settings stored as keys in the existing `catalog_site_content` table (`welcome_email_enabled`, `_subject`, `_headline`, `_body`, `_cta_label`, `_cta_url`) — no schema change, and the admin-only write policy already exists.
- New template `src/lib/email-templates/community-welcome.tsx` registered in `registry.ts`, styled from the existing templates; content comes in as props from the saved settings.
- `subscribeEmail` in `catalog.functions.ts` calls `sendTemplateEmail('community-welcome', …)` after the upsert, wrapped in try/catch, with an idempotency key derived from the email so re-signups don't double-send. It only sends for genuinely new rows.
- CSV generated client-side from loaded rows; no extra endpoint.
- UI built from existing admin card/table/input/button patterns — no new components or tokens.

# Team access (admin accounts)

Roles are currently visible on the People screen but can't be changed there. Add both ways to give someone on your team admin access.

## What you'll get

On the **People** screen, for each person:

- An **Admin** toggle that grants or removes admin access immediately, with the row showing the change right away
- A safety rule: you can't remove your own admin access, and the last remaining admin can't be removed

And a new **Invite admin** button at the top:

- Enter a name and email, send the invite
- They get an email inviting them to set a password and sign in
- Their account is created with admin access already granted, so they land in the admin area on first sign-in
- If the email already belongs to an existing account, it promotes that account instead of erroring

## Technical notes

- Two new server functions in `src/lib/admin-people.functions.ts`, both behind `requireSupabaseAuth` + `assertAdmin`:
  - `setPersonRole({ userId, role: 'admin', enabled })` — inserts/deletes in `user_roles` via the admin client, with a guard rejecting self-demotion and last-admin removal.
  - `inviteAdmin({ email, displayName })` — `supabaseAdmin.auth.admin.inviteUserByEmail`, then inserts the admin row in `user_roles`; if the user already exists, it skips creation and just grants the role.
- Roles stay in the separate `user_roles` table with the existing `has_role` security-definer function; nothing is stored on profiles.
- The invite email uses the existing auth invite template (`src/lib/email-templates/invite.tsx`), so it's already branded.
- UI: a switch in each People row plus a small invite dialog, built from existing components.
