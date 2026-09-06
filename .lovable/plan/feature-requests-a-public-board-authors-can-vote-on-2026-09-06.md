# Feature requests: a public board authors can vote on

A second, separate channel next to support tickets, so your backlog stays clean.

## Where authors find it

- A "Request a feature" call to action on the Help Center home page and on the Contact support page.
- On the Contact support page, a clear fork: "Something's broken or I need help" (a support ticket, as today) or "I have an idea" (a feature request).
- A new Feature requests page listing every approved request, newest or most-voted first, with a filter by status and a search box.

## Submitting and voting

- The form asks for a short title, a description of the problem it would solve, and an optional area of the app it relates to.
- A new request starts as pending and is visible only to its author (marked "Waiting for review") and to you.
- Once you approve it, it appears on the public board where any signed-in author can vote once. Vote counts are visible; who voted is not.
- Authors can edit or withdraw their own request while it is still pending.

## Statuses and progress

Each request carries one status: Waiting for review, Under consideration, Planned, In progress, Shipped, or Not planned. You set it, and you can add a short public note ("Shipped in the March release") that appears on the request.

## Keeping people posted

- Whenever you change a request's status or add a note, everyone who submitted or voted for it gets a bell notification in the app.
- The same update also goes out by email, with a link back to the request. Authors can turn these emails off from their request or their profile.
- Email sending needs a sender domain you own before anything can go out; in-app notifications work immediately either way.

## Your admin side

A new Feature requests tab in the admin area: a list with counts by status, filters, and per-request controls to approve or hide, change status, add the public note, merge duplicates into one request (voters carry across), and delete spam. Support tickets stay exactly where they are — the two lists never mix.

## Technical notes

- New tables: `feature_requests` (title, body, area, status, public_note, submitted_by, approved, vote_count cache, timestamps), `feature_request_votes` (request_id, user_id, unique per pair), and `feature_request_followers` derived implicitly from submitter + voters. RLS: authors read approved rows plus their own; insert scoped to `auth.uid()`; update own row only while pending; admins (via `has_role`) full access. Votes: insert/delete own only. GRANTs for `authenticated` and `service_role` in the same migration; `anon` gets nothing since the board is behind sign-in.
- A `merged_into` column on `feature_requests` handles duplicate merging; the board hides merged rows and shows a "merged into" pointer on the original.
- Status changes run through an admin-only server function that updates the row, inserts `notifications` rows for the submitter and every voter, and sends the update email. Vote counts are maintained by a trigger on `feature_request_votes`.
- Email uses Lovable's managed sending: a React Email template plus a send helper called from that same server function, with per-user opt-out stored on `profiles` (`feature_email_opt_out`). Sends are skipped cleanly when no sender domain is verified yet.
- New routes: `/help/requests` (board + submit form), `/help/requests/$requestId` (detail, votes, status history note), `/admin/requests` (admin list). Data access lives alongside `src/lib/help-db.ts` in a new `src/lib/feature-requests.ts`.
- Pen's context gains nothing here; the Help Center CTA is presentation only.

## Before emails can send

You'll need to connect a domain you own as the sender address. I'll build everything else first; the in-app notifications work right away and emails start flowing once the domain is verified.
