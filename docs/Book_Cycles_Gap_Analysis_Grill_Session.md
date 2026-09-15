# Book Cycles — Gap Analysis (Grill Session, A Frequency in Time)

**Source:** A one-question-at-a-time interview walking Sam's real, from-scratch process for *A Frequency in Time* (fiction chapter book) against the existing six-phase model, to find every milestone and structural assumption the spec was missing.

**Status:** Raw findings. Next step: fold into `Book_Cycles_Functionality_Specification`, `Book_Cycle_Plan_Schema`, and `Book_Cycles_Phase_Timeline_Formula`.

---

## 1. New / refined milestones, by phase

### Writing & Development
1. **Capture the idea** — raw notebook dump, backstory and ideas, no structure yet. Currently has no milestone at all; the phase starts at "finish manuscript."
2. **Build a general outline** (AI-assisted) — distinct step after capture, before world-building.
3. **World & rules-building + character development** — nailing down mechanics (a time-travel rule set, in this case) and how characters connect, before drafting starts.
4. **Skeletal first-pass draft** — short chapters capturing premise and how they connect to each other, not a full draft.
5. **Layered revision passes** — extending/deepening each chapter over multiple rounds. Replaces the single "finish manuscript" checkbox with something that matches how authors actually draft.
6. **Early spot-check beta read** — 1–2 trusted readers, a couple of chapters only. Lighter and earlier than the existing full beta-reader round.
7. **Deep revision, chapter by chapter (AI-assisted)** — needs cautious, explicit copy about AI's role (see §3, Pen copy).
8. **Print-and-markup pass** — reading a physical printout with a red pen; catches what screen-reading misses.
9. **Digital transcription** of the markup pass — a distinct second step, not the same session as #8.
10. **Structured beta-reader survey round** — a real instrument with specific questions, not just "send it and hope." Pen should suggest a genre-based starter template; author can fully edit it.
11. **Weigh & incorporate feedback** — the deliberate judgment call after the survey, distinct from collecting it.
12. **Full manuscript read-through** — the gate that decides Writing & Development is actually done. Distinct from all the chapter-level work before it.
13. **Draft front/back matter content** — acknowledgments, about the author, table of contents, dedication. This is *writing* the content, done here — not the same as Production's formatting job (see §2, item C).
14. **Draft back-cover summary / blurb copy.**
15. **Select trim size / manuscript template** (e.g. a KDP template) — belongs as an early Setup Task, not a Production milestone (see §2, item D).
16. **Set a tentative/placeholder target pub date** — new, lightweight, early. Feeds the phase-timeline formula without requiring a firm commitment (see §2, item F).
17. **Start lightweight list-building** — a sign-up page plus casual "here's what I'm working on" posts. Starts here, not in Pre-Launch (see §2, item G).
18. **Create an author website** — conditional: only surfaces if one doesn't already exist (see §2, item B).

### Editing
19. **Copyedit pass, AI-assisted, chapter by chapter** — not one full-book pass, not separate targeted passes; grammar/typos/etc. all caught together, per chapter. Needs the same cautious AI-role copy as #7.
20. **Full read-through gate** — confirms readiness for Production, mirroring #12's role at the end of Writing & Development.
21. **Lock manuscript.**

