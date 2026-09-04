# Create with Book Coach AI — guided conversation

Replace the current one-page intake form with the conversational sequence from the new spec: one question at a time, tappable chips plus free text, a short reflect-back after every answer, then a gate, optional enrichment, and a preview. Every coach turn is marked with the Book Cycles coach logo.

## The flow

**Q0 — starting point.** "Do you want to start from one of our book templates for your genre, or build your plan from scratch with me?" Chips: Start from a template · Build from scratch.

**Branch A — build from scratch (six essentials)**
1. Genre or type — chips: Fiction (novel), Nonfiction / how-to, Memoir, Children's picture book, Other.
2. The book — working title plus a sentence or two. "Not sure yet" is accepted; the coach suggests a title in the preview.
3. Format and publishing path — ebook / print / audiobook (multi-select) and self, hybrid, or small press.
4. Audience — age categories from board books through adult.
5. Manuscript status and launch date — sets the starting phase and back-plans all due dates.
6. Budget — one number, zero allowed; drives do-it-yourself versus hire.

**The gate.** "I have enough to draft your plan for [title]. Want me to generate a preview now, or shape it a bit more first?" Chips: Generate preview · Add collaborators · Link your manuscript · Add a goal · Adjust phases and milestones · Add resources. Completed items drop off the list and each one returns to the gate.

**Enrichment (all optional).** Collaborators (multi-select roles, bring-your-own), do-it-yourself versus hire steer per big job with a budget-aware recommendation, link a manuscript, book goal, resources and comparable titles, publishing details (ISBN / imprint / series), reflection prompts.

**Branch B — start from a template.** Pick a genre template, see what it sets up, then only three new questions: title, formats, launch date (with back-planned dates). Nothing the template already answers is re-asked. Budget is asked before the preview if it isn't carried. Tailoring edits say plainly that the template itself is unchanged.

**Convergence.** A reflect-back summary sentence, then the streaming draft plan (phases, milestones tagged by requirement type and hire/do-it-yourself, due dates, reflection prompts), then three actions: Create the book cycle · Generate a new preview · Change answers.

## Rules the conversation follows

- One question per turn; chips and a free-text field always both available.
- One short, varied reflect-back line before advancing; never robotic.
- Never re-ask something already answered; one answer can satisfy several questions.
- Once the title is known, the coach refers to the book by name.
- Generation is phase-anchored: always the six phases (or the template's), tailored within them — never invented from scratch.
- Everything generated is editable in the preview.

## Edge cases

Soft re-prompt once on a blank required answer; honest warning when the launch date is too tight, offering a realistic date or a flagged trade-off; a credible do-it-yourself plan at zero budget with no shaming; illustration track always added for a picture book with a note that it's a long-lead hire; scaffolding suggestions on "I don't know"; single gentle redirect on off-topic input; answers preserved if the author leaves mid-flow.

## Look and motion

The conversation runs in the same calm card the create page already uses. Coach turns carry the floating-book coach mark; author answers sit right-aligned with no mark. Chips are quiet outlined pills that fill with the momentum green on select; multi-select chips keep a running count and a "Done" chip. New turns fade and rise in; a slim progress rail shows how many essentials remain. Reduced-motion users get no animation.

## Technical notes

- New `src/lib/coach-intake.ts`: the question script (id, prompt, chips, multi-select flag, field mapping, reflect-back templates) plus a small reducer that tracks answers, decides the next question, skips answered fields, and drives the gate.
- `src/routes/books.new.tsx` step 1 becomes the chat transcript driven by that reducer; the existing streaming preview (`usePlanStream` → `/api/coach-plan`) stays and is triggered by "Generate preview".
- The intake payload sent to the plan generator grows to carry genre, title, description, formats, path, audience, manuscript status, launch date, budget, collaborators, and hire/do-it-yourself choices; zod schemas in `book-plan.functions.ts`, `api/coach-plan.ts`, and the instructions in `book-plan-schema.ts` are updated to match, with back-planning and phase-anchoring stated in the instructions.
- Template branch reads the existing template list and seeds the transcript, asking only title, formats, and launch date.
