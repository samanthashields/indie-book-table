# Book Cycles — Functionality Specification (First Draft)

**Status:** Draft for review
**Adapted from:** Coaching Cycles 2.0 Functionality Specification
**Domain:** Self-publishing / independent authorship (B2C SaaS, 0-1)
**Phase source:** Write|Publish|Sell — *The Book Publishing Timeline* (6-phase model)

> This is a conceptual adaptation, not an engineering-ready PRD. It deliberately mirrors the
> section structure of Coaching Cycles 2.0 so the two can be compared line by line. Where the
> book domain forces a real departure from the coaching model, it is called out in
> **§ 20 Key Adaptations from Coaching Cycles 2.0**. Once the model is agreed, run it through
> the `prd-writer` skill to produce the buildable PRD (scope snapshot, user stories, acceptance
> criteria, success metrics).

---

## 1. Overview

A **Book Cycle** organizes the end-to-end production of a single book, from a finished (or in-progress) manuscript through publication and post-launch growth. It is the direct analog of a Coaching Cycle: an engagement with an overall context, a phased progression, and concrete units of work.

The feature keeps the 2.0 hierarchy. Most day-to-day work does not live at the cycle level — the cycle provides context, **Phases** organize progression, and **Milestones** contain the concrete work the author (or a collaborator) completes.

### Concept hierarchy

| Level | Purpose | Contains / relates to |
|---|---|---|
| **Book Cycle** | Defines the overall book project. | Book Details, Book Goals, Setup Tasks, Phases, Resources, Team, Post-Launch Reflection |
| **Phase** | Organizes the cycle into the stages of publishing. | Milestones |
| **Milestone** | A concrete unit of work and what the owner is expected to do. | One Requirement, instructions, Resources, completion state |

Each Milestone has **one Requirement** (1:1), exactly as in 2.0. Requirement is part of the Milestone definition, not a separate level. Example: "commission cover design" is not a cycle-level behavior — it happens because a Milestone carries a **Request a Service** Requirement.

Book Cycles can be created:
- manually from scratch,
- from a reusable **Book Cycle Template** (genre-specific),
- or with the **Book Coach AI** (the analog of Talent-Ed AI®).

### The single most important structural note

A coaching cycle is a **repeating developmental loop centered on a person**. A book cycle is a **mostly-linear production pipeline centered on an artifact (the book)**, with two twists the coaching model never had: some phases run **parallel tracks** (editing and design happen concurrently), and the loop only *closes* through the post-launch reflection feeding the author's next book. Protect the coaching DNA — the **feedback loops inside a phase** and the **accountability rhythm across the cycle** — or this becomes a generic project tracker with a book template.

---

## 2. Roles

Roles determine how users interact with the same Book Cycle structure. This is the largest departure from 2.0, which is strictly a coach ↔ mentee dyad. Book cycles are **hub-and-spoke**: the Author is constant; specialists rotate in and out **by phase**.

### 2.1 Author (the constant / owner)

The Author is the protagonist and, in a B2C model, the **account owner**. This role fuses two 2.0 roles: the **Mentee** (receiving guidance and doing the work) and the **Manager/Admin** (owning the engagement, inviting people, controlling permissions).

The Author:
- progresses through the cycle's Milestones (Mentee behavior),
- owns Book Details, Book Goals, and Setup Tasks,
- invites, assigns, and removes collaborators per phase,
- approves collaborator deliverables (e.g., final cover),
- completes the Post-Launch Reflection.

### 2.2 Book Coach AI (the persistent guide)

The AI is the default **Coach** analog. It structures the cycle and guides the Author throughout, but it does **not** perform human specialist deliverables (it cannot edit to a professional standard or illustrate).

The Book Coach AI:
- generates the Phase/Milestone structure at creation (from a genre template + Book Details),
- explains each phase/milestone and recommends next actions,
- flags common, expensive mistakes (e.g., rushing; formatting before editing is done),
- recommends **DIY vs. hire** decisions based on the Author's stated budget,
- suggests vendors/resources and timeline adjustments,
- responds to Author-facing Pending Actions with guidance,
- powered by OpenAI. Like Talent-Ed AI®, it must **not** create a parallel hierarchy or treat Requirement-level actions as independent cycle-level objects.

