# Book Cycles — usability, pacing, and colour pass

Eleven fixes across templates, creation, the book cycle page, milestones, book details, and the palette. No change to the object hierarchy (Book Cycle → Phase → Milestone → Requirement) and no new screens beyond a template preview.

## 1. Templates

- Each template card gets two actions: **Preview** (secondary) and **Use this template** (primary).
- Preview opens a read-only view of the template: its six phases, each phase's milestones and requirement types, and what makes the template distinct. New route `/templates/$templateId`.
- Use this template goes straight into a new book cycle already pre-filled from that template, ready to customise — not back to the generic create page.

## 2. Create a Book Cycle routing

Picking "Start from a template" now goes to the template chooser, and "Build from scratch" opens the scratch form (phases and milestones you edit yourself). Today both fall into the coach conversation. "Plan with Book Coach" keeps the guided AI intake.

## 3. Book Coach as a floating chat

The coach icon opens a floating chat window (bottom-right, draggable-free, dismissible, works on mobile as a sheet) instead of a docked side column. It follows the suggested prompt sequence: an opening question, suggested replies as chips, and a next suggestion after each answer, so the author always has something to tap.

## 4. Phase pacing (suggested date ranges + chips)

Implement the attached timeline formula as a small utility:

- Fixed blocks: Launch = target −14 to +21 days; Post-Launch = +22 onward.
- Build window `B = (target − start) − 14`, split across the active build phases with weights 0.356 / 0.171 / 0.171 / 0.302, re-normalised by manuscript status, then raised to per-phase floors (21 / 21 / 30, or 90 for illustrated / 60).
- If the floors don't fit, surface the shortfall as a coach warning with a suggested later date.

Every phase on the book cycle page shows a chip with its suggested range (e.g. "Suggested 7 Jan – 8 Mar"), plus a "Behind pace" tone when today is past the phase end and the phase isn't complete.

## 5. Book cycle page: collapsible phases

Each phase card collapses and expands, with the current phase open by default; the header keeps the phase name, mode, pacing chip, and the milestone count so a collapsed phase still reads at a glance.

## 6. Milestone and reflection in a right-side drawer

Clicking a milestone (or Reflection) opens it in a drawer sliding in from the right over the book cycle page instead of navigating away. The drawer holds the full milestone content: details, the single requirement interaction, notes, attachments, and the collaborator view. The standalone pages stay reachable by direct link so nothing breaks.

## 7. Edit milestone

"Edit milestone" opens an edit form (name, description, owner, requirement type, due date, approval required, status) and saving updates the milestone in view.

## 8. Book details cover image

Adds a cover image block at the top of Book Details: current cover, replace/upload control, and a remove option, sized to the same 2:3 proportion used everywhere else.

## 9. Colour

Bring all six colours into regular use rather than leaning on one: amber `#e6b348`, green `#b4c85b`, teal `#67c3c0`, warm paper `#eee5db`, muted blue `#4b779a`, deep brown `#3a241f`. Each of the six phases gets its own colour identity (timeline marker, chip, hover), status pills map across the set, and the book list, priorities, and templates pick up warm paper and teal blocks. Deep brown stays the text colour; warm paper stays the page.

## Technical notes

- New `src/lib/phase-timeline.ts` with the weights, floors, feasibility check, and `suggestPhaseRanges(start, target, manuscriptStatus, genre)`; used by the phase chips and by the Behind Pace signal.
- New routes: `/templates/$templateId` (preview) and a scratch builder step in `/books/new`; `books.new.tsx` step 1 branches on the selected path instead of always rendering the coach conversation.
- Drawer uses the existing shadcn Sheet primitive; milestone content moves into a shared `MilestoneBody` component reused by the drawer and the existing route.
- Phase colours added as tokens in `src/styles.css` and referenced semantically (no hardcoded hex in components).
- Coach floating window replaces the side column in `app-shell.tsx`; conversation state stays local demo state for now.
