# Feature requests: richer form, timeline, and support ticket links

## 0. Fix the current build break first

The email work left a bundling rule that is too broad and now breaks the build (an unrelated package asks for `entities/decode` and gets sent to the wrong folder). Narrow the rule to exact matches only. Small, one-line change in the build config.

## 1. Better "Request a Feature" form

The form gains, alongside title, details and category:

- **Priority** — "Nice to have", "Would really help", "Blocking my work". The author picks it; you can change it during review.
- **Links** — one or more URLs (a doc, a video, a page in the app).
- **Screenshots** — drag-and-drop image upload (PNG/JPG, up to 5 files). Files go to a new private storage area; only the author, voters on an approved idea, and you can view them, through short-lived links.

Same fields appear on the author's edit view while the idea is still waiting for review.

## 2. Feature request detail page

Rebuilt around a timeline:

- Header: title, category, priority, current status pill, vote button.
- Description, links and screenshot thumbnails.
- **Timeline of updates** — each entry shows the date, the stage it moved to, and your public reply. The first entry is always "Submitted".
- **What happens next** — a short line per stage ("Waiting for review: we read every idea within a week", "Planned: it's on the build list, we'll post here when work starts", etc.), so authors always know the next step.
- Email toggle stays as-is.

## 3. Emails on every update

Authors (and voters) already get a bell notification. Extend that so an email also goes out when either the stage changes **or** you post a new public reply — using the branded template already set up. Nothing sends until the sender domain finishes verifying.

## 4. Admin workflow

The admin Feature requests screen gets:

- Filter by stage, plus a "needs triage" queue of new ideas.
- Priority override.
- **Post a public reply** box: each save writes a new timeline entry instead of overwriting the single note, so history is preserved.
- Approve/hide toggle for the public board (unchanged).

## 5. Support tickets ↔ feature requests

- When someone opens a support request, they can optionally link an existing idea, or, from the "I have an idea" fork, the new idea is linked to the ticket automatically.
- The ticket page shows a card: "This is tracked as: <idea title> — <stage>", linking to the idea's page.
- In Admin → Support you can attach or change the linked idea on any ticket, so you can point several tickets at the same idea.

## Technical notes

- Migration: new `feature_request_updates` table (`request_id`, `author_user_id`, `status`, `body`, `created_at`) with grants + RLS (readable when the parent request is readable; insert admin-only); new columns `feature_requests.priority` (text, default `nice_to_have`), `links` (text[]), `attachments` (jsonb of storage paths); new column `support_tickets.feature_request_id` (nullable FK). Backfill one timeline row per existing request from its current `public_note`/`status`.
- Storage: private bucket `feature-request-files` with `storage.objects` policies scoped to the owning author + admins; signed URLs for display.
- `updateFeatureRequest` server fn: insert a timeline row on every save, keep `public_note` in sync with the latest reply, and fire notifications + `sendTemplateEmail("feature-request-update", ...)` on status change **or** new reply.
- Client: extend `src/lib/feature-requests.ts` with `useFeatureRequestUpdates`, upload helpers, priority constants; update `help.requests.index.tsx`, `help.requests.$requestId.tsx`, `admin.requests.tsx`, `help.support.tsx`, `admin.support.tsx`.
- Status keys stay `waiting | considering | planned | in_progress | shipped | not_planned`.
