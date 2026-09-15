# Book Cycles — Phase Timeline Formula

How the system turns a **start date** and a **desired publication date** into a suggested date range for each of the six phases, so the author always knows where they should be. The ratios are derived from the Write|Publish|Sell "Realistic Publishing Timeline (At a Glance)."

Feeds two things already in the system: the **back-planned `due_date`** for each phase's milestones in the plan schema, and the **Behind Pace** trigger in Needs Follow-Up (author is past a phase's suggested end).

## 1. Deriving the ratios

The source gives checkpoints as *days before launch* (DBL). Read as a contiguous partition of the ~365-day pre-launch runway, they become phase durations:

| Phase | DBL window | Canonical days | Share of build window |
|---|---|---|---|
| Writing & Development | 365 → 240 | 125 | 35.6% (~36%) |
| Editing | 240 → 180 | 60 | 17.1% (~17%) |
| Production | 180 → 120 | 60 | 17.1% (~17%) |
| Pre-Launch | 120 → 14 | 106 | 30.2% (~30%) |
| **Launch** | −14 → +21 | **35 (fixed)** | — |
| **Post-Launch** | +22 → ongoing | **open-ended** | — |

**Critical modeling decision:** Launch and Post-Launch do **not** scale with the timeline — a launch window is ~2 weeks before and ~3 weeks after publication whether the book took 6 months or 3 years. Only the **four build phases** are allocated proportionally. Their shares sum to 100% over the *build window* (start → start of the launch window).

Build-phase weights used by the formula:

```
W_CANON = {
  writing_development: 0.356,
  editing:             0.171,
  production:          0.171,
  pre_launch:          0.302
}
```

## 2. The formula

Given start date `S` and publication date `P`, with `W = P − S` (calendar days):

1. **Validate:** require `W ≥ 35` (need room for the launch + post-launch blocks). Otherwise the date is invalid.
2. **Fixed blocks:**
   - `Launch      = [P − 14 days, P + 21 days]`
   - `Post-Launch = [P + 22 days, ongoing]`  (initial growth window: `P + 22 → P + 90`)
3. **Build window:** `B = W − 14`  (from `S` up to the start of the launch window at `P − 14`).
4. **Active phases:** the build phases from the starting phase onward, based on `manuscript_status`:
   - `drafting`         → writing_development, editing, production, pre_launch
   - `first_draft_done` → editing, production, pre_launch
   - `edited`           → production, pre_launch
5. **Re-normalize weights over active phases:** `r_i = W_CANON[i] / Σ_{j ∈ active} W_CANON[j]`.
6. **Ideal duration, then floor:** `dur_i = max(round(B × r_i), FLOOR_i)`.
7. **Feasibility check:** if `Σ dur_i > B`, the timeline is too tight. `shortfall = Σ dur_i − B` is exactly how many days short the author is → recommend moving `P` out by ≥ `shortfall`, or compressing scope.
8. **Lay out sequentially** from `S`: `phase_i = [cursor, cursor + dur_i]`; advance the cursor.

### Minimum floors (defaults — configurable, genre-adjusted)

| Phase | Floor (days) | Notes |
|---|---|---|
| Writing & Development | 21 (from a finished draft) | No system floor when drafting from scratch — author-paced; warn if the structured portion < 30. |
| Editing | 21 | Copyedit + author revision minimum. |
| Production | 30 non-illustrated / **90+ illustrated** | Children's/illustrated books need long illustration lead time. |
| Pre-Launch | 60 | The source is emphatic: marketing needs ≥ 2–3 months; below this, warn strongly. |
| Launch | 35 (fixed block) | Not a floor — a fixed 14 + 21 window. |

### Advisory overlap checkpoint (optional)

The source shows marketing/preorders can begin as early as 180 DBL — overlapping Production. To honor that without complicating the sequential ranges, emit an advisory marker:

```
marketing_start_by = P − round(B × 0.5)   // ~when half the build window remains
```

The Book Coach uses it to nudge **content marketing/blogging** to begin *during* Production, rather than waiting for the Pre-Launch phase to start.

**`list_building_start_by` — a second, earlier marker.** Folded in from the grill-session gap analysis (§ 2 item G): `marketing_start_by` fires too late for list-building specifically. Content marketing needs a concrete asset (cover, title reveal, excerpt) to be about, so it's reasonably anchored mid-Production — but lightweight list-building (a sign-up page, casual "here's what I'm working on" posts) has no such dependency and should start back in Writing & Development, distinct from `marketing_start_by`:

```
list_building_start_by = start_of(writing_development)   // as early as the cycle allows
```

