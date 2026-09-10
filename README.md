# Indie Book Table

You are the design lead adapting an existing product into a new one. I've attached two things: a Figma SVG Image file for our existing "Coaching Cycles" feature, and a functionality spec for the new product, "Book Cycles." Your job is to adapt the Coaching Cycles design into Book Cycles — reuse its layout patterns, component structure, navigation, and interaction model, and re-map every concept, screen, and label to the book-publishing domain per the spec. Adapt; don't rebuild from a blank page, and don't invent new structure the spec doesn't call for.

The product

Book Cycles is a B2C SaaS app for self-published (indie) authors. It walks an author through the full journey of producing one book — from draft through publication and post-launch growth — as a guided, phased project. An AI "Book Coach" is present throughout, explaining each step, recommending next actions, flagging common mistakes, and adapting the plan to the author's budget and genre. The audience is often first-time authors doing something ambitious and personal; the product should feel calm, encouraging, and craft-respecting, and make steady progress feel visible.




Two framing rules for the whole adaptation:




This is a standalone B2C product, not the coaching tool reskinned halfway. Drop all B2B chrome from the coaching Figma — org/admin provisioning, manager dashboards, any "Torsh"/"Talent" branding, logos, or product names. Keep the structure and interactions; replace the skin and the B2B concepts.

Preserve the object hierarchy exactly: Book Cycle → Phase → Milestone → Requirement. Each Milestone has exactly one Requirement (1:1). Never flatten this into a task list and never create a parallel hierarchy of loose actions.

Core mapping (coaching → book)

Translate every screen, component, and string using this table. When you encounter a coaching concept in the Figma, produce its book equivalent.




Coaching Cycles (source)

Book Cycles (target)

Coaching Cycle

Book Cycle — one book project

Coach

Book Coach AI — persistent, always-on guide

Mentee

Author — the owner; does the work

Manager / Admin

Omit in V1 (the Author owns everything)

Stage

Phase — the 6 publishing phases

Milestone

Milestone — plus new fields: due date, Notes with attachments, "Approval required" flag, and Blocked/On-Hold status

Requirement (1:1 with Milestone)

Requirement (trimmed type list, below)

Request an Observation

Request a Service (request work from a collaborator)

Complete a Data Form / Self-Assessment / Learning Path

Removed in V1

Attach a File

Attach a File (or Link)

Complete an Activity Outside the Platform

Complete an Activity Outside the Platform

—

Approve a Deliverable (new: author signs off on collaborator work)

Goals

Book Goals — the author's "why" / end goals

Preparation Tasks

Setup (Author) Tasks — strategic decisions up front

Resources

Resources — plus working artifacts (manuscript drafts, cover comps, files)

End-of-Cycle Reflection

Post-Launch Reflection — answered by the Author

Cycle Details

Book Details — expanded with publishing fields (below)

Cycle Type

Publishing Path (self / hybrid / small press / traditional)

Focus Tags

Genre / Category

Needs Follow-Up (Behind Pace / No Progress / Ending Soon)

Same, reoriented to the target launch date ("Launch Approaching")

Pending Action

Pending Action — owned by Author or a Collaborator

Coaching Cycle Template

Book Cycle Template — genre-specific, including a Children's Picture Book template

Talent-Ed AI (creation)

Book Coach AI (creation + ongoing guidance; OpenAI-powered)

Receive Coaching / Deliver Coaching

Author workspace / Collaborator workspace

Manage Coaching

Publisher/Agency view — out of scope for V1

Screen-by-screen adaptation

For each screen in the coaching Figma, build the book equivalent:




Coaching cycle list (Receive/Deliver Coaching) → "My Books" — the author's list of Book Cycles, each showing cover thumbnail, title, current phase, progress, target launch date, Needs Follow-Up state, and any Pending Actions.

Create Cycle (from scratch / template / AI) → Create Book Cycle with the same three methods; the AI method is a Book Coach AI intake conversation that gathers Book Details, publishing path, budget, and genre, then generates the phases and milestones.

Cycle Details / Overview → Book Overview (the hub): Book Details summary, the six Phases with their Milestones, Book Goals, Setup Tasks, overall progress, Team, Resources, and an ever-present Book Coach AI panel.

