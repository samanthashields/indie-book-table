# Give the flyer builder room to work

The issue editor currently stacks everything — new issue, cover words, sections, and the whole flyer page builder — in one narrow scrolling column, with every page piece expanded at once and the preview squeezed to the side. This reorganises that workspace. No features change: every field, button and action stays exactly as it is today.

## Two tabs inside an issue

- **Setup** — create/jump to an issue, the issue header (status, Preview as a reader, Publish/Unpublish), Cover words, and Sections with book curation. Unchanged content, just its own tab.
- **Layout** — the flyer page builder and its preview, on its own tab so you don't scroll past curation to reach it.

The issue picker sidebar and header stay visible above the tabs, so switching issues works from either tab.

## The Layout tab becomes a three-pane builder

```text
+-------------+---------------------------+------------------+
| Page list   | The selected piece        | Live preview     |
| (narrow)    | (wide, full fields)       | (pinned, large)  |
| 1 Cover     |                           |                  |
| 2 Section   |                           |                  |
| 3 Row of... |                           |                  |
| + Add piece |                           |                  |
+-------------+---------------------------+------------------+
```

- **Left:** a compact numbered list — piece type plus a one-line summary ("Young Readers · 2 books", "Literary Fiction · lime, ribbon"). Move up/down, duplicate and delete stay on each row. Click a row to select it. An "Add a page piece" button sits at the bottom of this list and opens the same set of choices as today.
- **Middle:** only the selected piece's fields, at full width. Nothing else expands.
- **Right:** the live preview, pinned so it stays in view while you edit, and noticeably larger than today.
- On a laptop the preview drops below the editor rather than shrinking to a sliver; on a wide screen all three sit side by side.

The Layout tab uses the full browser width instead of the narrow centred column used elsewhere in admin.

## Technical notes

- `src/routes/_authenticated/admin.issues.tsx`: wrap the detail area in a two-tab control (existing shadcn `Tabs`); move Cover words + Sections into "Setup" and `IssueBlockBuilder` into "Layout". Keep sidebar and header outside the tabs.
- `src/components/app-shell.tsx` caps content at 1120px. Rather than change it globally, the Layout tab breaks out with a full-bleed wrapper (negative-margin/viewport-width utility) so only this view widens.
- `src/components/admin/issue-block-builder.tsx`: add `selectedId` state; split the current per-block markup into an outline row renderer and a `BlockFields` editor keyed off the selected block. Add a `summaryFor(block)` helper for the one-line descriptions. Preview pane gets `sticky top-4` and a taller max height. All existing state, handlers, `saveIssueBlocks`, "Start from the lineup", and "Clear" logic are untouched.
- Reuse existing tokens/components only; no new dependencies, no data or schema changes.