### Production
22. **Interior formatting** to the trim template selected back in Setup — now clearly just *applying* an earlier decision, not making one.
23. **Cover design** — confirmed to run in parallel with interior formatting (validates the model's existing parallel-tracks assumption). DIY-vs-hire nudge should weigh **interior illustration density**, not genre alone — stays the author's choice either way.
24. **KDP draft creation** — triggers the platform's own automated format-check on manuscript and cover files. Distinct from personal proofing.
25. **IngramSpark listing + format check** — runs in parallel with #24.
26. **IngramSpark preorder scheduling** — existing milestone, but needs a flagged lead time: connecting to the KDP draft isn't instant (see §2, item E).
27. **ISBN decision: free vs. purchased** — a real decision point with consequences (switching later means redoing every file an ISBN touches), not a flat checkbox (see §2, item H).
28. **ISBN purchase & quantity** — one per *print* format (paperback, hardback). KDP ebooks get a free ASIN automatically and don't need one — a caveat on the "one per format" rule.
29. **Build the ebook file** via KDP's own tool — distinct task from print interior layout, even though both come from the same manuscript.
30. **Set final pricing** across formats.
31. **Order & physically verify proof copies** from both KDP and IngramSpark — the human check that catches what automated format-checks can't (print quality, binding, trim feel). Currently missing entirely; sits right before publish.

### Pre-Launch
32. **Firm up the pub date** — existing milestone, now clearly the *second* commitment, not the first (#16 is the first).
33. **Build & activate the ARC team** — sequenced first in this phase (longest lead time). Needs to **teach the concept inline** for first-timers (what an ARC is, why timing matters, how to run one) — a bare checkbox is useless without it (see §3).
34. **Continue list-building** (started in #17) at higher intensity.
35. **Content marketing / blogging begins** — deliberately starts later than list-building, since it needs a concrete asset (cover, title reveal, excerpt) to be about.
36. **Ebook preorder goes live.**
37. **Secure early/editorial reviews** — distinct from ARC reader reviews.
38. **Final sprint** (last 1–2 weeks) — countdown emails, reminder posts.

### Launch
39. Launch reframed as a **sequence culminating in one action** ("click publish"), not just a countdown window — keep that framing explicit in copy.
40. **Click publish.**
41. **Verify live and correct** on Amazon and IngramSpark — *before* announcing anything.
42–44. **Announce**: social media, blog post, email list.
45. **Update the author website** from "preorder" to "available now" — a state change that's easy to forget; worth its own reminder on launch day specifically.

### Post-Launch & Growth
46. **Marketing push begins with changed messaging** — shifts from pre-launch anticipation copy to reader-response/"it's here" energy. Same channels (social, blog), different content — worth encoding as a distinct copy template, not a continuation of pre-launch content.
47. **Order author copies** — physical stock for signings, gifts, direct sales. Distinct from the proof copies ordered in Production (#31).
48. Confirmed: this phase should **taper, not close** — the model's open-ended structure is right as-is; no changes needed here.

---

## 2. Structural / model-level findings

These aren't single milestones — they change how the model itself needs to work.

- **A. Repeat-per-chapter structure.** Revision (#5, #7) and copyediting (#19) both run chapter by chapter, not once per phase. Milestones may need a "repeat this per chapter" mode rather than one lump task — open question for the data model (see §4).
- **B. Conditional milestones.** Website (#18), and potentially existing email list or ISBN, need "does the author already have this?" logic — not shown unconditionally to everyone, the same way phases already check `manuscript_status`.
- **C. Front/back matter splits across two phases.** Drafting the content (#13) happens in Writing & Development; formatting it for print/ebook stays in Production. Currently modeled as one Production-only task.
- **D. Trim size is a Setup Task, not a Production milestone** (#15) — it's a decision made early that Production later *applies*.
- **E. Scheduling dependencies with real lead time** need to be flagged the same way the illustration lead-time warning already works — the IngramSpark↔KDP connection (#26) is a second example of this pattern, not a one-off.
- **F. Target launch date should not be a hard requirement at cycle creation.** Softened to: a tentative placeholder captured early (#16), with Pen periodically re-surfacing it in ongoing coaching ("still aiming for around [date]?") until it's firmed up at #32.
- **G. The phase-timeline formula's `marketing_start_by` marker fires too late for list-building specifically.** It currently targets the midpoint of Production; list-building (#17) needs to start back in Writing & Development — earlier than general content marketing.
- **H. ISBN needs real branching, not a flat checkbox**: a decision point (#27) with pros/cons, a quantity rule that varies by format (#28), and an explicit KDP-ebook exception.

## 3. Pen-behavior changes (not milestones — how Pen itself needs to act)

- New coaching content: **ARC teams** — what they are, why timing matters, how to run one, for authors who've never done it.
- New coaching content: **building an email list from zero** — concrete tactics, not just "grow your list."
- New coaching content: **free vs. purchased ISBN**, raised proactively *before* the author embeds anything in files — the cost of switching later is redoing every affected file.
- Pen should **periodically re-confirm the tentative pub date** in ongoing coaching, not ask once and treat it as fixed.
- Pen's DIY-vs-hire nudge for cover/illustration work should factor in **interior illustration density**, not genre alone.
- Deep-revision and copyedit milestone copy needs the cautious framing already drafted in-session: AI as feedback and thinking partner, never as the author of the work, and never a substitute for a professional pass when budget allows.

## 4. Open questions / risks to watch

- Whether "repeat per chapter" (§2-A) should be a first-class schema feature — a milestone that generates one instance per chapter automatically — versus the author manually duplicating a milestone. Not resolved this session.
- The genre → milestone catalog (already an open dependency in the plan schema) now needs to carry **genre-specific beta-survey templates** and **genre-specific illustration-density guidance**, not just a genre-specific milestone list.
- This whole session mapped **one author's process** in fiction/chapter books. Worth sanity-checking whether nonfiction, memoir, or a co-authored book follow a meaningfully different arc before treating any of this as universal.

---

*Next step: work this into the four canonical specs so the plan schema, the create-flow questions, and Pen's own system prompt all agree with what actually happens.*
