# Fix the email sender name, and add a logo to the welcome email

Two things: your emails currently arrive from **Book Launchpad**, and the welcome email has no logo at the top.

## 1. Sender name

- Every email the site sends will show **The Indie Book Table** as the sender name: the community-list welcome email, feature-request update notices, and the sign-in emails (confirm your address, team invite, password reset). One consistent name whichever email reaches someone.
- Nothing else changes: same sending address (noreply@indiebooktable.com), same look, wording, subject lines, lists and settings.

## 2. Logo at the top of the welcome email

- The welcome email gets your logo centered at the very top, above the headline, with comfortable spacing — sized so it looks right on phone and desktop, and with sensible alt text for anyone whose email app blocks images.
- On the Admin -> Community list screen, the welcome email panel gains a **Logo** field: a preview of the current logo, an **Upload logo** button, and **Remove** (removing it simply sends the email without a logo). Saved together with the rest of the welcome email settings.
- Starting image: your existing brand logo, so it looks right before you touch anything.
- "Send test to me" includes the logo, so you can check it in your own inbox before saving.

## How you'll check it

Admin -> Community list -> **Send test to me**. The sender should read The Indie Book Table, and your logo should sit centered at the top.

## Technical notes

**Sender name** — one constant, currently `"Book Launchpad"`, in three scaffolded files, all becoming `"The Indie Book Table"`:
- `src/lib/email-templates/send-email.ts` (app emails)
- `src/routes/lovable/email/auth/webhook.ts` (auth emails)
- `src/routes/lovable/email/auth/preview.ts` (dashboard previews)

The name has no punctuation, so the existing `from` format needs no other change. No template, subject, recipient, or data changes. Feature-request email bodies keep their "Author's Workshop" wording — that names a site area, not the sender.

**Logo**
- Email clients need a permanently public absolute URL; the existing `catalog-covers` / book buckets are private signed-URL buckets, so a new public storage bucket `email-assets` is created for this, with admin-only insert/update/delete policies and public read.
- One new settings key, `welcome_email_logo_url`, alongside the existing `welcome_email_*` keys in `catalog_site_content` — handled in `src/lib/welcome-email.server.ts` (`WelcomeEmailSettings`, `WELCOME_DEFAULTS`, `KEYS`, load/save, and the `templateData` passed to `sendTemplateEmail`). No table schema change.
- `src/lib/email-templates/community-welcome.tsx` accepts `logoUrl`, rendering a centered `Img` (max width ~180px, `alt` = site name) in a `Section` above the headline, omitted when absent. Preview data gets a logo so the dashboard preview matches.
- `src/routes/_authenticated/admin.subscribers.tsx`: the `WelcomeForm` type and panel gain the logo field — file input, preview `img`, Remove button — uploading to `email-assets` from the browser with the existing supabase client and storing the returned public URL. Reuses existing Button/Label patterns; no new components or tokens.
- Server-side files deploy on publish, so a republish is needed for the live site.