### 2.3 Collaborators (phase-scoped team members) — *new role class*

Collaborators are specialists engaged for specific phases. Not present in 2.0. Examples: co-author, developmental editor, copyeditor, proofreader, cover designer, interior formatter, illustrator, marketing/launch help, beta readers, ARC readers.

Each Collaborator:
- has access scoped to the phase(s) and milestones they're assigned,
- performs the service requested by a **Request a Service** Milestone,
- returns deliverables and feedback for Author approval,
- may be a lightweight/guest account (many are one-off contractors).

### 2.4 Publisher / Manager (optional)

For hybrid, small-press, or agency contexts — the analog of 2.0 Manager/Admin. Operates *across* book cycles rather than inside individual Milestones, to see workload, cycles behind pace, and upcoming launches across a roster of authors. Out of scope for a pure solo-author B2C V1; retained here for completeness.

---

## 3. Core Concepts

### 3.1 Book Cycle

The top-level object representing one book project. Provides context and contains the structures used to do the work.

Cycle-level structure — see **§ 4 Book Details** for the full field list (the Cycle Details analog). At a glance it holds: identity, publishing path, genre, format(s), target launch date, budget, Book Goals, Team, Setup Tasks, Phases, Resources, and Post-Launch Reflection.

### 3.2 Phase (the *Stage* analog)

A Phase is an organizational layer within a Book Cycle representing a broad stage of publishing. It contains one or more Milestones and does not independently define work. Book Cycles use a fixed default set of six phases (§ 5), which a Template or the Author may adjust.

A single Phase can contain **parallel tracks** (e.g., a *text track* and a *design track* in Production). This is net-new vs. 2.0 stages.

### 3.3 Milestone

The main unit of work inside a Phase. Combines context, one Requirement, optional Resources, and its own completion state. Same structure as 2.0.

| Field | What it controls | Values / behavior |
|---|---|---|
| Phase | Places the Milestone in the cycle. | One of the cycle's Phases. |
| Name | Identifies the Milestone. | Free text. |
| Description | Explains the Milestone. | Free text. |
| Owner | Who must act. | Author or an assigned Collaborator. *(New vs. 2.0, where the mentee always owns.)* |
| Requirement Type | Primary action expected. | See § 6. |
| Requirement-specific selection | Connects to the relevant object. | Form, Learning Path, Service request, etc. |
| Instructions | Guidance for completing the Requirement. | Free text. |
| Resources | Supporting material for this Milestone. | Files/Videos and Links. |
| Status | Completion of the Milestone itself. | In Progress / Completed. |

### 3.4 Requirement

1:1 with a Milestone, exactly as 2.0. The Requirement Type determines whether setup is needed, which object/feature is involved, and the primary action the owner sees. See § 6 for the adapted type list.

### 3.5 Milestone Completion

Completion belongs to the Milestone even when its Requirement references another object (a Form, a Service deliverable). `Mark as Complete` and `Resume Milestone` behave as in 2.0. Where the platform can reliably detect the underlying event (e.g., a form submitted, a file uploaded, a preorder link validated), it may auto-complete the Milestone; otherwise the owner marks it manually.

### 3.6 Pending Action

A concrete task waiting on a user, derived from cycle work (a Milestone/Requirement, a reflection, a coach recommendation awaiting response, or a collaborator handoff awaiting approval).

| Property | Behavior |
|---|---|
| Owner | Author or a specific Collaborator. |
| Action | The concrete task to complete. |
| Cycle association | Always belongs to a cycle. |
| Milestone association | Included when it originates from a Milestone. |

### 3.7 Needs Follow-Up (cycle health / timing)

A derived cycle-level signal — not a task. Reoriented around the **target launch date**, which is the dominant timing pressure in publishing.

