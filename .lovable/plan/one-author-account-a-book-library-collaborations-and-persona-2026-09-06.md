# One author account, a book library, collaborations and personal templates

Four changes to how accounts and books work.

## 1. Everyone is an author

There is no separate collaborator account type any more. Every person who signs up gets an author account, and any author can also be invited to help on someone else's book cycle.

- Sign-up no longer asks "author or collaborator".
- Invitations work exactly as they do today, by email address. If the invited person already has an account, the cycle simply appears for them; if not, they sign up as an author and it appears on first sign-in.
- Existing collaborator-only accounts are converted to author accounts, so nobody loses access.
- A new **Collaborations** page ("shared with me") lists every cycle someone else invited you to, showing the book, its author, your role on it and the milestones assigned to you. Cycles you were invited to no longer sit mixed into My Books.
- The sidebar label under a person's name reads Author for everyone; the Editor marker for admins stays.

## 2. My Books becomes a library of book ideas

Today a book only exists once you start a cycle. After this, My Books is where an author keeps every book — ideas included.

- **Add a book** captures the same details the book details page already has: title, subtitle, pen name, genre, audience, comparables, goals, length, target date, price, cover image and the rest. Nothing is required except a title, so an idea can be one line.
- Books sit in two groups on the page: **Ideas** (no cycle yet) and **In a cycle**.
- Each book card has a kebab menu with: Create book cycle, Edit details, Submit to The Table, Delete.
- **Create book cycle** opens the existing create flow (template, from scratch, or the Book Coach) already carrying that book's details, and when finished the same book gains its phases and milestones — no duplicate record.
- Deleting a book that already has a cycle asks for confirmation.

## 3. My Submissions sits alongside

My Submissions stays as its own page and keeps tracking the books sent to the Indie Author Table: status, which issue picked them up, spotlight badges. From My Books, the kebab's Submit to The Table opens the submission form pre-filled from that book, and once sent the book card shows its submission status so the two pages stay in step.

## 4. Authors can build their own templates

- The Templates page gains two sections: **Genre templates** (the global ones editors publish) and **My templates**.
- On any global template: **Clone to my templates**, which copies its phases and milestones into a private, fully editable copy.
- Authors can also create a template from scratch, rename, edit phases and milestones, duplicate, and delete their own templates. Private templates are visible only to their owner and appear as choices when starting a cycle.
- Editors keep sole control of the global templates; an author's clone never changes the original, and later edits to a global template never rewrite anyone's clone or an in-flight cycle.

## Technical notes

- Roles: keep the roles table, drop `collaborator` from the practical sign-up path — everyone gets `author`; the `collaborators` table continues to carry per-book membership and role. Existing `collaborator`-only users get an `author` role row added by migration.
- `books` gains a `has_cycle` / lifecycle state (`idea` vs `active`) so a book can exist with no phases; the cycle builder writes phases and milestones onto the existing book row rather than creating a new one. Existing books are backfilled as active.
- `templates` already has `owner_id`, `published` and `archived`. Add RLS so an author can select global published templates plus their own rows, and insert/update/delete only rows where `owner_id = auth.uid()`; `published` stays editor-only. Cloning is a client-side copy of `phases` and `details` into a new owned row.
- Optional link column from `books` to the matching `catalog_books` submission so a book card can show its submission status.
- New routes: `/collaborations`, `/books/new-idea` (or a details form reused in a dialog), `/templates/mine/$templateId` editor.

## Build order

1. Single account type + Collaborations page.
2. Book library: idea books, kebab actions, Create book cycle from an existing book.
3. Submission link between My Books and My Submissions.
4. Personal templates: clone, create, edit, use.
