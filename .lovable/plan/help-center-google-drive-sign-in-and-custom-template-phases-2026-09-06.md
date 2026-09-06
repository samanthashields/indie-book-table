# Help Center, Google Drive sign-in, and custom template phases

## Already in place from your last list

These five are built and working now, so the plan below only covers what's left:

- Google Drive links can be attached on a milestone's file step
- The milestone drawer opens without darkening the page
- Book details has a cycle start date, and the book cycle page has "End book cycle" with the conditional questions
- Reflections shows the end-of-cycle answers (heading will be renamed to "End of Cycle Details")
- "My Cycles" sits under "My Books" in the left nav, grouped Not started / In progress / Complete

## 1. Google sign-in for Drive files on a milestone

On a milestone's file step, "Connect Google Drive" signs the author into their own Google account, then they browse and pick a file instead of pasting a link. The chosen file is attached with its name, type and a link back to Drive, and stays connected for future milestones until they disconnect it in their account settings.

This needs a one-time setup from you: creating a Google sign-in app in the Google console and pasting its details into a setup card I'll open for you. I'll walk you through it when we get there.

## 2. Help Center for authors

A new "Help Center" item at the bottom of the left nav, with:

- A landing page: search box, article categories, and a "What's new" strip showing the three latest release notes
- Category and article pages. Articles are written by admins, support headings, lists, links and images, and can link to each other — picking related articles adds a "Related articles" block at the bottom, Zendesk style
- A "Release notes" page listing every update newest first, with a date and label
- "Contact support": a short form (subject, message, optional screenshot) that opens a ticket, plus a "My requests" list where the author sees their tickets, the status, and the back-and-forth with the team

## 3. Admin: Help Center, tickets and release notes

Three new tabs in the admin panel:

- **Help articles** — list, create and edit articles; set a category, publish or keep as draft, upload images, pick related articles
- **Support** — every ticket with its status (New, Open, Waiting on author, Resolved), the full message thread, a reply box, and status changes. Authors get a notification when you reply
- **Release notes** — write and publish an entry (title, date, body, optional highlight) that shows in the author Help Center

## 4. Build your own phases in templates

Right now both the author template editor and the admin template tools use the same six fixed phases and only let you edit the milestones inside them. This changes so that, in the author editor and in the admin template editor:

- Add a phase from the six standard ones (Writing & Development, Editing, Production, Pre-Launch, Launch, Post-Launch) or create a brand-new phase with its own name, type (Loop, Sprint, Launch window) and description
- Remove a phase, and drag phases into the order you want
- Add, edit and remove milestones inside any phase, including phases you invented
- Suggested date ranges keep working: a custom phase gets a share of the cycle you set with a simple percentage field, and the standard phases keep their existing ratios
- Admins get the same editor for the genre templates they publish to everyone

## 5. Later: Penny the Book Chat guide

Not part of this build. Once the above is in, we shape the Book Chat into "Penny (Pen)" with in-context prompts across the workshop — planned separately.

## Technical notes

- New tables: `help_categories`, `help_articles` (slug, title, category, body, status, related ids), `release_notes`, `support_tickets` (author, subject, status), `support_messages` (ticket, sender, body, attachment). Authors read published articles and notes and only their own tickets and messages; admins manage everything. GRANTs for `authenticated`/`anon` where public reads apply, plus `service_role`.
- Author routes: `/help`, `/help/$categorySlug`, `/help/$slug`, `/help/releases`, `/help/support`. Admin routes: `admin.help.index`, `admin.help.$articleId`, `admin.support`, `admin.releases`, following the tab layout in `admin.tsx`.
- Reuse the journal editor's markdown toolbar and image upload, and `MarkdownText` for rendering. Ticket replies reuse the existing notifications table.
- Google Drive uses the App User Connector flow (`google_drive`, `drive.readonly` scope) with a Google OAuth client you register; per-user connection keys stored encrypted server-side, Drive file picking through a server function.
- Template phases: extend `TemplatePhase` handling in `templates.mine.$templateId.tsx` and `admin.templates.tsx` with add/remove/reorder plus a custom-phase form; add an optional `ratio` on each phase and fall back to the standard ratios in `phase-timeline.ts` when it is absent.
- Rename the Reflections section heading to "End of Cycle Details".
