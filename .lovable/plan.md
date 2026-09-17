# Workshop readability, view controls, and admin navigation

Two deliberately separate implementation plans. Complete and verify Plan 1 first; Plan 2 remains a follow-up onboarding project and should not be folded into the first build.

## Plan 1 — Workshop interface improvements

### 1. Reduce long milestone lists

- In every phase summary, show the first five milestones by default when a phase contains more than five.
- Add one clear disclosure control below the fifth item: “Show N more”; when expanded it becomes “Show fewer.”
- Apply this consistently to:
  - template preview;
  - author and admin template editors;
  - template and scratch cycle builders;
  - Pen’s generated cycle preview;
  - expanded phases on an active book cycle.
- Keep each phase’s disclosure state independent. Adding a milestone while editing expands that phase so the new item is visible.
- Do not alter, truncate, reorder, or discard milestone data; this is presentation-only.
- Ensure the control is keyboard accessible, reports its expanded state, and respects reduced-motion settings.

### 2. Create one reliable list/grid switcher

- Replace the cramped My Books control with a shared segmented list/grid control built from the existing button system.
- Give both options stable dimensions, accessible labels, pressed states, focus styles, and tooltips where labels are visually hidden.
- Keep it available on phones as requested: compact icon controls on narrow screens and icon-plus-label controls when space allows.
- Place it in a mobile-safe heading/action layout so page titles and primary actions cannot squeeze or overlap it.
- Remember the selected view separately for each page in the browser.

### 3. Add list and grid views across the Author’s Workshop

Add the shared switcher and a purpose-built alternate layout to:

- **My Books** — retain the existing card and row information and actions.
- **My Cycles** — preserve Not started, In progress, and Complete groupings in both views.
- **Templates** — support list and grid layouts for both Genre templates and My templates without changing preview, copy, edit, delete, or use actions.
- **My submissions** — retain status, progress, issue placement, dates, and actions in both layouts.
- **Collaborations** — retain progress, next action, target date, and shared status in both layouts.

Empty, loading, and populated states will remain stable in either view. The underlying records and behavior will not change.

### 4. Replace admin chips with a sectioned sidebar

- Replace the current wrapping chip row with a dedicated, sectioned admin navigation inside the admin workspace.
- Group the existing destinations without changing their URLs or permissions:
  - **Overview:** Dashboard
  - **Editorial:** Submissions, Issues, Journal, Table homepage, Mission page, Site words
  - **Community:** People, Community list
  - **Workshop:** Templates, Challenges
  - **Operations:** Help articles, Support, Feature requests, Release notes, Activity log
- Use a persistent labelled sidebar on wider screens and a compact section/page menu on narrow screens.
- Clearly mark the current page, retain keyboard focus visibility, and avoid reducing the usable width of desktop-heavy admin tools.

### 5. Verify Plan 1

- Check the five-item milestone limit and expand/collapse behavior in every listed context.
- Check all five list/grid pages with loading, empty, and populated data.
- Confirm each page remembers its own view and that both views remain usable on phone, tablet, and desktop widths.
- Confirm every admin destination remains reachable and active-state highlighting is correct.
- Run the focused type checks and inspect the affected screens in the browser with no new console errors.

## Plan 2 — First-visit welcome and Workshop walkthrough

This is a separate follow-up build after Plan 1 is complete and reviewed.

### 1. First-access welcome

- Show a welcome dialog when an author enters the Author’s Workshop for the first time.
- Include an admin-managed heading, body, primary “Start walkthrough” action, secondary continue action, and a media area for an intro image or video.
- Include “Don’t show this again.” Closing without that choice allows the welcome to appear on a later visit; choosing it saves the preference to the author’s account.
- Provide a visible way in the Workshop help area to reopen the welcome or restart the walkthrough later.

### 2. Guided walkthrough screens

- Build a responsive, keyboard-accessible sequence of tutorial screens that explains the main Workshop areas.
- Each screen supports a title, body, optional image/video, optional destination button, previous/next controls, progress, skip, and finish.
- Save completion and dismissal per signed-in author so the experience is consistent across devices.
- Keep the tutorial explanatory rather than changing or automating any author workflow.

### 3. Admin-managed onboarding

- Add an **Onboarding** destination to the Workshop section of the new admin sidebar.
- Let admins manage the welcome heading, body, media, enabled state, and button labels.
- Let admins create, edit, reorder, preview, publish/unpublish, and remove walkthrough screens.
- Support an uploaded image or a validated video URL for welcome and walkthrough media, with a clear placeholder when no media is set.
- Provide an admin preview that does not alter the admin’s own completion state.

### 4. Account state and access rules

- Add dedicated onboarding content and per-user onboarding-state records rather than relying on browser-only storage.
- Grant signed-in users read access to published onboarding content and access only to their own completion/dismissal state.
- Restrict onboarding content management to verified admins using the existing server-side role checks.
- Include explicit database grants, row-level access rules, and service-role access in the same migration.
- Preserve the existing role model and do not place role or admin state on user profiles.

### 5. Verify Plan 2

- Test first access, ordinary close, “Don’t show again,” start, skip, completion, restart, and cross-device persistence.
- Test disabled and unpublished onboarding content, missing media, reordered screens, and admin preview.
- Verify focus trapping, screen-reader labels, mobile sizing, reduced motion, and admin-only editing.
- Run focused type and browser checks with no new console or access errors.

## Scope boundary

Plan 1 changes presentation and navigation only. Plan 2 introduces the welcome/walkthrough feature and its account-backed content/state; it begins only after Plan 1 is complete and reviewed.
