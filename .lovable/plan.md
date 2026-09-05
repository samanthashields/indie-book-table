# Demo sign-in accounts

Right now there is only your own account (an author) plus one unconfirmed test account, and nobody has the admin role — so the private admin area can't be opened by anyone yet. This adds three ready-to-use demo logins.

## The accounts

| Purpose | Email | Password |
| --- | --- | --- |
| Super admin (sees the admin area) | admin@bookcycles.test | BookCycles!2026 |
| Author, paid plan (AI coach on) | author@bookcycles.test | BookCycles!2026 |
| Collaborator | collab@bookcycles.test | BookCycles!2026 |

All three are created already confirmed, so there's no email step — just go to the sign-in page and enter them.

## What gets set up with each

- A profile with a display name and the right plan (paid for the author, free for the collaborator).
- The matching role record: super admin, author, collaborator.
- Your own account (samantha.jo.shields@gmail.com) also gets the super admin role, so you can reach the admin area as yourself.

## Notes

- These are demo-only credentials for the preview; they should be removed or the passwords changed before the app goes live to real readers.
- No app screens or features change — this is only account setup.

## Technical

Accounts are created through the Auth Admin API with `email_confirm: true`, then rows are inserted into `profiles` and `user_roles` (roles stay in the separate roles table, never on the profile).
