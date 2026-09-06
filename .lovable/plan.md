# Product handbook for Book Cycles + The Indie Table

Write a full product handbook as a single Markdown document (`/mnt/documents/book-cycles-product-handbook.md`), downloadable from chat. It describes every section of the app and its features, in plain language with a technical appendix.

## Contents

1. **What the app is** — one-page overview: two halves that feed each other (the Author's Workshop where books get made, and The Indie Table where finished books get presented to readers).

2. **Who uses it and the plans** — authors, collaborators (editors, designers, illustrators, beta readers), editors (admins), and public readers. Free plan (templates + build-from-scratch) vs paid plan (adds the AI Book Coach).

3. **Accounts and sign-in** — email + password, Google sign-in, password reset, profiles (display name, pen name, photo, bio), roles kept separate from profiles, demo logins.

4. **The Author's Workshop** —
   - My Books: the cycle list with covers, current phase, progress, target launch date, status chips (On Track / Behind Pace / No Progress / Launch Approaching), pending actions.
   - Create a book cycle: three paths (from scratch, from a genre template, with the AI Book Coach's guided conversation).
   - Book overview: the six phases (Loop/Sprint), milestones, parallel production tracks (text / design / publishing), goals, setup tasks, team, resources, recent activity.
   - Milestones: instructions, due dates, the four requirement types (request a service, attach a file/link, outside activity, approve a deliverable), statuses, notes, attachments, edit milestone.
   - Phase pacing: suggested date ranges per phase from the phase-timeline formula, pacing chips, collapsible phases.
   - Book details: the full publishing record — title, pen name, genre, formats, publishing path, audience, comparables, goals, page count, target date, budget, team, ISBN/imprint, trim size, paper, price, language, series, distribution, cover image.
   - Post-launch reflection with conditional questions.
   - Templates: global genre templates (incl. Children's Picture Book), preview and use.
   - The floating AI Book Coach: suggested prompts, next-action advice, pitfall flags, paid-plan gating.
   - Notifications.

5. **Collaboration** — inviting collaborators per book with roles, per-milestone assignment, plan requirement, independent accounts.

6. **The Indie Table (public)** — The Table issue archive and issue pages by category, book detail pages, author shelves, the flip-book flyer reader, circling books and the tear-off list (copy/print), the Mission page, the Journal, email sign-up gate.

7. **Submitting a book** — the six-step submission wizard and the My Submissions tracking page with statuses.

8. **The admin area** — dashboard, submissions review, issue curation (sections, slots, quotas, spotlights, cover words, publishing), journal & site copy editing, people management (suspend/restore, password reset, delete), global template management, activity log.

9. **Technical appendix** — the stack (React/TanStack Start, Lovable Cloud database/auth/storage), per-table security model (row-level security, roles via a security-definer check), file storage with private access, plan-gating, seed data, what's demo vs production-ready.

## Format details

- Each section: what it is, who it's for, what you can do (feature bullets), and the small behaviors worth knowing.
- Plain, author-first language matching the app's voice; jargon only in the appendix.
- A short "current state" note per area where relevant (e.g. email sending needs a connected domain; the AI coach streams live responses).
- Verified against the actual app (routes, features, admin tabs) before writing, so nothing is described that doesn't exist.
