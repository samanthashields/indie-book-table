# Create Book Cycle with the Book Coach AI: Conversation & Content Spec

Content deliverable for the **Create with Book Coach AI** path in Book Cycles. Defines the question sequence, microcopy, generation rules, and edge cases the AI drawer runs when an author clicks **Create with Book Coach AI**.

Adapted section-for-section from the Coaching Cycles *Create with Talent-Ed AI: Conversation & Content Spec*, so the two can be compared directly. The conversational pattern is inherited almost verbatim; the one rule that inverts is **generation** (§7): coaching is framework-*neutral*, book cycles are phase-*anchored*. Domain differences from the coaching version are marked **\[book]** and summarized in §15.

## 1. Purpose & scope

When an author chooses **Create with Book Coach AI**, a drawer opens and walks them through building a book cycle conversationally. The AI captures the required book information, optionally enriches it (team, manuscript, goals), generates a preview plan across the six publishing phases, and creates the cycle through the **existing create pipeline** — the same writes as the manual Scratch flow.

This spec covers the parts between the intro and the preview: the question sequence, all reflect-back and gate microcopy, the rule for how the AI turns answers into a phased plan, and edge-case handling. Intro, summary, preview, and post-preview actions follow the same shapes as the coaching flow.

## 2. Design constraints