| Value | Meaning | Trigger |
|---|---|---|
| Behind Pace | Progress is lower than expected for the target launch date. | Expected vs. actual progress against the timeline. |
| No Progress in X days | No meaningful progress in the configured window. | Inactivity threshold. |
| Launch Approaching | The target publication date is near. | Configured window (the *Ending Soon* analog). |
| On Track | No follow-up condition applies. | — |

Priority order for summary surfaces: Behind Pace → No Progress → Launch Approaching.

### 3.8 Book Goal (the *Goal* analog)

An existing Goal-type entity attached to the cycle, sitting at cycle level. In publishing these encode the Author's **"why" and end goals** (e.g., "build authority for my consulting business," "hit a bestseller list," "sell 1,000 copies in year one"). These drive downstream decisions (launch size, budget). As in 2.0, Goals are attached, not created inside the cycle; Templates do not carry specific Goals.

### 3.9 Setup Task (the *Preparation Task* analog)

Author-owned, cycle-level tasks completed **before/around** the production work — the strategic decisions the Write|Publish|Sell timeline insists come first: choose publishing path (self / hybrid / small press), define audience and genre, gather comparable titles, set a budget, decide launch ambition, **select trim size / manuscript template** (e.g. a KDP template). Distinct from Milestones (which structure the primary production work).

Trim size is a Setup Task, not a Production milestone, because it's a decision made early that Production later *applies* — the Production-phase "Interior formatting" milestone (§ 5.1, #22) formats *to* the template chosen here rather than choosing it. *(Folded in from the grill-session gap analysis, § 2 item D — see [Book_Cycles_Gap_Analysis_Grill_Session.md](./Book_Cycles_Gap_Analysis_Grill_Session.md).)*

### 3.10 Resource

Supporting material scoped to the cycle or to a Milestone, with Milestone Resources rolled up into the cycle Resources area — identical behavior to 2.0. In this domain, Resources also carry the **working artifacts** (manuscript drafts, cover comps, formatted files) and reference material (formatting guides, vendor lists, checklists).

### 3.11 Post-Launch Reflection (the *End-of-Cycle Reflection* analog)

Cycle-level questions at the end of the engagement. This is where a book "cycle" earns the name — the reflection is designed to **feed the next Book Cycle**, which is also the primary B2C retention mechanism.

System-defined questions (adapted from 2.0):

| Question | Response | Conditional |
|---|---|---|
| Did this book achieve its goals? | Yes / No + notes | Always shown. |
| Was the book published on or before its target date? | Yes / No + notes | Shown when the above = No. |

Custom prompts allow retro tailoring (what worked in the launch, what to do differently, which vendors to reuse). Audience/trigger rules mirror 2.0's open questions (see § 21).

### 3.12 Book Cycle Template

A reusable definition of the cycle's structure (Phases → Milestones → Requirements), shared across future books. Genre-specific templates are the natural unit here: **Fiction Novel**, **Nonfiction / How-To**, **Memoir**, **Children's Picture Book** (mandatory illustrator + specialized layout track). Instance-specific info (Author, Team, dates, Book Goals, Resources) is added only when the Template is used, exactly as 2.0.

---

## 4. Book Details (the *Cycle Details* analog)

The information collected to define a Book Cycle. Fields marked *(derived)* are computed; fields marked *(prod)* are populated during the Production phase.

