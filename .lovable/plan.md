# Mobile loading skeletons for My Books

## What we’ll build
Replace the plain “Loading your books…” text on the My Books page with skeleton placeholders that match the actual layout, so the page never looks empty while the app warms up. The skeletons will work for both the mobile list view and the desktop list/grid views.

## Why
Right now `isLoading` renders only a short text line, which leaves the stats cards and book list completely blank on first load. Skeletons give the same shape as the final UI and avoid the empty-screen impression on slower connections.

## Scope / not in scope
- In scope: the authenticated `/` (My Books) index route.
- In scope: skeleton versions of the three stats cards and the book list.
- Out of scope: skeletons for other pages; out-of-scope for this task.

## Implementation

1. **Skeleton sub-components** in `src/routes/_authenticated/index.tsx`:
   - `StatsSkeleton` — three rounded rectangles using the same `grid gap-3 rounded-2xl border border-border bg-card p-2 shadow-xs sm:grid-cols-3` wrapper as the real stats row.
   - `BookRowSkeleton` — a single card/row that mirrors `BookRow`:
     - mobile: stacked layout with cover placeholder, title placeholder, two short lines, and action placeholders;
     - sm+: the same `sm:grid-cols-[88px_1fr_auto_auto]` grid with inline placeholders.
   - `BookCardSkeleton` — a card placeholder matching `BookCard` for grid view.
   - `BookGroupSkeleton({ view })` — renders the right skeleton shape based on `effectiveView` (list rows or grid cards).

2. **Replace the loading branch** in `Index()`:
   - When `isLoading` is true, render:
     - the real `<PageHeading>` and action buttons already exist; keep them but disable the data-dependent counters/labels only if needed;
     - `StatsSkeleton`;
     - two section headings (“In a book cycle”, “Ideas and drafts”) with a `text-muted-foreground` skeleton count;
     - `BookGroupSkeleton view={effectiveView}`.
   - Remove the current `<p className="text-sm text-muted-foreground">Loading your books…</p>` fallback.

3. **Styling constraints**:
   - Use the existing `Skeleton` component from `@/components/ui/skeleton`.
   - Keep colors theme-neutral (`bg-primary/10` from Skeleton).
   - Match real card spacing (`rounded-2xl`, `border border-border`, `bg-card`, `px-5 py-5`, `shadow-xs`) so the layout does not shift when data arrives.

4. **Responsive behaviour**:
   - Mobile (`sm:` breakpoint): show list-style row skeletons because the toggle is hidden and `effectiveView` is always `"list"` on small screens.
   - Desktop: respect the user’s saved view preference — grid skeletons when `view === "grid"`, list skeletons otherwise.

## Acceptance
- Opening `/` on a fresh load shows skeleton cards/rows instead of a blank page or plain text.
- The skeleton layout matches the real mobile list layout and the chosen desktop view.
- No layout shift is visible when the real data replaces the skeletons.
- Existing empty state and error handling remain unchanged once loading finishes.
