# Fix the sender name on your emails

Your community-list welcome email arrives from **Book Launchpad** — a leftover name from when the email templates were first set up. It should read **The Indie Book Table**.

## What changes

- Every email the site sends shows "The Indie Book Table" as the sender name. That means the community-list welcome email, feature-request update notices, and the sign-in emails (confirm your address, team invite, password reset) — so a recipient sees one consistent name no matter which email reaches them.
- Nothing else about the emails changes: same sending address (noreply@indiebooktable.com), same look, same wording, same subject lines, same lists and settings.

## How you'll check it

Admin -> Community list -> **Send test to me**, then look at the sender name in your inbox. It should say The Indie Book Table. A password-reset email will show the new name too.

## Technical notes

- The name lives in one constant in each of three scaffolded files, currently set to `"Book Launchpad"`:
  - `src/lib/email-templates/send-email.ts` — the app-email sender (welcome email, feature-request updates)
  - `src/routes/lovable/email/auth/webhook.ts` — the auth-email sender (confirm, invite, magic link, reset, email change)
  - `src/routes/lovable/email/auth/preview.ts` — the in-dashboard email previews, so what you see there matches what people receive
- All three become `"The Indie Book Table"`. The name has no punctuation, so the existing sender format needs no other adjustment.
- No template, subject, body, or recipient changes, and no database or settings changes. Feature-request emails keep their current body wording ("Author's Workshop"), which refers to the area of the site rather than the sender.
- These are server-side files, so they go live with the app on publish — a republish is needed for the live site to use the new name.
