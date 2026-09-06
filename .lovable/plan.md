# Pen gets sharper: quick actions, your real deadlines, and links you can follow

Three changes to the Pen chat so it feels less like a general chatbot and more like a coach who is looking at your workshop with you.

## 1. Quick action buttons

A small row of buttons above the message box, always visible (not just on an empty chat):

- **What should I do next?** — asks Pen for the single next step on the book you are currently looking at.
- **Show me a help article** — asks Pen to recommend the help article that fits what you have been discussing.
- **Where do I do this?** — asks Pen to point you to the exact page in the workshop and give you a link to it.

The buttons adapt to where you are: on a book cycle page they mention that book, on a milestone page they mention that milestone, on My Submissions they lean toward publishing and The Table. They stay available mid-conversation so you can nudge Pen at any point.

## 2. Pen knows your cycle, your current milestone, and your dates

Right now Pen sees your books, their status and their target publication date. It will also see:

- The phase your book cycle is in now, with its suggested start and end dates.
- Your open milestones — name, which phase they belong to, due date, and whether they are late, due this week, or upcoming.
- What you have recently finished, so Pen can acknowledge progress instead of repeating it.
- Today's date, so "you have three weeks" is actually true.

Pen is told to lead with what is overdue or due soonest, and to be honest when a launch date no longer looks realistic.

## 3. References you can act on

Pen's answers will end with a short "Where this comes from" line listing the things it leaned on — a milestone and its due date, a phase and its window, or a help article title. Each of those becomes a clickable chip under the message that takes you straight to the milestone, the book cycle page, or the article. Pen only cites things that actually exist in your account; if it has nothing to point to, no chips appear.

## Technical notes

- `buildPenContext` in `src/lib/pen.server.ts` expands to join `phases` and `milestones` for the author's books (open milestones ordered by due date, capped; recently completed ones summarised), computes overdue / due-this-week buckets against the server's current date, and emits stable reference ids (`milestone:<id>`, `book:<id>`, `article:<slug>`) alongside each item.
- `penInstructions` gains rules: prioritise overdue and nearest-due work, never invent a date, and close with a `References: [milestone:<id>] [article:<slug>]` line drawn only from the supplied context.
- The streamed reply is parsed client-side in `pen-chat.tsx`: the references line is stripped from the visible text and rendered as chips linking to `/books/$bookId/milestones/$milestoneId`, `/books/$bookId`, or `/help/articles/$slug`. A small resolver maps ids to titles and routes using the same context the server sent, returned once per stream via a lightweight `data` part on the UI message stream.
- Quick actions live in a new `PenQuickActions` component used by `PenChat`, driven by a per-section map extended from the existing `PEN_OPENERS`; each button sends a pre-written prompt through the existing `send()` path.
- No database changes. No change to how conversations are saved.