| Field | What it controls | Values / behavior |
|---|---|---|
| Working title / subtitle | Identifies the book. | Free text. |
| Author / pen name | The owner's public authorship identity. | Free text / linked account. |
| Genre / Category | Categorizes the book (the *Focus Tags* analog). | One or more configured tags. |
| Format(s) | What will be produced. | Ebook, Print (paperback/hardcover), Audiobook — multi-select. |
| Publishing path | The route to market (the *Cycle Type* analog). | Self / Hybrid / Small press / Traditional. Drives which phases and milestones apply. |
| Target reader / audience | Who the book is for. | Free text. |
| Comparable titles | Market positioning (comps). | List. |
| Book Goals / "why" | The end goals driving decisions. | Attached Book Goals (§ 3.8). |
| Length estimate | Rough word/page count. | Number. Feeds cover/layout planning. |
| **Target publication date** | The anchor date for the whole timeline. | Date, captured **tentative** at cycle creation (see Writing & Development milestone § 5.1 #16) and re-confirmed as **firm** in Pre-Launch (§ 5.1 #32). Not a hard commitment up front — Pen periodically re-surfaces it in ongoing coaching until firmed. Drives Needs Follow-Up. |
| **Budget** | What the Author can spend. | Amount / tier. **Determines which Collaborator roles and milestones are active vs. optional** (see § 20.5). |
| Team | The people on the project. | Author + invited Collaborators, each phase-scoped. |
| ISBN / imprint | Publishing identifiers. *(prod)* | Populated in Production. |
| Metadata bundle | Discoverability data. *(prod)* | Title, description, keywords, categories. |
| Distribution channels | Where the book will sell. | KDP, IngramSpark, Draft2Digital, direct, etc. |
| Progress | Progress through the cycle. *(derived)* | From Phase/Milestone completion. |

---

## 5. Phases and example Milestones

The default six-phase structure, adapted from the Write|Publish|Sell timeline. Phases are **sequenced** (each gates the next), but a phase may run **parallel tracks**. Each phase is tagged as a **Loop phase** (feedback-driven, coaching-native) or a **Sprint phase** (checklist/momentum-driven) — this tells the product where the coaching layer earns its keep.

| # | Phase | Type | Rotates in | Example Milestones |
|---|---|---|---|---|
| 1 | Writing & Development | Loop | Co-author, dev editor, beta readers | Capture the idea; outline; world/rules + character development; skeletal first-pass draft; layered revision passes; early spot-check beta read; deep AI-assisted revision; print-and-markup + transcription; structured beta-reader survey; full read-through gate; draft front/back matter + blurb copy. |
| 2 | Editing | Loop | Copyeditor, line editor | AI-assisted copyedit, chapter by chapter; full read-through gate; lock manuscript. *(Proofreading deferred to after layout — see § 21.)* |
| 3 | Production | Sprint + parallel tracks | Cover designer, formatter, illustrator | **Text track:** interior format to the trim template chosen in Setup, build the ebook file, proofread laid-out files. **Design track:** cover design. **Publishing track:** KDP draft + format check, IngramSpark listing + format check, IngramSpark preorder scheduling, ISBN decision + purchase, set pricing, order + verify proof copies. |
| 4 | Pre-Launch | Sprint | Marketing help, ARC readers | Firm up the pub date; build + activate ARC team; continue list-building; begin content marketing; ebook preorder live; secure early/editorial reviews; final sprint (last 1–2 weeks). |
| 5 | Launch | Sprint | Publicist / launch team | Click publish; verify live and correct on Amazon/IngramSpark; announce (social, blog, email list); update author website from preorder to available-now. Launch is a *sequence culminating in one action*, not just a countdown window. |
| 6 | Post-Launch & Growth | Loop | (data, not people) | Marketing push with changed ("it's here") messaging; order author copies; ongoing audience growth; long-tail marketing; metadata optimization; additional formats; partnerships. Runs into the **Post-Launch Reflection** → next Book Cycle. Tapers, doesn't close. |

Note: the earlier four-phase sketch (Writing & Rest / Editing & Design / Pre-Launch / Launch & Post-Launch) is a valid *compressed* view; this six-phase model is the fuller default and separates the concurrent-but-distinct Editing, Production, and Post-Launch work.

### 5.1 Full milestone catalog (fiction / chapter-book baseline)

The table above is illustrative; this is the fuller catalog, folded in from a grill-session interview walking one author's real, from-scratch process for a fiction chapter book against the six-phase model (see [Book_Cycles_Gap_Analysis_Grill_Session.md](./Book_Cycles_Gap_Analysis_Grill_Session.md)). Numbering matches that source document. It is a **baseline, not a universal template** — see § 21 on sanity-checking nonfiction/memoir/co-authored arcs.

Tags: *(conditional)* = Pen asks during intake and simply omits the milestone from the generated plan if the author already has the thing — a Plan Generation-time decision, not a stored schema field (see Plan Schema "Design rules"); *(repeats per chapter)* = runs once per chapter, not once per phase — schema treatment is an **open question**, see § 21; *(lead-time flag)* = the milestone's schedule depends on an external turnaround the author doesn't control, and should carry a `warnings[]` entry the same way the illustration lead-time warning already does.

**Writing & Development**
1. Capture the idea — raw notebook dump, backstory and ideas, no structure yet.
2. Build a general outline (AI-assisted).
3. World & rules-building + character development.
4. Skeletal first-pass draft — short chapters capturing premise and how they connect.
5. Layered revision passes — extending/deepening each chapter over multiple rounds. *(repeats per chapter)*
6. Early spot-check beta read — 1–2 trusted readers, a couple of chapters only.
7. Deep revision, chapter by chapter (AI-assisted). *(repeats per chapter)* Needs the cautious AI-role framing at § 8 / § 3 Pen-behavior.
8. Print-and-markup pass — reading a physical printout with a red pen.
9. Digital transcription of the markup pass — a distinct second milestone from #8, not the same session.
10. Structured beta-reader survey round — Pen suggests a genre-based starter template (see § 21, genre → milestone catalog); author can fully edit it.
11. Weigh & incorporate feedback — the deliberate judgment call after the survey, distinct from collecting it.
12. **Full manuscript read-through** — the gate that decides Writing & Development is done.
13. Draft front/back matter content — acknowledgments, about the author, table of contents, dedication. *Writing* the content; formatting it for print/ebook is a separate Production milestone (#22).
14. Draft back-cover summary / blurb copy.
15. *(Moved to Setup Task, § 3.9 — see gap analysis § 2 item D.)*
16. Set a tentative/placeholder target pub date — lightweight, early; feeds the phase-timeline formula without a firm commitment. Re-confirmed at #32.
17. Start lightweight list-building — a sign-up page plus casual "here's what I'm working on" posts. Starts here, not in Pre-Launch (see § 21, `list_building_start_by`).
18. Create an author website. *(conditional — skip if one already exists)*

**Editing**
19. Copyedit pass, AI-assisted, chapter by chapter — grammar/typos/etc. all caught together, per chapter, not one full-book pass. *(repeats per chapter)* Same cautious AI-role framing as #7.
20. **Full read-through gate** — confirms readiness for Production, mirroring #12's role.
21. Lock manuscript.

**Production**
22. Interior formatting to the trim template selected in Setup (§ 3.9) — applies an earlier decision, doesn't make one.
23. Cover design — runs **in parallel** with interior formatting (validates the parallel-tracks model). Pen's DIY-vs-hire nudge weighs **interior illustration density**, not genre alone (§ 8).
24. KDP draft creation — triggers KDP's own automated format-check on manuscript + cover files. Distinct from personal proofing.
25. IngramSpark listing + format check — runs in parallel with #24.
26. IngramSpark preorder scheduling. *(lead-time flag — connecting to the KDP draft isn't instant.)*
27. ISBN decision: free vs. purchased — a real decision with consequences (switching later means redoing every file the ISBN touches). Modeled as a `complete_activity_outside` milestone whose instructions carry the pros/cons Pen raises proactively (§ 3 Pen-behavior), not a flat checkbox — see § 6 for why this doesn't need a new Requirement Type.
28. ISBN purchase & quantity — one per *print* format (paperback, hardback). KDP ebooks get a free ASIN automatically and don't need one.
29. Build the ebook file via KDP's own tool — distinct from print interior layout even though both come from the same manuscript.
30. Set final pricing across formats.
31. Order & physically verify proof copies from both KDP and IngramSpark — the human check that catches what automated format-checks can't (print quality, binding, trim feel). Sits right before publish.

**Pre-Launch**
32. **Firm up the pub date** — the second commitment; #16 was the first (tentative) one.
33. Build & activate the ARC team — sequenced first in this phase (longest lead time). *(lead-time flag)* Needs inline teaching for first-timers (§ 3 Pen-behavior) — a bare checkbox is useless without it.
34. Continue list-building (started at #17) at higher intensity.
35. Content marketing / blogging begins — deliberately starts later than list-building since it needs a concrete asset (cover, title reveal, excerpt) to be about.
36. Ebook preorder goes live.
37. Secure early/editorial reviews — distinct from ARC reader reviews.
38. Final sprint (last 1–2 weeks) — countdown emails, reminder posts.

**Launch**
39. *(Framing note, not a milestone: launch is a sequence culminating in "click publish," not just a countdown window — keep that framing explicit in copy.)*
40. Click publish.
41. Verify live and correct on Amazon and IngramSpark — *before* announcing anything.
42. Announce — social media.
43. Announce — blog post.
44. Announce — email list.
45. Update the author website from "preorder" to "available now" — easy to forget; worth its own reminder specifically on launch day.

**Post-Launch & Growth**
46. Marketing push begins with changed messaging — shifts from pre-launch anticipation copy to reader-response/"it's here" energy. Same channels, different copy template than Pre-Launch's.
47. Order author copies — physical stock for signings, gifts, direct sales. Distinct from the proof copies ordered in Production (#31).
48. *(Confirmed, no change: this phase tapers, doesn't close — the model's open-ended structure is already right.)*

---

## 6. Requirement Types (adapted)

The primary action the owner sees inside a Milestone. Mapped from 2.0.

| Requirement Type | Meaning inside the Milestone | Owner interaction | 2.0 origin |
|---|---|---|---|
| **Complete a Form** | Requires completing a specific form. | Open Form | Complete a Data Form |
| **Complete a Self-Assessment** | Owner assesses readiness (e.g., "manuscript ready for editing?" checklist). | Start / Open Self-Assessment | Complete a Self-Assessment |
| **Complete a Learning Path** | Requires completing a guidance module (e.g., "Format for KDP"). | Open Learning Path | Complete a Learning Path |
| **Request a Service** *(reframed)* | Requires the Author to request work from a Collaborator (dev edit, cover, proofread, formatting). A brief/spec may be attached. The Collaborator performs it; the deliverable + feedback attach to the Milestone. | Request Service → (Collaborator delivers) → Author approves | Request an Observation |
| **Attach a File** | Requires a file to be provided (manuscript, cover, formatted files, ARC list). | Attach File (upload or from Library) | Attach a File |
| **Complete an Activity Outside the Platform** | External work (buy ISBN from Bowker, upload to KDP, set up ESP). | Do externally, then Mark as Complete | Complete an Activity Outside Talent |
| **Approve a Deliverable** *(candidate new type)* | Author signs off on a Collaborator's returned work. | Review → Approve / Request changes | *(new — could also be modeled as a Form)* |

**Request a Service** is the highest-value reframing: it is structurally identical to "Request an Observation" (owner requests → other party performs → result attaches to the Milestone), and it is the natural insertion point for phase-scoped Collaborators — and, later, a **marketplace** to hire them.

**Decision-point milestones (ISBN, trim size) don't need a fifth type.** The gap analysis (§ 2 item H) flags ISBN as "a real decision point with consequences, not a flat checkbox." Rather than add a new Requirement Type — which would touch the locked four-type object model — these are modeled as `complete_activity_outside` milestones whose `instructions` carry the pros/cons framing, authored by Pen and surfaced proactively before the author acts (§ 8). This keeps the object model's four types intact; flagged in § 21 as a judgment call worth revisiting if more decision-shaped milestones turn up.

**Conditional and repeating milestones are a milestone-level concern, not a Requirement Type concern.** Whether a milestone appears at all (author website, § 5.1 #18) or runs once per chapter instead of once per phase (revision/copyedit passes, § 5.1 #5, #7, #19) is orthogonal to which Requirement Type it carries. See § 21 for the open schema question on per-chapter repetition.

---

## 7. Cycle Lifecycle

1. A Book Cycle is created (scratch / Template / Book Coach AI).
2. Book Details, Book Goals, Team, and Setup Tasks are configured.
3. Phases organize the intended progression.
4. Each Phase contains Milestones (with parallel tracks where needed).
5. Each Milestone defines its Requirement.
6. The Author (and assigned Collaborators) progress through Milestones; handoffs pass work between them.
7. Pending Actions surface concrete work waiting on a participant.
8. Needs Follow-Up surfaces cycle-health/timing conditions against the target launch date.
9. Launch occurs; the cycle enters Post-Launch & Growth.
10. Post-Launch Reflection is completed and **feeds the next Book Cycle**; the cycle is marked Ended (trigger TBD — see § 21).

---

## 8. The Book Coach AI

The AI is both a **creation method** and an **always-on guide** — the two roles Talent-Ed AI® plays, plus the ongoing coaching the human coach played in 2.0.

- **Creation:** conversationally gathers Book Details, publishing path, budget, and genre, then generates the Phase/Milestone structure from the matching Template. Reviewed through the standard cycle model.
- **Ongoing guidance:** at each phase/milestone, explains the step, recommends the next action, and surfaces the well-known pitfalls (rushing the timeline; formatting before editing; skipping the ARC team; launching with no email list).
- **Budget-aware recommendations:** given the Author's budget, recommends DIY vs. hire per milestone, and suggests where money is best spent. **For cover/illustration work specifically, the nudge weighs interior illustration density, not genre alone** — a heavily-illustrated chapter book and a plain-text novel in the same genre warrant different DIY-vs-hire defaults.
- **Responds to Pending Actions** with guidance and nudges (the "coach responds to pending actions" behavior).
- **Teaches concepts inline where a bare checkbox would fail a first-timer**, rather than assuming prior knowledge:
  - **ARC teams** — what one is, why timing matters, how to run one (§ 5.1 #33).
  - **Building an email list from zero** — concrete tactics, not just "grow your list" (§ 5.1 #17, #34).
  - **Free vs. purchased ISBN** — raised *proactively*, before the author embeds anything in files, since switching later means redoing every affected file (§ 5.1 #27).
- **Periodically re-confirms the tentative pub date** in ongoing coaching ("still aiming for around [date]?") rather than asking once at creation and treating it as fixed — it isn't firm until § 5.1 #32.
- **Frames AI-assisted revision and copyedit milestones (§ 5.1 #7, #19) with explicit boundary language:** AI is a feedback and thinking partner, never the author of the work, and never a substitute for a professional pass when budget allows.
- **Boundary:** the AI guides and recommends; it does not deliver human specialist work. AI-coach and human-Collaborators coexist within the same cycle.
- **Constraint (from 2.0):** must not create a parallel hierarchy or promote Requirement-level actions to cycle-level objects.

*Folded in from the grill-session gap analysis, § 3 (Pen-behavior changes) — see [Book_Cycles_Gap_Analysis_Grill_Session.md](./Book_Cycles_Gap_Analysis_Grill_Session.md).*

---

## 9. Templates, Creation, Hubs

- **Creation methods** produce the same hierarchy: from scratch, from a Template, or via Book Coach AI — identical to 2.0 § 13.
- **Templates** are genre-specific and carry Phases → Milestones → Requirements + Setup Tasks + Post-Launch prompts; they exclude Author, Team, dates, Book Goals, and Resources (added to the live cycle) — same inclusion/exclusion logic as 2.0 § 15.
- **Author workspace** (the *Receive Coaching* analog): aggregates the Author's active Book Cycles and their Pending Actions.
- **Collaborator workspace** (loose analog to *Deliver Coaching*): aggregates the cycles/milestones where a Collaborator has assigned work and pending approvals.
- **Publisher/Agency view** (the *Manage Coaching* analog): cross-author roster health — only relevant for hybrid/small-press/agency; out of scope for solo-author V1.

---

## 20. Key Adaptations from Coaching Cycles 2.0

The genuine departures — what a book-specific tool must do that the coaching tool does not.

1. **Team roster, not a dyad.** 2.0 has exactly one coach + one mentee. Book cycles need a variable, phase-scoped team: role-based membership, join/leave at phase boundaries, optional roles, and lightweight/guest access for one-off contractors.
2. **Parallel tracks within a phase.** 2.0 stages are linear. Production runs text, design, and publishing tracks concurrently. Milestones need track grouping.
3. **Phase gating / dependencies.** 2.0 milestones are free-flowing. Publishing has hard dependencies (can't proofread before layout; can't finalize cover before page count). Some sequencing is enforced, not advisory.
4. **Loop phases vs. sprint phases.** Not every phase is a feedback loop. Editing is loop-shaped (coaching-native); Pre-Launch/Launch are execution sprints. Tag phases so the coaching frame isn't forced where it doesn't fit.
5. **Budget-driven optionality.** The Author's budget is a first-class input that toggles which Collaborator roles and milestones are active. The **solo author is the degenerate default** (every role = the Author), and the template must feel complete at "just me" and expand gracefully.
6. **AI as the default coach.** The persistent guide is the Book Coach AI, not a human coach — because most self-publishers won't hire one. Human expertise enters as Collaborators, per phase.
7. **Request a Service (marketplace-ready).** The Observation pattern becomes a service-request pattern — the hook for hiring editors/designers inside the product later.
8. **B2C ownership flip.** The Author owns the account and invites the team; there is no org admin provisioning coach↔mentee pairs. Permissions are Author-controlled, per collaborator, per phase.
9. **The loop closes across books.** A single book is linear and ends at publication. "Cycle" is justified by the Post-Launch Reflection feeding the next book — which is also the retention/renewal mechanism.
10. **Handoffs are the risk surface.** Books stall at transitions (author→editor, lock page count→layout, editor→proofreader), not inside phases. Model each handoff as a reflection-plus-action-step moment; de-risking handoffs is a defensible product wedge.

---

## 21. Open Questions / Pending Decisions

| Concept | Decision needed |
|---|---|
| Scope boundary | Does the product own drafting (blank page → publish) or begin at a finished manuscript? Smaller, cleaner product if the latter. |
| Coach model | Book Coach AI only, optional human coach as a role, and/or peer cohort? This choice defines the product's identity. |
| Collaborator sourcing | Bring-your-own only, or an in-product marketplace (with a take rate)? |
| Guest access & permissions | Access model for one-off contractors; permission granularity per phase/milestone. |
| Budget → structure mapping | Exactly how budget input gates roles and milestones; how the Author changes it mid-cycle. |
| Children's / illustrated books | Distinct template with mandatory illustrator + specialized layout track and longer timeline — V1 or later? |
| Cross-phase dependencies | How proofreading (after layout) and other dependencies are enforced across phases. |
| Cycle-ended trigger | What marks a cycle Ended — target date reached, publication confirmed, first sale, or Author action? (Mirror of the 2.0 end-of-cycle open question.) |
| Post-Launch Reflection audience/trigger | Who answers, and what makes it available (launch confirmed vs. all milestones complete vs. manual)? |
| Series / multi-book | How related books (series, backlist) relate across cycles. |
| Monetization | B2C pricing model; marketplace economics; AI (OpenAI) cost model. |
| Requirement auto-completion | Which Requirement Types auto-complete their Milestone (form submitted, file uploaded, preorder link validated). |
| Repeat-per-chapter milestones | Whether "repeats per chapter" (§ 5.1 #5, #7, #19) is a first-class schema feature — a milestone that auto-generates one instance per chapter — versus the author manually duplicating a milestone. Not resolved in the grill session. |
| Genre → milestone catalog scope | Beyond a genre-specific milestone list, the catalog needs genre-specific **beta-survey templates** (§ 5.1 #10) and genre-specific **illustration-density guidance** (§ 8 DIY-vs-hire nudge). |
| Generalizing beyond fiction/chapter books | The § 5.1 catalog maps one author's process for a fiction chapter book. Worth sanity-checking whether nonfiction, memoir, or a co-authored book follow a meaningfully different arc before treating it as universal. |

---

*End of first draft. Next: resolve the § 21 questions that change the data model (scope boundary, coach model, marketplace), then run the agreed model through `prd-writer` for the engineering-ready PRD.*
