# Issues hero, a real book-fair flyer, and Pen the book coach

## 1. Hero images on the Issues page

- Generate two new illustrations: a wide hero for the top of the Issues page and a smaller companion image for the archive band.
- Rework `/issues` so the current issue sits in a hero with the image, a bold issue label, and the "Read the flyer" call to action; the archive keeps its grid below with the second image as a section band.
- Keep the page's own title and description; add the hero to the social preview only if it ends up on a public web address.

## 2. Make the flyer look like a Scholastic book-fair flyer

Direction chosen: glossy poster pages.

- Remove the "stapled paper" cues: the staple marks, the double hairline borders, the muted paper grain background, the thin dotted contents rules.
- Rebuild the page frame as a full-bleed colour block: saturated ground colour per category, a big angled masthead bar, rounded white content panels floating on the colour, and a thick playful outer edge instead of the printed border.
- Cover page: giant issue title in condensed display type, the cover art bled to the edge, a starburst "NEW THIS MONTH" badge, and the contents as chunky numbered chips rather than a dotted list.
- Category pages: wide colour ribbon header with an oversized category name, book listings as poster cards — large cover, big numbered badge, hook in two lines, bold price tag, "circle it" heart button.
- Spotlight page: full-page feature — cover art on one side, oversized pull quote and blurb on the other, on a contrasting colour ground.
- Keep the corner page-turn control pinned bottom right, keep swipe and the page picker, keep the wishlist bar.
- Colours come from the existing palette (amber, leaf, teal, sand, inkblue, cocoa) so it stays on brand while reading much louder.

## 3. Pen — the book coach

A real AI coach (not the current scripted panel), for paid-plan authors, with named saved conversations.

**Where she lives**
- A floating "Chat with Pen" button in the workshop, opening a chat panel wherever the author is — with a full-page view at `/pen` and `/pen/{thread}` for longer sessions and thread history.
- The panel knows which page it was opened from (a book, a milestone, submissions, help) and opens with a question about that.

**What she does**
- Talks through the author's actual books: what stage each is at, what's blocking it, what would move it toward a cycle.
- Nudges a book with no cycle toward starting one, from a template or from scratch.
- When a book is marked published, invites the author to bring it to The Table and links the submission form.
- Answers open self-publishing questions, asks thought-provoking follow-ups instead of just answering, and brainstorms ideas.
- Recommends Help Center articles by name and link when one fits.

**Threads and history**
- A thread list with New conversation, rename, and delete; every thread has its own web address so a reload returns to the same conversation.
- Titles are auto-set from the first message and editable.
- History is saved to the author's account, so it returns on any device.

**Plans**
- Paid plan only. Free authors see the existing upgrade card in the same panel; the current Book Coach panel is replaced by Pen everywhere.

## Technical notes

- Two new tables: `pen_threads` (user_id, title, book_id, timestamps) and `pen_messages` (thread_id, role, parts/content), both with row-level security scoped to `auth.uid()` and the required grants.
- Streaming endpoint at `src/routes/api/pen.ts`, following the existing `api/coach-plan.ts` gateway pattern (Lovable AI Gateway Responses API, `openai/gpt-5.4-mini`, key read inside the handler). Plan gate and thread ownership are verified server-side, not just in the UI.
- The server builds Pen's context each turn from the signed-in author's books, cycle status, submissions, and the published help-article index — the client never sends it.
- Chat UI built from AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`) installed via the shadcn registry; messages render from `message.parts`, with an optimistic user bubble and a "Pen is thinking" shimmer.
- Pen gets her own drawn mark (generated), not a generic sparkle icon.
- Gateway failures surface in the panel: credit/limit errors say so plainly; only rate limits and server hiccups retry.
- Existing files touched: `src/components/book-coach.tsx` (replaced), `src/components/app-shell.tsx`, `src/components/site/flyer/*`, `src/routes/issues.index.tsx`.