- **Only Book Details is required to create a cycle.** Everything else (collaborators, manuscript link, goals, resources, per-milestone tailoring, reflections) is optional and can be auto-suggested or worked through with the author.
- Required Book Details fields: **Working title, Genre/Category, Format(s), Publishing path, Primary audience, Target launch date.** (Budget is strongly encouraged but may be 0/unset.) **\[book]**
- **The six publishing phases are the default framework** — Writing & Development, Editing, Production, Pre-Launch, Launch, Post-Launch & Growth. Unlike coaching, this framework is product-provided; the author tailors *within* it rather than defining it from nothing. **\[book]**
- **Templates are genre-specific** (Fiction Novel, Nonfiction/How-To, Memoir, Children's Picture Book…). A template inherits phases, milestones, requirement types, resources, and reflection prompts.
- **Drafting is in scope.** If the manuscript isn't finished, the cycle starts in Writing & Development, and the author can link a draft manuscript to a milestone. **\[book]**
- **Budget is a single numeric field** that drives DIY-vs-hire recommendations during generation. **\[book]**
- **Bring-your-own collaborators.** The AI assigns people the author already has; it never sources or hires them. **\[book]**
- The AI writes through the existing create pipeline; it does not write data the manual flow can't.

## 3. Core behavioral rules

1. **One question at a time.** Each question offers tappable chips **and** a "type your own" input.
2. **Reflect back before advancing.** One short line acknowledging the answer, then the next question.
3. **Essentials first, then optional enrichment.** Six essential questions capture everything needed to create. The AI then offers to generate immediately or keep shaping.
4. **Never re-ask what's already known.** If one answer covers multiple fields, skip ahead. In the template branch, never ask what the template already provides.
5. **Personalize with the book.** Once the working title is known, refer to it by name in later questions ("For *\[title]*…"). There is no mentee — the subject is the book. **\[book]**
6. **Phase-anchored generation.** Milestones are generated inside the fixed six-phase framework (or the genre template's phases), tailored by genre, format, publishing path, and budget — never by inferring the phase set from scratch (see §7). **\[book]**
7. **Multi-select where the author can pick more than one** — formats, collaborator roles, and DIY-vs-hire jobs are multi-select with a running summary and a Done chip.
8. **The author is always in control.** Every generated element is a suggestion the author can edit, reorder, or remove in the preview before creating.

## 4. The fork — scratch vs. template

At the intro, before the essential questions, the AI establishes the starting point.

**Q0 · Starting point**
"Do you want to start from one of our book templates for your genre, or build your plan from scratch with me?" Chips: **Start from a template** · **Build from scratch**

- **Build from scratch** → Branch A (§5).
- **Start from a template** → Branch B (§6).

Both branches converge on the same summary → preview → actions (§8).

## 5. Branch A — Build from scratch

The AI elicits the book's essentials, then *generates* a phased plan.

### 5.1 Essential sequence (captures all required fields)

**Q1 · Genre / type**
"What kind of book are you publishing?"
- Maps to: **Genre/Category**; selects the phase/milestone tailoring and flags special tracks (e.g., illustration for a picture book).
- Chips: Fiction (Novel) · Nonfiction / How-To · Memoir · Children's Picture Book · Other · *type your own*
- Reflect: "Great — a \[genre]. I'll tailor the plan for that."

**Q2 · The book**
"What's the working title, and what's it about in a sentence or two?"
- Maps to: **Working title** + **Description**. If the author has no title yet, accept "not sure yet" and auto-suggest one in the preview.
- Reflect: "Got it — we'll build the plan for *\[title]*." **\[book]**

**Q3 · Format & path**
"How do you want to publish *\[title]* — ebook, print, audiobook? And which route: self, hybrid, or small press?"
- Maps to: **Format(s)** (multi-select) + **Publishing path**. Drives which milestones appear (print → trim size, ISBN, IngramSpark; audio → narration/production).
- Reflect: "\[formats] via \[path] — noted."

**Q4 · Audience**
"Who's *\[title]* for?"
- Maps to: **Primary audience / age category** (Board Books 0–3, Picture Books 3–8, Early Readers 5–8, Chapter Books 6–10, Middle Grade 8–12, YA 12–18, Adult 18+).
- Reflect: "Writing for \[audience] — that shapes a few decisions."

**Q5 · Manuscript status → launch date (back-planning)** **\[book]**
"Where are you with the manuscript — still drafting, first draft done, or already edited? And when would you like to launch?"
- Maps to: **starting phase** (from status) + **Target launch date**. The AI **back-plans** phase and milestone due dates from the launch date, and starts the cycle at the phase matching the manuscript status.
- If the date is too soon for the remaining work, the AI says so and offers to adjust the date or compress scope (see §12).
- Reflect: "\[status], launching around \[date] — I'll work the schedule backward from there."

**Q6 · Budget** **\[book]**
"What's your budget for producing and launching *\[title]*? A rough number is fine — I'll use it to recommend what to do yourself vs. hire out."
- Maps to: **Budget** (single number). Drives DIY-vs-hire in generation. Accepts 0 / "no budget."
- Reflect: "Got it — I'll spend it where it matters most and keep the rest DIY."

At this point all required fields are captured (**Working title** provided or to be suggested; §7.3).

### 5.2 The gate

Once essentials are captured, the AI gates rather than continuing to ask:

"I have enough to draft your plan for *\[title]*. Want me to generate a preview now, or shape it a bit more first? We can add your team, link your manuscript, set a goal, or adjust the phases." Chips: **Generate preview** · Add collaborators · Link your manuscript · Add a goal · Adjust phases & milestones · Add resources

- **Generate preview** → §8.
- Any enrichment chip → the corresponding item in §5.3, then returns to the gate (completed items drop off the chip list).

### 5.3 Enrichment sequence (all optional)

**N1 · Team / collaborators (bring-your-own, multi-select)** **\[book]**
"Who's helping you with *\[title]*? I'll assign them to the right milestones. Leave it blank to run solo — you can add people any time."
- Maps to: **Team**; also informs DIY-vs-hire (a role you already have is assigned; a role you don't is a candidate hire or DIY).
- Multi-select roles: Co-author · Developmental editor · Copyeditor · Proofreader · Cover designer · Formatter · Illustrator · Marketing help · Beta/ARC readers · **Done adding collaborators**
- Reflect: "Added \[N] collaborator(s) — I'll route their milestones to them."

**N2 · DIY vs. hire steer (multi-select)** **\[book]**
"For the big jobs — editing, cover, formatting — which do you want to do yourself, and which should I plan as hires? I'll recommend based on your budget."
- Maps to: **milestone requirement types** — a hired job becomes a *Request a Service* milestone; a DIY job becomes *Attach a File* or *Complete an Activity Outside the Platform*.
- Presented as a per-job toggle with a budget-aware recommendation next to each. Analog of the coaching "evidence types" question.
- Reflect: "Good — I'll plan \[jobs] as hires and the rest as DIY."

**N3 · Link your manuscript** **\[book]**
"Have a draft? Link it and I'll attach it to your Writing & Development milestone."
- Maps to: **Resources** — links the draft manuscript to the relevant milestone.
- Chips: Upload / link file · Not yet
- Reflect: "Linked — your draft is attached to the Writing milestone."

**N4 · Book Goal / your "why"**
"Why are you writing *\[title]* — what would make this a success for you? (Sell a certain number, build authority, hit a list, tell your story.)"
- Maps to: **Book Goals**. Attach an existing goal or state one; the AI uses it to size the launch and budget advice.
- Reflect: "Noted — this cycle is aimed at \[goal]."

**N5 · Resources & comps**
"Any comparable titles or reference materials you want on hand? I can keep them with the cycle."
- Maps to: **Resources / comparable titles**.
- Chips: Add comps · Choose from library · Not now

**N6 · Publishing details (optional, early capture)** **\[book]**
"Do you already have an ISBN, an imprint name, or is this part of a series? Optional now — most of this is finalized in Production."
- Maps to: **ISBN / imprint / series flag** (otherwise populated later).
- Chips: I have details · Skip for now

**N7 · Post-Launch Reflection** *(usually auto-generated, not asked)*
"I'll add post-launch reflection prompts for you to complete after launch — want to review or tweak them?"
- Maps to: **Post-Launch Reflection**. Author-only (§9).
- Chips: Use suggested · Customize

## 6. Branch B — Start from a genre template

When a template is chosen, the cycle **inherits all phases, milestones, requirements, resources, and reflection prompts** from the genre template. The AI shifts from *elicit-and-generate* to **confirm-and-tailor**: fill only what the template can't hold, then let the author adjust inherited content conversationally.

**T1 · Pick template**
"Choose a template that fits your book — tap one to preview what it sets up."
- Chips: \[genre templates: Fiction Novel · Nonfiction/How-To · Memoir · Children's Picture Book · …]
- On selection: "Here's what the \[template] sets up: \[X] phases, \[M] milestones, resources, and reflection prompts. Your cycle will inherit this whole plan — you can tailor any of it with me before creating." Chips: **Use as-is** · **Customize**

**T2 · The book & format** *(required-new)*
"What's the working title, and which formats — ebook, print, audiobook?"
- Maps to: **Working title** + **Format(s)** (templates don't carry these).

**T3 · Launch date → back-planning** **\[book]**
"When would you like to launch? I'll set the milestone due dates working backward from there."
- Chips: Use template's default timeline · Choose a launch date
- Either path leads to a launch-date picker with a live "starts \[date]" preview derived by back-planning. Warns if the date is unrealistic (§12).
- Reflect: "Launching around \[date] — schedule set."

**T4 · Tailor** *(optional, conversational)*
"Want to adjust anything — add or drop a milestone, change a hire to DIY — or use it as-is?"
- The author edits inherited content in natural language ("drop the audiobook milestones," "make the cover a hire"), applied to **this cycle's copy**.

### 6.1 Template-branch rules

- **Do not re-ask what the template answers.** Only title, format, and launch date are required-new.
- **Edits apply to the cycle, not the template.** Reflect-back makes it explicit: "Applied to this cycle's copy… the template is unchanged."
- **Budget:** if not carried, ask Q6 from Branch A before the preview so DIY-vs-hire can be tuned.

## 7. Phase-anchored generation rule *(the inversion of the coaching framework-neutral rule)*

This governs how Branch A turns answers into a plan. It is the single most important behavioral rule — and the key place Book Cycles differs from Coaching Cycles.

### 7.1 The rule
There **is** a product framework: the six publishing phases. The AI always structures the plan around them (or the genre template's phases). It does **not** infer the phase set from the author's answers. Instead it **tailors within the fixed phases**: which milestones appear, which are DIY vs. hire, and when they're due. **\[book — inverts coaching §7]**

### 7.2 What the AI generates
- **Phases:** the six standard phases (or the template's), starting at the phase matching the manuscript status.
- **Milestones:** placed within phases and tailored by **genre + format(s) + publishing path + budget + team**. Print adds ISBN/trim/wide-distribution milestones; audio adds production; a picture book **always** adds the illustration track and its longer lead time.
- **DIY vs. hire:** each production job is set to *Request a Service* (hire) or *Attach a File / Outside Activity* (DIY) based on N2 and the budget.
- **Due dates:** back-planned from the target launch date, with realistic minimums; flag if the date is too tight.
- **Reflection prompts:** the default post-launch prompts (§9) unless customized.

### 7.3 Title
Unlike coaching (where title is auto-derived and never asked), **the working title is asked** (Q2/T2) because the book's title is central to the author. If the author has none, accept "not sure yet" and **suggest** one in the preview, editable there. **\[book]**

### 7.4 Everything is editable
The preview presents the generated phases and milestones as **suggestions the author can rename, reorder, add to, or remove** before creating.

## 8. Convergence — summary → preview → actions

Both branches converge here.

1. **Reflect-back summary:**
"Here's what I've got: a \[genre] \[format(s)] book, *\[title]*, published via \[path] for \[audience], launching around \[date]. I've built the plan across the six phases — \[Y] milestones total, with \[H] jobs planned as hires given your budget and the rest DIY. Does this look right?"

2. **Book Cycle Preview** card with an **Expand panel**: renders the plan with its phases, milestones (tagged DIY/hire and by requirement type), due dates, and reflection prompts.
   - Branch A: freshly generated plan.
   - Branch B: template plan with the author's conversational edits applied.

3. **Actions:** **Create the book cycle** · **Generate new preview** · **Change answers**.

## 9. Default Post-Launch Reflection prompts

Auto-added unless customized (N7). Author-only, since the author answers. **\[book — coaching had two parties]**

- "Did *\[title]* achieve its goals?"
- "Was it published on or before your target date?"
- "What are the next steps for *\[title]* to be successful?"

*(Starting points the author can edit.)*

## 10. Reflect-back microcopy library

One short line after each answer, then the next question. Vary phrasing; never robotic.

| After | Reflect-back |
|---|---|
| Genre | "Great — a \[genre]. I'll tailor the plan for that." |
| The book | "Got it — we'll build the plan for *\[title]*." |
| Format & path | "\[formats] via \[path] — noted." |
| Audience | "Writing for \[audience] — that shapes a few decisions." |
| Status + launch date | "\[status], launching around \[date] — I'll work backward from there." |
| Budget | "Got it — I'll spend it where it matters most and keep the rest DIY." |
| Collaborators | "Added \[N] collaborator(s) — I'll route their milestones to them." |
| DIY vs. hire | "I'll plan \[jobs] as hires and the rest as DIY." |
| Manuscript linked | "Linked — your draft is attached to the Writing milestone." |
| Goal | "Noted — this cycle is aimed at \[goal]." |
| Template picked | "Starting from the \[template] — I'll bring in its plan for us to review." |
| Template edit | "Applied to this cycle's copy: \[change]. (The template is unchanged.)" |

## 11. Gate & transition microcopy

- **Essentials complete (Branch A):** "I have enough to draft your plan for *\[title]*. Generate a preview now, or shape it more first? We can add your team, link your manuscript, set a goal, or adjust the phases."
- **Returning to the gate after enrichment:** re-show the gate with completed items removed.
- **Template tailor entry:** "Here's what the \[template] sets up: \[X phases, M milestones]. Adjust anything, or use it as-is?"

## 12. Edge cases & error handling

| Situation | AI behavior |
|---|---|
| **Empty / skipped required field** | Re-prompt once, softer: "Even a rough idea helps — what genre feels closest?" If still empty, offer a sensible default or a chip to fill it later in the preview. |
| **Launch date is unrealistic for the work left** | Say so plainly and offer a choice: "That's tight for a \[genre] starting from \[status] — I can plan an honest date of \[date], or keep yours and flag what we'd cut. Which?" Never silently accept an impossible schedule. **\[book]** |
| **No budget / budget = 0** | Build a credible DIY-first plan; be honest about tradeoffs; recommend free/low-cost tools and beta readers. Never shame it. **\[book]** |
| **Manuscript not started** | Start the cycle at Writing & Development; skip the manuscript-link enrichment or offer to add it later. **\[book]** |
| **Children's / illustrated book, no illustrator** | Flag that illustration is a required hire with a long lead time, and add the illustration track regardless. **\[book]** |
| **"I don't know" on genre/audience** | Offer scaffolding: "Want me to suggest a couple that fit what you described?" |
| **Off-topic input** | Acknowledge and redirect once to the current question; don't answer off-topic requests. |
| **Answer covers multiple fields** | Extract all, skip the answered questions, confirm in the next reflect-back. |
| **No templates for the chosen genre (Branch B)** | "No template for that genre yet — want to build from scratch instead? I can save it as a template afterward." |
| **Author abandons mid-flow** | Preserve captured answers so re-opening resumes rather than restarts (confirm with eng). |

## 13. Field mapping (question → book cycle field)

| Question | Book Cycle field | Required? |
|---|---|---|
| Q1 Genre | Genre/Category (+ tailoring basis) | **Required** |
| Q2 The book | Working title + Description | **Required** (title; description optional) |
| Q3 Format & path | Format(s) + Publishing path | **Required** |
| Q4 Audience | Primary audience / age category | **Required** |
| Q5 Status + launch date | Starting phase + Target launch date (back-plans due dates) | **Required** |
| Q6 Budget | Budget | Encouraged (0 allowed) |
| N1 Collaborators | Team | Optional |
| N2 DIY vs. hire | Milestone requirement types | Optional |
| N3 Manuscript link | Resources (draft → milestone) | Optional |
| N4 Goal | Book Goals | Optional |
| N5 Resources & comps | Resources / comparable titles | Optional |
| N6 Publishing details | ISBN / imprint / series | Optional (usually later) |
| N7 Reflections | Post-Launch Reflection | Optional (auto-generated) |

## 14. Dependencies & open items

**Engineering dependencies:**
- Feeds the **Book Coach AI create drawer** (two sub-modes: generate-from-answers, seed-from-template-then-tailor), both writing through the existing create pipeline.
- The template sub-mode depends on the **genre template schema** (the AI must read the template's milestone/requirement model to inherit and display it).
- Generation output must conform to the `plan_schema` used by the Book Coach AI system prompt, so intake and instantiation agree.
- **Back-planning logic** (launch date → phase/milestone due dates with realistic minimums) is a shared service.
- **Budget → DIY/hire mapping** is a shared rule used both here and in ongoing coaching.

**Content/design to confirm:**
- Genre chip taxonomy must match the product's actual genre/category list.
- Which "big jobs" appear in the N2 DIY-vs-hire toggle per genre/format.
- Whether N6 (publishing details) is worth asking up front or better left to Production.
- Abandon/resume behavior for a partial conversation.
- Whether the working title should be askable-but-skippable (auto-suggest) vs. always asked.

## 15. Key differences from the coaching version (similarities analysis)

**Inherited almost verbatim:** the one-question-at-a-time rhythm, reflect-back-before-advancing, essentials-first-then-enrichment, never-re-ask, everything-editable, user-in-control; the scratch-vs-template fork; the gate; the summary → preview → actions convergence; the microcopy-library, edge-case, and field-mapping structures.

**The inversions and domain shifts:**
1. **Generation flips from framework-neutral to phase-anchored.** Coaching infers the stage set; Book Cycles always uses the six fixed phases and tailors within them. *(Coaching §7 → this §7.)*
2. **No mentee; the subject is the book.** Personalization uses the working title, not a person's name. Roles: Coach → Author (the person running the flow).
3. **Title is asked, not auto-derived** — the book's title is central to the author.
4. **Duration → launch-date back-planning.** Coaching picks a length then a start; Book Cycles asks the launch date and works backward, warning when it's unrealistic.
5. **A budget question with no coaching analog**, driving DIY-vs-hire generation.
6. **"Evidence types" → "DIY vs. hire" steer.** Both set milestone requirement types, but the book version is about who does the work, not what proof to collect.
7. **Enrichment set changes:** team/collaborators, manuscript link, and comps replace coaching's evidence/prep-tasks/cycle-type.
8. **Reflection is author-only** (three prompts), vs. coaching's two-party prompts.
9. **Drafting is in scope** — the cycle can begin before the manuscript is finished.