Stage → Phase grouping within the overview; a Phase may show parallel tracks (e.g., a text track and a design track side by side in Production).

Milestone detail (mentee + coach views) → Milestone detail (Author + Collaborator views) with due date, instructions, the Requirement interaction, Notes + attachments, Resources, the "Approval required" flag, and status (In Progress / Completed / Blocked / On-Hold).

Requirement interactions → the four V1 types: Request a Service, Attach a File, Complete an Activity Outside the Platform, Approve a Deliverable.

Recent Activity → Recent Activity (milestone completions, deliveries, approvals, coach updates).

Templates management → Book Cycle Templates, including the Children's Picture Book template.

End-of-Cycle Reflection → Post-Launch Reflection (three questions, below).

Spec to honor

Roles. Author (constant owner; does the work, owns Book Details/Goals/Setup Tasks, invites collaborators, approves deliverables, answers the reflection). Book Coach AI (default coach: generates structure, guides, recommends DIY-vs-hire by budget, responds to pending actions; does not perform human specialist work). Collaborators — a phase-scoped role class (co-author, developmental editor, copyeditor, proofreader, cover designer, formatter, illustrator, marketing help, beta/ARC readers, and optionally a human coach); may be lightweight/guest accounts, permissioned per book cycle.




The six phases (sequenced, but parallel work allowed; each tagged Loop = feedback-driven or Sprint = checklist-driven):




Writing & Development (Loop) — finish manuscript, rest + self-review, beta-reader round, developmental edit, major revision.

Editing (Loop) — line/copyedit rounds, author revisions, lock manuscript. (Proofreading happens later, after layout.)

Production (Sprint + parallel tracks) — Text: front/back matter, interior format (ebook + print), proofread laid-out files. Design: cover, illustrations. Publishing: buy ISBN, establish imprint, finalize metadata.

Pre-Launch (Sprint) — set firm pub date, ebook preorder, print files to IngramSpark, build/activate ARC team, secure reviews, grow email list, content marketing.

Launch (Sprint) — reviews, email campaigns, social, podcasts/features, publicity. Launch is a window, not a day.

Post-Launch & Growth (Loop) — audience growth, long-tail marketing, metadata optimization, added formats, partnerships → flows into the Post-Launch Reflection → next Book Cycle.




Book Details fields (the editable heart of a cycle): working title/subtitle; author/pen name; genre/category (Fiction: Picture Book, Fantasy, Romance, Mystery/Thriller, YA; Non-Fiction: Historical, Investigative Journalism, Memoir, Self-Help, Other); format(s) — ebook, paperback, hardcover, audiobook; publishing path; primary + secondary audience with age categories (Board Books 0–3, Picture Books 3–8, Early Readers 5–8, Chapter Books 6–10, Middle Grade 8–12, YA 12–18, Adult 18+); comparable titles; Book Goals; length estimate (page count); target publication date (drives Needs Follow-Up); budget (single numeric field); team; ISBN/imprint (populated in Production); metadata bundle — title, description, keywords, categories (Production); trim size; bleed (bleed / non-bleed PDF); preferred print/paper type; price; language; series (yes/no) + edition number; distribution channels (KDP, IngramSpark, Draft2Digital, direct); progress (derived).




Milestone fields: phase; name; description; owner (Author or a Collaborator); requirement type; requirement-specific selection (file upload, link, outside action, or manual check-to-complete); instructions; resources; notes (with attachment picker + links); status (In Progress / Completed / Blocked / On-Hold); optional due date; "Approval required" flag.




Requirement types (V1): Request a Service (author requests work from a collaborator; brief attached; collaborator delivers → author approves); Attach a File (or Link); Complete an Activity Outside the Platform (do it externally, then mark complete); Approve a Deliverable (review → approve / request changes).




Needs Follow-Up: Behind Pace, No Progress in X days, Launch Approaching, On Track — priority order Behind Pace → No Progress → Launch Approaching.




Post-Launch Reflection (Author answers): "Did this book achieve its goals?" (Yes/No + notes, always shown); "Was the book published on or before its target date?" (Yes/No + notes, shown when the first = No); "What are the next steps for this book to be successful?" (free text, always shown). Plus optional custom prompts.




