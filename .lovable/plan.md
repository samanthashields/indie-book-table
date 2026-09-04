# Book Cycles — adaptation plan

Adapt the Coaching Cycles prototype into **Book Cycles**, a B2C guided publishing app for indie authors. Structure, navigation, and interaction model come from the coaching product; every concept is re-mapped to publishing per the spec. The source screen inventory is confirmed from the shared Drive folder: coach/mentee hubs and cycle lists, scratch and AI creation, recent-cycle and activity states, follow-up and pending-action states, cycle details/end cycle, templates, and the component sheet. Per your direction, the spec's screen-by-screen mapping and those source screen names are the structural reference without a pixel-level PNG review.

## Design direction (committed)

**Concept — manuscript to shelf.** Early phases are quiet and cool (the writing desk); warmth and energy rise toward Launch (the shelf). Progress along this arc is the emotional core: a persistent phase arc shows where the author stands, and milestone completion visibly moves them along it.

**Palette** (named, committed — no warm-cream/terracotta clichés):

| Token | Hex | Use |
|---|---|---|
| Ink | `#22333C` | Text, primary surfaces' foreground |
| Paper | `#F8F7F3` | App background — cool-leaning paper, not cream |
| Desk | `#ECEDEA` | Muted panels, the writing-desk surface |
| Verdigris | `#2E7D5B` | The one confident accent: momentum, "live", approve/complete, progress |
| Launch amber | `#D99A3D` | Launch-phase energy, "Launch Approaching" follow-up state — used sparingly |
| Brick | `#A34A41` | "Behind Pace" / "No Progress" flags and errors |

Early-phase screens lean Ink/Desk; Verdigris is the constant thread of progress; Launch amber appears only in Pre-Launch/Launch contexts.

**Type:** Newsreader (editorial serif) for headings and book titles; Source Sans 3 (humanist sans) for UI. No single-word accents, no eyebrow labels, no middle-dot meta strings, no monospace labels, no arrow-suffixed buttons.

**Layout & motion:** Left app nav (My Books, Templates, Resources); content column; persistent Book Coach AI panel docked right (collapsible, becomes a bottom sheet on mobile). Numbered markers only on the six-phase timeline. Motion answers actions — milestone completion animates progress along the phase arc; approving a deliverable confirms inline. One orchestrated celebratory moment when a cycle enters Launch. `prefers-reduced-motion` respected; visible keyboard focus throughout; sentence case everywhere.

## Screens (build order)

1. **My Books** (`/`) — list of Book Cycles: cover thumbnail, title, current phase, progress, target launch date, Needs Follow-Up state (Behind Pace / No Progress / Launch Approaching / On Track, in that priority), Pending Actions. Empty state invites creating the first book.
2. **Create Book Cycle** (`/books/new`) — three methods like the source: from scratch, from template, or with Book Coach AI. The AI method is a conversational intake gathering Book Details (title, genre, formats, publishing path, audience/age, comparables, goals, length, target date, budget) and generating the six-phase plan.
3. **Book Overview** (`/books/$bookId`) — the hub: Book Details summary, the six Phases (Loop/Sprint tagged) with Milestones, parallel tracks in Production (text / design / publishing side by side), Book Goals, Setup Tasks, progress, Team, Resources, Recent Activity, persistent Book Coach AI panel.
4. **Milestone detail** (`/books/$bookId/milestones/$milestoneId`) — Author and Collaborator views: owner, due date, instructions, the single Requirement interaction, notes with attachments/links, resources, "Approval required" flag, status (In Progress / Completed / Blocked / On-Hold), mark complete / resume.
5. **The four Requirement interactions** — Request a Service (brief → collaborator delivers → author approves), Attach a File (or Link), Complete an Activity Outside the Platform, Approve a Deliverable (approve / request changes). Auto-completion where the event is detectable.
6. **Book Details editor** (`/books/$bookId/details`) — full publishing field set: title/subtitle, pen name, genre/category, formats, publishing path, audiences with age bands, comparables, goals, page count, target publication date, budget (single numeric), team, ISBN/imprint, metadata bundle, trim size, bleed, paper, price, language, series + edition, distribution channels; link to another Book Cycle for series/backlist.
7. **Post-Launch Reflection** (`/books/$bookId/reflection`) — the three spec questions with conditional logic ("published on time" appears only when goals = No), optional custom prompts, feeds the next cycle; cycle ends by manual author action.
8. **Templates** (`/templates`) — genre templates including the Children's Picture Book template (mandatory illustrator, specialized layout track, longer timeline).

## Data & behavior

- Strict hierarchy: Book Cycle → Phase → Milestone → Requirement (1:1). No task lists, no parallel action hierarchy.
- Seeded demo data: two or three books at different points on the arc (one mid-Writing, one in Production with parallel tracks, one built from the Children's Picture Book template near Launch), so every follow-up state and requirement type is visible. Every screen works with zero collaborators.
- Client-side state (prototype); no login, no org/admin chrome, no publisher/agency view, no marketplace.
- Book Coach AI: persistent panel with per-screen guidance, next-action recommendation, pitfall flags (rushing timeline, formatting before editing, skipping ARC team, launching with no email list), and DIY-vs-hire suggestions read from the budget field; it responds to Pending Actions. The create-flow intake is a guided conversation that outputs the generated plan. Prototype responses are scripted per screen; wiring to a live model is a follow-up if you want it.

## Voice

Plain, encouraging, author-first: "Request a proofread", "Approve cover", "Mark complete", "Link your manuscript". Empty states invite action; errors say what to fix.

## Brief check

- **Not generic SaaS:** the phase arc, manuscript-to-shelf energy shift, editorial typography, book covers, publishing vocabulary, and authored empty states make the product specific to indie authorship.
- **No prohibited visual tells:** no warm-cream/terracotta pairing, dark acid-accent theme, repetitive floating cards, tracked all-caps eyebrows, middle-dot metadata, monospace labels, decorative arrows, or page-load animation everywhere.
- **Adaptation, not reinvention:** source roles map to Author/Collaborator states; source creation, cycle hub, follow-up, pending action, recent activity, ending, and template patterns remain; B2B admin and brand chrome are removed.
- **Hierarchy protected:** every action remains inside one Requirement attached 1:1 to a Milestone inside a Phase; the Coach never generates loose tasks.

## Technical notes

- TanStack Start routes as listed above; semantic tokens in `src/styles.css` (oklch), no hardcoded colors; fonts via `<link>` in `__root.tsx`; per-route `head()` metadata.
- Responsive (mobile + desktop): nav collapses, coach panel becomes a bottom sheet, milestone grids stack.
- The source's PNG filenames are used to map each app state; the detailed functionality spec governs content and behavior.