The Book Coach uses this to nudge the "start lightweight list-building" milestone (Functionality Spec § 5.1 #17) at cycle kickoff, then nudge the higher-intensity continuation (§ 5.1 #34) once `marketing_start_by` is reached in Pre-Launch.

## 3. Pseudocode

```python
def suggest_phase_ranges(start, pub, manuscript_status, genre):
    W = days_between(start, pub)
    if W < 35:
        return invalid("Need at least ~35 days for the launch and post-launch windows.")

    launch      = [pub - days(14), pub + days(21)]      # fixed
    post_launch = [pub + days(22), None]                # ongoing (initial window +90)
    B = W - 14                                           # build window

    W_CANON = {"writing_development":0.356, "editing":0.171,
               "production":0.171, "pre_launch":0.302}
    floors  = {"writing_development":21, "editing":21,
               "production": 90 if is_illustrated(genre) else 30,
               "pre_launch":60}

    active = build_phases_from(manuscript_status)        # slice of the four
    total_w = sum(W_CANON[p] for p in active)
    dur = {}
    for p in active:
        ideal   = round(B * (W_CANON[p] / total_w))
        dur[p]  = max(ideal, floors[p])

    warnings = []
    if sum(dur.values()) > B:
        shortfall = sum(dur.values()) - B
        warnings.append(
            f"Timeline is tight by ~{shortfall} days. Move the launch to about "
            f"{pub + days(shortfall)} for a realistic plan, or compress scope.")

    ranges, cursor = {}, start
    for p in active:                                     # sequential layout
        ranges[p] = [cursor, cursor + days(dur[p])]
        cursor   += days(dur[p])

    ranges["launch"]      = launch
    ranges["post_launch"] = post_launch
    marketing_start_by     = pub - days(round(B * 0.5))
    list_building_start_by = ranges[active[0]][0]   # start of the earliest active build phase
    return {"ranges": ranges, "warnings": warnings,
            "marketing_start_by": marketing_start_by,
            "list_building_start_by": list_building_start_by}
```

## 4. Worked examples

### A) Clean 12-month plan, drafting from scratch
`S = 2026-09-04`, `P = 2027-09-04` → `W = 365`, `B = 351`. All four build phases active.

| Phase | Share | Days | Suggested range |
|---|---|---|---|
| Writing & Development | 36% | 125 | 2026-09-04 → 2027-01-07 |
| Editing | 17% | 60 | 2027-01-07 → 2027-03-08 |
| Production | 17% | 60 | 2027-03-08 → 2027-05-07 |
| Pre-Launch | 30% | 106 | 2027-05-07 → 2027-08-21 |
| Launch | fixed | 35 | 2027-08-21 → 2027-09-25 |
| Post-Launch | fixed | — | 2027-09-26 → ongoing |

Advisory: `marketing_start_by ≈ 2027-03-08` (start content marketing during Production); `list_building_start_by = 2026-09-04` (start lightweight list-building at cycle kickoff, back in Writing & Development).

### B) Compressed 150-day plan, manuscript already edited
`S = 2026-09-04`, `P = 2027-02-01` → `W = 150`, `B = 136`. Active: Production, Pre-Launch. Re-normalize {0.171, 0.302} → {0.362, 0.638}.

| Phase | Weight | Days | Suggested range |
|---|---|---|---|
| Production | 0.362 | 49 (≥ floor 30) | 2026-09-04 → 2026-10-23 |
| Pre-Launch | 0.638 | 87 (≥ floor 60) | 2026-10-23 → 2027-01-18 |
| Launch | fixed | 35 | 2027-01-18 → 2027-02-22 |

Feasible — both phases clear their floors.

### C) Too-tight 70-day plan, drafting from scratch → feasibility warning
`S = 2026-09-04`, `P = 2026-11-13` → `W = 70`, `B = 56`. All four active. Ideal splits (20 / 10 / 10 / 17) fall below floors (—/21/30/60). Floored durations sum to ≈ 20 + 21 + 30 + 60 = **131 days** vs. a 56-day build window.

→ `shortfall ≈ 75 days`. The Book Coach responds: *"This book needs roughly 130+ days of build time; your date gives 56. I'd set the launch around 2027-01-27, or we can compress scope — which would you like?"*

## 5. Integration notes

- **Plan schema:** each phase's computed end date becomes the back-planned `due_date` anchor for that phase's milestones; distribute milestone due dates within the phase range.
- **Needs Follow-Up:** "today is past `phase_i.end` but the phase isn't complete" → **Behind Pace**. Approaching `P` → **Launch Approaching**.
- **Book Coach warnings:** the `warnings[]` and `shortfall` output map directly to the create-flow's "unrealistic date" edge case and the ongoing pace-watching behavior.
- **Genre floors:** `is_illustrated(genre)` (children's picture books, illustrated non-fiction) raises the Production floor and should also lengthen the Writing & Development allowance for illustration rounds.
- **`list_building_start_by`:** anchors to the start of the *earliest active build phase*, not always Writing & Development — if the cycle starts at `edited` (Example B), list-building starts at Production kickoff instead, since there's no Writing & Development phase to anchor to.
- **Recompute on change:** re-run whenever the author moves `P`, changes `manuscript_status`, or falls behind, so the ranges and the Behind Pace signal stay honest. The formula runs against a tentative `P` just as well as a firm one — early ranges are useful before the author locks in a launch date, not gated on any confirmation state.
