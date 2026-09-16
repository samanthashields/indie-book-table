# Book Cycles build

- [x] Shared app shell and design system
- [x] My Books dashboard
- [x] Create Book Cycle flow
- [x] Book Overview and phases
- [x] Milestone and requirement interactions
- [x] Book Details editor
- [x] Post-Launch Reflection
- [x] Templates
- [x] Responsive and accessibility verification
- [x] Streaming Book Coach intake with cancel
- [x] Collapsible Book Coach panel + floating-book cycle logo
- [x] Soft editorial redesign across all product screens
- [x] Desktop and mobile visual verification of redesigned screens

## Usability, pacing and colour pass

- [x] Template preview + use-this-template routing
- [x] Create flow branches (template / scratch / coach)
- [x] Floating Book Coach chat with suggested prompts
- [x] Phase timeline formula + pacing chips
- [x] Collapsible phases on the book cycle page
- [x] Milestone and reflection in a right-side drawer
- [x] Edit milestone form
- [x] Book details cover image
- [x] Full palette usage across the app

## Backend planning (next)

- [x] Plan accounts, sign-up, roles, super admin user management, global genre templates

## Accounts, roles and admin (approved plan)

- [x] Decided: collaborators require their own plan (full accounts, email + Google sign-in)
- [x] Decided: free plan (templates + scratch) and paid plan (adds AI coach)
- [x] Decided: author/collaborator accounts independent
- [x] Enable backend, accounts, profiles, roles
- [x] Sign-up, sign-in, Google, password reset, session-aware header
- [x] Books/phases/milestones/reflections as real per-author records
- [x] File storage for covers and deliverables
- [x] Collaborator invites and per-book permissions
- [x] Super-admin area: people, templates, dashboard, activity log
- [x] In-app notifications (email sending still to come)
- [x] Plan gating: coach is paid-only

## The Indie Table merge (uploaded brief)

- [x] Catalog schema recreated in this backend (catalog_* tables, roles-based admin, seed issue)
- [x] Public shell + routing: The Table and Journal alongside the Author's Workshop
- [x] The Table: issue archive, issue pages by category, book detail, author shelf
- [x] Journal: post list and post page
- [x] Submission wizard (author submits a book to The Table)
- [x] Admin curation: issues, selections, quotas, cover words, journal posts, site copy

- [x] Flip-book flyer reader for The Table (adapted from the showcase)
- [x] Circling books, tear-off list (copy/print) and the Mission page
- [ ] Phase 5: One author identity + publish → listing → Table handoff

## Workshop polish (approved plan)

- [x] Templates index/preview/editor routing
- [x] Book status dropdown (add book + cycle details)
- [x] Back button on every page
- [x] Sidebar renamed to Author's Workshop
- [x] My Books grid view
- [x] Admin submissions: select to feature in issue
- [x] Site words as its own admin section
- [x] Journal admin: all posts first, post editor page, image upload, formatting
- [x] Admin People: edit details + reset password
- [x] Magazine-style flyer with pinned corner turn

## New requests (Sep 6)

- [x] Homepage main heading renamed to Author's Workshop
- [x] Attach a Google Drive file link on a milestone (full account connection not set up)
- [x] Milestone drawer opens without darkening the background
- [x] Start Date in book cycle details
- [x] End Book Cycle CTA with conditional questions, shown in Reflections
- [x] My Cycles page under My Books grouped by Not started / In progress / Complete

## Pen chat layout (Sep 10)

- [x] Fit the full Pen pages safely within desktop and mobile screens
- [x] Increase the floating Pen window height with safe screen margins
- [x] Verify both layouts at desktop and mobile sizes

## Private publish behind coming-soon gate (Sep 16)

- [x] Site-wide shared-password gate + branded coming-soon page
- [x] Password entry hidden behind a discreet admin link
- [x] Publish the site (gated) to the custom domain
- [x] Mailing-list signup on the coming-soon page (reuses subscriber list)
- [x] Republish with the signup form live
- [ ] At launch: remove gate + noindex, republish

## Community list + team admin (Sep 16)

- [x] Admin "Community list" screen: signups, search, counts, remove, CSV export
- [x] Editable welcome email for new subscribers (on/off, subject, headline, body, button, send test)
- [x] Welcome email sent on new signups from the coming-soon form
- [x] Admin toggle on People to promote/demote team members (self + last-admin guards)
- [x] Invite admin (creates the account with admin access, or promotes an existing one)
- [x] Republish so the admin changes are live

## PostHog analytics (Sep 16)

- [x] PostHog connector linked (project token + region)
- [x] Browser analytics init + pageview tracking on navigation
- [x] Custom "joined_mailing_list" event on coming-soon signup
- [x] Republish with analytics live
- [ ] Confirm events arriving in the PostHog dashboard (headless test browsers are bot-filtered by design)
