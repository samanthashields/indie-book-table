# Finish the backend, then bring in the Indie Book Showcase

Two stages: first close out accounts, roles and the admin area for Book Cycles, then merge the showcase site in as a second area of the same product.

## Stage 1 — Finish accounts, roles and admin

Already done: sign in / sign up with email and Google, password reset, the signed-in header, profiles, roles, and every screen reading real data from your account.

Remaining work, in order:

1. **Create flow polish** — confirm that building from a template, from scratch, or through the coach conversation all create a real book cycle and land you on that book's page.
2. **File storage** — a private store for book covers, manuscripts and deliverables, wired into the cover slot on Book Details, the file attachment step on milestones, and note attachments. Only people on that book cycle can see the files.
3. **Collaborators** — invite by email to one book cycle with a role (editor, designer, illustrator, marketing, beta reader, coach). Invited people create their own account, then see only that book and only milestones assigned to them. The author can change a role or remove access. Invites expire.
4. **Plans** — free plan gets templates and build-from-scratch; paid plan adds the Book Coach. The coach entry points show an upgrade prompt on the free plan.
5. **Super admin** — a private area reachable only by an admin account: people (search, view, suspend, restore, change plan), global genre templates (create, edit, reorder, publish, unpublish, duplicate, archive — including Children's Picture Book), a dashboard (sign-ups, active cycles, books published, template usage), and an activity log.
6. **Notifications** — email on invitation, on being assigned a milestone, and a gentle nudge when a phase is falling behind pace. In-app list of the same.

Open item to settle before step 4 is finished: whether a paid plan includes a set number of collaborator accounts or every collaborator pays separately. Everything else can be built without that answer.

## Stage 2 — Merge in the Indie Book Showcase

The showcase project is a public book catalog with issues, a submission wizard, a blog, and its own admin. It becomes a second area of this product rather than a separate site.

**Shape of the merged app**

```text
Author's Workshop   your books, phases, milestones, coach (Pen)
The Table           public catalog: issues, book pages, author pages, submit
Journal             blog posts
Admin               people, templates, curation, issues, posts
```

Steps:

1. **Freeze the design system** into one reference the whole app follows — colours, type, cards, chips, buttons — so the showcase screens are restyled to match Book Cycles rather than arriving with their own look.
2. **Unified shell and navigation** — one header with the three areas, one account menu, one sign-in. Rebrand away from the old showcase naming; the coach is named Pen.
3. **Bring the catalog data across** — authors, books, issues, selections, purchase links, quotas, editorial settings, issue themes, subscribers, wishlist, posts and site content recreated in this app's backend with access rules that fit the merged roles (public can read published catalog and posts; admins manage; authors manage their own listing).
4. **Port The Table** — catalog index, issue/flyer reader, book detail, author profile, submission wizard, subscribe and wishlist behaviour, restyled to the frozen design system.
5. **Port the Journal** — post list, post page, and the admin post editor.
6. **Merge the two admin areas** into one admin with sections for people, templates, curation and issues, content and posts — using this app's role system, replacing the showcase's separate admin login.
7. **One author identity** — the author account in the workshop is the same account that submits to The Table. Finishing a Book Cycle offers "submit this book to The Table" with the title, cover, blurb and links prefilled from Book Details, and the resulting listing links back to the book.

## Technical notes

- Everything stays on Lovable Cloud; the showcase's separate backend is not connected — its tables and policies are recreated here as new migrations, and its code is copied from a read-only snapshot and adapted.
- The showcase's `admins` table and email-link admin login are dropped in favour of the existing role table and `has_role` checks.
- Its data access already uses server functions with server-only helpers, which matches this project's pattern, so those port with light edits.
- Row-level security: catalog reads open to anonymous for published issues, books and posts; everything else scoped to owner, book-cycle membership, or admin.
- Images from the showcase snapshot that are pointers rather than real files may not transfer; any that fail get a placeholder and I'll flag them.
