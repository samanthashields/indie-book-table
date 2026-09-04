# Accounts, roles and admin for Book Cycles

Right now everything on screen is sample content. This adds real accounts and a private admin area for you, so books, milestones and templates belong to real people and survive a refresh.

## What people get

**Authors (your customers)**
- Sign up and sign in with email and password, plus Google sign-in.
- A confirmation email on sign-up, and a working "forgot password" flow.
- A profile: display name, pen name, photo, and a short bio.
- Their own books only. One author never sees another author's work.

**Collaborators (editors, designers, illustrators, beta readers)**
- Invited by email to one specific book cycle, with a role such as copyeditor or cover designer.
- A full account with its own subscription plan (decided: collaborators are required to have a plan) that opens only the book cycle they were invited to, and only the milestones assigned to them.
- The author can change a collaborator's role or remove access at any time.

**You (super admin)**
- A private admin area, hidden from everyone else.
- People: search accounts, view a person's books, suspend or restore an account, resend a confirmation, trigger a password reset, and delete an account with its data.
- Templates: create, edit, reorder, publish, unpublish, duplicate and archive the global genre templates every author sees — including the Children's Picture Book path — editing phases, milestones, requirement types and default guidance.
- A simple dashboard: sign-ups over time, active book cycles, books published, template usage.
- An activity log of admin actions, so account changes are traceable.

## Things worth deciding that weren't in your list

These are the gaps I'd fill in the same build:

1. **Roles are stored separately from profiles.** Author, collaborator and super admin live in their own permissions record — never on the profile — so nobody can promote themselves by editing their own details.
2. **Everything the app currently fakes becomes real data**: books, book details, phases, milestones, requirements, notes, attachments, activity, and reflections.
3. **File storage** for cover images, manuscripts and deliverables, with private access so only the book's people can open a file.
4. **A "my templates" layer**: an author can save their own customised cycle as a personal template, separate from your global ones.
5. **Template versioning**: when you edit a global template, books already created from it keep the plan they started with.
6. **Book Coach conversations are saved** per book, so advice survives a reload and the coach can refer back.
7. **Invitations and email**: invite, reminder and confirmation emails, plus expiring invite links.
8. **Account lifecycle**: what happens to a book when an author deletes their account or a collaborator is removed (data stays with the author; collaborator access is revoked).
9. **Notifications**: due-date reminders, "you're behind pace", and "a collaborator delivered something".
10. **Subscription hooks** left ready for later: a plan field on each account and a limit on active book cycles, so pricing can switch on without a rebuild.
11. **Audit and safety**: rate limiting on sign-in, leaked-password checking, and admin actions recorded.

## Build order

1. Turn on the backend, add accounts, profiles and the roles record.
2. Sign-up, sign-in, Google sign-in, password reset, and a session-aware header with sign-out.
3. Move books, phases, milestones and reflections from sample data to real, per-author records.
4. File storage for covers, manuscripts and deliverables.
5. Collaborator invitations and per-book permissions.
6. Super-admin area: people management, then template management, then the dashboard and activity log.
7. Notifications and emails.

## Technical notes

- Lovable Cloud provides the database, auth, storage and server functions; no external accounts needed.
- Row-level security on every table, scoped by author, by book-cycle membership, or by admin role through a security-definer role check.
- Your super-admin account is granted its role directly in the database, not through any signup path.
- Global templates are seeded from the current in-app template data so nothing is lost.
- Admin screens live behind a protected route and re-check the admin role on the server for every read and write.

## Open questions

- Decided: collaborators must have their own plan, so they get full accounts — sign-in with email/password and Google, same as authors.
- One open question remains: do you want a free tier at launch, or one paid plan?
- Should suspending an author freeze their collaborators' access as well?
