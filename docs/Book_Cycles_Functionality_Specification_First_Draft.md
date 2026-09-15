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

Author-owned, cycle-level tasks completed **before/around** the production work — the strategic decisions the Write|Publish|Sell timeline insists come first: choose publishing path (self / hybrid / small press), define audience and genre, gather comparable titles, set a budget, decide launch ambition. Distinct from Milestones (which structure the primary production work).

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
| **Target publication date** | The anchor date for the whole timeline. | Date. Drives Needs Follow-Up. |
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
| 1 | Writing & Development | Loop | Co-author, dev editor, beta readers | Finish manuscript; rest + structured self-review; beta-reader round; developmental edit; major revision. |
| 2 | Editing | Loop | Copyeditor, line editor | Line/copyedit round(s); author revisions; lock manuscript. *(Proofreading deferred to after layout — see § 21.)* |
| 3 | Production | Sprint + parallel tracks | Cover designer, formatter, illustrator | **Text track:** finalize front/back matter, interior format (ebook + print), proofread laid-out files. **Design track:** finalize cover, illustrations (if any). **Publishing track:** purchase ISBN, establish imprint, finalize metadata. |
| 4 | Pre-Launch | Sprint | Marketing help, ARC readers | Set firm pub date; upload ebook preorder; upload print files to IngramSpark; build + activate ARC team; secure reviews; grow email list; content marketing. |
| 5 | Launch | Sprint | Publicist / launch team | Reviews (reader/ARC/editorial); email campaigns; social content; podcast/features; publicity. Launch is a *window*, not a day. |
| 6 | Post-Launch & Growth | Loop | (data, not people) | Ongoing audience growth; long-tail marketing; metadata optimization; additional formats (audio, hardcover, translation); partnerships. Runs into the **Post-Launch Reflection** → next Book Cycle. |

Note: the earlier four-phase sketch (Writing & Rest / Editing & Design / Pre-Launch / Launch & Post-Launch) is a valid *compressed* view; this six-phase model is the fuller default and separates the concurrent-but-distinct Editing, Production, and Post-Launch work.

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
- **Budget-aware recommendations:** given the Author's budget, recommends DIY vs. hire per milestone, and suggests where money is best spent.
- **Responds to Pending Actions** with guidance and nudges (the "coach responds to pending actions" behavior).
- **Boundary:** the AI guides and recommends; it does not deliver human specialist work. AI-coach and human-Collaborators coexist within the same cycle.
- **Constraint (from 2.0):** must not create a parallel hierarchy or promote Requirement-level actions to cycle-level objects.

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

---

*End of first draft. Next: resolve the § 21 questions that change the data model (scope boundary, coach model, marketplace), then run the agreed model through `prd-writer` for the engineering-ready PRD.*