Book Coach AI behavior: present on every screen as a guide/assistant. It generates the plan at creation, explains each step, recommends the next action, surfaces pitfalls (rushing the timeline, formatting before editing is done, skipping the ARC team, launching with no email list), recommends DIY vs. hire from the budget, and responds to author-facing Pending Actions with guidance. Show it as a persistent assistant panel — not a separate destination.

Locked decisions (build these; don't re-open)

Own drafting. The product covers drafting; the author links their draft manuscript to a Milestone.

AI-only coach model. The persistent coach is the Book Coach AI. A human coach is only ever an optional Collaborator with configured permissions — never a required role.

Bring-your-own collaborators. No marketplace in V1.

Permissions granularity per book cycle (not per-milestone in V1).

Budget is a single numeric field in Book Details.

Children's / illustrated books ship in V1 as a distinct template (mandatory illustrator + specialized layout track, longer timeline).

No enforced cross-phase dependencies. Phases and milestones can run in parallel; nothing is hard-blocked by sequencing.

Cycle ends by manual author action in V1.

Series/backlist: allow linking one Book Cycle to another.

Monetization: standard B2C subscription pricing (no marketplace economics).

Auto-completion: a Milestone may auto-complete when its underlying event is detectable — file uploaded, preorder link validated, or required approval granted. Otherwise the owner marks it complete.

Solo author is the default. Every screen must work with zero collaborators — the author can be every role. Collaborators expand the same structure; they don't unlock it.

Design direction

Make deliberate, opinionated choices for this audience — indie authors — not generic SaaS defaults. Actively avoid the current AI-design tells: the warm-cream (#F4F1EA) + high-contrast serif + terracotta (~#D97757) combo; near-black backgrounds with one acid accent; identical rounded cards with the same soft grey shadow on everything; tracked-out ALL-CAPS eyebrow labels above headings; meta strings joined with middle dots; a "→" appended to buttons; monospace for small labels. If you reach for one of these, choose something specific to books and authorship instead.




A starting concept to develop (commit and refine — don't hedge): the arc from private manuscript to public book. Early phases feel quiet and focused (the writing desk); the palette and energy warm and brighten toward Launch (the shelf). Progress is the emotional core — show the author moving along the arc.




Palette: propose 4–6 named hex values and commit. Lead with a considered "ink" for text and an paper-adjacent surface that is not the #F4F1EA cliché, plus one confident accent that signals momentum/"live." Spend your boldness in one place; keep everything else disciplined.

Type: one or two families, chosen deliberately (a contemporary editorial serif for headings suits books; pair with a clean humanist sans for UI). Don't accent a single word in a headline; don't add labels that repeat the content.

Layout & motion: reuse the coaching Figma's information architecture. Use numbered markers only where content truly is a sequence (the phase timeline qualifies). Motion answers user actions (completing a milestone, approving a deliverable) rather than decorating page loads. One orchestrated celebratory moment at Launch is welcome.

Copy & voice

Author-facing, plain, encouraging. Name things as an author understands them ("Request a proofread," not "create Requirement of type Service"). CTAs say what happens ("Approve cover," "Mark complete," "Link your manuscript"). Empty states invite action ("No collaborators yet — you can do this phase solo, or invite an editor"). Errors explain what to fix without apologizing. Sentence case throughout.

Deliverables & build order

Produce a responsive (mobile + desktop) prototype, accessible by default (visible keyboard focus, reduced-motion respected), in this order:




My Books (dashboard/list)

Create Book Cycle — including the Book Coach AI intake flow

Book Overview (the hub, with the persistent Book Coach AI panel)

Milestone detail — Author and Collaborator views

The four Requirement interactions — Request a Service, Attach a File, Outside Activity, Approve a Deliverable

Book Details editor

Post-Launch Reflection

Templates — including the Children's Picture Book template




Before building, produce a short design plan (palette, type, layout concept, principles), check it against this brief to confirm nothing reads as a generic default, revise, then build.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/180ca307-32fc-4bcb-95b8-e2e5827f0ca1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
