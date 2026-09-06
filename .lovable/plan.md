# Help Center, support tickets and release notes

## Already in place from your last list

These five are built and working now, so the plan below only covers what's left:

- Google Drive links can be attached on a milestone's file step
- The milestone drawer opens without darkening the page
- Book details has a cycle start date, and the book cycle page has "End book cycle" with the conditional questions
- Reflections shows an "How this cycle ended" section with those answers
- "My Cycles" sits under "My Books" in the left nav, grouped Not started / In progress / Complete

Two small follow-ups included below: rename that Reflections section to "End of Cycle Details", and decide how far to take Google Drive.

## 1. Help Center for authors

A new "Help Center" item at the bottom of the left nav, with:

- A landing page: search box, article categories, and a "What's new" strip showing the three latest release notes
- Category and article pages. Articles are written by admins, support headings, lists, links and images, and can link to each other — picking a related article from a list adds a "Related articles" block at the bottom, Zendesk style
- A "Release notes" page listing every update newest first, with a date and version label
- "Contact support": a short form (subject, message, optional screenshot) that opens a ticket, plus a "My requests" list where the author sees their tickets, the status, and the back-and-forth with the team

## 2. Admin: Help Center, tickets and release notes

Three new tabs in the admin panel:

- **Help articles** — list, create and edit articles; set a category, publish or keep as draft, upload images, pick related articles
- **Support** — every ticket with its status (New, Open, Waiting on author, Resolved), the full message thread, a reply box, and status change. Authors get a notification when you reply
- **Release notes** — write and publish an entry (title, date, body, optional "highlight" flag) that shows on the author-facing Help Center

## 3. Later: Penny the Book Chat guide

Not part of this build. Once the Help Center is in, we shape the Book Chat into "Penny (Pen)" with in-context prompts across the workshop — I'll plan that separately so it gets proper attention.

## Decision needed: Google Drive

Today you can paste a Drive link on a milestone. Full "Sign in to Google Drive and pick a file" needs a one-time Google sign-in setup on your side. Say the word and I'll add it; otherwise pasting links stays as-is.

## Technical notes

- New tables: `help_articles` (slug, title, category, body, status, related ids), `help_categories`, `release_notes`, `support_tickets` (author, subject, status), `support_messages` (ticket, author/admin, body, attachment). Row-level rules: authors read published articles and notes and only their own tickets and messages; admins manage everything. Grants for `authenticated` and `anon` where public reads apply, plus `service_role`.
- Author routes: `/help`, `/help/$categorySlug`, `/help/$slug`, `/help/releases`, `/help/support`. Admin routes: `admin.help.index`, `admin.help.$articleId`, `admin.support`, `admin.releases` — all following the existing tab layout in `admin.tsx`.
- Reuse the journal editor's markdown toolbar and image upload for article and release-note bodies, and `MarkdownText` for rendering.
- Ticket replies reuse the existing notifications table so authors see a bell alert.
- Rename the Reflections section heading to "End of Cycle Details".
